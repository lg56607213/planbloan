import { useRef, useState } from 'react'

interface Props {
  onChange: (dataUrl: string | null) => void
}

export default function SignaturePad({ onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const t = e.touches[0]
      return { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    drawing.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1d4ed8'
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasDrawn(true)
  }

  function end() {
    if (!drawing.current) return
    drawing.current = false
    onChange(canvasRef.current!.toDataURL('image/png'))
  }

  function clear() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
    onChange(null)
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={300}
        height={120}
        className="border rounded bg-white touch-none"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">{hasDrawn ? '서명이 입력되었습니다.' : '위 칸에 서명해 주세요.'}</span>
        <button type="button" onClick={clear} className="text-xs text-blue-600 underline">
          지우기
        </button>
      </div>
    </div>
  )
}
