// frontend/src/pages/ParentDashboard/ParentDashboard.jsx
// Complete parent dashboard with 6 tabs: Overview, Activity, Education, Schemes, Alerts, Help & Support
// Data fetched from /api/parent/* endpoints — no mock data
// Has its OWN sidebar — do NOT nest inside AppLayout

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { parentService } from '../../services/parentService'
import '../../styles/ParentDashboard.css'

// ── Disability emoji map ───────────────────────────────────
const EMOJI = { visual:'🟡', hearing:'👂', cognitive:'🧠', physical:'🦾', speech:'🗣️', none:'😊' }

// ── Heat colour ────────────────────────────────────────────
const heatColor = (n) => n===0?'#1e2236': n===1?'#4c3aed55': n<=3?'#6d28d9':'#8B5CF6'

// ── Skeleton loader ────────────────────────────────────────
function Skel({ h=80, mb=12 }) {
  return <div style={{ height:h, marginBottom:mb, borderRadius:10, background:'linear-gradient(90deg,#1e2236 25%,#262d44 50%,#1e2236 75%)', backgroundSize:'400px 100%', animation:'pdShimmer 1.4s infinite' }} />
}

// ── Student header card (dark top bar) ────────────────────
function StudentHeader({ student, overview }) {
  if (!student) return null
  const o  = overview?.overview || {}
  const emoji = EMOJI[student.disabilityType] || '😊'
  return (
    <div style={{ background:'#0f1629', borderRadius:16, padding:'24px 28px', display:'flex', alignItems:'center', gap:20, marginBottom:24, flexWrap:'wrap' }}>
      <div style={{ width:64, height:64, borderRadius:'50%', border:'3px solid #7c3aed', background:'#1e2236', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>{emoji}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:8 }}>{student.name}</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <span style={{ background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)', borderRadius:99, padding:'4px 10px', fontSize:12, fontWeight:600 }}>{student.disabilityType || 'none'}</span>
          {student.educationLevel && student.educationLevel !== 'none' && (
            <span style={{ background:'rgba(52,211,153,.2)', color:'#34d399', borderRadius:99, padding:'4px 10px', fontSize:12, fontWeight:600 }}>🏫 {student.educationLevel}{student.className ? ` ${student.className}` : ''}</span>
          )}
          {student.udid && (
            <span style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.6)', borderRadius:99, padding:'4px 10px', fontSize:12 }}>⊟ {student.udid}</span>
          )}
        </div>
      </div>
      <div style={{ display:'flex', gap:32 }}>
        {[
          { val: o.studyTime||'0h',   lbl:'Study Time' },
          { val: o.totalGames||0,      lbl:'Games' },
          { val: o.totalPoints||0,     lbl:'Points' },
          { val: o.lastSeen ? '●' : '—', lbl:'Last Seen', col:'#34d399' },
        ].map((s,i) => (
          <div key={i} style={{ textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:800, color: s.col||'#fff' }}>{s.val}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:2 }}>{s.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ══════════════════════════════════════════════════════════
function OverviewTab({ data, loading }) {
  if (loading) return <><Skel h={160}/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>{[1,2,3].map(i=><Skel key={i} h={110} mb={0}/>)}</div></>
  if (!data) return null
  const o = data.overview || {}
  const maxBar = Math.max(...(o.weeklySeries||[1]),1)

  return (
    <>
      {/* Weekly engagement */}
      <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff', marginBottom:20 }}>
        <div style={{ fontWeight:700, color:'#1a1a2e', fontSize:15, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>📊 Weekly Engagement</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, alignItems:'flex-end', height:120 }}>
          {(o.weeklyLabels||['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).map((day,i) => {
            const val = (o.weeklySeries||[])[i]||0
            const h   = val > 0 ? Math.max(8,(val/maxBar)*100) : 3
            return (
              <div key={day} style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', gap:6, height:'100%' }}>
                <div style={{ flex:1, width:'100%', display:'flex', alignItems:'flex-end', background:'#f3f4f6', borderRadius:6, overflow:'hidden' }}>
                  <div style={{ width:'100%', height:`${h}%`, background:'linear-gradient(180deg,#a78bfa,#7c3aed)', borderRadius:6, minHeight:3 }} title={`${val} sessions`}/>
                </div>
                <span style={{ fontSize:11, color:'#9ca3af', fontWeight:500 }}>{day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3 metric cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
        {[
          { icon:'📚', iconBg:'#ede9fe', color:'#7c3aed', border:'#7c3aed', val:o.studyTime||'0h',      label:'Learning Time',   sub:'Waiting for first session' },
          { icon:'🎯', iconBg:'#d1fae5', color:'#059669', border:'#10b981', val:`${o.speechAccuracy||0}%`, label:'Speech Accuracy',  sub:'Based on Tongue Twisters' },
          { icon:'🔥', iconBg:'#ffedd5', color:'#ea580c', border:'#f97316', val:o.mathStreak||0,          label:'Math Streak',     sub:'Record correct answers' },
        ].map(m=>(
          <div key={m.label} style={{ background:'#fff', borderRadius:14, padding:'20px 22px', boxShadow:'0 1px 8px rgba(0,0,0,.06)', display:'flex', alignItems:'center', gap:16, borderLeft:`4px solid ${m.border}` }}>
            <div style={{ width:44, height:44, borderRadius:10, background:m.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{m.icon}</div>
            <div>
              <div style={{ fontSize:24, fontWeight:800, color:m.color }}>{m.val}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'3px 0 1px' }}>{m.label}</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Category performance */}
      <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff' }}>
        <div style={{ fontWeight:700, color:'#1a1a2e', fontSize:15, marginBottom:16 }}>📈 Category Performance</div>
        {(o.categoryPerformance||[]).map(c=>(
          <div key={c.label} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
              <span style={{ color:'#555', fontWeight:500 }}>{c.label}</span>
              <span style={{ fontWeight:700, color:c.color }}>{c.pct}%</span>
            </div>
            <div style={{ height:8, background:'#f3f4f6', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${c.pct}%`, background:c.color, borderRadius:99, transition:'width .7s ease' }}/>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════
// TAB: ACTIVITY
// ══════════════════════════════════════════════════════════
function ActivityTab({ data, loading }) {
  if (loading) return <div>{[1,2,3,4].map(i=><Skel key={i} h={64}/>)}</div>
  if (!data) return null
  const feed    = data.feed    || []
  const heatmap = data.heatmap || {}
  const stats   = data.stats   || {}

  const rows = []
  const keys = Object.keys(heatmap).sort()
  for (let i=0; i<keys.length; i+=7) rows.push(keys.slice(i,i+7))

  const TYPE = { math:{icon:'🧮',color:'#7c3aed'}, twister:{icon:'🗣️',color:'#2563eb'}, scribble:{icon:'🎨',color:'#0d9488'} }

  return (
    <>
      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
        {[
          { val:stats.totalSessions||0, lbl:'Total Sessions', color:'#7c3aed' },
          { val:stats.thisWeek||0,      lbl:'This Week',      color:'#10b981' },
          { val:stats.bestStreak||0,    lbl:'Best Streak',    color:'#f97316' },
        ].map(s=>(
          <div key={s.lbl} style={{ background:'#fff', borderRadius:14, padding:'16px 20px', boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff' }}>
            <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:13, color:'#888', marginTop:4 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff', marginBottom:20 }}>
        <div style={{ fontWeight:700, color:'#1a1a2e', fontSize:15, marginBottom:16 }}>📅 28-Day Activity Heatmap</div>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {rows.map((row,ri)=>(
            <div key={ri} style={{ display:'flex', gap:4 }}>
              {row.map(date=>(
                <div key={date} title={`${date}: ${heatmap[date]||0} sessions`}
                  style={{ width:16, height:16, borderRadius:3, background:heatColor(heatmap[date]||0), cursor:'default', transition:'transform .1s' }}
                  onMouseEnter={e=>e.target.style.transform='scale(1.4)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', fontSize:11, color:'#9ca3af', marginTop:10 }}>
          <span>Less</span>
          {[0,1,2,4].map(c=><div key={c} style={{ width:12, height:12, borderRadius:2, background:heatColor(c) }}/>)}
          <span>More</span>
        </div>
      </div>

      {/* Feed */}
      <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff' }}>
        <div style={{ fontWeight:700, color:'#1a1a2e', fontSize:15, marginBottom:16 }}>🕐 Recent Sessions</div>
        {feed.length===0
          ? <div style={{ textAlign:'center', color:'#9ca3af', padding:'24px 0' }}>No sessions yet. Encourage your child to start playing!</div>
          : feed.map((a,i)=>{
              const m = TYPE[a.type]||TYPE.math
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom: i<feed.length-1?'1px solid #f9fafb':'none' }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{m.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1a1a2e' }}>{a.label}</div>
                    <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{a.detail}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:14, fontWeight:800, color:m.color }}>{a.score}</div>
                    <div style={{ fontSize:11, color:'#d1d5db' }}>{new Date(a.date).toLocaleDateString()}</div>
                  </div>
                </div>
              )
            })
        }
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════
// TAB: EDUCATION
// ══════════════════════════════════════════════════════════
function EducationTab({ data, loading }) {
  if (loading) return <div>{[1,2,3].map(i=><Skel key={i} h={80}/>)}</div>
  if (!data) return null
  const bd   = data.breakdown  || []
  const quiz = data.quizStats  || {}
  const wt   = data.weeklyTrend || {}

  return (
    <>
      <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff', marginBottom:20 }}>
        <div style={{ fontWeight:700, color:'#1a1a2e', fontSize:15, marginBottom:16 }}>📖 Subject Performance</div>
        {bd.map(s=>(
          <div key={s.subject} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
              <span style={{ color:'#374151', fontWeight:600 }}>{s.subject} — {s.lessonsCompleted} lessons</span>
              <span style={{ fontWeight:700, color:s.color }}>{s.quizAvg}%</span>
            </div>
            <div style={{ height:8, background:'#f3f4f6', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${s.quizAvg}%`, background:s.color, borderRadius:99 }}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff' }}>
          <div style={{ fontWeight:700, color:'#1a1a2e', fontSize:15, marginBottom:16 }}>📅 Weekly Progress</div>
          {(wt.datasets||[]).map(ds=>(
            <div key={ds.label} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                <span style={{ color:'#555' }}>{ds.label}</span>
                <span style={{ fontWeight:700, color:ds.color }}>{ds.data[3]} sessions</span>
              </div>
              <div style={{ height:6, background:'#f3f4f6', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(100,(ds.data[3]/10)*100)}%`, background:ds.color, borderRadius:99 }}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff' }}>
          <div style={{ fontWeight:700, color:'#1a1a2e', fontSize:15, marginBottom:16 }}>✅ Quiz Accuracy</div>
          {[
            { lbl:'Correct', pct:quiz.correct||0, color:'#10b981' },
            { lbl:'Wrong',   pct:quiz.wrong  ||0, color:'#ef4444' },
            { lbl:'Skipped', pct:quiz.skipped||0, color:'#f97316' },
          ].map(q=>(
            <div key={q.lbl} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                <span style={{ display:'flex', alignItems:'center', gap:6, color:'#374151', fontWeight:600 }}>
                  <span style={{ width:10, height:10, borderRadius:2, background:q.color, display:'inline-block' }}/>
                  {q.lbl}
                </span>
                <span style={{ fontWeight:700, color:q.color }}>{q.pct}%</span>
              </div>
              <div style={{ height:6, background:'#f3f4f6', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${q.pct}%`, background:q.color, borderRadius:99 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════
// TAB: SCHEMES
// ══════════════════════════════════════════════════════════
function SchemesTab({ data, loading }) {
  if (loading) return <div>{[1,2,3].map(i=><Skel key={i} h={100}/>)}</div>
  if (!data) return null
  const schemes = data.schemes || []

  return (
    <>
      {data.studentDisability && (
        <div style={{ background:'#f5f3ff', border:'1.5px solid #ddd6fe', borderRadius:14, padding:'14px 18px', marginBottom:20, fontSize:14, color:'#6d28d9', fontWeight:600 }}>
          🎯 Showing schemes matched to your child's <strong>{data.studentDisability}</strong> disability profile
          {data.studentState && <> in <strong>{data.studentState}</strong></>}
        </div>
      )}

      {schemes.length === 0 ? (
        <div style={{ textAlign:'center', padding:48, color:'#9ca3af' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#374151' }}>No schemes found</div>
          <div style={{ fontSize:14, marginTop:8 }}>Add schemes in the Admin dashboard under Content → Schemes</div>
        </div>
      ) : schemes.map((s,i)=>(
        <div key={s._id||i} style={{ background:'#fff', borderRadius:14, padding:20, boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff', marginBottom:12, display:'flex', alignItems:'flex-start', gap:16 }}>
          <div style={{ width:42, height:42, borderRadius:10, background:'#f0ebff', color:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🏆</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:'#1a1a2e', fontSize:14, marginBottom:4 }}>{s.title}</div>
            <div style={{ fontSize:12, color:'#888', marginBottom:8 }}>{s.description}</div>
            {s.lastDate && <div style={{ fontSize:11, color:'#f97316', fontWeight:600 }}>📅 Last date: {s.lastDate}</div>}
          </div>
          {s.applyLink && (
            <a href={s.applyLink} target="_blank" rel="noreferrer"
              style={{ background:'#f0ebff', color:'#7c3aed', borderRadius:8, padding:'6px 14px', fontSize:12, fontWeight:700, textDecoration:'none', flexShrink:0 }}>
              Apply →
            </a>
          )}
        </div>
      ))}
    </>
  )
}

// ══════════════════════════════════════════════════════════
// TAB: ALERTS
// ══════════════════════════════════════════════════════════
function AlertsTab({ data, loading }) {
  if (loading) return <div>{[1,2].map(i=><Skel key={i} h={80}/>)}</div>
  if (!data) return null
  const alerts = data.alerts || []
  const tips   = data.aiTips || []

  const SEV = {
    critical: { bg:'#fee2e2', icon:'🚨', textColor:'#991b1b', badgeBg:'#fee2e2', badgeColor:'#991b1b' },
    warning:  { bg:'#fef3c7', icon:'⚠️', textColor:'#92400e', badgeBg:'#fef3c7', badgeColor:'#92400e' },
    info:     { bg:'#dbeafe', icon:'ℹ️', textColor:'#1d4ed8', badgeBg:'#dbeafe', badgeColor:'#1d4ed8' },
  }

  return (
    <>
      {/* Count chips */}
      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        {[
          { lbl:'Active',   val:data.counts?.active||0,   color:'#ef4444', bg:'#fee2e2' },
          { lbl:'Critical', val:data.counts?.critical||0, color:'#dc2626', bg:'#fecaca' },
          { lbl:'Resolved', val:data.counts?.resolved||0, color:'#059669', bg:'#dcfce7' },
        ].map(c=>(
          <div key={c.lbl} style={{ background:c.bg, borderRadius:10, padding:'10px 18px' }}>
            <div style={{ fontSize:22, fontWeight:800, color:c.color }}>{c.val}</div>
            <div style={{ fontSize:12, color:c.color, fontWeight:600 }}>{c.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff', marginBottom:20 }}>
        <div style={{ fontWeight:700, color:'#1a1a2e', fontSize:15, marginBottom:16 }}>🔔 Recent Alerts</div>
        {alerts.length===0
          ? <div style={{ textAlign:'center', color:'#9ca3af', padding:'20px 0' }}>No new notifications.</div>
          : alerts.map(a=>{
              const m = SEV[a.severity]||SEV.info
              return (
                <div key={a._id} style={{ borderRadius:12, padding:'14px 16px', marginBottom:10, background:a.status==='Resolved'?'#f9fafb':m.bg, display:'flex', alignItems:'flex-start', gap:12 }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{m.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:a.status==='Resolved'?'#6b7280':m.textColor }}>{a.alert}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:3 }}>{new Date(a.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, borderRadius:99, padding:'2px 8px', background:a.status==='Resolved'?'#dcfce7':m.badgeBg, color:a.status==='Resolved'?'#166534':m.badgeColor }}>{a.status}</span>
                </div>
              )
            })
        }
      </div>

      {tips.length>0 && (
        <div style={{ background:'#f5f3ff', border:'1.5px solid #ddd6fe', borderRadius:14, padding:'18px 20px' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#6d28d9', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
            🛡️ AI-Powered Tips for {data.studentName}
          </div>
          {tips.map((t,i)=>(
            <div key={i} style={{ fontSize:13, color:'#4c1d95', marginBottom:8, paddingLeft:4 }}>• {t}</div>
          ))}
        </div>
      )}
    </>
  )
}

// ══════════════════════════════════════════════════════════
// TAB: HELP & SUPPORT
// ══════════════════════════════════════════════════════════
function SupportTab({ supportData, loadingSupport, onSubmit, submitting }) {
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ subject:'', message:'', category:'Feedback' })
  const [selected, setSelected]   = useState(null)
  const [formErr, setFormErr]     = useState('')

  const tickets = supportData?.tickets || []

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) { setFormErr('Subject and message are required'); return }
    setFormErr('')
    const ok = await onSubmit(form)
    if (ok) { setForm({ subject:'', message:'', category:'Feedback' }); setShowForm(false) }
  }

  const CATS = ['Bug','Feature','Audio','Feedback','Other']
  const STATUS_STYLE = {
    'Open':         { bg:'#fef3c7', color:'#92400e' },
    'In Progress':  { bg:'#dbeafe', color:'#1d4ed8' },
    'Resolved':     { bg:'#dcfce7', color:'#166534' },
  }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div style={{ fontWeight:800, color:'#1a1a2e', fontSize:16 }}>Help & Support</div>
          <div style={{ fontSize:13, color:'#8B5CF6', marginTop:2 }}>Submit a ticket and get a reply from the admin team.</div>
        </div>
        <button onClick={()=>{ setShowForm(!showForm); setFormErr('') }}
          style={{ background:'linear-gradient(135deg,#8B5CF6,#5c29e7)', color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontWeight:700, fontSize:14, cursor:'pointer' }}>
          {showForm ? '✕ Cancel' : '+ New Ticket'}
        </button>
      </div>

      {showForm && (
        <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 2px 16px rgba(92,41,231,.07)', border:'1.5px solid #f0ebff', marginBottom:20 }}>
          <div style={{ fontWeight:800, color:'#1a1a2e', marginBottom:16 }}>Submit New Ticket</div>
          {formErr && <div style={{ background:'#fee2e2', borderRadius:8, padding:'8px 12px', color:'#991b1b', fontSize:13, marginBottom:12 }}>⚠️ {formErr}</div>}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:13, fontWeight:700, color:'#555', display:'block', marginBottom:6 }}>Category</label>
            <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}
              style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #e8e3ff', fontSize:14, outline:'none' }}>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:13, fontWeight:700, color:'#555', display:'block', marginBottom:6 }}>Subject</label>
            <input value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))}
              placeholder="Describe your issue briefly…"
              style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #e8e3ff', fontSize:14, outline:'none', boxSizing:'border-box' }}/>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:13, fontWeight:700, color:'#555', display:'block', marginBottom:6 }}>Message</label>
            <textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} rows={4}
              placeholder="Describe in detail…"
              style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #e8e3ff', fontSize:14, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}/>
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ background:'linear-gradient(135deg,#8B5CF6,#5c29e7)', color:'#fff', border:'none', borderRadius:10, padding:'11px 24px', fontWeight:700, fontSize:14, cursor:submitting?'not-allowed':'pointer', opacity:submitting?.7:1 }}>
            {submitting ? 'Submitting…' : 'Submit Ticket'}
          </button>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:20 }}>
        {/* List */}
        <div style={{ background:'#fff', borderRadius:16, padding:20, boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff' }}>
          <div style={{ fontWeight:700, color:'#1a1a2e', marginBottom:12 }}>Your Tickets ({tickets.length})</div>
          {loadingSupport ? [1,2].map(i=><Skel key={i} h={70}/>) : tickets.length===0
            ? <div style={{ textAlign:'center', padding:32, color:'#9ca3af' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>💬</div>
                <div style={{ fontSize:13 }}>No tickets yet. Click "+ New Ticket" to get help.</div>
              </div>
            : tickets.map(t=>(
                <div key={t._id} onClick={()=>setSelected(t)}
                  style={{ padding:14, borderRadius:12, marginBottom:8, cursor:'pointer', background:selected?._id===t._id?'#f0ebff':'#faf9ff', border:`1.5px solid ${selected?._id===t._id?'#8B5CF6':'#f0ebff'}`, transition:'all .15s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontWeight:700, color:'#1a1a2e', fontSize:13 }}>{t.subject}</span>
                    <span style={{ ...(STATUS_STYLE[t.status]||STATUS_STYLE.Open), borderRadius:6, padding:'2px 8px', fontWeight:700, fontSize:11 }}>{t.status}</span>
                  </div>
                  <div style={{ fontSize:12, color:'#888' }}>{t.category} · {new Date(t.createdAt).toLocaleDateString()}</div>
                  {t.replies?.length>0 && <div style={{ fontSize:11, color:'#8B5CF6', fontWeight:700, marginTop:4 }}>💬 {t.replies.length} admin repl{t.replies.length===1?'y':'ies'}</div>}
                </div>
              ))
          }
        </div>

        {/* Thread */}
        {selected
          ? (
            <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff', display:'flex', flexDirection:'column' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, paddingBottom:16, borderBottom:'1px solid #f0ebff' }}>
                <div>
                  <div style={{ fontSize:17, fontWeight:800, color:'#1a1a2e' }}>{selected.subject}</div>
                  <div style={{ fontSize:13, color:'#888', marginTop:2 }}>{selected.category} · {new Date(selected.createdAt).toLocaleDateString()}</div>
                </div>
                <span style={{ ...(STATUS_STYLE[selected.status]||STATUS_STYLE.Open), borderRadius:8, padding:'5px 14px', fontWeight:700, fontSize:13 }}>{selected.status}</span>
              </div>
              <div style={{ flex:1, overflowY:'auto', maxHeight:350, display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                {/* Original */}
                <div style={{ background:'#faf9ff', borderRadius:'0 12px 12px 12px', padding:'12px 16px', fontSize:14, color:'#333', border:'1.5px solid #f0ebff' }}>
                  {selected.message}
                  <div style={{ fontSize:11, color:'#aaa', marginTop:6 }}>You · {new Date(selected.createdAt).toLocaleString()}</div>
                </div>
                {/* Replies */}
                {(selected.replies||[]).length===0
                  ? <div style={{ textAlign:'center', fontSize:13, color:'#aaa', padding:'12px 0' }}>⏳ Waiting for admin reply…</div>
                  : (selected.replies||[]).map((r,i)=>
                      r.from==='admin'
                        ? <div key={i} style={{ alignSelf:'flex-end', maxWidth:'80%' }}>
                            <div style={{ background:'#ede9fe', borderRadius:'12px 0 12px 12px', padding:'10px 14px', fontSize:13, color:'#5b21b6' }}>{r.message}</div>
                            <div style={{ fontSize:11, color:'#aaa', textAlign:'right', marginTop:4 }}>Admin · {new Date(r.sentAt).toLocaleString()}</div>
                          </div>
                        : <div key={i} style={{ background:'#faf9ff', borderRadius:'0 12px 12px 12px', padding:'10px 14px', fontSize:13, color:'#333', maxWidth:'80%', border:'1.5px solid #f0ebff' }}>{r.message}</div>
                    )
                }
              </div>
              {selected.status==='Resolved'
                ? <div style={{ background:'#dcfce7', borderRadius:10, padding:'10px 16px', fontSize:13, color:'#166534', fontWeight:600 }}>✅ Ticket resolved. Open a new one if you need more help.</div>
                : <div style={{ background:'#f5f3ff', borderRadius:10, padding:'10px 16px', fontSize:13, color:'#5b21b6' }}>💬 The admin team will reply here soon.</div>
              }
            </div>
          )
          : (
            <div style={{ background:'#fff', borderRadius:16, padding:48, boxShadow:'0 1px 8px rgba(0,0,0,.06)', border:'1.5px solid #f0ebff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
              <div style={{ fontWeight:700, color:'#1a1a2e' }}>Select a ticket to view</div>
              <div style={{ color:'#aaa', fontSize:13, marginTop:6 }}>or create a new one above</div>
            </div>
          )
        }
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
const NAV = [
  { id:'overview',  label:'Overview',        icon:'📊' },
  { id:'activity',  label:'Activity',        icon:'🕐' },
  { id:'education', label:'Education',       icon:'📖' },
  { id:'schemes',   label:'Schemes',         icon:'🏆' },
  { id:'alerts',    label:'Alerts',          icon:'🔔' },
  { id:'support',   label:'Help & Support',  icon:'💬' },
]

export default function ParentDashboard() {
  const navigate    = useNavigate()
  const [children,  setChildren]  = useState([])
  const [activeChild, setActiveChild] = useState(null)
  const [activeNav, setActiveNav] = useState('overview')
  const [loadingChildren, setLoadingChildren] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [tabData,   setTabData]   = useState(null)
  const [supportData, setSupportData] = useState(null)
  const [loadingSupport, setLoadingSupport] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const cache = useRef({})

  // Load children on mount
  useEffect(() => {
    parentService.getChildren()
      .then(r => {
        const kids = r.children || []
        setChildren(kids)
        if (kids.length > 0) setActiveChild(kids[0])
      })
      .catch(e => setError(e?.response?.data?.error || e.message))
      .finally(() => setLoadingChildren(false))
  }, [])

  // Load support tickets separately (not child-specific)
  const loadSupport = useCallback(async () => {
    setLoadingSupport(true)
    try { setSupportData(await parentService.getSupport()) }
    catch (e) { setError(e?.response?.data?.error || e.message) }
    finally { setLoadingSupport(false) }
  }, [])

  // Fetch tab data when child or nav changes
  useEffect(() => {
    if (activeNav === 'support') { loadSupport(); setTabData(null); return }
    if (!activeChild) return
    const cacheKey = `${activeChild._id}:${activeNav}`
    if (cache.current[cacheKey]) { setTabData(cache.current[cacheKey]); return }

    setTabLoading(true); setTabData(null)
    const loaders = {
      overview:  () => parentService.getOverview(activeChild._id),
      activity:  () => parentService.getActivity(activeChild._id),
      education: () => parentService.getEducation(activeChild._id),
      schemes:   () => parentService.getSchemes(activeChild._id),
      alerts:    () => parentService.getAlerts(activeChild._id),
    }
    loaders[activeNav]()
      .then(d => { cache.current[cacheKey] = d; setTabData(d) })
      .catch(e => setError(e?.response?.data?.error || e.message))
      .finally(() => setTabLoading(false))
  }, [activeChild, activeNav, loadSupport])

  // Also fetch overview whenever child changes (for header stats)
  const overviewData = activeChild ? cache.current[`${activeChild._id}:overview`] : null

  const handleSubmitSupport = async (form) => {
    setSubmitting(true)
    try {
      await parentService.submitSupport(form)
      setSuccess('Ticket submitted!')
      setSupportData(null)
      loadSupport()
      return true
    } catch (e) {
      setError(e?.response?.data?.error || 'Submission failed')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loadingChildren) {
    return (
      <div style={{ display:'flex', height:'100vh', background:'#f0f2f8', fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:260, background:'#1a1f36', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ color:'rgba(255,255,255,.5)', fontSize:14 }}>Loading…</div>
        </div>
        <div style={{ flex:1, padding:24 }}><Skel h={100}/><Skel h={200}/></div>
      </div>
    )
  }

  // No children state
  if (children.length === 0) {
    return (
      <div style={{ display:'flex', height:'100vh', background:'#f0f2f8', fontFamily:"'DM Sans',sans-serif", alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center', color:'#9ca3af', padding:40 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>👨‍👩‍👧</div>
          <div style={{ fontSize:20, fontWeight:700, color:'#374151', marginBottom:8 }}>No children linked</div>
          <div style={{ fontSize:14, marginBottom:24, maxWidth:360 }}>
            {error || 'Your account is not linked to any student. Register with the student\'s UDID to link accounts.'}
          </div>
          <button onClick={() => navigate('/login')} style={{ background:'#7c3aed', color:'#fff', border:'none', borderRadius:10, padding:'10px 24px', fontWeight:700, cursor:'pointer', fontSize:14 }}>
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f0f2f8', fontFamily:"'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @keyframes pdShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
      `}</style>

      {/* ── SIDEBAR ───────────────────────────────────────── */}
      <aside style={{ width:260, minHeight:'100vh', background:'#1a1f36', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, overflowY:'auto', zIndex:100 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'24px 20px 20px', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
          <span style={{ fontSize:22 }}>🎓</span>
          <span style={{ fontSize:16, fontWeight:700, color:'#fff' }}>Parent Dashboard</span>
        </div>

        {/* Children list */}
        <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.35)', letterSpacing:'1.2px', textTransform:'uppercase', padding:'20px 20px 10px' }}>My Children</div>
        {children.map(child=>(
          <button key={child._id}
            onClick={()=>{ setActiveChild(child); setActiveNav('overview'); setTabData(null) }}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', margin:'0 8px 4px', borderRadius:10, cursor:'pointer', border:'none', background:activeChild?._id===child._id?'rgba(124,58,237,.35)':'transparent', width:'calc(100% - 16px)', textAlign:'left', transition:'background .2s' }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:'#2d3458', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, border:activeChild?._id===child._id?'2px solid #a78bfa':'2px solid rgba(255,255,255,.15)', flexShrink:0 }}>
              {EMOJI[child.disabilityType]||'😊'}
            </div>
            <div>
              <div style={{ fontSize:13.5, fontWeight:600, color:'#fff' }}>{child.name}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', textTransform:'capitalize' }}>{child.disabilityType||'None'}</div>
            </div>
          </button>
        ))}

        {/* Nav */}
        <div style={{ height:1, background:'rgba(255,255,255,.08)', margin:'16px 0' }}/>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setActiveNav(n.id)}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 20px', cursor:'pointer', border:'none', background:activeNav===n.id?'rgba(124,58,237,.3)':'transparent', width:'100%', textAlign:'left', color:activeNav===n.id?'#a78bfa':'rgba(255,255,255,.55)', fontSize:14, fontWeight:activeNav===n.id?700:500, fontFamily:'inherit', borderLeft:activeNav===n.id?'3px solid #7c3aed':'3px solid transparent', transition:'all .15s' }}>
            <span style={{ fontSize:15, width:18, textAlign:'center' }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </aside>

      {/* ── MAIN ──────────────────────────────────────────── */}
      <main style={{ marginLeft:260, flex:1, padding:24, minHeight:'100vh' }}>
        {/* Error / Success banners */}
        {error && (
          <div style={{ background:'#fee2e2', borderRadius:10, padding:'12px 16px', color:'#991b1b', marginBottom:16, fontSize:14, fontWeight:600, display:'flex', justifyContent:'space-between' }}>
            ⚠️ {error}
            <button onClick={()=>setError('')} style={{ background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>✕</button>
          </div>
        )}
        {success && (
          <div style={{ background:'#dcfce7', borderRadius:10, padding:'12px 16px', color:'#166534', marginBottom:16, fontSize:14, fontWeight:600, display:'flex', justifyContent:'space-between' }}>
            ✅ {success}
            <button onClick={()=>setSuccess('')} style={{ background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>✕</button>
          </div>
        )}

        {/* Student header — always visible (except on support tab) */}
        {activeNav !== 'support' && (
          <StudentHeader student={activeChild} overview={overviewData} />
        )}

        {/* Tab content */}
        {activeNav==='overview'  && <OverviewTab   data={tabData}    loading={tabLoading && !tabData} />}
        {activeNav==='activity'  && <ActivityTab   data={tabData}    loading={tabLoading && !tabData} />}
        {activeNav==='education' && <EducationTab  data={tabData}    loading={tabLoading && !tabData} />}
        {activeNav==='schemes'   && <SchemesTab    data={tabData}    loading={tabLoading && !tabData} />}
        {activeNav==='alerts'    && <AlertsTab     data={tabData}    loading={tabLoading && !tabData} />}
        {activeNav==='support'   && <SupportTab    supportData={supportData} loadingSupport={loadingSupport} onSubmit={handleSubmitSupport} submitting={submitting} />}
      </main>
    </div>
  )
}