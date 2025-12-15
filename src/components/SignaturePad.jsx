import { useRef, useState, useEffect } from 'react'
import '../styles/SignaturePad.css'

export function SignaturePad({ onSave, initialSignature = null }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(!!initialSignature)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    if (initialSignature) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        setHasSignature(true)
      }
      img.src = initialSignature
    }
  }, [initialSignature])

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    const x = e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left
    const y = e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    const x = e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left
    const y = e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top
    
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      const canvas = canvasRef.current
      if (canvas) {
        const signature = canvas.toDataURL('image/png')
        setHasSignature(true)
        if (onSave) {
          onSave(signature)
        }
      }
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    if (onSave) {
      onSave(null)
    }
  }

  return (
    <div className="signature-pad-container">
      <div className="signature-pad-wrapper">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="signature-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="signature-pad-actions">
        <button
          type="button"
          onClick={clearSignature}
          className="signature-clear-btn"
          disabled={!hasSignature}
        >
          清除簽名
        </button>
      </div>
    </div>
  )
}

