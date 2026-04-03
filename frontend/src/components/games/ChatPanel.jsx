import { useState, useRef, useEffect } from 'react'
import { FaPaperPlane, FaComments, FaListUl } from 'react-icons/fa'
import './ChatPanel.css'

export default function ChatPanel({ messages, answers, onSendMessage, isDrawing, hasGuessed }) {
  const [tab,     setTab]     = useState('chat')
  const [input,   setInput]   = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, answers])

  const handleSend = () => {
    if (!input.trim() || isDrawing) return
    onSendMessage(input.trim())
    setInput('')
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSend() }

  return (
    <div className="chat-wrap">
      {/* Tabs */}
      <div className="chat-tabs">
        <button
          className={`chat-tab ${tab==='answers'?'active':''}`}
          onClick={() => setTab('answers')}
        >
          <FaListUl /> Answers
        </button>
        <button
          className={`chat-tab ${tab==='chat'?'active':''}`}
          onClick={() => setTab('chat')}
        >
          <FaComments /> Chat
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {tab === 'answers' && answers.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.type || ''}`}>
            {msg.isSystem ? (
              <span className="chat-system">{msg.message}</span>
            ) : (
              <>
                <span className="chat-nick">{msg.nickname}:</span>
                <span className="chat-text">{msg.message}</span>
              </>
            )}
          </div>
        ))}
        {tab === 'chat' && messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.type || ''}`}>
            {msg.isSystem ? (
              <span className="chat-system">{msg.message}</span>
            ) : (
              <>
                <span className="chat-nick">{msg.nickname}:</span>
                <span className="chat-text">{msg.message}</span>
              </>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-wrap">
        <input
          type="text"
          className="chat-input"
          placeholder={
            isDrawing    ? "You're drawing! Can't guess." :
            hasGuessed   ? '✅ You already guessed!' :
            'Type your guess here...'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={isDrawing || hasGuessed}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={isDrawing || hasGuessed || !input.trim()}
          title="Send"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  )
}