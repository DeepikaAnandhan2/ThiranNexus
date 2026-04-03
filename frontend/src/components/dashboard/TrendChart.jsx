// src/components/dashboard/TrendChart.jsx
import { useEffect, useRef } from 'react'
import {
  Chart, LineElement, PointElement, LinearScale,
  CategoryScale, Filler, Tooltip, Legend,
} from 'chart.js'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend)

const isDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches
const gc     = () => isDark() ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.07)'
const tc     = () => isDark() ? '#9c9a92' : '#73726c'

export default function TrendChart({ labels = [], lessonSeries = [], gameSeries = [] }) {
  const ref  = useRef(null)
  const inst = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    inst.current?.destroy()
    inst.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Lessons',
            data: lessonSeries,
            borderColor: '#3B8BD4',
            backgroundColor: 'rgba(59,139,212,.12)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#3B8BD4',
          },
          {
            label: 'Games',
            data: gameSeries,
            borderColor: '#D4537E',
            backgroundColor: 'rgba(212,83,126,.08)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#D4537E',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gc() }, ticks: { color: tc(), font: { size: 11 } } },
          y: { grid: { color: gc() }, ticks: { color: tc(), font: { size: 11 }, stepSize: 2 }, min: 0 },
        },
      },
    })
    return () => inst.current?.destroy()
  }, [labels, lessonSeries, gameSeries])

  return (
    <div style={{ position: 'relative', width: '100%', height: 200 }}>
      <canvas ref={ref} />
    </div>
  )
}