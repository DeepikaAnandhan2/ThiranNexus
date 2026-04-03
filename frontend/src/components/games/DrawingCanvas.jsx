// ─── Drawing Canvas ───────────────────────────────────────
// Touch + mouse drawing with tools: pen, eraser, fill, shapes
// Syncs strokes via Socket.IO

import { useRef, useState, useEffect, useCallback } from 'react'
import { FaPen, FaEraser, FaFill, FaTrash, FaUndo, FaMinus, FaCircle, FaSquare } from 'react-icons/fa'
import './DrawingCanvas.css'

const COLORS = [
  '#1A1A2E','#8B5CF6','#FF8C42','#2DC9A6','#EF4444',
  '#3B82F6','#F59E0B','#10B981','#EC4899','#6366F1',
  '#FFFFFF','#94A3B8',
]

const BRUSH_SIZES = [3, 6, 10, 16]

export default function DrawingCanvas({ socket, roomCode, isDrawing, onCanvasUpdate }) {
  const canvasRef    = useRef(null)
  const ctxRef       = useRef(null)
  const isMouseDown  = useRef(false)
  const lastPos      = useRef({ x: 0, y: 0 })
  const historyRef   = useRef([])

  const [tool,      setTool]      = useState('pen')
  const [color,     setColor]     = useState('#1A1A2E')
  const [brushSize, setBrushSize] = useState(6)
  const [fillColor, setFillColor] = useState('#8B5CF6')

  // ── Init canvas ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const ctx     = canvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap   = 'round'
    ctx.lineJoin  = 'round'
    ctxRef.current = ctx
  }, [])

  // ── Receive strokes from other players ──────────────
  useEffect(() => {
    if (!socket) return
    socket.on('draw-stroke', (stroke) => drawFromData(stroke))
    socket.on('clear-canvas', () => clearCanvas(false))
    socket.on('fill-canvas',  ({ x, y, color }) => floodFill(x, y, color, false))
    return () => {
      socket.off('draw-stroke')
      socket.off('clear-canvas')
      socket.off('fill-canvas')
    }
  }, [socket])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const saveHistory = () => {
    const canvas = canvasRef.current
    historyRef.current.push(canvas.toDataURL())
    if (historyRef.current.length > 20) historyRef.current.shift()
  }

  // ── Draw from socket data ────────────────────────────
  const drawFromData = (stroke) => {
    const ctx = ctxRef.current
    if (!ctx) return
    if (stroke.type === 'begin') {
      ctx.beginPath()
      ctx.moveTo(stroke.x, stroke.y)
    } else if (stroke.type === 'draw') {
      ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.strokeStyle  = stroke.color
      ctx.lineWidth    = stroke.size
      ctx.lineTo(stroke.x, stroke.y)
      ctx.stroke()
    } else if (stroke.type === 'end') {
      ctx.closePath()
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  // ── Mouse / Touch events ─────────────────────────────
  const onPointerDown = useCallback((e) => {
    if (!isDrawing) return
    e.preventDefault()
    isMouseDown.current = true
    saveHistory()
    const pos = getPos(e)
    lastPos.current = pos
    const ctx = ctxRef.current

    if (tool === 'fill') {
      floodFill(pos.x, pos.y, color, true)
      return
    }

    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)

    socket?.emit('draw-stroke', {
      roomCode, type: 'begin', x: pos.x, y: pos.y, color, size: brushSize, tool,
    })
  }, [isDrawing, tool, color, brushSize, socket, roomCode])

  const onPointerMove = useCallback((e) => {
    if (!isDrawing || !isMouseDown.current) return
    e.preventDefault()
    const pos = getPos(e)
    const ctx = ctxRef.current

    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = color
    ctx.lineWidth   = brushSize
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    socket?.emit('draw-stroke', {
      roomCode, type: 'draw', x: pos.x, y: pos.y, color, size: brushSize, tool,
    })
    lastPos.current = pos
  }, [isDrawing, tool, color, brushSize, socket, roomCode])

  const onPointerUp = useCallback(() => {
    if (!isDrawing || !isMouseDown.current) return
    isMouseDown.current = false
    ctxRef.current?.closePath()
    ctxRef.current && (ctxRef.current.globalCompositeOperation = 'source-over')
    socket?.emit('draw-stroke', { roomCode, type: 'end' })
    if (onCanvasUpdate) onCanvasUpdate(canvasRef.current.toDataURL())
  }, [isDrawing, socket, roomCode, onCanvasUpdate])

  // ── Clear ────────────────────────────────────────────
  const clearCanvas = (emit = true) => {
    const canvas = canvasRef.current
    const ctx    = ctxRef.current
    if (!ctx) return
    saveHistory()
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (emit) socket?.emit('clear-canvas', { roomCode })
  }

  // ── Undo ─────────────────────────────────────────────
  const undo = () => {
    if (historyRef.current.length === 0) return
    const img    = new Image()
    img.src      = historyRef.current.pop()
    img.onload   = () => ctxRef.current?.drawImage(img, 0, 0)
  }

  // ── Flood fill ───────────────────────────────────────
  const floodFill = (startX, startY, fillCol, emit = true) => {
    const canvas  = canvasRef.current
    const ctx     = ctxRef.current
    if (!ctx) return
    saveHistory()

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data      = imageData.data
    const startIdx  = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4
    const startR    = data[startIdx], startG = data[startIdx+1], startB = data[startIdx+2]

    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1,3),16)
      const g = parseInt(hex.slice(3,5),16)
      const b = parseInt(hex.slice(5,7),16)
      return [r, g, b]
    }
    const [fillR, fillG, fillB] = hexToRgb(fillCol)
    if (startR === fillR && startG === fillG && startB === fillB) return

    const stack = [[Math.floor(startX), Math.floor(startY)]]
    while (stack.length) {
      const [x, y] = stack.pop()
      const idx    = (y * canvas.width + x) * 4
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue
      if (data[idx] !== startR || data[idx+1] !== startG || data[idx+2] !== startB) continue
      data[idx] = fillR; data[idx+1] = fillG; data[idx+2] = fillB; data[idx+3] = 255
      stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1])
    }
    ctx.putImageData(imageData, 0, 0)
    if (emit) socket?.emit('fill-canvas', { roomCode, x: startX, y: startY, color: fillCol })
  }

  return (
    <div className="canvas-wrap">
      {/* ── Toolbar ── */}
      {isDrawing && (
        <div className="canvas-toolbar">
          {/* Tools */}
          <div className="toolbar-section">
            <button className={`tool-btn ${tool==='pen'?'active':''}`} onClick={()=>setTool('pen')} title="Pen"><FaPen /></button>
            <button className={`tool-btn ${tool==='eraser'?'active':''}`} onClick={()=>setTool('eraser')} title="Eraser"><FaEraser /></button>
            <button className={`tool-btn ${tool==='fill'?'active':''}`} onClick={()=>setTool('fill')} title="Fill"><FaFill /></button>
          </div>

          <div className="toolbar-divider" />

          {/* Brush sizes */}
          <div className="toolbar-section">
            {BRUSH_SIZES.map(s => (
              <button
                key={s}
                className={`size-btn ${brushSize===s?'active':''}`}
                onClick={()=>setBrushSize(s)}
                title={`Size ${s}`}
              >
                <span style={{ width: s, height: s, borderRadius:'50%', background: color, display:'block' }} />
              </button>
            ))}
          </div>

          <div className="toolbar-divider" />

          {/* Colors */}
          <div className="toolbar-colors">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-btn ${color===c?'active':''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                title={c}
              />
            ))}
          </div>

          <div className="toolbar-divider" />

          {/* Actions */}
          <div className="toolbar-section">
            <button className="tool-btn tool-undo"  onClick={undo}             title="Undo"><FaUndo /></button>
            <button className="tool-btn tool-clear" onClick={()=>clearCanvas()} title="Clear"><FaTrash /></button>
          </div>
        </div>
      )}

      {/* ── Canvas ── */}
      <canvas
        ref={canvasRef}
        className={`draw-canvas ${isDrawing ? 'can-draw' : ''}`}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        style={{ cursor: tool === 'eraser' ? 'cell' : tool === 'fill' ? 'crosshair' : 'default' }}
      />
    </div>
  )
}