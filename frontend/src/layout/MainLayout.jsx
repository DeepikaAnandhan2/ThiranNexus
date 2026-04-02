import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './MainLayout.css'

export default function MainLayout({ children, user }) {
  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Topbar user={user} />

        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  )
}