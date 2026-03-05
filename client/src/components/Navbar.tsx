import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        LearnHub
      </Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Courses</Link>
        {user ? (
          <>
            <Link to="/my-courses" style={styles.link}>My Courses</Link>
            <span style={styles.userName}>{user.name}</span>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={styles.loginBtn}>Login</Link>
        )}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 32px',
    height: 64,
    background: '#1a1a2e',
    color: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    color: '#e94560',
    textDecoration: 'none',
    letterSpacing: 1,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  link: {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  userName: {
    color: '#e94560',
    fontWeight: 600,
    fontSize: 14,
  },
  loginBtn: {
    color: '#fff',
    background: '#e94560',
    textDecoration: 'none',
    padding: '8px 20px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
  },
  logoutBtn: {
    color: '#fff',
    background: 'transparent',
    border: '1px solid #e94560',
    padding: '6px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
};
