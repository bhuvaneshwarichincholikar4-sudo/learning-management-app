import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Sign In</h2>
        {error && <div style={styles.error}>{error}</div>}
        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
          placeholder="student@demo.com"
        />
        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
          placeholder="password123"
        />
        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p style={styles.switchText}>
          Don't have an account? <Link to="/register" style={styles.switchLink}>Register</Link>
        </p>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 64px)',
    padding: 24,
  },
  form: {
    background: '#16213e',
    padding: 40,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: 500,
    display: 'block',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    background: '#0f3460',
    border: '1px solid #2a2a4a',
    borderRadius: 8,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
    outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: 14,
    background: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
  },
  error: {
    background: '#3d1111',
    color: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
    textAlign: 'center',
  },
  switchText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
  switchLink: {
    color: '#e94560',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
