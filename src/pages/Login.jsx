import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  function handleLogin() {
    // later connect to Supabase
    // for now just go to dashboard
    if (email && password) {
      navigate('/dashboard');
    } else {
      alert('Please enter email and password');
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>Gramin Shiksha</h2>
        <p style={styles.sub}>Admin Login</p>

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#0D1B2A',
  },
  box: {
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    padding: '40px',
    width: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    color: '#1D9E75',
    fontSize: '24px',
    textAlign: 'center',
    margin: 0,
  },
  sub: {
    color: '#7a8fa8',
    textAlign: 'center',
    margin: 0,
    fontSize: '14px',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '0.5px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    background: '#1D9E75',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
};

export default Login;