import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NoPage.css';

function NoPage() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
        <div className="error-illustration">
          <div className="car-icon">🚗</div>
        </div>
        <div className="navigation-options">
          <Link to="/" className="home-link">Go to Homepage</Link>
          <Link to="/login" className="login-link">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default NoPage;
