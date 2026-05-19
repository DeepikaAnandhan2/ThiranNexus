// ─── scribbleSocket.js ────────────────────────────────────────────────────────

const ScribbleRoom  = require('./models/ScribbleRoom')
const ScribbleScore = require('./models/ScribbleScore')
const { getRandomWords } = require('./controllers/scribbleController')

const gameState = {}

module.exports = (io) => {

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id)

    // ── JOIN ROOM ──────────────────────────────────────────────────────────────
    socket.on('join-room', async ({ roomCode, userId, nickname, avatar }) => {
      socket.join(roomCode)
      // Store on socket instance — used in 'disconnect' where payload isn't available
      socket.roomCode = roomCode
      socket.userId   = userId
      socket.nickname = nickname

      console.log(`👤 ${nickname} joined room ${roomCode} | socket: ${socket.id}`)

      if (!gameState[roomCode]) {
        let room = null
        try { room = await ScribbleRoom.findOne({ roomCode }) } catch(e) {}
        gameState[roomCode] = {
          players:         [],
          currentDrawer:   null,
          currentWord:     null,
          timer:           null,
          wordChoiceTimer: null,
          timeLeft:        80,
          roundNum:        0,
          totalRounds:     room?.totalRounds  || 3,
          timePerRound:    room?.timePerRound || 80,
          wordOptions:     [],
          category:        room?.wordCategory || 'general',
          status:          'waiting',
          guessedPlayers:  [],
          hostId:          room?.hostId || userId,
        }
      }

      const gs = gameState[roomCode]

      // Add or update player — handles reconnects by updating socketId
      const existing = gs.players.find(p => p.userId === userId)
      if (existing) {
        existing.socketId = socket.id
      } else {
        gs.players.push({
          userId,
          nickname,
          avatar:     avatar || '😊',
          score:      0,
          socketId:   socket.id,
          hasGuessed: false,
        })
      }

      socket.emit('room-state', {
        players:         gs.players,
        status:          gs.status,
        roundNum:        gs.roundNum,
        totalRounds:     gs.totalRounds,
        timeLeft:        gs.timeLeft,
        currentDrawerId: gs.currentDrawer?.userId || null,
      })

      socket.to(roomCode).emit('player-joined', { userId, nickname, avatar })
      io.to(roomCode).emit('players-updated', gs.players)
    })

    // ── START GAME ─────────────────────────────────────────────────────────────
    socket.on('start-game', ({ roomCode }) => {
      const gs = gameState[roomCode]
      if (!gs) return
      console.log(`🎮 Game starting in room ${roomCode}`)
      gs.status   = 'playing'
      gs.roundNum = 0
      gs.players.forEach(p => { p.score = 0; p.hasGuessed = false })
      io.to(roomCode).emit('game-started', { totalRounds: gs.totalRounds })
      startNextTurn(io, roomCode)
    })

    // ── WORD CHOSEN ────────────────────────────────────────────────────────────
    socket.on('word-chosen', ({ roomCode, word }) => {
      const gs = gameState[roomCode]
      if (!gs) return
      console.log(`📝 Word chosen in ${roomCode}: ${word}`)
      gs.currentWord = word
      clearTimeout(gs.wordChoiceTimer)

      socket.emit('your-word', { word })

      const hint = word.split('').map(c => c === ' ' ? ' ' : '_').join(' ')
      socket.to(roomCode).emit('word-hint', { hint, length: word.length })

      startTimer(io, roomCode)
    })

    // ── DRAW STROKE ────────────────────────────────────────────────────────────
    socket.on('draw-stroke', (data) => {
      socket.to(data.roomCode).emit('draw-stroke', data)
    })

    // ── CLEAR CANVAS ───────────────────────────────────────────────────────────
    socket.on('clear-canvas', ({ roomCode }) => {
      socket.to(roomCode).emit('clear-canvas')
    })

    // ── FILL CANVAS ────────────────────────────────────────────────────────────
    socket.on('fill-canvas', (data) => {
      socket.to(data.roomCode).emit('fill-canvas', data)
    })

    // ── CHAT / GUESS ───────────────────────────────────────────────────────────
    // FIX: userId always read from payload — never from socket fields
    // FIX: server is single source of truth — client does NOT add messages locally
    socket.on('chat-message', ({ roomCode, message, userId, nickname }) => {
      const gs = gameState[roomCode]
      if (!gs || !userId || !message) return

      const isCorrect = (
        gs.currentWord &&
        gs.status === 'playing' &&
        userId !== gs.currentDrawer?.userId &&
        !gs.guessedPlayers.includes(userId) &&
        message.toLowerCase().trim() === gs.currentWord.toLowerCase().trim()
      )

      if (isCorrect) {
        gs.guessedPlayers.push(userId)

        const pointsEarned = 100 + Math.floor(gs.timeLeft * 2)
        const player = gs.players.find(p => p.userId === userId)
        if (player) { player.score += pointsEarned; player.hasGuessed = true }
        const drawer = gs.players.find(p => p.userId === gs.currentDrawer?.userId)
        if (drawer) drawer.score += 40

        io.to(roomCode).emit('correct-guess', { userId, nickname, pointsEarned })
        io.to(roomCode).emit('players-updated', gs.players)
        // Only tell the guesser privately — not broadcast as a chat message
        socket.emit('you-guessed', { word: gs.currentWord, points: pointsEarned })

        const nonDrawers = gs.players.filter(p => p.userId !== gs.currentDrawer?.userId)
        if (gs.guessedPlayers.length >= nonDrawers.length) {
          endRound(io, roomCode)
        }

      } else {
        // Censor near-miss guesses during active game
        const censor = (
          gs.status === 'playing' &&
          gs.currentWord &&
          message.toLowerCase().includes(gs.currentWord.slice(0, 3).toLowerCase())
        )
        const display = censor ? '🤫 (almost!)' : message

        // Broadcast to ALL — client must NOT add locally to avoid duplicates
        io.to(roomCode).emit('chat-message', { userId, nickname, message: display, isSystem: false })
      }
    })

    // ── DISCONNECT ─────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const { roomCode, userId, nickname } = socket
      if (!roomCode || !gameState[roomCode]) return
      console.log(`❌ ${nickname} disconnected from ${roomCode}`)

      const gs = gameState[roomCode]
      const wasDrawer = gs.currentDrawer?.userId === userId

      gs.players        = gs.players.filter(p => p.userId !== userId)
      gs.guessedPlayers = gs.guessedPlayers.filter(id => id !== userId)

      io.to(roomCode).emit('player-left', { userId, nickname })
      io.to(roomCode).emit('players-updated', gs.players)

      if (wasDrawer && gs.status === 'playing') {
        io.to(roomCode).emit('chat-message', {
          message:  `${nickname} (drawer) disconnected — skipping turn`,
          isSystem: true,
        })
        endRound(io, roomCode)
      }

      // Empty room cleanup
      if (gs.players.length === 0) {
        clearInterval(gs.timer)
        clearTimeout(gs.wordChoiceTimer)
        delete gameState[roomCode]
        console.log(`🗑️ Room ${roomCode} removed`)
      }
    })
  })

  // ── startNextTurn ──────────────────────────────────────────────────────────
  function startNextTurn(io, roomCode) {
    const gs = gameState[roomCode]
    if (!gs) return

    gs.roundNum++
    console.log(`🔄 Round ${gs.roundNum}/${gs.totalRounds} in ${roomCode}`)

    if (gs.roundNum > gs.totalRounds) {
      endGame(io, roomCode)
      return
    }

    const drawerIdx   = (gs.roundNum - 1) % gs.players.length
    gs.currentDrawer  = gs.players[drawerIdx]
    gs.currentWord    = null
    gs.guessedPlayers = []
    gs.players.forEach(p => { p.hasGuessed = false })

    const words = getRandomWords(gs.category, 3)
    gs.wordOptions = words

    io.to(roomCode).emit('new-turn', {
      roundNum:    gs.roundNum,
      totalRounds: gs.totalRounds,
      drawerId:    gs.currentDrawer.userId,
      drawerName:  gs.currentDrawer.nickname,
    })

    io.to(roomCode).emit('clear-canvas')

    // Find drawer socket by userId (set in join-room)
    const drawerSocket = [...io.sockets.sockets.values()]
      .find(s => s.userId === gs.currentDrawer.userId && s.roomCode === roomCode)

    if (drawerSocket) {
      console.log(`📋 Sending word choices to ${gs.currentDrawer.nickname}`)
      drawerSocket.emit('choose-word', { words })
    } else {
      console.warn(`⚠️ Drawer socket not found for ${gs.currentDrawer.nickname} — auto-picking`)
      gs.currentWord = words[0]
      const hint = gs.currentWord.split('').map(c => c === ' ' ? ' ' : '_').join(' ')
      io.to(roomCode).emit('word-hint', { hint, length: gs.currentWord.length })
      startTimer(io, roomCode)
    }

    // Auto-pick word after 15s if drawer hasn't chosen
    gs.wordChoiceTimer = setTimeout(() => {
      if (!gs.currentWord && gs.wordOptions.length > 0) {
        gs.currentWord = gs.wordOptions[0]
        console.log(`⏰ Auto-picked word: ${gs.currentWord}`)
        const drawerSock = [...io.sockets.sockets.values()]
          .find(s => s.userId === gs.currentDrawer?.userId && s.roomCode === roomCode)
        if (drawerSock) drawerSock.emit('your-word', { word: gs.currentWord })
        const hint = gs.currentWord.split('').map(c => c === ' ' ? ' ' : '_').join(' ')
        io.to(roomCode).emit('word-hint', { hint, length: gs.currentWord.length })
        startTimer(io, roomCode)
      }
    }, 15000)
  }

  // ── startTimer ─────────────────────────────────────────────────────────────
  function startTimer(io, roomCode) {
    const gs = gameState[roomCode]
    if (!gs) return
    clearInterval(gs.timer)
    gs.timeLeft = gs.timePerRound || 80

    gs.timer = setInterval(() => {
      gs.timeLeft--
      io.to(roomCode).emit('timer', { timeLeft: gs.timeLeft })
      if (gs.timeLeft <= 0) {
        clearInterval(gs.timer)
        endRound(io, roomCode)
      }
    }, 1000)
  }

  // ── endRound ───────────────────────────────────────────────────────────────
  function endRound(io, roomCode) {
    const gs = gameState[roomCode]
    if (!gs) return
    clearInterval(gs.timer)
    clearTimeout(gs.wordChoiceTimer)
    console.log(`🏁 Round ended in ${roomCode}, word was: ${gs.currentWord}`)

    io.to(roomCode).emit('round-ended', {
      word:    gs.currentWord || '?',
      players: gs.players,
    })

    setTimeout(() => startNextTurn(io, roomCode), 5000)
  }

  // ── endGame ────────────────────────────────────────────────────────────────
  async function endGame(io, roomCode) {
    const gs = gameState[roomCode]
    if (!gs) return
    clearInterval(gs.timer)
    gs.status = 'finished'

    const sorted = [...gs.players].sort((a, b) => b.score - a.score)
    const finalScores = sorted.map((p, i) => ({
      userId:   p.userId,
      nickname: p.nickname,
      score:    p.score,
      rank:     i + 1,
    }))

    console.log(`🏆 Game over in ${roomCode}:`, finalScores)
    io.to(roomCode).emit('game-over', { finalScores })

    try {
      await Promise.all(finalScores.map(s =>
        ScribbleScore.create({
          userId:     s.userId,
          nickname:   s.nickname,
          roomCode,
          totalScore: s.score,
          rank:       s.rank,
        })
      ))
      await ScribbleRoom.findOneAndUpdate(
        { roomCode },
        { finalScores, status: 'finished', endedAt: new Date() }
      )
    } catch (err) {
      console.error('Save error:', err.message)
    }

    setTimeout(() => { delete gameState[roomCode] }, 300000)
  }
}