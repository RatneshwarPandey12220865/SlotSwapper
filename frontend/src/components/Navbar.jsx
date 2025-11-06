import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.brand}>SlotSwapper</div>
        <div style={styles.links}>
          <Link
            to="/dashboard"
            style={isActive('/dashboard') ? { ...styles.link, ...styles.activeLink } : styles.link}
          >
            My Calendar
          </Link>
          <Link
            to="/marketplace"
            style={isActive('/marketplace') ? { ...styles.link, ...styles.activeLink } : styles.link}
          >
            Marketplace
          </Link>
          <Link
            to="/notifications"
            style={isActive('/notifications') ? { ...styles.link, ...styles.activeLink } : styles.link}
          >
            Requests
          </Link>
        </div>
        <div style={styles.userSection}>
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '2rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  activeLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userName: {
    fontSize: '0.9rem',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid white',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s',
  },
};

export default Navbar;
