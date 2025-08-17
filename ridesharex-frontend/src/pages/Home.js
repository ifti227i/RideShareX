import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";

// Attempt to import Leaflet with error handling
let L;
let leafletLoaded = false;
try {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');

  // Only try to load routing machine if leaflet loaded successfully
  try {
    require('leaflet-routing-machine');
    require('leaflet-routing-machine/dist/leaflet-routing-machine.css');
    leafletLoaded = true;
  } catch (routingError) {
    console.error("Error loading Leaflet Routing Machine:", routingError);
  }

  // Fix Leaflet default icon issues in React
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
} catch (leafletError) {
  console.error("Error loading Leaflet:", leafletError);
}

function Home() {
  // State variables
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [mapLoadError, setMapLoadError] = useState(!leafletLoaded);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [quickActions, setQuickActions] = useState([]);
  const [recentRides, setRecentRides] = useState([]);
  const [activeSection, setActiveSection] = useState('request');

  // Refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('user-token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setIsLoggedIn(true);
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Generate quick actions based on user data
        generateQuickActions(parsedUser);

        // Load recent rides
        loadRecentRides();
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Generate quick actions based on user data
  const generateQuickActions = (userData) => {
    const actions = [
      { id: 1, title: "My Profile", icon: "👤", color: "#4285F4", path: "/profile" },
      { id: 2, title: "Ride History", icon: "🕒", color: "#34A853", path: "/history" },
      { id: 3, title: "Find Riders", icon: "🚗", color: "#FBBC05", path: "/find-riders" },
      { id: 4, title: "Saved Places", icon: "⭐", color: "#EA4335", path: "/profile" }
    ];

    setQuickActions(actions);
  };

  // Load recent rides from localStorage or mock data
  const loadRecentRides = () => {
    try {
      const storedRides = localStorage.getItem('recent-rides');
      if (storedRides) {
        setRecentRides(JSON.parse(storedRides));
      } else {
        // Mock data for demonstration
        const mockRides = [
          { id: 1, from: "Dhanmondi", to: "Airport", date: "2025-08-15", price: "৳350" },
          { id: 2, from: "Gulshan", to: "Mirpur", date: "2025-08-10", price: "৳220" },
          { id: 3, from: "Uttara", to: "Farmgate", date: "2025-08-05", price: "৳280" }
        ];
        setRecentRides(mockRides);
        localStorage.setItem('recent-rides', JSON.stringify(mockRides));
      }
    } catch (error) {
      console.error("Error loading recent rides:", error);
    }
  };

  // Dummy locations for demonstration
  const dummyLocations = useMemo(() => ({
    "Airport": [23.8513, 90.4061],
    "Dhanmondi": [23.7461, 90.3742],
    "Gulshan": [23.7925, 90.4078],
    "Uttara": [23.8759, 90.3795],
    "Banani": [23.7937, 90.4066],
    "Mohakhali": [23.7950, 90.4100],
    "Mirpur": [23.8220, 90.3640],
    "Farmgate": [23.7950, 90.3700],
    "Motijheel": [23.7300, 90.4100],
    "Bashundhara": [23.8200, 90.4200],
    "Khilkhet": [23.8250, 90.4250]
  }), []);

  // Handle form input changes
  const handlePickupChange = (e) => setPickup(e.target.value);
  const handleDropoffChange = (e) => setDropoff(e.target.value);

  // Initialize map with routing control - only if Leaflet loaded successfully
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Create map instance
      mapInstanceRef.current = L.map(mapRef.current).setView([23.8103, 90.4125], 13);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(mapInstanceRef.current);

      setIsMapLoaded(true);
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapLoadError(true);
    }
  }, []);

  // Effect to update the map when pickup or dropoff changes
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    if (!pickup || !dropoff) return;

    const pickupCoords = dummyLocations[pickup];
    const dropoffCoords = dummyLocations[dropoff];

    if (pickupCoords && dropoffCoords) {
      try {
        // Clear any existing routes and markers
        mapInstanceRef.current.eachLayer((layer) => {
          if (layer instanceof L.Polyline || layer instanceof L.Marker) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        // Add markers for pickup and dropoff
        const pickupIcon = L.divIcon({
          html: '<div style="background-color: #4CAF50; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
          className: 'custom-div-icon',
          iconSize: [16, 16]
        });

        const dropoffIcon = L.divIcon({
          html: '<div style="background-color: #f44336; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
          className: 'custom-div-icon',
          iconSize: [16, 16]
        });

        // Add markers
        L.marker(pickupCoords, { icon: pickupIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`Pickup: ${pickup}`)
          .openPopup();

        L.marker(dropoffCoords, { icon: dropoffIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`Dropoff: ${dropoff}`);

        // Try to use routing machine if available
        if (typeof L.Routing !== 'undefined' && L.Routing.control) {
          try {
            // Create routing control
            const routingControl = L.Routing.control({
              waypoints: [
                L.latLng(pickupCoords[0], pickupCoords[1]),
                L.latLng(dropoffCoords[0], dropoffCoords[1])
              ],
              routeWhileDragging: false,
              showAlternatives: false,
              fitSelectedRoutes: true,
              lineOptions: {
                styles: [{ color: '#4a90e2', opacity: 0.8, weight: 5 }]
              },
              createMarker: function() { return null; } // Don't create default markers
            }).addTo(mapInstanceRef.current);

            // Listen for route calculation
            routingControl.on('routesfound', function(e) {
              const routes = e.routes;
              const summary = routes[0].summary;

              // Update route info with accurate data
              setRouteInfo({
                distance: (summary.totalDistance / 1000).toFixed(1), // Convert to km
                time: Math.round(summary.totalTime / 60), // Convert to minutes
                price: calculatePrice(summary.totalDistance / 1000)
              });
            });

            return () => {
              // Clean up routing control
              if (mapInstanceRef.current) {
                mapInstanceRef.current.removeControl(routingControl);
              }
            };
          } catch (routingError) {
            console.error("Error with routing control:", routingError);

            // Fallback to simple line if routing machine fails
            drawSimpleLine(pickupCoords, dropoffCoords);
            calculateSimpleRouteInfo(pickupCoords, dropoffCoords);
          }
        } else {
          // Fallback to simple line if routing machine is not available
          drawSimpleLine(pickupCoords, dropoffCoords);
          calculateSimpleRouteInfo(pickupCoords, dropoffCoords);
        }

        // Fit map to show both points
        mapInstanceRef.current.fitBounds([pickupCoords, dropoffCoords], {
          padding: [50, 50]
        });
      } catch (error) {
        console.error("Error displaying route:", error);
        setRouteError("Could not display route on map. Please try again.");
      }
    }
  }, [pickup, dropoff, dummyLocations]);

  // Calculate price based on distance
  const calculatePrice = (distance) => {
    // Base fare + distance rate + time
    const baseFare = 50;
    const ratePerKm = 15;
    const estimatedPrice = baseFare + (distance * ratePerKm);

    // Round to nearest 10 taka
    return "৳" + (Math.round(estimatedPrice / 10) * 10);
  };

  // Helper function to draw a simple line between points
  const drawSimpleLine = (start, end) => {
    if (!mapInstanceRef.current) return;

    // Create a curved line for better visualization
    const latlngs = [
      start,
      [
        (start[0] + end[0]) / 2 + (Math.random() * 0.01 - 0.005), // Add slight random curve
        (start[1] + end[1]) / 2 + (Math.random() * 0.01 - 0.005)
      ],
      end
    ];

    L.polyline(latlngs, {
      color: '#4a90e2',
      weight: 4,
      opacity: 0.8
    }).addTo(mapInstanceRef.current);
  };

  // Helper function to calculate simple route info
  const calculateSimpleRouteInfo = (start, end) => {
    // Simple distance calculation (this is very rough approximation)
    const distance = Math.sqrt(
      Math.pow(start[0] - end[0], 2) +
      Math.pow(start[1] - end[1], 2)
    ) * 111; // rough conversion to kilometers

    // Estimate time (assuming 30 km/h average speed)
    const timeMinutes = Math.round((distance / 30) * 60);

    // Calculate estimated price
    const price = calculatePrice(distance);

    // Update route info
    setRouteInfo({
      distance: distance.toFixed(1),
      time: timeMinutes,
      price: price
    });
  };

  // Improved Locate Me functionality with better geolocation handling
  const handleLocateMe = () => {
    if (!leafletLoaded || !mapInstanceRef.current) {
      alert("Map not available. Please try again later.");
      return;
    }

    // Show the user that we're detecting their location
    setRouteError(null); // Clear any previous errors
    const loadingMessage = L.popup()
      .setLatLng([23.8103, 90.4125]) // Center of the map
      .setContent('<div style="text-align:center"><b>Detecting your location...</b><br/>Please allow location access</div>')
      .openOn(mapInstanceRef.current);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Successfully got location
          const { latitude, longitude } = position.coords;
          loadingMessage.close(); // Close the loading message

          // Create a marker for the user's actual location
          const userLocationIcon = L.divIcon({
            html: '<div style="background-color: #2196F3; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            className: 'custom-div-icon',
            iconSize: [20, 20]
          });

          // Add marker for user's exact position
          const userMarker = L.marker([latitude, longitude], { icon: userLocationIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup("Your current location")
            .openPopup();

          // Pan the map to user's location first
          mapInstanceRef.current.setView([latitude, longitude], 13);

          // Find closest pickup location using Haversine formula for better accuracy
          let closestLocation = null;
          let shortestDistance = Infinity;

          Object.entries(dummyLocations).forEach(([name, coords]) => {
            // Haversine formula for more accurate Earth distance calculation
            const R = 6371; // Radius of the earth in km
            const dLat = (coords[0] - latitude) * Math.PI / 180;
            const dLon = (coords[1] - longitude) * Math.PI / 180;
            const a =
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(latitude * Math.PI / 180) * Math.cos(coords[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c; // Distance in km

            if (distance < shortestDistance) {
              shortestDistance = distance;
              closestLocation = name;
            }
          });

          if (closestLocation) {
            // Set the pickup location to the closest point
            setPickup(closestLocation);

            // Add pulsing effect to the nearest pickup point for better visibility
            const closestCoords = dummyLocations[closestLocation];

            // Add marker for the nearest pickup point
            const pickupIcon = L.divIcon({
              html: '<div style="background-color: #4CAF50; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
              className: 'custom-div-icon',
              iconSize: [16, 16]
            });

            const nearestPickup = L.marker(closestCoords, { icon: pickupIcon })
              .addTo(mapInstanceRef.current)
              .bindPopup(`Nearest pickup: ${closestLocation} (${shortestDistance.toFixed(2)} km away)`);

            // Draw a line connecting user's location to the nearest pickup point
            const connectingLine = L.polyline([[latitude, longitude], closestCoords], {
              color: '#2196F3',
              dashArray: '5, 5',
              weight: 2
            }).addTo(mapInstanceRef.current);

            // Fit bounds to show both the user location and pickup point
            mapInstanceRef.current.fitBounds([
              [latitude, longitude],
              closestCoords
            ], { padding: [50, 50] });

            // Show a success message with distance
            L.popup()
              .setLatLng([(latitude + closestCoords[0])/2, (longitude + closestCoords[1])/2])
              .setContent(`<div style="text-align:center"><b>Found nearest pickup location!</b><br/>${closestLocation} (${shortestDistance.toFixed(2)} km away)</div>`)
              .openOn(mapInstanceRef.current);
          }
        },
        (error) => {
          // Handle specific geolocation errors with helpful messages
          loadingMessage.close();
          let errorMessage;

          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access was denied. Please enable location services in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Your location information is unavailable. Please try again later.";
              break;
            case error.TIMEOUT:
              errorMessage = "Request to get your location timed out. Please try again.";
              break;
            default:
              errorMessage = "An unknown error occurred while trying to access your location.";
          }

          console.error("Geolocation error:", error);
          setRouteError(errorMessage);

          // Show error popup on map
          L.popup()
            .setLatLng([23.8103, 90.4125])
            .setContent(`<div style="color: #d32f2f;"><b>Location Error</b><br/>${errorMessage}</div>`)
            .openOn(mapInstanceRef.current);
        },
        {
          enableHighAccuracy: true, // Get the best possible location
          timeout: 10000, // Time to wait before giving up (10 seconds)
          maximumAge: 0 // Don't use cached position
        }
      );
    } else {
      loadingMessage.close();
      const errorMsg = "Geolocation is not supported by your browser. Please select pickup location manually.";
      setRouteError(errorMsg);
      alert(errorMsg);
    }
  };

  // Save ride history
  const saveRide = (from, to, price) => {
    const newRide = {
      id: Date.now(),
      from: from,
      to: to,
      date: new Date().toISOString().split('T')[0],
      price: price
    };

    const updatedRides = [newRide, ...recentRides.slice(0, 4)]; // Keep last 5 rides
    setRecentRides(updatedRides);
    localStorage.setItem('recent-rides', JSON.stringify(updatedRides));

    return newRide;
  };

  // Modified handleRequestRide function to work with the useEffect-based route calculation
  const handleRequestRide = () => {
    if (!pickup || !dropoff) {
      alert("Please select both pickup and dropoff locations");
      return;
    }

    if (!isLoggedIn) {
      alert("Please login to request a ride");
      navigate("/login");
      return;
    }

    // Route is automatically displayed when pickup and dropoff are both selected
    if (routeInfo) {
      // Save this ride to history
      const ride = saveRide(pickup, dropoff, routeInfo.price);

      alert(`Ride requested from ${pickup} to ${dropoff}!\n` +
            `Distance: ${routeInfo.distance} km\n` +
            `Estimated time: ${routeInfo.time} minutes\n` +
            `Estimated fare: ${routeInfo.price}\n\n` +
            `A driver will pick you up soon.`);
    } else {
      alert(`Ride requested from ${pickup} to ${dropoff}!\nA driver will pick you up soon.`);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleRequestRide();
  };

  // Handle navigation to different sections
  const handleNavigation = (section) => {
    setActiveSection(section);
  };

  const navigate = useNavigate();

  // Render the appropriate section based on activeSection state
  const renderSection = () => {
    switch(activeSection) {
      case 'request':
        return renderRideRequestSection();
      case 'history':
        return renderRideHistorySection();
      default:
        return renderRideRequestSection();
    }
  };

  // Render ride request section
  const renderRideRequestSection = () => (
    <>
      <div className="ride-request-container">
        <div className="ride-form">
          <h2>Request a ride</h2>
          <p>Get where you need to go with RideShareX</p>

          <div className="location-inputs">
            <div className="input-group">
              <span className="input-icon pickup-icon">●</span>
              <select
                value={pickup}
                onChange={handlePickupChange}
                disabled={!isLoggedIn}
              >
                <option value="">Select Pickup Location</option>
                {Object.keys(dummyLocations).map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <span className="input-icon dropoff-icon">■</span>
              <select
                value={dropoff}
                onChange={handleDropoffChange}
                disabled={!isLoggedIn}
              >
                <option value="">Select Dropoff Location</option>
                {Object.keys(dummyLocations).map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>

          {!isLoggedIn ? (
            <div className="login-prompt">
              <p>Please <Link to="/login">login</Link> or <Link to="/signup">sign up</Link> to request a ride</p>
            </div>
          ) : (
            <>
              <button className="locate-btn" onClick={handleLocateMe}>
                Locate Me
              </button>

              {routeError && (
                <div className="route-error">
                  <p>{routeError}</p>
                </div>
              )}

              {routeInfo && (
                <div className="route-info">
                  <div className="info-item">
                    <span className="info-label">Distance:</span>
                    <span className="info-value">{routeInfo.distance} km</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Estimated Time:</span>
                    <span className="info-value">{routeInfo.time} min</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Estimated Fare:</span>
                    <span className="info-value">{routeInfo.price}</span>
                  </div>
                </div>
              )}

              <button className="request-ride-btn" onClick={handleRequestRide}>
                Request Ride
              </button>
            </>
          )}
        </div>

        <div className="map-placeholder">
          <div className="map-container" ref={mapRef}>
            {/* Leaflet will initialize here */}
          </div>
          <div className="map-overlay">
            <h3>Live Map Active</h3>
            <p>Select locations to see real-time routes</p>
            {!isMapLoaded && <div className="map-loading">Loading map...</div>}
          </div>
        </div>
      </div>

      {isLoggedIn && (
        <div className="quick-actions-section">
          <h2>Quick Access</h2>
          <div className="quick-actions-grid">
            {quickActions.map(action => (
              <Link key={action.id} to={action.path} className="quick-action-card" style={{ backgroundColor: action.color }}>
                <div className="action-icon">{action.icon}</div>
                <span className="action-title">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Render ride history section
  const renderRideHistorySection = () => (
    <div className="ride-history-preview">
      <h2>Your Recent Rides</h2>
      {recentRides.length > 0 ? (
        <div className="recent-rides-list">
          {recentRides.map(ride => (
            <div key={ride.id} className="ride-item">
              <div className="ride-info">
                <div className="ride-route">
                  <span className="ride-from">{ride.from}</span>
                  <span className="ride-arrow">→</span>
                  <span className="ride-to">{ride.to}</span>
                </div>
                <div className="ride-details">
                  <span className="ride-date">{ride.date}</span>
                  <span className="ride-price">{ride.price}</span>
                </div>
              </div>
              <button className="repeat-ride-btn" onClick={() => {
                setPickup(ride.from);
                setDropoff(ride.to);
                setActiveSection('request');
              }}>
                Repeat Ride
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-rides">
          <p>You haven't taken any rides yet</p>
        </div>
      )}
      <Link to="/history" className="view-all-link">View Complete History</Link>
    </div>
  );

  return (
    <div className="home-container">
      {/* Hero Section - Login/Signup for non-authenticated users */}
      {!isLoggedIn && (
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">RideShareX</h1>
            <p className="hero-subtitle">Your trusted ride-sharing platform</p>
            <div className="hero-buttons">
              <Link to="/login" className="hero-btn primary">Login</Link>
              <Link to="/signup" className="hero-btn secondary">Sign Up</Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Welcome banner for authenticated users */}
        {isLoggedIn && (
          <div className="welcome-banner">
            <div className="welcome-text">
              <h1>Welcome{user?.username ? `, ${user.username}` : ''}!</h1>
              <p>Where would you like to go today?</p>
            </div>
            <div className="welcome-navigation">
              <button
                className={`nav-button ${activeSection === 'request' ? 'active' : ''}`}
                onClick={() => handleNavigation('request')}
              >
                Request Ride
              </button>
              <button
                className={`nav-button ${activeSection === 'history' ? 'active' : ''}`}
                onClick={() => handleNavigation('history')}
              >
                Recent Rides
              </button>
            </div>
          </div>
        )}

        {/* Dynamic section based on activeSection state */}
        {renderSection()}

        {/* Features Section */}
        <div className="features-section">
          <h2>Why Choose RideShareX?</h2>

          <div className="feature-cards">
            <div className="feature-card">
              <div className="card-icon">���</div>
              <h3>Reliable Rides</h3>
              <p>Get there on demand with our reliable network of drivers</p>
            </div>

            <div className="feature-card">
              <div className="card-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Competitive pricing with upfront fare estimates</p>
            </div>

            <div className="feature-card">
              <div className="card-icon">⭐</div>
              <h3>Top Rated</h3>
              <p>Highly rated drivers and excellent customer service</p>
            </div>

            <div className="feature-card">
              <div className="card-icon">📱</div>
              <h3>Easy to Use</h3>
              <p>Simple booking process with real-time tracking</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="how-it-works-section">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>{isLoggedIn ? "Select Location" : "Sign Up"}</h3>
              <p>{isLoggedIn ? "Choose your pickup and dropoff points" : "Create your account in seconds"}</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>{isLoggedIn ? "Request Ride" : "Login"}</h3>
              <p>{isLoggedIn ? "Confirm your route and request a driver" : "Access your account securely"}</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>{isLoggedIn ? "Get Matched" : "Request Ride"}</h3>
              <p>{isLoggedIn ? "We'll connect you with a driver" : "Enter your pickup and destination"}</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Enjoy Ride</h3>
              <p>Track your ride and arrive safely</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Error Fallback UI */}
      {mapLoadError && (
        <div className="map-error-container">
          <div className="map-error-content">
            <h2>Map Loading Error</h2>
            <p>We couldn't load the map right now. Please try again later.</p>
            <p>You can still use the ride request form above.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
