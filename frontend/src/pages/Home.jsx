// pages/Home.jsx
export default function Home({ user, onLogout }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Welcome to Thiran Nexus Dashboard</h1>
      <p>Hello, {user.name}! Your role is: {user.role}</p>
      <button onClick={onLogout} className="login-btn" style={{ width: '200px' }}>
        Logout
      </button>
    </div>
  );
}