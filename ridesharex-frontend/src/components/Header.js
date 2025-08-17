import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import '../styles/Header.css';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('user-token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user-token');
    localStorage.removeItem('user-info');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <header className="app-header">
      <nav className="header-nav">
        <Link to='/' className="header-logo">RideShareX</Link>
        <div className="nav-links">
          <Link to='/' className="nav-link">Home</Link>
          <Link to='/find-riders' className="nav-link highlight-link">Find Riders</Link>
          {isLoggedIn ? (
            <>
              <Link to='/profile' className="nav-link">Profile</Link>
              <Link to='/history' className="nav-link">Ride History</Link>
              <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to='/login' className="nav-link login-link">Login</Link>
              <Link to='/signup' className="nav-link signup-link">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
};

export default Header;
