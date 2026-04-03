// ─── Scribble Socket.IO Handler ───────────────────────────
// Handles all real-time events:
//  - join-room, leave-room
//  - draw-stroke (canvas sync)
//  - chat-message, submit-guess
//  - start-game, next-turn, end-round
//  - scores saved to MongoDB at end

const ScribbleRoom  = require('./models/ScribbleRoom')
const ScribbleScore = require('./models/ScribbleScore')
const { getRandomWords } = require('./controllers/scribbleController')

// In-memory game state (fast access during game)
const gameState = {}
// gameState[roomCode] = {
//   players: [], currentDrawer: null, currentWord: null,
//   timer: null, timeLeft: 80, roundNum: 1, totalRounds: 3,
//   wordOptions: [], drawingData: '', category: 'general',
// }

module.exports = (io) => {

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    // ── JOIN ROOM ────────────────────────────────────────
    socket.on('join-room', async ({ roomCode, userId, nickname, avatar }) => {
      try {
        socket.join(roomCode)
        socket.roomCode  = roomCode
        socket.userId    = userId
        socket.nickname  = nickname

        // Update socket ID in DB
        await ScribbleRoom.findOneAndUpdate(
          { roomCode, 'players.userId': userId },
          { $set: { 'players.$.socketId': socket.id } }
        )

        // Init game state if not exists
        if (!gameState[roomCode]) {
          const room = await ScribbleRoom.findOne({ roomCode })
          gameState[roomCode] = {
            players:       room?.players || [],
            currentDrawer: null,
            currentWord:   null,
            timer:         null,
            timeLeft:      room?.timePerRound || 80,
            roundNum:      0,
            totalRounds:   room?.totalRounds || 3,
            wordOptions:   [],
            drawingData:   '',
            category:      room?.wordCategory || 'general',
            status:        'waiting',
            guessedPlayers:[],
          }
        }

        // Add player to in-memory state if not there
        const gs = gameState[roomCode]
        if (!gs.players.find(p => p.userId === userId)) {
          gs.players.push({ userId, nickname, avatar, score: 0, socketId: socket.id })
        } else {
          // Update socketId
          const p = gs.players.find(p => p.userId === userId)
          if (p) p.socketId = socket.id
        }

        // Broadcast updated player list
        io.to(roomCode).emit('players-updated', gs.players)
        socket.to(roomCode).emit('player-joined', { userId, nickname, avatar })

        // Send current state to new joiner
        socket.emit('room-state', {
          players:    gs.players,
          status:     gs.status,
          roundNum:   gs.roundNum,
          totalRounds:gs.totalRounds,
          timeLeft:   gs.timeLeft,
          currentDrawerId: gs.currentDrawer?.userId || null,
        })

        console.log(`${nickname} joined room ${roomCode}`)
      } catch (err) {
        console.error('join-room error:', err.message)
      }
    })

    // ── START GAME ───────────────────────────────────────
    socket.on('start-game', async ({ roomCode }) => {
      const gs = gameState[roomCode]
      if (!gs || gs.status !== 'waiting') return

      gs.status   = 'playing'
      gs.roundNum = 0

      await ScribbleRoom.findOneAndUpdate({ roomCode }, { status: 'playing' })

      io.to(roomCode).emit('game-started', { totalRounds: gs.totalRounds })
      startNextTurn(io, roomCode)
    })

    // ── WORD CHOSEN ──────────────────────────────────────
    socket.on('word-chosen', ({ roomCode, word }) => {
      const gs = gameState[roomCode]
      if (!gs) return
      gs.currentWord = word

      // Tell everyone the word length (dashes) except drawer
      const wordHint = '_ '.repeat(word.length).trim()
      socket.to(roomCode).emit('word-hint', { hint: wordHint, length: word.length })
      socket.emit('your-word', { word })

      // Start timer
      startTimer(io, roomCode)
    })

    // ── DRAW STROKE ──────────────────────────────────────
    socket.on('draw-stroke', ({ roomCode, strokeData }) => {
      // Relay to all EXCEPT drawer
      socket.to(roomCode).emit('draw-stroke', strokeData)
      // Store latest canvas data
      if (gameState[roomCode]) {
        gameState[roomCode].drawingData = strokeData.fullCanvas || ''
      }
    })

    // ── CLEAR CANVAS ─────────────────────────────────────
    socket.on('clear-canvas', ({ roomCode }) => {
      socket.to(roomCode).emit('clear-canvas')
    })

    // ── FILL CANVAS ──────────────────────────────────────
    socket.on('fill-canvas', ({ roomCode, fillData }) => {
      socket.to(roomCode).emit('fill-canvas', fillData)
    })

    // ── CHAT MESSAGE ─────────────────────────────────────
    socket.on('chat-message', ({ roomCode, message, userId, nickname }) => {
      const gs = gameState[roomCode]
      if (!gs) return

      // Check if it's a correct guess
      if (
        gs.currentWord &&
        gs.status === 'playing' &&
        userId !== gs.currentDrawer?.userId &&
        !gs.guessedPlayers.includes(userId) &&
        message.toLowerCase().trim() === gs.currentWord.toLowerCase()
      ) {
        // Correct guess!
        gs.guessedPlayers.push(userId)
        const timeBonus     = Math.floor((gs.timeLeft / (gs.totalRounds * 80)) * 500)
        const pointsEarned  = 100 + timeBonus
        const player        = gs.players.find(p => p.userId === userId)
        if (player) player.score += pointsEarned

        // Give drawer points too
        const drawer = gs.players.find(p => p.userId === gs.currentDrawer?.userId)
        if (drawer) drawer.score += 50

        io.to(roomCode).emit('correct-guess', { userId, nickname, pointsEarned })
        io.to(roomCode).emit('players-updated', gs.players)

        // Private message to guesser
        socket.emit('you-guessed', { word: gs.currentWord, points: pointsEarned })

        // Check if all guessed
        const nonDrawers = gs.players.filter(p => p.userId !== gs.currentDrawer?.userId)
        if (gs.guessedPlayers.length >= nonDrawers.length) {
          endRound(io, roomCode)
        }
      } else {
        // Regular chat — hide word if close
        const msg = gs.currentWord &&
          message.toLowerCase().includes(gs.currentWord.toLowerCase().slice(0, 3))
          ? '🤫 (close guess!)' : message

        io.to(roomCode).emit('chat-message', {
          userId, nickname,
          message: gs.guessedPlayers.includes(userId) ? `✅ ${message}` : msg,
          isSystem: false,
        })
      }
    })

    // ── DISCONNECT ───────────────────────────────────────
    socket.on('disconnect', () => {
      const { roomCode, userId, nickname } = socket
      if (!roomCode || !gameState[roomCode]) return

      const gs = gameState[roomCode]
      gs.players = gs.players.filter(p => p.userId !== userId)
      io.to(roomCode).emit('player-left', { userId, nickname })
      io.to(roomCode).emit('players-updated', gs.players)

      // If drawer left, end turn
      if (gs.currentDrawer?.userId === userId && gs.status === 'playing') {
        io.to(roomCode).emit('chat-message', {
          message: `${nickname} (drawer) left. Skipping turn…`,
          isSystem: true,
        })
        endRound(io, roomCode)
      }
    })
  })

  // ── Start next turn ────────────────────────────────────
  function startNextTurn(io, roomCode) {
    const gs = gameState[roomCode]
    if (!gs) return

    gs.roundNum++
    if (gs.roundNum > gs.totalRounds) {
      endGame(io, roomCode)
      return
    }

    // Pick next drawer (round-robin)
    const drawerIndex   = (gs.roundNum - 1) % gs.players.length
    gs.currentDrawer    = gs.players[drawerIndex]
    gs.currentWord      = null
    gs.guessedPlayers   = []
    gs.drawingData      = ''

    // Give word choices to drawer
    gs.wordOptions = getRandomWords(gs.category, 3)

    io.to(roomCode).emit('new-turn', {
      roundNum:     gs.roundNum,
      totalRounds:  gs.totalRounds,
      drawerId:     gs.currentDrawer.userId,
      drawerName:   gs.currentDrawer.nickname,
    })

    // Send word choices only to drawer
    const drawerSocket = [...io.sockets.sockets.values()]
      .find(s => s.userId === gs.currentDrawer.userId && s.roomCode === roomCode)

    if (drawerSocket) {
      drawerSocket.emit('choose-word', { words: gs.wordOptions })
    }

    // Auto-pick after 15s if drawer doesn't choose
    gs.wordChoiceTimer = setTimeout(() => {
      if (!gs.currentWord) {
        gs.currentWord = gs.wordOptions[0]
        if (drawerSocket) drawerSocket.emit('your-word', { word: gs.currentWord })
        const hint = '_ '.repeat(gs.currentWord.length).trim()
        io.to(roomCode).emit('word-hint', { hint, length: gs.currentWord.length })
        startTimer(io, roomCode)
      }
    }, 15000)
  }

  // ── Timer ──────────────────────────────────────────────
  function startTimer(io, roomCode) {
    const gs = gameState[roomCode]
    if (!gs) return

    gs.timeLeft = 80
    clearInterval(gs.timer)

    gs.timer = setInterval(() => {
      gs.timeLeft--
      io.to(roomCode).emit('timer', { timeLeft: gs.timeLeft })

      if (gs.timeLeft <= 0) {
        clearInterval(gs.timer)
        endRound(io, roomCode)
      }
    }, 1000)
  }

  // ── End round ─────────────────────────────────────────
  function endRound(io, roomCode) {
    const gs = gameState[roomCode]
    if (!gs) return
    clearInterval(gs.timer)
    clearTimeout(gs.wordChoiceTimer)

    io.to(roomCode).emit('round-ended', {
      word:    gs.currentWord,
      players: gs.players,
    })

    // Save round to DB
    ScribbleRoom.findOne({ roomCode }).then(room => {
      if (room) {
        room.rounds.push({
          roundNumber:  gs.roundNum,
          word:         gs.currentWord || '',
          drawerId:     gs.currentDrawer?.userId || '',
          drawerName:   gs.currentDrawer?.nickname || '',
          drawingData:  gs.drawingData,
          correctGuesses: gs.guessedPlayers.map(uid => ({
            userId: uid,
            nickname: gs.players.find(p => p.userId === uid)?.nickname || '',
          })),
        })
        room.save()
      }
    })

    // Wait 5s then next turn
    setTimeout(() => startNextTurn(io, roomCode), 5000)
  }

  // ── End game ──────────────────────────────────────────
  async function endGame(io, roomCode) {
    const gs = gameState[roomCode]
    if (!gs) return
    clearInterval(gs.timer)
    gs.status = 'finished'

    // Sort by score
    const sorted = [...gs.players].sort((a, b) => b.score - a.score)
    const finalScores = sorted.map((p, i) => ({
      userId: p.userId, nickname: p.nickname,
      score: p.score, rank: i + 1,
    }))

    io.to(roomCode).emit('game-over', { finalScores })

    // Save to MongoDB
    try {
      await Promise.all(finalScores.map(s =>
        ScribbleScore.create({
          userId: s.userId, nickname: s.nickname,
          roomCode, totalScore: s.score, rank: s.rank,
          wordsDrawn: gs.rounds?.filter(r => r.drawerId === s.userId).length || 0,
          correctGuesses: gs.guessedPlayers?.filter(id => id === s.userId).length || 0,
        })
      ))
      await ScribbleRoom.findOneAndUpdate(
        { roomCode },
        { finalScores, status: 'finished', endedAt: new Date() }
      )
    } catch (err) {
      console.error('Save scores error:', err.message)
    }

    // Cleanup after 5 min
    setTimeout(() => { delete gameState[roomCode] }, 300000)
  }
}