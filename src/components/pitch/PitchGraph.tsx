import { useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';

export default function PitchGraph() {
  const { theme, pitchHistory } = useStore();
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = isDark ? '#111827' : '#f9fafb';
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = isDark ? '#1f2937' : '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const y = (i / 12) * rect.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    if (pitchHistory.length < 2) return;

    const freqs = pitchHistory.map(p => p.frequency);
    const minFreq = Math.max(50, Math.min(...freqs) - 50);
    const maxFreq = Math.min(1500, Math.max(...freqs) + 50);
    const range = maxFreq - minFreq;

    ctx.beginPath();
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, 'rgba(59,130,246,0.8)');
    gradient.addColorStop(1, 'rgba(59,130,246,0.1)');
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;

    pitchHistory.forEach((p, i) => {
      const x = (i / (pitchHistory.length - 1)) * rect.width;
      const y = rect.height - ((p.frequency - minFreq) / range) * rect.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    const lastX = rect.width;
    const lastY = rect.height - ((freqs[freqs.length - 1] - minFreq) / range) * rect.height;
    ctx.lineTo(lastX, rect.height);
    ctx.lineTo(0, rect.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(59,130,246,0.1)';
    ctx.fill();
  }, [pitchHistory, isDark]);

  return <canvas ref={canvasRef} className="w-full h-40 rounded-xl" />;
}
