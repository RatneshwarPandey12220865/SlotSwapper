import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Notifications from './pages/Notifications';
import Navbar from './components/Navbar';

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <div className="app">
        {token && <Navbar />}
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={token ? <Navigate to="/dashboard" replace /> : <Signup />}
          />
          <Route
            path="/dashboard"
            element={token ? <Dashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/marketplace"
            element={token ? <Marketplace /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/notifications"
            element={token ? <Notifications /> : <Navigate to="/login" replace />}
          />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
