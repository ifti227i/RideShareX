import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Load users from localStorage on mount
  useEffect(() => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
      setUsers(storedUsers);
      console.log('Signup component mounted successfully');

      // Load theme preference
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.body.classList.add('dark-mode');
      }
    } catch (err) {
      console.error('Error loading users from localStorage:', err);
      setUsers([]);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');

    // Calculate password strength when password field changes
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    if (passwordStrength === 4) return "Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 1) return "#ff4d4d"; // Red for weak
    if (passwordStrength === 2) return "#ffaa00"; // Orange for fair
    if (passwordStrength === 3) return "#2196f3"; // Blue for good
    if (passwordStrength === 4) return "#4caf50"; // Green for strong
    return "#e0e0e0"; // Default
  };

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

  const validateForm = () => {
    if (formData.username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }

    if (users.some(u => u.email.toLowerCase() === formData.email.trim().toLowerCase())) {
      setError('Email already registered');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    // Create new user object
    const newUser = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
    };

    // First try to register the user with the backend API
    fetch('http://localhost:8081/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser)
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      return response.text().then(text => {
        throw new Error(text || 'Registration failed');
      });
    })
    .then(data => {
      console.log('User registered successfully in the database:', data);
      setSuccess('Account created successfully!');

      // Also save to localStorage for the fallback authentication
      const localUser = {
        ...newUser,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...users, localUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);

      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    })
    .catch(err => {
      console.error('Error during API signup:', err);

      // If API registration fails, fall back to localStorage only
      try {
        console.log('Falling back to localStorage registration');
        const localUser = {
          id: Date.now().toString(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          createdAt: new Date().toISOString()
        };

        // Save to localStorage DB
        const updatedUsers = [...users, localUser];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);

        setSuccess('Account created successfully (offline mode)!');

        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch (localErr) {
        console.error('Error during localStorage signup:', localErr);
        setError('An unexpected error occurred. Please try again.');
      }
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  return (
    <div className={`auth-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="theme-toggle">
        <button onClick={toggleTheme} aria-label="Toggle theme">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="auth-header">
        <h1>Create Account</h1>
        <p>Join RideShareX today for easier commutes</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            disabled={isLoading}
            className="form-input"
            autoComplete="username"
            required
          />
        </div>

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
            placeholder="Create a password"
            disabled={isLoading}
            className="form-input"
            autoComplete="new-password"
            required
          />
          {formData.password && (
            <div className="password-strength-container">
              <div
                className="password-strength-bar"
                style={{
                  width: `${(passwordStrength / 4) * 100}%`,
                  backgroundColor: getPasswordStrengthColor()
                }}
              ></div>
              <span className="password-strength-label">
                {getPasswordStrengthLabel()}
              </span>
            </div>
          )}
          <div className="password-hints">
            <small>Use 8+ characters with a mix of letters, numbers & symbols</small>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            disabled={isLoading}
            className="form-input"
            autoComplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? <span className="loading-spinner"></span> : 'Sign Up'}
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
        <span>Sign Up with Google</span>
      </button>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default Signup;
