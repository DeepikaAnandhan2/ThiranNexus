import { useState } from 'react'
import {
  FaHome,
  FaBook,
  FaGamepad,
  FaTrophy,
  FaCog
} from 'react-icons/fa'
import './Sidebar.css'

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false)

  const menu = [
    { icon: <FaHome />, label: 'Dashboard' },
    { icon: <FaBook />, label: 'Education' },
    { icon: <FaGamepad />, label: 'Games' },
    { icon: <FaTrophy />, label: 'Badges' },
    { icon: <FaCog />, label: 'Settings' }
  ]

  return (
    <aside className={`sidebar ${expanded ? 'expanded' : ''}`}>
      
      {/* Toggle */}
      <div className="logo" onClick={() => setExpanded(!expanded)}>
        TN
      </div>

      {/* Menu */}
      <ul>
        {menu.map((item, i) => (
          <li key={i}>
            {item.icon}
            {expanded && <span>{item.label}</span>}
          </li>
        ))}
      </ul>

      {/* Profile */}
      <div className="profile">
        <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=user" />
      </div>

    </aside>
  )
}