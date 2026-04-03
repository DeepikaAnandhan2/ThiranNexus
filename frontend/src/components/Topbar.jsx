import './Topbar.css'

export default function Topbar({ user }) {
  return (
    <header className="topbar">
      
      <h2 className="logo-text">ThiranNexus</h2>

      <div className="top-actions">
        <input placeholder="Search..." />

        <img
          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'User'}`}
          alt="user"
        />
      </div>

    </header>
  )
}