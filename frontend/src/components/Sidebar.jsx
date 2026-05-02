import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHome, FaBook, FaGamepad, FaTrophy,
  FaSignOutAlt, FaEdit, FaComments, FaGraduationCap
} from 'react-icons/fa';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();

  const menu = [
    { icon: <FaHome />, label: 'Home', path: '/dashboard' },
    { icon: <FaBook />, label: 'Education', path: '/education' },
    { icon: <FaGraduationCap />, label: 'SmartLearn', path: '/education2' },
    { icon: <FaGamepad />, label: 'Games', path: '/games' },
    { icon: <FaEdit />, label: 'Scribble', path: '/scribble' },
    { icon: <FaTrophy />, label: 'Schemes', path: '/schemes' },
    { icon: <FaComments />, label: 'Help & Support', path: '/feedback' },
  ];

  return (
    <aside className="sidebar expanded">
      <div className="logo">ThiranNexus</div>

      <nav className="sidebar-nav">
        <ul>
          {menu.map((item, i) => (
            <li key={i}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="nav-link logout" onClick={() => navigate('/')}>
          <span className="icon"><FaSignOutAlt /></span>
          <span className="label">Logout</span>
        </div>

        <div className="profile-section">
          <img
            src="https://api.dicebear.com/7.x/adventurer/svg?seed=user"
            alt="user"
          />
        </div>
      </div>
    </aside>
  );
}