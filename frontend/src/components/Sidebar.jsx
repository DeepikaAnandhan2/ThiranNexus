import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHome, FaBook, FaGamepad, FaTrophy,
  FaSignOutAlt, FaComments, FaGraduationCap,
  FaUser // ✅ Imported user icon for profile decoration
} from 'react-icons/fa';
import { useListNavigation } from '../hooks/useListNavigation';
import { useAuth } from '../context/AuthContext'; // ✅ Added to track real-time avatar naming
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Fetch current user metadata

  const menu = [
    { icon: <FaHome />, label: 'Home', path: '/dashboard' },
    { icon: <FaBook />, label: 'Education', path: '/education' },
    { icon: <FaGraduationCap />, label: 'SmartLearn', path: '/education2' },
    { icon: <FaGamepad />, label: 'Games', path: '/games' },
    { icon: <FaTrophy />, label: 'Schemes', path: '/schemes' },
    { icon: <FaUser />, label: 'My Profile', path: '/profile' }, // ✅ Integrated cleanly into list array matrix
    { icon: <FaComments />, label: 'Help & Support', path: '/feedback' },
  ];

  const { getListProps, getItemProps } = useListNavigation(menu, (item) => navigate(item.path), { autoFocus: false });

  return (
    <aside className="sidebar expanded">
      <div className="logo">ThiranNexus</div>

      <nav className="sidebar-nav">
        <ul {...getListProps()}>
          {menu.map((item, i) => (
            <li key={i}>
              <NavLink
                {...getItemProps(i)}
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

        {/* ✅ Clicking the avatar will also direct the user straight to their profile screen */}
        <div className="profile-section" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <img
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'user'}`}
            alt="user profile shortcut link"
          />
        </div>
      </div>
    </aside>
  );
}