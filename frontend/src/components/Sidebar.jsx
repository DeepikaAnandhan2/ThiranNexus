import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  FaHome, FaBook, FaGamepad, FaTrophy,
  FaSignOutAlt, FaComments, FaGraduationCap,
  FaUser, FaBars, FaTimes
} from 'react-icons/fa';
import { useListNavigation } from '../hooks/useListNavigation';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menu = [
    { icon: <FaHome />, label: 'Home', path: '/dashboard' },
    { icon: <FaBook />, label: 'Education', path: '/education' },
    { icon: <FaGraduationCap />, label: 'SmartLearn', path: '/education2' },
    { icon: <FaGamepad />, label: 'Games', path: '/games' },
    { icon: <FaTrophy />, label: 'Schemes', path: '/schemes' },
    { icon: <FaUser />, label: 'My Profile', path: '/profile' },
    { icon: <FaComments />, label: 'Help & Support', path: '/feedback' },
  ];

  const { getListProps, getItemProps } = useListNavigation(menu, (item) => {
    navigate(item.path);
    setIsOpen(false); // Close sidebar on mobile after navigation
  }, { autoFocus: false });

  const handleLogout = () => {
    navigate('/');
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button - Mobile Only */}
      <button className="hamburger-menu" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Backdrop - Closes sidebar when clicked */}
      {isOpen && <div className="sidebar-backdrop" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
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
          <div className="nav-link logout" onClick={handleLogout}>
            <span className="icon"><FaSignOutAlt /></span>
            <span className="label">Logout</span>
          </div>

          <div className="profile-section" onClick={() => {
            navigate('/profile');
            setIsOpen(false);
          }} style={{ cursor: 'pointer' }}>
            <img
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'user'}`}
              alt="user profile shortcut link"
            />
          </div>
        </div>
      </aside>
    </>
  );
}