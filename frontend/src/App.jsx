import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Assuming useAuth exists
import ProtectedRoute from './components/common/ProtectedRoute';

// Page Imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Games from './pages/Games';
import Education from './pages/Education';
import Schemes from './pages/Schemes';
import SchemeDetails from './pages/SchemeDetails';
import SavedApplied from './pages/SavedApplied';

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '100px', color: 'white', background: '#764ba2', minHeight: '100vh' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist or you are unauthorized.</p>
    <a href="/home" style={{ color: '#fff', textDecoration: 'underline' }}>Back to Home</a>
  </div>
);

// Helper to get user from context (Adjust based on your AuthContext structure)
const SchemesWithAuth = () => {
  const { user } = useAuth(); 
  return <Schemes user={user} />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected/Feature Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/education" element={<Education />} />

          {/* Scheme Routes - Ensure :id is present to avoid 404 */}
          <Route path="/schemes" element={<SchemesWithAuth />} />
          <Route path="/scheme/:id" element={<SchemeDetails />} />
          <Route path="/saved" element={<SavedApplied />} />

          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}