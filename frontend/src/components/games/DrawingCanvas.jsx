import { useRef, useState, useEffect, useCallback } from 'react'
import { FaPen, FaEraser, FaFill, FaTrash, FaUndo } from 'react-icons/fa'
import './DrawingCanvas.css'

const COLORS = [
  '#000000','#8B5CF6','#FF8C42','#2DC9A6','#EF4444',
  '#3B82F6','#F59E0B','#10B981','#EC4899','#6366F1',
  '#FFFFFF','#94A3B8',
]
const BRUSH_SIZES = [3, 6, 10, 16]

export default function DrawingCanvas({ socket, roomCode, isDrawing }) {
  const canvasRef  = useRef(null)
  const ctxRef     = useRef(null)
  const isDown     = useRef(false)
  const historyRef = useRef([])
  const sizeRef    = useRef({ w: 800, h: 500 })

  const [tool,      setTool]      = useState('pen')
  const [color,     setColor]     = useState('#000000')
  const [brushSize, setBrushSize] = useState(6)

  // ── Setup canvas ────────────────────────────────────
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const w = parent.clientWidth  || 800
    const h = parent.clientHeight || 500
    if (w === 0 || h === 0) return

    // Save existing content
    let saved = null
    if (canvas.width > 0 && canvas.height > 0 && ctxRef.current) {
      try { saved = canvas.toDataURL() } catch(e) {}
    }

    canvas.width  = w
    canvas.height = h
    sizeRef.current = { w, h }

    const ctx = canvas.getContext('2d')
    ctx.lineCap  = 'round'
    ctx.lineJoin = 'round'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, h)
    ctxRef.current = ctx

    if (saved) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, w, h)
      img.src = saved
    }
  }, [])

  // Run setup after mount (use setTimeout to ensure DOM is ready)
  useEffect(() => {
    const t = setTimeout(setupCanvas, 100)
    return () => clearTimeout(t)
  }, [setupCanvas])

  // Also setup on resize
  useEffect(() => {
    window.addEventListener('resize', setupCanvas)
    return () => window.removeEventListener('resize', setupCanvas)
  }, [setupCanvas])

  // ── Socket listeners — receive remote strokes ────────
  useEffect(() => {
    if (!socket) return

    const onStroke = (data) => {
      const canvas = canvasRef.current
      const ctx    = ctxRef.current
      if (!canvas || !ctx) return

      const W = canvas.width
      const H = canvas.height

      // Convert normalized ratio back to this canvas's pixels
      const x = data.rx * W
      const y = data.ry * H

      if (data.type === 'begin') {
        ctx.beginPath()
        ctx.moveTo(x, y)

      } else if (data.type === 'draw') {
        ctx.globalCompositeOperation = data.tool === 'eraser'
          ? 'destination-out' : 'source-over'
        ctx.strokeStyle = data.color
        ctx.lineWidth   = data.size
        ctx.lineTo(x, y)
        ctx.stroke()

      } else if (data.type === 'end') {
        ctx.closePath()
        ctx.globalCompositeOperation = 'source-over'
      }
    }

    const onClear = () => {
      const canvas = canvasRef.current
      const ctx    = ctxRef.current
      if (!canvas || !ctx) return
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const onFill = ({ rx, ry, color: fillColor }) => {
      const canvas = canvasRef.current
      if (!canvas || !ctxRef.current) return
      doFloodFill(rx * canvas.width, ry * canvas.height, fillColor, false)
    }

    socket.on('draw-stroke', onStroke)
    socket.on('clear-canvas', onClear)
    socket.on('fill-canvas',  onFill)

    return () => {
      socket.off('draw-stroke', onStroke)
      socket.off('clear-canvas', onClear)
      socket.off('fill-canvas',  onFill)
    }
  }, [socket])

  // ── Get position + normalized ratio ─────────────────
  const getPos = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x:0, y:0, rx:0, ry:0 }
    const rect = canvas.getBoundingClientRect()
    const src  = e.touches ? e.touches[0] : e
    const x    = src.clientX - rect.left
    const y    = src.clientY - rect.top
    return { x, y, rx: x / canvas.width, ry: y / canvas.height }
  }

  const saveHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      historyRef.current.push(canvas.toDataURL())
      if (historyRef.current.length > 15) historyRef.current.shift()
    } catch(e) {}
  }

  // ── Draw events ──────────────────────────────────────
  const onDown = useCallback((e) => {
    if (!isDrawing) return
    e.preventDefault()
    isDown.current = true
    saveHistory()

    const { x, y, rx, ry } = getPos(e)
    const ctx = ctxRef.current
    if (!ctx) return

    if (tool === 'fill') {
      doFloodFill(x, y, color, true, rx, ry)
      return
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
    socket?.emit('draw-stroke', { roomCode, type:'begin', rx, ry, color, size:brushSize, tool })
  }, [isDrawing, tool, color, brushSize, socket, roomCode])

  const onMove = useCallback((e) => {
    if (!isDrawing || !isDown.current) return
    e.preventDefault()
    const { x, y, rx, ry } = getPos(e)
    const ctx = ctxRef.current
    if (!ctx) return

    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = color
    ctx.lineWidth   = brushSize
    ctx.lineTo(x, y)
    ctx.stroke()

    socket?.emit('draw-stroke', { roomCode, type:'draw', rx, ry, color, size:brushSize, tool })
  }, [isDrawing, tool, color, brushSize, socket, roomCode])

  const onUp = useCallback(() => {
    if (!isDown.current) return
    isDown.current = false
    const ctx = ctxRef.current
    if (ctx) { ctx.closePath(); ctx.globalCompositeOperation = 'source-over' }
    if (isDrawing) socket?.emit('draw-stroke', { roomCode, type:'end', rx:0, ry:0 })
  }, [isDrawing, socket, roomCode])

  // ── Actions ──────────────────────────────────────────
  const clearAll = () => {
    const canvas = canvasRef.current
    const ctx    = ctxRef.current
    if (!canvas || !ctx) return
    saveHistory()
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    socket?.emit('clear-canvas', { roomCode })
  }

  const undo = () => {
    if (!historyRef.current.length || !ctxRef.current) return
    const img  = new Image()
    img.onload = () => ctxRef.current.drawImage(img, 0, 0)
    img.src    = historyRef.current.pop()
  }

  const doFloodFill = (startX, startY, fillCol, emit=true, rx=0, ry=0) => {
    const canvas = canvasRef.current
    const ctx    = ctxRef.current
    if (!canvas || !ctx) return
    saveHistory()

    const W = canvas.width, H = canvas.height
    const sx = Math.max(0, Math.min(W-1, Math.floor(startX)))
    const sy = Math.max(0, Math.min(H-1, Math.floor(startY)))

    const imageData = ctx.getImageData(0, 0, W, H)
    const data      = imageData.data
    const startIdx  = (sy * W + sx) * 4
    const sR = data[startIdx], sG = data[startIdx+1], sB = data[startIdx+2]

    const toRgb = (hex) => [
      parseInt(hex.slice(1,3),16),
      parseInt(hex.slice(3,5),16),
      parseInt(hex.slice(5,7),16),
    ]
    const [fR, fG, fB] = toRgb(fillCol)
    if (sR===fR && sG===fG && sB===fB) return

    const stack   = [[sx, sy]]
    const visited = new Uint8Array(W * H)

    while (stack.length) {
      const [x, y] = stack.pop()
      if (x<0||x>=W||y<0||y>=H) continue
      const k = y*W+x
      if (visited[k]) continue
      visited[k] = 1
      const i = k*4
      if (data[i]!==sR || data[i+1]!==sG || data[i+2]!==sB) continue
      data[i]=fR; data[i+1]=fG; data[i+2]=fB; data[i+3]=255
      stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1])
    }
    ctx.putImageData(imageData, 0, 0)

    if (emit) socket?.emit('fill-canvas', {
      roomCode,
      rx: rx || startX/W,
      ry: ry || startY/H,
      color: fillCol,
    })
  }

  return (
    <div className="canvas-wrap">

      {isDrawing && (
        <div className="canvas-toolbar">
          <div className="toolbar-section">
            <button className={`tool-btn${tool==='pen'?' active':''}`}    onClick={()=>setTool('pen')}    title="Pen"><FaPen/></button>
            <button className={`tool-btn${tool==='eraser'?' active':''}`} onClick={()=>setTool('eraser')} title="Eraser"><FaEraser/></button>
            <button className={`tool-btn${tool==='fill'?' active':''}`}   onClick={()=>setTool('fill')}   title="Fill"><FaFill/></button>
          </div>
          <div className="toolbar-divider"/>
          <div className="toolbar-section">
            {BRUSH_SIZES.map(s=>(
              <button key={s} className={`size-btn${brushSize===s?' active':''}`} onClick={()=>setBrushSize(s)}>
                <span style={{width:Math.min(s,16),height:Math.min(s,16),borderRadius:'50%',background:color==='#FFFFFF'?'#999':color,display:'block'}}/>
              </button>
            ))}
          </div>
          <div className="toolbar-divider"/>
          <div className="toolbar-colors">
            {COLORS.map(c=>(
              <button
                key={c}
                className={`color-btn${color===c?' active':''}`}
                style={{background:c,border:c==='#FFFFFF'?'2px solid #ccc':undefined}}
                onClick={()=>setColor(c)}
              />
            ))}
          </div>
          <div className="toolbar-divider"/>
          <div className="toolbar-section">
            <button className="tool-btn tool-undo"  onClick={undo}     title="Undo"><FaUndo/></button>
            <button className="tool-btn tool-clear" onClick={clearAll} title="Clear"><FaTrash/></button>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`draw-canvas${isDrawing?' can-draw':''}`}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
        style={{ cursor: !isDrawing?'default': tool==='eraser'?'cell':'crosshair' }}
      />

      {!isDrawing && (
        <div className="canvas-watch-label">👀 Watch and guess!</div>
      )}
    </div>
  )
}