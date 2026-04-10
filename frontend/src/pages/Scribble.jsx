// ─── Scribble Game Page ───────────────────────────────────
// Lobby → Word Selection → Game → Scoreboard
// Uses Socket.IO for real-time drawing + guessing
// FIXED: Correct backend payload keys (userId, nickname as flat fields)
// FIXED: Full UI restored from original

import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import {
  FaGamepad, FaDoorOpen, FaPencilAlt, FaTrophy,
  FaCrown, FaUserFriends, FaCog, FaPlay, FaCopy, FaCheck
} from 'react-icons/fa'
import DrawingCanvas from '../components/games/DrawingCanvas'
import PlayerList    from '../components/games/PlayerList'
import ChatPanel     from '../components/games/ChatPanel'
import '../styles/Scribble.css'

const API        = 'http://localhost:5000'
const SOCKET_URL = 'http://localhost:5000'

const AVATARS = ['😊','😎','🤩','😜','🥳','😇','🤓','😏','🥸','😈','👻','🤖','🦊','🐼','🦁','🐸']

export default function Scribble() {
  // ── User identity (FIXED: safe JSON parse) ─────────────
  const [myId] = useState(() => {
    try {
      const saved = localStorage.getItem('tn_user')
      if (saved) return JSON.parse(saved).id || `guest_${Date.now()}`
    } catch {}
    return `guest_${Date.now()}`
  })

  const [nickname, setNickname] = useState(() => {
    try {
      const saved = localStorage.getItem('tn_user')
      if (saved) return JSON.parse(saved).name || `User${Math.floor(Math.random()*9000)+1000}`
    } catch {}
    return `User${Math.floor(Math.random()*9000)+1000}`
  })

  const [avatar, setAvatar] = useState('😊')

  // ── Screen state ───────────────────────────────────────
  const [screen, setScreen] = useState('lobby') // lobby | waiting | wordpick | game | gameover

  // ── Room state ─────────────────────────────────────────
  const [roomCode,     setRoomCode]     = useState('')
  const [joinCode,     setJoinCode]     = useState('')
  const [players,      setPlayers]      = useState([])
  const [isHost,       setIsHost]       = useState(false)
  const [roomSettings, setRoomSettings] = useState({ totalRounds: 3, timePerRound: 80, wordCategory: 'general' })

  // ── Game state ─────────────────────────────────────────
  const [amDrawing,     setAmDrawing]     = useState(false)
  const [currentDrawer, setCurrentDrawer] = useState(null)
  const [wordOptions,   setWordOptions]   = useState([])
  const [currentWord,   setCurrentWord]   = useState('')
  const [wordHint,      setWordHint]      = useState('')
  const [timeLeft,      setTimeLeft]      = useState(80)
  const [roundNum,      setRoundNum]      = useState(0)
  const [totalRounds,   setTotalRounds]   = useState(3)
  const [hasGuessed,    setHasGuessed]    = useState(false)
  const [messages,      setMessages]      = useState([])
  const [answers,       setAnswers]       = useState([])
  const [finalScores,   setFinalScores]   = useState([])
  const [copied,        setCopied]        = useState(false)
  const [roundEndWord,  setRoundEndWord]  = useState('')
  const [showRoundEnd,  setShowRoundEnd]  = useState(false)

  const socketRef = useRef(null)

  // ── Socket setup ───────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('players-updated', (p) => setPlayers(p))
    socket.on('player-joined',   ({ nickname }) => addSystemMsg(`${nickname} joined the room!`))
    socket.on('player-left',     ({ nickname }) => addSystemMsg(`${nickname} left.`))

    socket.on('room-state', ({ players, status, roundNum, totalRounds, timeLeft }) => {
      setPlayers(players)
      setRoundNum(roundNum)
      setTotalRounds(totalRounds)
      setTimeLeft(timeLeft)
      if (status === 'playing') setScreen('game')
    })

    socket.on('game-started', ({ totalRounds }) => {
      setTotalRounds(totalRounds)
      setScreen('game')
      addSystemMsg('🎮 Game started!')
    })

    socket.on('new-turn', ({ roundNum, totalRounds, drawerId, drawerName }) => {
      setRoundNum(roundNum)
      setTotalRounds(totalRounds)
      setCurrentDrawer({ userId: drawerId, nickname: drawerName })
      setAmDrawing(drawerId === myId)
      setHasGuessed(false)
      setCurrentWord('')
      setWordHint('')
      setShowRoundEnd(false)
      addSystemMsg(`🎨 Round ${roundNum}/${totalRounds} — ${drawerName} is drawing!`)
    })

    socket.on('choose-word', ({ words }) => {
      setWordOptions(words)
      setScreen('wordpick')
    })

    socket.on('your-word', ({ word }) => {
      setCurrentWord(word)
      setScreen('game')
    })

    socket.on('word-hint', ({ hint }) => {
      setWordHint(hint)
      setCurrentWord('')
    })

    socket.on('timer', ({ timeLeft }) => setTimeLeft(timeLeft))

    socket.on('correct-guess', ({ nickname, pointsEarned }) => {
      const msg = `✅ ${nickname} guessed the word! +${pointsEarned} pts`
      addSystemMsg(msg)
    })

    socket.on('you-guessed', ({ word }) => {
      setHasGuessed(true)
      setCurrentWord(word)
    })

    socket.on('chat-message', (msg) => {
      addMessage(msg)
      addAnswer(msg)
    })

    socket.on('round-ended', ({ word, players }) => {
      setPlayers(players)
      setRoundEndWord(word)
      setShowRoundEnd(true)
      addSystemMsg(`⏱️ Round over! The word was: "${word}"`)
    })

    socket.on('game-over', ({ finalScores }) => {
      setFinalScores(finalScores)
      setScreen('gameover')
    })

    return () => socket.disconnect()
  }, [myId])

  const addSystemMsg = (msg) =>
    setMessages(prev => [...prev, { message: msg, isSystem: true }])

  const addMessage = (msg) =>
    setMessages(prev => [...prev, msg])

  const addAnswer = (msg) =>
    setAnswers(prev => [...prev, msg])

  // ── Create room (FIXED: flat payload keys) ─────────────
  const createRoom = async () => {
    try {
      const payload = {
        userId:       myId,
        nickname:     nickname,
        avatar,
        totalRounds:  roomSettings.totalRounds,
        timePerRound: roomSettings.timePerRound,
        wordCategory: roomSettings.wordCategory,
      }
      const res = await axios.post(`${API}/api/scribble/room/create`, payload)
      setRoomCode(res.data.roomCode)
      setIsHost(true)
      setPlayers(res.data.room.players)
      socketRef.current?.emit('join-room', {
        roomCode: res.data.roomCode, userId: myId, nickname, avatar
      })
      setScreen('waiting')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create room')
    }
  }

  // ── Join room (FIXED: flat payload keys) ───────────────
  const joinRoom = async () => {
    if (!joinCode.trim()) return
    try {
      const payload = {
        roomCode: joinCode.toUpperCase(),
        userId:   myId,
        nickname,
        avatar,
      }
      const res = await axios.post(`${API}/api/scribble/room/join`, payload)
      setRoomCode(res.data.room.roomCode)
      setIsHost(false)
      setPlayers(res.data.room.players)
      socketRef.current?.emit('join-room', {
        roomCode: res.data.room.roomCode, userId: myId, nickname, avatar
      })
      setScreen('waiting')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join room')
    }
  }

  // ── Start game ─────────────────────────────────────────
  const startGame = () => {
    socketRef.current?.emit('start-game', { roomCode })
  }

  // ── Choose word ────────────────────────────────────────
  const chooseWord = (word) => {
    socketRef.current?.emit('word-chosen', { roomCode, word })
    setCurrentWord(word)
    setWordOptions([])
    setScreen('game')
  }

  // ── Send chat message ──────────────────────────────────
  const sendMessage = (message) => {
    socketRef.current?.emit('chat-message', { roomCode, message, userId: myId, nickname })
    addMessage({ nickname: 'You', message, isSystem: false })
    addAnswer({ nickname: 'You', message, isSystem: false })
  }

  // ── Copy room code ─────────────────────────────────────
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const timerPct   = (timeLeft / (roomSettings.timePerRound || 80)) * 100
  const timerColor = timeLeft <= 10 ? '#EF4444' : timeLeft <= 30 ? '#FF8C42' : '#8B5CF6'

  // ══════════════════════════════════════════════════════
  // LOBBY SCREEN
  // ══════════════════════════════════════════════════════
  if (screen === 'lobby') return (
    <div className="scribble-lobby">
      <div className="lobby-bg" aria-hidden="true">
        {[...Array(12)].map((_,i) => <span key={i} className="lobby-bubble" style={{ '--i': i }} />)}
      </div>

      <div className="lobby-card">
        {/* Header */}
        <div className="lobby-header">
          <FaPencilAlt className="lobby-header-icon" />
          <h1 className="lobby-title">Scribble</h1>
          <p className="lobby-subtitle">Draw • Guess • Win</p>
        </div>

        {/* Avatar picker */}
        <div className="lobby-avatar-section">
          <div className="lobby-avatar-display">{avatar}</div>
          <div className="lobby-avatar-grid">
            {AVATARS.map(a => (
              <button key={a} className={`avatar-opt ${avatar===a?'selected':''}`} onClick={() => setAvatar(a)}>{a}</button>
            ))}
          </div>
        </div>

        {/* Nickname */}
        <div className="lobby-field">
          <label className="lobby-label">Nickname</label>
          <input
            className="lobby-input"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={16}
            placeholder="Enter nickname..."
          />
        </div>

        <div className="lobby-divider"><span>or</span></div>

        <div className="lobby-actions">
          {/* Create */}
          <div className="lobby-create">
            <h3 className="lobby-section-title"><FaCog /> Room Settings</h3>
            <div className="lobby-settings-row">
              <div className="lobby-setting">
                <label>Rounds</label>
                <select
                  value={roomSettings.totalRounds}
                  onChange={e => setRoomSettings(p => ({ ...p, totalRounds: +e.target.value }))}
                >
                  {[2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="lobby-setting">
                <label>Time (sec)</label>
                <select
                  value={roomSettings.timePerRound}
                  onChange={e => setRoomSettings(p => ({ ...p, timePerRound: +e.target.value }))}
                >
                  {[60,80,100,120].map(n => <option key={n} value={n}>{n}s</option>)}
                </select>
              </div>
              <div className="lobby-setting">
                <label>Category</label>
                <select
                  value={roomSettings.wordCategory}
                  onChange={e => setRoomSettings(p => ({ ...p, wordCategory: e.target.value }))}
                >
                  {['general','animals','food','objects'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="lobby-btn lobby-btn-create" onClick={createRoom}>
              <FaGamepad /> Create Room
            </button>
          </div>

          <div className="lobby-or">OR</div>

          {/* Join */}
          <div className="lobby-join">
            <h3 className="lobby-section-title"><FaDoorOpen /> Join Room</h3>
            <input
              className="lobby-input lobby-code-input"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter room code..."
              maxLength={6}
            />
            <button className="lobby-btn lobby-btn-join" onClick={joinRoom}>
              <FaDoorOpen /> Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════
  // WAITING ROOM
  // ══════════════════════════════════════════════════════
  if (screen === 'waiting') return (
    <div className="scribble-waiting">
      <div className="waiting-card">
        <h2 className="waiting-title"><FaUserFriends /> Waiting Room</h2>

        {/* Room code */}
        <div className="waiting-code-wrap">
          <p className="waiting-code-label">Room Code</p>
          <div className="waiting-code-row">
            <span className="waiting-code">{roomCode}</span>
            <button className="waiting-copy-btn" onClick={copyCode}>
              {copied ? <FaCheck /> : <FaCopy />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="waiting-code-hint">Share this code with friends to join!</p>
        </div>

        {/* Players */}
        <div className="waiting-players">
          <p className="waiting-players-label">{players.length} player{players.length !== 1 ? 's' : ''} in room</p>
          <div className="waiting-player-grid">
            {players.map(p => (
              <div key={p.userId} className="waiting-player">
                <span className="waiting-player-avatar">{p.avatar || '😊'}</span>
                <span className="waiting-player-name">{p.nickname}</span>
                {p.userId === myId && <span className="waiting-player-you">you</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="waiting-actions">
          {isHost ? (
            <button
              className="lobby-btn lobby-btn-create"
              onClick={startGame}
              disabled={players.length < 2}
            >
              <FaPlay /> Start Game {players.length < 2 && '(need 2+ players)'}
            </button>
          ) : (
            <p className="waiting-host-msg">⏳ Waiting for host to start the game…</p>
          )}
          <button className="lobby-btn lobby-btn-ghost" onClick={() => setScreen('lobby')}>
            Leave Room
          </button>
        </div>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════
  // WORD PICK SCREEN
  // ══════════════════════════════════════════════════════
  if (screen === 'wordpick') return (
    <div className="scribble-wordpick">
      <div className="wordpick-card">
        <h2 className="wordpick-title">🎨 Your Turn to Draw!</h2>
        <p className="wordpick-sub">Choose a word to draw:</p>
        <div className="wordpick-options">
          {wordOptions.map(word => (
            <button key={word} className="wordpick-btn" onClick={() => chooseWord(word)}>
              {word}
            </button>
          ))}
        </div>
        <p className="wordpick-timer">Auto-picks in 15s…</p>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════
  // GAME OVER SCREEN
  // ══════════════════════════════════════════════════════
  if (screen === 'gameover') return (
    <div className="scribble-gameover">
      <div className="gameover-card">
        <FaTrophy className="gameover-trophy" />
        <h2 className="gameover-title">Game Over!</h2>

        <div className="gameover-scores">
          {finalScores.map((p, i) => (
            <div key={p.userId} className={`gameover-row ${i===0?'first':i===1?'second':i===2?'third':''}`}>
              <span className="gameover-rank">
                {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
              </span>
              <span className="gameover-name">{p.nickname}</span>
              <span className="gameover-score">{p.score} pts</span>
            </div>
          ))}
        </div>

        <div className="gameover-actions">
          <button
            className="lobby-btn lobby-btn-create"
            onClick={() => { setScreen('waiting'); setMessages([]); setAnswers([]) }}
          >
            Play Again
          </button>
          <button className="lobby-btn lobby-btn-ghost" onClick={() => setScreen('lobby')}>
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════
  // GAME SCREEN
  // ══════════════════════════════════════════════════════
  return (
    <div className="scribble-game">

      {/* ── Top bar ── */}
      <div className="game-topbar">
        <div className="topbar-left">
          <FaPencilAlt className="topbar-icon" />
          <span className="topbar-brand">Scribble</span>
        </div>

        <div className="topbar-center">
          <div className="topbar-round">Round {roundNum}/{totalRounds}</div>
          <div className="topbar-word">
            {amDrawing ? (
              <><span className="topbar-word-label">Draw:</span> <strong>{currentWord}</strong></>
            ) : currentWord ? (
              <><span className="topbar-word-label">Word:</span> <strong>{currentWord}</strong></>
            ) : wordHint ? (
              <span className="topbar-hint">{wordHint}</span>
            ) : (
              <span className="topbar-word-label">Waiting for word…</span>
            )}
          </div>
          <div className="topbar-drawer">
            {currentDrawer && <><FaPencilAlt /> {currentDrawer.nickname} is drawing</>}
          </div>
        </div>

        <div className="topbar-right">
          <div className="topbar-timer" style={{ color: timerColor }}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* ── Timer bar ── */}
      <div className="game-timer-bar">
        <div
          className="game-timer-fill"
          style={{ width: `${timerPct}%`, background: timerColor }}
        />
      </div>

      {/* ── Round end overlay ── */}
      {showRoundEnd && (
        <div className="round-end-overlay">
          <div className="round-end-card">
            <p className="round-end-label">Round Over!</p>
            <p className="round-end-word">The word was: <strong>{roundEndWord}</strong></p>
          </div>
        </div>
      )}

      {/* ── Main game layout ── */}
      <div className="game-layout">
        {/* Left: Player list */}
        <div className="game-players">
          <PlayerList
            players={players}
            currentDrawerId={currentDrawer?.userId}
            myId={myId}
          />
        </div>

        {/* Center: Canvas */}
        <div className="game-canvas-wrap">
          <DrawingCanvas
            socket={socketRef.current}
            roomCode={roomCode}
            isDrawing={amDrawing}
          />
        </div>

        {/* Right: Chat */}
        <div className="game-chat">
          <ChatPanel
            messages={messages}
            answers={answers}
            onSendMessage={sendMessage}
            isDrawing={amDrawing}
            hasGuessed={hasGuessed}
          />
        </div>
      </div>
    </div>
  )
}