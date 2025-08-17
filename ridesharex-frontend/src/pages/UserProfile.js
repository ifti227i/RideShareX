import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserService from '../Services/UserService';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();

  // State variables
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });

  // Profile picture handling
  const [profilePicture, setProfilePicture] = useState(null);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const fileInputRef = useRef(null);

  // Ride history
  const [rideHistory, setRideHistory] = useState([]);

  // Saved locations
  const [savedLocations, setSavedLocations] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', address: '', icon: '📍' });

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({ type: 'card', name: '', number: '', expiry: '' });

  // User statistics
  const [stats, setStats] = useState({
    ridesCompleted: 0,
    totalDistance: 0,
    totalSpent: 0,
    avgRating: 0,
    savedCO2: 0
  });

  // Security settings
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    rideUpdates: true,
    promotions: false,
    accountActivity: true
  });

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Check if user is logged in
      const token = localStorage.getItem('user-token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user data
      const userData = localStorage.getItem('user');
      if (!userData) {
        setMessage({ type: 'error', text: 'User data not found. Please login again.' });
        navigate('/login');
        return;
      }

      // Parse user data
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Set form data
      setFormData({
        username: parsedUser.username || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        address: parsedUser.address || '',
        bio: parsedUser.bio || 'Hi there! I\'m using RideShareX.'
      });

      // Load profile picture if exists
      const savedProfilePicture = localStorage.getItem('user-profile-picture');
      if (savedProfilePicture) {
        setProfilePicture(savedProfilePicture);
      }

      // Load ride history
      loadRideHistory();

      // Load saved locations
      loadSavedLocations();

      // Load payment methods
      loadPaymentMethods();

      // Load user statistics
      loadUserStatistics();

      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data. Please try again.' });
      setLoading(false);
    }
  };

  const loadRideHistory = () => {
    try {
      // For demo purposes, we'll use localStorage or mock data
      const storedRides = localStorage.getItem('recent-rides');

      if (storedRides) {
        setRideHistory(JSON.parse(storedRides));
      } else {
        // Mock ride history data
        const mockRides = [
          { id: 1, from: "Dhanmondi", to: "Airport", date: "2025-08-15", price: "৳350", rating: 5 },
          { id: 2, from: "Gulshan", to: "Mirpur", date: "2025-08-10", price: "৳220", rating: 4 },
          { id: 3, from: "Uttara", to: "Farmgate", date: "2025-08-05", price: "৳280", rating: 5 },
          { id: 4, from: "Banani", to: "Gulshan", date: "2025-07-30", price: "৳150", rating: 3 },
          { id: 5, from: "Mohakhali", to: "Dhanmondi", date: "2025-07-25", price: "৳200", rating: 4 }
        ];

        setRideHistory(mockRides);
        localStorage.setItem('recent-rides', JSON.stringify(mockRides));
      }
    } catch (error) {
      console.error('Error loading ride history:', error);
    }
  };

  const loadSavedLocations = () => {
    try {
      // Try to get saved locations from localStorage
      const storedLocations = localStorage.getItem('saved-locations');

      if (storedLocations) {
        setSavedLocations(JSON.parse(storedLocations));
      } else {
        // Mock saved locations
        const mockLocations = [
          { id: 1, name: 'Home', address: '123 Home Street, Dhanmondi', icon: '🏠' },
          { id: 2, name: 'Work', address: '456 Office Avenue, Gulshan', icon: '🏢' },
          { id: 3, name: 'Gym', address: '789 Fitness Road, Banani', icon: '🏋️' }
        ];

        setSavedLocations(mockLocations);
        localStorage.setItem('saved-locations', JSON.stringify(mockLocations));
      }
    } catch (error) {
      console.error('Error loading saved locations:', error);
    }
  };

  const loadPaymentMethods = () => {
    try {
      // Try to get payment methods from localStorage
      const storedPayments = localStorage.getItem('payment-methods');

      if (storedPayments) {
        setPaymentMethods(JSON.parse(storedPayments));
      } else {
        // Mock payment methods
        const mockPayments = [
          { id: 1, type: 'card', name: 'Personal Visa', number: '****-****-****-4821', expiry: '09/26' },
          { id: 2, type: 'mobile', name: 'bKash', number: '****5738', expiry: 'N/A' }
        ];

        setPaymentMethods(mockPayments);
        localStorage.setItem('payment-methods', JSON.stringify(mockPayments));
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const loadUserStatistics = () => {
    // In a real app, this would be calculated from actual ride data
    // For demo, we'll use random or mock data
    const totalRides = rideHistory.length || Math.floor(Math.random() * 20) + 5;
    const distance = Math.round((Math.random() * 200) * 10) / 10;
    const spent = totalRides * ((Math.random() * 200) + 100);

    setStats({
      ridesCompleted: totalRides,
      totalDistance: distance,
      totalSpent: Math.round(spent),
      avgRating: 4.7,
      savedCO2: Math.round((distance * 0.12) * 10) / 10 // Rough CO2 savings calculation
    });
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Profile form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Update the user data
      const updatedUser = {
        ...user,
        ...formData
      };

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Show success message
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Exit edit mode
      setEditing(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
  };

  // Handle profile picture change
  const handleProfilePictureChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size too large. Please select an image smaller than 5MB.' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setProfilePicture(imageDataUrl);

        // Save to localStorage
        localStorage.setItem('user-profile-picture', imageDataUrl);

        // Show success message
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });

        // Close modal
        setShowPictureModal(false);

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      };

      reader.readAsDataURL(file);
    }
  };

  // Handle saved location form
  const handleLocationInputChange = (e) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new saved location
  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.address) {
      setMessage({ type: 'error', text: 'Please enter location name and address' });
      return;
    }

    // Create new location
    const location = {
      id: Date.now(),
      ...newLocation
    };

    // Update state
    const updatedLocations = [...savedLocations, location];
    setSavedLocations(updatedLocations);

    // Save to localStorage
    localStorage.setItem('saved-locations', JSON.stringify(updatedLocations));

    // Reset form and close modal
    setNewLocation({ name: '', address: '', icon: '📍' });
    setShowLocationModal(false);

    // Show success message
    setMessage({ type: 'success', text: 'Location saved successfully!' });

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  // Delete saved location
  const handleDeleteLocation = (locationId) => {
    const updatedLocations = savedLocations.filter(location => location.id !== locationId);
    setSavedLocations(updatedLocations);
    localStorage.setItem('saved-locations', JSON.stringify(updatedLocations));

    // Show success message
    setMessage({ type: 'success', text: 'Location removed successfully!' });

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  // Handle payment method form
  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setNewPayment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new payment method
  const handleAddPayment = () => {
    if (!newPayment.name || !newPayment.number) {
      setMessage({ type: 'error', text: 'Please enter payment details' });
      return;
    }

    // Create new payment method
    const payment = {
      id: Date.now(),
      ...newPayment
    };

    // Update state
    const updatedPayments = [...paymentMethods, payment];
    setPaymentMethods(updatedPayments);

    // Save to localStorage
    localStorage.setItem('payment-methods', JSON.stringify(updatedPayments));

    // Reset form and close modal
    setNewPayment({ type: 'card', name: '', number: '', expiry: '' });
    setShowPaymentModal(false);

    // Show success message
    setMessage({ type: 'success', text: 'Payment method added successfully!' });

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  // Delete payment method
  const handleDeletePayment = (paymentId) => {
    const updatedPayments = paymentMethods.filter(payment => payment.id !== paymentId);
    setPaymentMethods(updatedPayments);
    localStorage.setItem('payment-methods', JSON.stringify(updatedPayments));

    // Show success message
    setMessage({ type: 'success', text: 'Payment method removed successfully!' });

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  // Handle security form
  const handleSecurityInputChange = (e) => {
    const { name, value } = e.target;
    setSecurityForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update password
  const handleUpdatePassword = (e) => {
    e.preventDefault();

    // Basic validation
    if (!securityForm.currentPassword) {
      setMessage({ type: 'error', text: 'Please enter your current password' });
      return;
    }

    if (!securityForm.newPassword) {
      setMessage({ type: 'error', text: 'Please enter your new password' });
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    // In a real app, this would call an API to update the password
    // For demo purposes, show success message
    setMessage({ type: 'success', text: 'Password updated successfully!' });

    // Reset form
    setSecurityForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  // Handle notification preferences change
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));

    // In a real app, this would save to an API
    // For demo, just show success message
    setMessage({ type: 'success', text: 'Notification preferences updated!' });

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If no user data found
  if (!user) {
    return (
      <div className="profile-container">
        <div className="no-user-data">
          <h2>Profile Not Found</h2>
          <p>We couldn't load your profile data. Please login again.</p>
          <Link to="/login" className="login-button">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Header with Banner and Avatar */}
      <div className="profile-header-banner">
        <div className="profile-avatar-container">
          <div
            className="profile-avatar"
            onClick={() => setShowPictureModal(true)}
            style={profilePicture ? {
              backgroundImage: `url(${profilePicture})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          >
            {!profilePicture && user.username?.charAt(0).toUpperCase()}
            <div className="avatar-edit-overlay">
              <span>Change Photo</span>
            </div>
          </div>
          <div className="profile-user-info">
            <h2>{user.username}</h2>
            <p className="member-since">Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
            <div className="user-rating">
              <span className="stars">{'★'.repeat(Math.round(stats.avgRating))}</span>
              <span className="rating-value">{stats.avgRating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {!editing && (
          <button className="edit-profile-btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className={`message-container ${message.type}`}>
          <p>{message.text}</p>
          <button className="close-message" onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      {/* Profile Navigation */}
      <div className="profile-nav">
        <button
          className={`nav-item ${activeSection === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveSection('personal')}
        >
          Personal Info
        </button>
        <button
          className={`nav-item ${activeSection === 'rides' ? 'active' : ''}`}
          onClick={() => setActiveSection('rides')}
        >
          Ride History
        </button>
        <button
          className={`nav-item ${activeSection === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveSection('locations')}
        >
          Saved Places
        </button>
        <button
          className={`nav-item ${activeSection === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveSection('payment')}
        >
          Payment Methods
        </button>
        <button
          className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
          onClick={() => setActiveSection('security')}
        >
          Security
        </button>
        <button
          className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveSection('notifications')}
        >
          Notifications
        </button>
      </div>

      {/* Profile Content based on active section */}
      <div className="profile-content">
        {/* Personal Information Section */}
        {activeSection === 'personal' && (
          <div className="profile-section">
            <h2>Personal Information</h2>

            {editing ? (
              <form className="edit-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your contact number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Your address for pickup/dropoff"
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setEditing(false)} className="cancel-button">
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-card">
                  <div className="info-item">
                    <span className="info-label">Username</span>
                    <span className="info-value">{user.username}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{formData.phone || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Bio</span>
                    <span className="info-value">{formData.bio}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Address</span>
                    <span className="info-value">{formData.address || 'Not specified'}</span>
                  </div>
                </div>

                <div className="stats-cards">
                  <div className="stat-card">
                    <div className="stat-value">{stats.ridesCompleted}</div>
                    <div className="stat-label">Rides</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.totalDistance} km</div>
                    <div className="stat-label">Distance</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">৳{stats.totalSpent}</div>
                    <div className="stat-label">Spent</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.savedCO2} kg</div>
                    <div className="stat-label">CO₂ Saved</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ride History Section */}
        {activeSection === 'rides' && (
          <div className="profile-section">
            <h2>Ride History</h2>
            <div className="ride-history-container">
              {rideHistory.length > 0 ? (
                <div className="ride-history-list">
                  <div className="ride-history-header">
                    <span>Route</span>
                    <span>Date</span>
                    <span>Price</span>
                    <span>Rating</span>
                  </div>

                  {rideHistory.map(ride => (
                    <div key={ride.id} className="ride-history-item">
                      <div className="ride-route-info">
                        <span className="from-location">{ride.from}</span>
                        <span className="route-arrow">→</span>
                        <span className="to-location">{ride.to}</span>
                      </div>
                      <span className="ride-date">{ride.date}</span>
                      <span className="ride-price">{ride.price}</span>
                      <span className="ride-rating">{'★'.repeat(ride.rating)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-rides-message">
                  <p>You haven't taken any rides yet.</p>
                  <Link to="/" className="request-ride-link">Request your first ride</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved Locations Section */}
        {activeSection === 'locations' && (
          <div className="profile-section">
            <h2>Saved Places</h2>

            <div className="locations-container">
              <button
                className="add-location-btn"
                onClick={() => setShowLocationModal(true)}
              >
                Add New Location
              </button>

              {savedLocations.length > 0 ? (
                <div className="locations-list">
                  {savedLocations.map(location => (
                    <div key={location.id} className="location-card">
                      <div className="location-icon">{location.icon}</div>
                      <div className="location-details">
                        <h3>{location.name}</h3>
                        <p>{location.address}</p>
                      </div>
                      <button
                        className="delete-location-btn"
                        onClick={() => handleDeleteLocation(location.id)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-locations-message">
                  <p>You don't have any saved locations yet.</p>
                  <p>Add locations to quickly select them when booking rides.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Methods Section */}
        {activeSection === 'payment' && (
          <div className="profile-section">
            <h2>Payment Methods</h2>

            <div className="payments-container">
              <button
                className="add-payment-btn"
                onClick={() => setShowPaymentModal(true)}
              >
                Add Payment Method
              </button>

              {paymentMethods.length > 0 ? (
                <div className="payments-list">
                  {paymentMethods.map(payment => (
                    <div key={payment.id} className="payment-card">
                      <div className="payment-icon">
                        {payment.type === 'card' ? '💳' : payment.type === 'mobile' ? '📱' : '💰'}
                      </div>
                      <div className="payment-details">
                        <h3>{payment.name}</h3>
                        <p>{payment.number}</p>
                        {payment.expiry !== 'N/A' && (
                          <p className="expiry-date">Expires: {payment.expiry}</p>
                        )}
                      </div>
                      <button
                        className="delete-payment-btn"
                        onClick={() => handleDeletePayment(payment.id)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-payments-message">
                  <p>You don't have any payment methods yet.</p>
                  <p>Add a payment method to easily pay for your rides.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <div className="profile-section">
            <h2>Security Settings</h2>

            <div className="security-container">
              <div className="password-section">
                <h3>Change Password</h3>
                <form className="password-form" onSubmit={handleUpdatePassword}>
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={securityForm.currentPassword}
                      onChange={handleSecurityInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={securityForm.newPassword}
                      onChange={handleSecurityInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={securityForm.confirmPassword}
                      onChange={handleSecurityInputChange}
                      required
                    />
                  </div>

                  <button type="submit" className="update-password-btn">
                    Update Password
                  </button>
                </form>
              </div>

              <div className="account-security">
                <h3>Account Security</h3>
                <div className="security-options">
                  <div className="security-option">
                    <div className="option-info">
                      <h4>Two-Factor Authentication</h4>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <button className="enable-btn">Enable</button>
                  </div>

                  <div className="security-option">
                    <div className="option-info">
                      <h4>Login Notifications</h4>
                      <p>Get notified when someone logs into your account</p>
                    </div>
                    <button className="enable-btn">Enable</button>
                  </div>

                  <div className="security-option">
                    <div className="option-info">
                      <h4>Download Personal Data</h4>
                      <p>Get a copy of all your personal data</p>
                    </div>
                    <button className="download-btn">Download</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="profile-section">
            <h2>Notification Preferences</h2>

            <div className="notifications-container">
              <div className="notification-group">
                <h3>Notification Channels</h3>

                <div className="notification-option">
                  <div className="option-info">
                    <h4>Email Notifications</h4>
                    <p>Receive notifications via email</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="email"
                      checked={notifications.email}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-option">
                  <div className="option-info">
                    <h4>Push Notifications</h4>
                    <p>Receive push notifications on your device</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="push"
                      checked={notifications.push}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-option">
                  <div className="option-info">
                    <h4>SMS Notifications</h4>
                    <p>Receive SMS messages on your phone</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="sms"
                      checked={notifications.sms}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="notification-group">
                <h3>Notification Types</h3>

                <div className="notification-option">
                  <div className="option-info">
                    <h4>Ride Updates</h4>
                    <p>Get notified about your ride status</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="rideUpdates"
                      checked={notifications.rideUpdates}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-option">
                  <div className="option-info">
                    <h4>Promotions</h4>
                    <p>Receive special offers and discounts</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="promotions"
                      checked={notifications.promotions}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-option">
                  <div className="option-info">
                    <h4>Account Activity</h4>
                    <p>Get notified about important account changes</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="accountActivity"
                      checked={notifications.accountActivity}
                      onChange={handleNotificationChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Picture Modal */}
      {showPictureModal && (
        <div className="modal-backdrop">
          <div className="modal-content picture-modal">
            <h3>Update Profile Picture</h3>
            <div className="modal-close" onClick={() => setShowPictureModal(false)}>&times;</div>

            <div className="picture-preview">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" />
              ) : (
                <div className="placeholder-preview">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="picture-actions">
              <input
                type="file"
                id="profilePicture"
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Image
              </button>
              {profilePicture && (
                <button
                  className="remove-btn"
                  onClick={() => {
                    setProfilePicture(null);
                    localStorage.removeItem('user-profile-picture');
                    setMessage({ type: 'success', text: 'Profile picture removed!' });
                    setShowPictureModal(false);
                  }}
                >
                  Remove Photo
                </button>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="close-modal-btn"
                onClick={() => setShowPictureModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showLocationModal && (
        <div className="modal-backdrop">
          <div className="modal-content location-modal">
            <h3>Add Saved Location</h3>
            <div className="modal-close" onClick={() => setShowLocationModal(false)}>&times;</div>

            <div className="location-form">
              <div className="form-group">
                <label htmlFor="locationName">Name</label>
                <input
                  type="text"
                  id="locationName"
                  name="name"
                  value={newLocation.name}
                  onChange={handleLocationInputChange}
                  placeholder="e.g. Home, Work, Gym"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="locationAddress">Address</label>
                <textarea
                  id="locationAddress"
                  name="address"
                  value={newLocation.address}
                  onChange={handleLocationInputChange}
                  placeholder="Full address"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="locationIcon">Icon</label>
                <select
                  id="locationIcon"
                  name="icon"
                  value={newLocation.icon}
                  onChange={handleLocationInputChange}
                >
                  <option value="🏠">🏠 Home</option>
                  <option value="🏢">🏢 Work</option>
                  <option value="🏋️">🏋️ Gym</option>
                  <option value="🍽️">🍽️ Restaurant</option>
                  <option value="🛒">🛒 Shopping</option>
                  <option value="📍">📍 Other</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="close-modal-btn"
                onClick={() => setShowLocationModal(false)}
              >
                Cancel
              </button>
              <button
                className="save-location-btn"
                onClick={handleAddLocation}
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showPaymentModal && (
        <div className="modal-backdrop">
          <div className="modal-content payment-modal">
            <h3>Add Payment Method</h3>
            <div className="modal-close" onClick={() => setShowPaymentModal(false)}>&times;</div>

            <div className="payment-form">
              <div className="form-group">
                <label htmlFor="paymentType">Type</label>
                <select
                  id="paymentType"
                  name="type"
                  value={newPayment.type}
                  onChange={handlePaymentInputChange}
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="mobile">Mobile Banking</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="paymentName">Name</label>
                <input
                  type="text"
                  id="paymentName"
                  name="name"
                  value={newPayment.name}
                  onChange={handlePaymentInputChange}
                  placeholder="e.g. Personal Visa, bKash"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="paymentNumber">
                  {newPayment.type === 'card'
                    ? 'Card Number'
                    : newPayment.type === 'mobile'
                    ? 'Phone Number'
                    : 'Reference Number'}
                </label>
                <input
                  type="text"
                  id="paymentNumber"
                  name="number"
                  value={newPayment.number}
                  onChange={handlePaymentInputChange}
                  placeholder={newPayment.type === 'card'
                    ? '1234 5678 9012 3456'
                    : newPayment.type === 'mobile'
                    ? '01XXXXXXXXX'
                    : 'Optional'}
                  required={newPayment.type !== 'cash'}
                />
              </div>

              {newPayment.type === 'card' && (
                <div className="form-group">
                  <label htmlFor="paymentExpiry">Expiry Date</label>
                  <input
                    type="text"
                    id="paymentExpiry"
                    name="expiry"
                    value={newPayment.expiry}
                    onChange={handlePaymentInputChange}
                    placeholder="MM/YY"
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="close-modal-btn"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button
                className="save-payment-btn"
                onClick={handleAddPayment}
              >
                Save Payment Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
