import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FaHome,
  FaBook,
  FaGamepad,
  FaTrophy,
  FaCog,
  FaSignOutAlt,
  FaUserShield,
  FaEdit
} from 'react-icons/fa'
import './Sidebar.css'

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()

  const menu = [
    { icon: <FaHome />, label: 'Home', path: '/home' },
    { icon: <FaBook />, label: 'Education', path: '/education' },
    { icon: <FaGamepad />, label: 'Games', path: '/games' },
    { icon: <FaEdit />, label: 'Scribble', path: '/scribble' },
    { icon: <FaTrophy />, label: 'Schemes', path: '/schemes' },
    { icon: <FaUserShield />, label: 'Parent Portal', path: '/parent-dashboard' },
    
  ]

  const handleLogout = () => {
    navigate('/')
  }

  return (
    <aside className={`sidebar ${expanded ? 'expanded' : ''}`}>

      {/* Logo */}
      <div className="logo" onClick={() => setExpanded(!expanded)}>
        TN
      </div>

      {/* Menu */}
      <ul>
        {menu.map((item, i) => (
          <li key={i}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="nav-link logout" onClick={handleLogout}>
          <span className="icon"><FaSignOutAlt /></span>
          <span className="label">Logout</span>
        </div>

        <div className="profile">
          <img
            src="https://api.dicebear.com/7.x/adventurer/svg?seed=user"
            alt="user"
          />
        </div>
      </div>

    </aside>
  )
}