import './Topbar.css';

export default function Topbar({ user }) {
  return (
    <header className="topbar">
      <h2 className="topbar-title">ThiranNexus</h2>
      <div className="topbar-right">
        <input type="text" placeholder="Search..." className="search-bar" />
        <div className="user-avatar">
          <img
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'Guest'}`}
            alt="user"
          />
        </div>
      </div>
    </header>
  );
}