import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState({
    ridesCompleted: 0,
    totalDistance: 0,
    savedCO2: 0
  });
  const [tools, setTools] = useState([
    { id: 1, name: 'Saved Locations', icon: '📍', active: true, description: 'Manage your favorite pickup and dropoff locations' },
    { id: 2, name: 'Payment Methods', icon: '💳', active: false, description: 'Add or remove payment options' },
    { id: 3, name: 'Notification Settings', icon: '🔔', active: false, description: 'Control how and when we contact you' },
    { id: 4, name: 'Privacy Settings', icon: '🔒', active: false, description: 'Manage your data and privacy preferences' },
    { id: 5, name: 'Help & Support', icon: '❓', active: false, description: 'Get assistance with your account or rides' },
    { id: 6, name: 'Ride Preferences', icon: '��', active: false, description: 'Set your default ride options' },
    { id: 7, name: 'Account Security', icon: '🛡️', active: false, description: 'Update password and security settings' },
    { id: 8, name: 'Referrals', icon: '👥', active: false, description: 'Invite friends and earn rewards' },
    { id: 9, name: 'Travel History', icon: '🗺️', active: false, description: 'View and analyze your ride history' },
    { id: 10, name: 'Family Safety', icon: '👨‍👩‍👧‍👦', active: false, description: 'Set up tracking and safety features for family members' },
    { id: 11, name: 'Accessibility', icon: '♿', active: false, description: 'Customize app for accessibility needs' },
    { id: 12, name: 'Billing & Receipts', icon: '🧾', active: false, description: 'Access your ride receipts and payment history' }
  ]);
  const [activeTool, setActiveTool] = useState(1);
  const [savedLocations, setSavedLocations] = useState([
    { id: 1, name: 'Home', address: '123 Home Street, City', icon: '🏠' },
    { id: 2, name: 'Work', address: '456 Office Avenue, Business District', icon: '🏢' },
    { id: 3, name: 'Gym', address: '789 Fitness Road, Healthville', icon: '🏋️' }
  ]);
  // Add new state for profile picture
  const [profilePicture, setProfilePicture] = useState(null);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('user-token');
    if (!token) {
      console.log('No user token found, redirecting to login');
      navigate('/login');
      return;
    }

    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching user profile data...');

        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        // Get saved profile picture from localStorage if it exists
        const savedProfilePicture = localStorage.getItem('user-profile-picture');
        if (savedProfilePicture) {
          setProfilePicture(savedProfilePicture);
        }

        if (!userData) {
          console.log('No user data found in localStorage, creating default profile');

          // Extract username from email in token if possible
          let defaultUsername = 'User';
          try {
            // Attempt to get email from token (if it's JWT and decoded)
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            if (tokenData && tokenData.email) {
              defaultUsername = tokenData.email.split('@')[0];
            }
          } catch (e) {
            console.log('Could not extract username from token');
          }

          // Create default user data if none exists
          const defaultUserData = {
            id: Date.now().toString(),
            username: defaultUsername,
            email: 'user@example.com',
            phone: '',
            address: '',
            bio: 'Welcome to my RideShareX profile!',
            createdAt: new Date().toISOString()
          };

          // Save default user to localStorage
          localStorage.setItem('user', JSON.stringify(defaultUserData));
          setUser(defaultUserData);

          setFormData({
            username: defaultUserData.username,
            email: defaultUserData.email,
            phone: defaultUserData.phone || '',
            address: defaultUserData.address || '',
            bio: defaultUserData.bio || ''
          });

          console.log('Created default profile', defaultUserData);
        } else {
          // Parse stored user data
          try {
            const parsedUserData = JSON.parse(userData);
            console.log('User data retrieved:', parsedUserData);
            setUser(parsedUserData);

            setFormData({
              username: parsedUserData.username || '',
              email: parsedUserData.email || '',
              phone: parsedUserData.phone || '',
              address: parsedUserData.address || '',
              bio: parsedUserData.bio || ''
            });
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            // Don't redirect, instead create a new default profile
            const defaultUserData = {
              id: Date.now().toString(),
              username: 'User',
              email: 'user@example.com',
              phone: '',
              address: '',
              bio: 'Welcome to my RideShareX profile!',
              createdAt: new Date().toISOString()
            };

            localStorage.setItem('user', JSON.stringify(defaultUserData));
            setUser(defaultUserData);

            setFormData({
              username: defaultUserData.username,
              email: defaultUserData.email,
              phone: defaultUserData.phone || '',
              address: defaultUserData.address || '',
              bio: defaultUserData.bio || ''
            });

            console.log('Created new profile after parse error', defaultUserData);
          }
        }

        // Simulate ride stats (this would normally come from an API)
        setStats({
          ridesCompleted: Math.floor(Math.random() * 20) + 5,
          totalDistance: Math.round((Math.random() * 200) * 10) / 10,
          savedCO2: Math.round((Math.random() * 80) * 10) / 10
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle profile picture change
  const handleProfilePictureChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Check file size (limit to 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size too large. Please select an image smaller than 20MB.' });
        return;
      }

      // Accept all file formats (removed type check)

      const reader = new FileReader();

      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setProfilePicture(imageDataUrl);
        // Save to localStorage
        localStorage.setItem('user-profile-picture', imageDataUrl);
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });

        // Hide modal after successful upload
        setShowPictureModal(false);

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      };

      reader.onerror = () => {
        setMessage({ type: 'error', text: 'Error reading file. Please try again.' });
      };

      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  // Open picture modal
  const openPictureModal = () => {
    setShowPictureModal(true);
  };

  // Close picture modal
  const closePictureModal = () => {
    setShowPictureModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Saving user profile changes:', formData);

      // Simulate API call
      setTimeout(() => {
        const updatedUser = {
          ...user,
          ...formData
        };

        // Save updated user data to localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setLoading(false);

        console.log('Profile updated successfully', updatedUser);
      }, 800);

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      setLoading(false);
    }
  };

  // Function to handle tool selection
  const handleToolSelect = (toolId) => {
    setActiveTool(toolId);
    setTools(tools.map(tool => ({
      ...tool,
      active: tool.id === toolId
    })));
  };

  // Function to add new saved location
  const addSavedLocation = (location) => {
    const newLocation = {
      id: savedLocations.length + 1,
      name: location.name || 'New Location',
      address: location.address || 'Address not specified',
      icon: location.icon || '📍'
    };
    setSavedLocations([...savedLocations, newLocation]);
  };

  // Function to remove saved location
  const removeSavedLocation = (locationId) => {
    setSavedLocations(savedLocations.filter(location => location.id !== locationId));
  };

  if (loading && !user) {
    return <div className="profile-loading">Loading profile</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header-banner"></div>

      <div className="profile-content">
        <div className="profile-header">
          <div
            className="profile-avatar"
            onClick={openPictureModal}
            style={profilePicture ? {
              backgroundImage: `url(${profilePicture})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'transparent',
            } : {}}
          >
            {!profilePicture && (user?.username?.charAt(0).toUpperCase() || 'U')}
            <div className="avatar-overlay">
              <span className="avatar-edit-icon">📷</span>
            </div>
          </div>
          <div className="profile-name">
            <h2>{user?.username}</h2>
            <p className="member-since">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
          {!editing && (
            <button
              className="edit-profile-btn"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Picture Modal */}
        {showPictureModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h3>Update Profile Picture</h3>

              <div className="picture-preview">
                {profilePicture ? (
                  <img src={profilePicture} alt="Current profile" className="current-picture" />
                ) : (
                  <div className="no-picture">No profile picture set</div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                accept="image/*"
                style={{ display: 'none' }}
              />

              <div className="picture-actions">
                <button onClick={openFileSelector} className="upload-btn">
                  Choose Image
                </button>
                {profilePicture && (
                  <button
                    onClick={() => {
                      setProfilePicture(null);
                      localStorage.removeItem('user-profile-picture');
                      setMessage({ type: 'success', text: 'Profile picture removed!' });
                      setShowPictureModal(false);
                    }}
                    className="remove-picture-btn"
                  >
                    Remove Picture
                  </button>
                )}
                <button onClick={closePictureModal} className="cancel-picture-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <h1 className="profile-page-title">My Profile</h1>

        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? '✅ ' : '⚠️ '}
            {message.text}
          </div>
        )}

        <div className="profile-sections-nav">
          <div
            className={`profile-nav-item ${activeSection === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveSection('personal')}
          >
            Personal Info
          </div>
          <div
            className={`profile-nav-item ${activeSection === 'rides' ? 'active' : ''}`}
            onClick={() => setActiveSection('rides')}
          >
            Ride Stats
          </div>
          <div
            className={`profile-nav-item ${activeSection === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveSection('preferences')}
          >
            Preferences
          </div>
          <div
            className={`profile-nav-item ${activeSection === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveSection('tools')}
          >
            Tools
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="profile-form">
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
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            {activeSection === 'personal' && (
              <div className="profile-info">
                <h3>Account Information</h3>
                <div className="info-group">
                  <span className="info-label">Username</span>
                  <span className="info-value">{user?.username}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{user?.phone || 'Not provided'}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Bio</span>
                  <span className="info-value">{user?.bio || 'No bio provided'}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Address</span>
                  <span className="info-value">{user?.address || 'Not provided'}</span>
                </div>
              </div>
            )}

            {activeSection === 'rides' && (
              <div className="profile-info">
                <h3>Your Ride Statistics</h3>
                <div className="profile-stats">
                  <div className="stat-item">
                    <div className="stat-value">{stats.ridesCompleted}</div>
                    <div className="stat-label">Rides</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.totalDistance} km</div>
                    <div className="stat-label">Distance</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.savedCO2} kg</div>
                    <div className="stat-label">CO2 Saved</div>
                  </div>
                </div>

                <h3>Recent Activity</h3>
                <div className="info-group">
                  <span className="info-label">Last ride</span>
                  <span className="info-value">August 15, 2025</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Most visited</span>
                  <span className="info-value">Airport (8 rides)</span>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="profile-info">
                <h3>App Preferences</h3>
                <div className="info-group">
                  <span className="info-label">Notifications</span>
                  <span className="info-value">Enabled</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Payment Method</span>
                  <span className="info-value">Credit Card (•••• 4321)</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Language</span>
                  <span className="info-value">English</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Default Map View</span>
                  <span className="info-value">Street</span>
                </div>
              </div>
            )}

            {activeSection === 'tools' && (
              <div className="profile-tools">
                <div className="tools-sidebar">
                  {tools.map(tool => (
                    <div
                      key={tool.id}
                      className={`tool-item ${tool.active ? 'active' : ''}`}
                      onClick={() => handleToolSelect(tool.id)}
                    >
                      <span className="tool-icon">{tool.icon}</span>
                      <span className="tool-name">{tool.name}</span>
                    </div>
                  ))}
                </div>

                <div className="tool-content">
                  {activeTool === 1 && (
                    <div className="saved-locations">
                      <h3>Saved Locations</h3>
                      <p>Quickly access your favorite places when booking a ride</p>

                      <div className="locations-list">
                        {savedLocations.map(location => (
                          <div className="location-card" key={location.id}>
                            <div className="location-icon">{location.icon}</div>
                            <div className="location-details">
                              <div className="location-name">{location.name}</div>
                              <div className="location-address">{location.address}</div>
                            </div>
                            <button
                              className="location-delete"
                              onClick={() => removeSavedLocation(location.id)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        <button
                          className="add-location-btn"
                          onClick={() => addSavedLocation({
                            name: prompt('Enter location name:'),
                            address: prompt('Enter address:'),
                            icon: '📍'
                          })}
                        >
                          + Add New Location
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTool === 2 && (
                    <div className="payment-methods">
                      <h3>Payment Methods</h3>
                      <p>Manage your payment options for easier checkout</p>

                      <div className="payment-card">
                        <div className="card-type">Visa •••• 4321</div>
                        <div className="card-info">Expires 12/28</div>
                        <div className="card-actions">
                          <button className="btn-edit">Edit</button>
                          <button className="btn-remove">Remove</button>
                        </div>
                      </div>

                      <button className="add-payment-btn">
                        + Add Payment Method
                      </button>
                    </div>
                  )}

                  {activeTool === 3 && (
                    <div className="notification-settings">
                      <h3>Notification Settings</h3>
                      <p>Control how and when you receive updates</p>

                      <div className="notification-option">
                        <div className="option-label">Ride Updates</div>
                        <label className="switch">
                          <input type="checkbox" defaultChecked={true} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="notification-option">
                        <div className="option-label">Promotions and Offers</div>
                        <label className="switch">
                          <input type="checkbox" defaultChecked={false} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="notification-option">
                        <div className="option-label">Driver Messages</div>
                        <label className="switch">
                          <input type="checkbox" defaultChecked={true} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="notification-option">
                        <div className="option-label">Email Newsletters</div>
                        <label className="switch">
                          <input type="checkbox" defaultChecked={false} />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeTool === 4 && (
                    <div className="privacy-settings">
                      <h3>Privacy Settings</h3>
                      <p>Manage your data and privacy preferences</p>

                      <div className="privacy-option">
                        <div className="option-label">Share ride history with drivers</div>
                        <label className="switch">
                          <input type="checkbox" defaultChecked={false} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="privacy-option">
                        <div className="option-label">Allow location tracking when app is closed</div>
                        <label className="switch">
                          <input type="checkbox" defaultChecked={false} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="privacy-option">
                        <div className="option-label">Use data to improve recommendations</div>
                        <label className="switch">
                          <input type="checkbox" defaultChecked={true} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <button className="data-export-btn">
                        Export My Data
                      </button>
                    </div>
                  )}

                  {activeTool === 5 && (
                    <div className="help-support">
                      <h3>Help & Support</h3>
                      <p>Get assistance with your RideShareX account</p>

                      <div className="support-options">
                        <div className="support-card">
                          <div className="support-icon">📋</div>
                          <div className="support-title">FAQs</div>
                          <p>Find answers to common questions</p>
                          <button className="support-btn">View FAQs</button>
                        </div>

                        <div className="support-card">
                          <div className="support-icon">🎫</div>
                          <div className="support-title">Submit Ticket</div>
                          <p>Get help with a specific issue</p>
                          <button className="support-btn">Open Ticket</button>
                        </div>

                        <div className="support-card">
                          <div className="support-icon">💬</div>
                          <div className="support-title">Live Chat</div>
                          <p>Chat with our support team</p>
                          <button className="support-btn">Start Chat</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTool === 6 && (
                    <div className="ride-preferences">
                      <h3>Ride Preferences</h3>
                      <p>Set your default ride options for a personalized experience</p>

                      <div className="preference-option">
                        <div className="option-label">Default Ride Type</div>
                        <select className="option-select">
                          <option value="standard">Standard (Economy)</option>
                          <option value="premium">Premium (Comfort)</option>
                          <option value="luxury">Luxury (Business)</option>
                        </select>
                      </div>

                      <div className="preference-option">
                        <div className="option-label">Preferred Payment Method</div>
                        <select className="option-select">
                          <option value="credit_card">Credit Card (•••• 4321)</option>
                          <option value="paypal">PayPal</option>
                          <option value="apple_pay">Apple Pay</option>
                        </select>
                      </div>

                      <div className="preference-option">
                        <div className="option-label">Ride Reminder Notifications</div>
                        <label className="switch">
                          <input type="checkbox" defaultChecked={true} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <button className="save-preferences-btn">
                        Save Preferences
                      </button>
                    </div>
                  )}

                  {activeTool === 7 && (
                    <div className="account-security">
                      <h3>Account Security</h3>
                      <p>Update your password and manage security settings</p>

                      <div className="security-option">
                        <div className="option-label">Change Password</div>
                        <button className="btn-change-password">
                          Change Password
                        </button>
                      </div>

                      <div className="security-option">
                        <div className="option-label">Two-Factor Authentication</div>
                        <label className="switch">
                          <input type="checkbox" defaultChecked={false} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="security-option">
                        <div className="option-label">Login Alerts</div>
                        <label className="switch">
                          <input type="checkbox" defaultChecked={true} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <button className="save-security-btn">
                        Save Security Settings
                      </button>
                    </div>
                  )}

                  {activeTool === 8 && (
                    <div className="referrals">
                      <h3>Referrals</h3>
                      <p>Invite friends to RideShareX and earn rewards</p>

                      <div className="referral-code">
                        <div className="code-label">Your Referral Code</div>
                        <div className="code-value">RIDESHARE123</div>
                        <button className="btn-copy-code">
                          Copy Code
                        </button>
                      </div>

                      <div className="referral-instructions">
                        <p>Share your referral code with friends and family. They get a discount on their first ride, and you earn rewards when they complete their first ride!</p>
                      </div>

                      <button className="btn-view-referrals">
                        View My Referrals
                      </button>
                    </div>
                  )}

                  {activeTool === 9 && (
                    <div className="travel-history">
                      <h3>Travel History</h3>
                      <p>View and analyze your ride history</p>

                      <div className="history-filter">
                        <label htmlFor="date-range">Date Range:</label>
                        <input
                          type="date"
                          id="start-date"
                          className="date-input"
                        />
                        <span className="date-separator">to</span>
                        <input
                          type="date"
                          id="end-date"
                          className="date-input"
                        />
                        <button className="btn-apply-filters">
                          Apply Filters
                        </button>
                      </div>

                      <div className="history-list">
                        {/* Sample history items (replace with real data) */}
                        <div className="history-item">
                          <div className="history-date">August 10, 2025</div>
                          <div className="history-details">
                            <div className="history-location">
                              <span className="location-icon">📍</span>
                              <span className="location-name">Airport</span>
                            </div>
                            <div className="history-distance">15 km</div>
                            <div className="history-fare">€25.00</div>
                          </div>
                        </div>

                        <div className="history-item">
                          <div className="history-date">August 5, 2025</div>
                          <div className="history-details">
                            <div className="history-location">
                              <span className="location-icon">📍</span>
                              <span className="location-name">Hotel</span>
                            </div>
                            <div className="history-distance">5 km</div>
                            <div className="history-fare">€10.00</div>
                          </div>
                        </div>

                        <div className="history-item">
                          <div className="history-date">July 28, 2025</div>
                          <div className="history-details">
                            <div className="history-location">
                              <span className="location-icon">📍</span>
                              <span className="location-name">Office</span>
                            </div>
                            <div className="history-distance">8 km</div>
                            <div className="history-fare">€15.00</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTool === 10 && (
                    <div className="family-safety">
                      <h3>Family Safety</h3>
                      <p>Set up tracking and safety features for family members</p>

                      <div className="family-member">
                        <div className="member-info">
                          <span className="member-name">John Doe</span>
                          <span className="member-relation">Son</span>
                        </div>
                        <div className="member-actions">
                          <button className="btn-edit-member">
                            Edit
                          </button>
                          <button className="btn-remove-member">
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="family-member">
                        <div className="member-info">
                          <span className="member-name">Jane Doe</span>
                          <span className="member-relation">Daughter</span>
                        </div>
                        <div className="member-actions">
                          <button className="btn-edit-member">
                            Edit
                          </button>
                          <button className="btn-remove-member">
                            Remove
                          </button>
                        </div>
                      </div>

                      <button className="btn-add-family-member">
                        + Add Family Member
                      </button>
                    </div>
                  )}

                  {activeTool === 11 && (
                    <div className="accessibility-settings">
                      <h3>Accessibility</h3>
                      <p>Customize app for accessibility needs</p>

                      <div className="accessibility-option">
                        <div className="option-label">Text Size</div>
                        <select className="option-select">
                          <option value="default">Default</option>
                          <option value="large">Large</option>
                          <option value="xlarge">Extra Large</option>
                        </select>
                      </div>

                      <div className="accessibility-option">
                        <div className="option-label">Color Contrast</div>
                        <select className="option-select">
                          <option value="default">Default</option>
                          <option value="high">High Contrast</option>
                          <option value="invert">Invert Colors</option>
                        </select>
                      </div>

                      <div className="accessibility-option">
                        <div className="option-label">Screen Reader</div>
                        <label className="switch">
                          <input type="checkbox" defaultChecked={false} />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <button className="save-accessibility-btn">
                        Save Settings
                      </button>
                    </div>
                  )}

                  {activeTool === 12 && (
                    <div className="billing-receipts">
                      <h3>Billing & Receipts</h3>
                      <p>Access your ride receipts and payment history</p>

                      <div className="receipt-list">
                        {/* Sample receipt items (replace with real data) */}
                        <div className="receipt-item">
                          <div className="receipt-date">August 10, 2025</div>
                          <div className="receipt-details">
                            <div className="receipt-ride">
                              <span className="ride-label">Airport to Hotel</span>
                              <span className="ride-distance">15 km</span>
                            </div>
                            <div className="receipt-fare">€25.00</div>
                          </div>
                        </div>

                        <div className="receipt-item">
                          <div className="receipt-date">August 5, 2025</div>
                          <div className="receipt-details">
                            <div className="receipt-ride">
                              <span className="ride-label">Hotel to Office</span>
                              <span className="ride-distance">5 km</span>
                            </div>
                            <div className="receipt-fare">€10.00</div>
                          </div>
                        </div>

                        <div className="receipt-item">
                          <div className="receipt-date">July 28, 2025</div>
                          <div className="receipt-details">
                            <div className="receipt-ride">
                              <span className="ride-label">Office to Airport</span>
                              <span className="ride-distance">8 km</span>
                            </div>
                            <div className="receipt-fare">€15.00</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
