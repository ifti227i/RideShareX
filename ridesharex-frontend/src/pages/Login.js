import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Load users from localStorage and check theme preference
  useEffect(() => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
      setUsers(storedUsers);

      // For debugging
      console.log('Available users:', storedUsers);

      // Add a default user if no users exist
      if (!storedUsers || storedUsers.length === 0) {
        const defaultUser = {
          id: '123456',
          username: 'demo_user',
          email: 'user@example.com',
          password: 'password123',
          createdAt: new Date().toISOString()
        };

        localStorage.setItem('users', JSON.stringify([defaultUser]));
        setUsers([defaultUser]);
        console.log('Added default user for testing');
      }

      // Load theme preference
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.body.classList.add('dark-mode');
      }

      // Check if user has saved credentials
      const savedEmail = localStorage.getItem('remembered-email');
      if (savedEmail) {
        setFormData(prev => ({...prev, email: savedEmail}));
        setRememberMe(true);
      }
    } catch (err) {
      console.error('Error loading users from localStorage:', err);
      setUsers([]);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Please fill all fields');
      return;
    }

    setIsLoading(true);

    // First try to authenticate using backend API
    fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      // If backend authentication fails, fall back to localStorage
      return Promise.reject('Invalid credentials');
    })
    .then(data => {
      console.log('Login successful from API:', data);

      // Store user data from API response
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('user-token', data.token);

      if (rememberMe) {
        localStorage.setItem('remembered-email', formData.email);
      } else {
        localStorage.removeItem('remembered-email');
      }

      setSuccess('Logged in successfully!');

      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/');
      }, 1000);
    })
    .catch(err => {
      console.log('API login failed, trying localStorage fallback');

      // Fallback to localStorage authentication (for demo/development purposes)
      const currentUsers = JSON.parse(localStorage.getItem('users')) || [];
      console.log('Current users from localStorage:', currentUsers);

      // Trim and convert to lowercase for comparison
      const inputEmail = formData.email.trim().toLowerCase();
      const inputPassword = formData.password;

      // Display available users for debugging
      console.log('Available users for login:');
      currentUsers.forEach(u => console.log(`- Email: ${u.email}, Password: ${u.password}`));

      // Try to find user in localStorage with improved comparison
      const user = currentUsers.find(u => {
        const emailMatches = u.email.toLowerCase() === inputEmail;
        const passwordMatches = u.password === inputPassword;

        console.log(`Checking user ${u.email}: Email match: ${emailMatches}, Password match: ${passwordMatches}`);

        return emailMatches && passwordMatches;
      });

      if (user) {
        console.log('Login successful from localStorage:', user.email);

        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('user-token', 'demo-token-' + Date.now());

        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('remembered-email', formData.email);
        } else {
          localStorage.removeItem('remembered-email');
        }

        setSuccess('Logged in successfully!');

        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        console.log('Login failed: User not found or password incorrect');
        setError('Invalid email or password');

        // Debug the current input
        console.log(`Login attempt with: Email=${inputEmail}, Password=${inputPassword.length > 0 ? '(provided)' : '(empty)'}`);

        // Show helpful debug message when in development
        if (process.env.NODE_ENV !== 'production') {
          console.log('Try using the default credentials: user@example.com / password123');
        }
      }

      setIsLoading(false);
    });
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  // For easier testing/demo, let's add a function to pre-fill with default credentials
  const fillDefaultCredentials = () => {
    setFormData({
      email: 'user@example.com',
      password: 'password123'
    });
    setError('');
  };

  return (
    <div className={`auth-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="theme-toggle">
        <button onClick={toggleTheme} aria-label="Toggle theme">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Log in to RideShareX to continue your journey</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your email address"
            disabled={isLoading}
            className="form-input"
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            disabled={isLoading}
            className="form-input"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="form-options">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMeChange}
            />
            <span className="checkmark"></span>
            Remember me
          </label>
          <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? <span className="loading-spinner"></span> : 'Log In'}
        </button>
      </form>

      <div className="auth-divider">
        <span>OR</span>
      </div>

      <button
        type="button"
        className="google-auth-button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        <span>Log In with Google</span>
      </button>

      <div className="auth-footer">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
}

export default Login;
