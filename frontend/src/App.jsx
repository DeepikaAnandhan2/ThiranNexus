import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Home from './pages/Home'
// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Games from './pages/Games'
import Education from './pages/Education' // 1. Add this import

// ── Quick 404 Component ──
const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>401 - Unauthorized or 404</h1>
    <p>Please check your URL or log in.</p>
    <a href="/">Back to Login</a>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Protected Routes ── */}
          <Route path="/home" element={<Home />} />
          <Route path="/games" element={<Games />} />
          
          {/* 2. Add the Education Route here */}
          <Route path="/education" element={<Education />} />

          {/* ── 404 Route ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}