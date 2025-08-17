import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FindRiders.css';

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

// Sample rider data - In a real app, this would come from an API
const sampleRiders = [
  {
    id: 1,
    name: "John Smith",
    rating: 4.8,
    vehicle: "Toyota Camry",
    licensePlate: "ABC-123",
    price: 12.50,
    eta: "5 mins",
    location: [51.505, -0.09], // London coordinates
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    rating: 4.9,
    vehicle: "Honda Civic",
    licensePlate: "XYZ-789",
    price: 14.75,
    eta: "8 mins",
    location: [51.508, -0.11],
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    name: "David Chen",
    rating: 4.7,
    vehicle: "Tesla Model 3",
    licensePlate: "EV-2023",
    price: 18.00,
    eta: "12 mins",
    location: [51.503, -0.08],
    avatar: "https://randomuser.me/api/portraits/men/59.jpg"
  }
];

// Return point state - This is the initial state we'll return to when the "paper" command is used
const RETURN_POINT_STATE = {
  pickup: "",
  dropoff: "",
  availableRiders: [],
  selectedRider: null,
  isMapLoaded: false,
  isLoading: false,
  searchComplete: false,
  routeInfo: null,
};

function FindRiders() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [availableRiders, setAvailableRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pickupCoordinates, setPickupCoordinates] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);
  const markersRef = useRef([]);
  const carIconsRef = useRef([]);
  const navigate = useNavigate();

  // Function to reset state to return point
  const resetToReturnPoint = () => {
    setPickup(RETURN_POINT_STATE.pickup);
    setDropoff(RETURN_POINT_STATE.dropoff);
    setAvailableRiders(RETURN_POINT_STATE.availableRiders);
    setSelectedRider(RETURN_POINT_STATE.selectedRider);
    setIsLoading(RETURN_POINT_STATE.isLoading);
    setSearchComplete(RETURN_POINT_STATE.searchComplete);
    setRouteInfo(RETURN_POINT_STATE.routeInfo);
    clearMarkers();
    clearRoute();
    clearCarIcons();
  };

  // Check for "paper" command in console
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'p') {
        const activeElement = document.activeElement;
        // Only check for "paper" if not in an input field
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
          const paperCommandInput = window.prompt("Enter command:");
          if (paperCommandInput && paperCommandInput.toLowerCase() === "paper") {
            resetToReturnPoint();
            alert("Returned to saved state!");
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check for dark mode preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || mapInstanceRef.current) return;

    try {
      if (mapRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([51.505, -0.09], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstanceRef.current);

        setIsMapLoaded(true);
      }
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
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

  // Clear previous markers
  const clearMarkers = () => {
    if (markersRef.current.length) {
      markersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
      markersRef.current = [];
    }
  };

  // Clear car icons
  const clearCarIcons = () => {
    if (carIconsRef.current.length) {
      carIconsRef.current.forEach(icon => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(icon);
        }
      });
      carIconsRef.current = [];
    }
  };

  // Clear previous route
  const clearRoute = () => {
    if (routingControlRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
  };

  // Create custom car icon
  const createCarIcon = () => {
    return L.divIcon({
      html: '🚗',
      className: 'car-emoji-icon',
      iconSize: [25, 25],
      iconAnchor: [12, 12]
    });
  };

  // Add car emojis around pickup point
  const addCarIcons = (pickupCoords) => {
    // Use actual rider locations from sample data
    sampleRiders.forEach(rider => {
      const carIcon = createCarIcon();
      const carMarker = L.marker(rider.location, { icon: carIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>${rider.name}</b><br>${rider.vehicle}<br>ETA: ${rider.eta}`);

      carIconsRef.current.push(carMarker);
    });

    // Center map to show both pickup and nearby riders
    if (carIconsRef.current.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds([pickupCoords]);
      sampleRiders.forEach(rider => bounds.extend(rider.location));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const handleFindRiders = async (e) => {
    e.preventDefault();

    if (!pickup || !dropoff) {
      alert("Please enter both pickup and drop-off locations");
      return;
    }

    setIsLoading(true);
    setSearchComplete(false);

    // Clear previous markers, routes, and car icons
    clearMarkers();
    clearRoute();
    clearCarIcons();

    // Simulate geocoding the pickup location
    // In a real app, you would use a geocoding service here
    const simulatedPickupCoords = [51.505, -0.09]; // Default to London for demo
    setPickupCoordinates(simulatedPickupCoords);

    // Add a marker for pickup location
    if (mapInstanceRef.current) {
      const pickupMarker = L.marker(simulatedPickupCoords)
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>Pickup:</b> ${pickup}`)
        .openPopup();

      mapInstanceRef.current.setView(simulatedPickupCoords, 14);
      markersRef.current.push(pickupMarker);

      // Add car emojis around pickup point
      addCarIcons(simulatedPickupCoords);
    }

    // In a real application, you would make an API call here to get nearby riders
    // For now, we'll use sample data and add a delay to simulate a network request
    setTimeout(() => {
      setAvailableRiders(sampleRiders);

      setIsLoading(false);
      setSearchComplete(true);
    }, 1500);
  };

  const handleSelectRider = (rider) => {
    setSelectedRider(rider);

    // Create a route from rider location to pickup to dropoff
    if (mapInstanceRef.current && leafletLoaded && pickupCoordinates) {
      // Clear existing route if any
      clearRoute();

      // In a real app, you would geocode the dropoff location
      // For now, we'll use dummy coordinates
      const dropoffCoords = [51.52, -0.1]; // Dummy dropoff location

      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(rider.location[0], rider.location[1]), // Rider's current location
          L.latLng(pickupCoordinates[0], pickupCoordinates[1]),     // Pickup location
          L.latLng(dropoffCoords[0], dropoffCoords[1])    // Dropoff location
        ],
        lineOptions: {
          styles: [
            {color: 'blue', opacity: 0.6, weight: 4}
          ]
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false
      }).addTo(mapInstanceRef.current);

      // Update route info - in a real app this would come from the routing service
      setRouteInfo({
        distance: '5.2 km',
        duration: '18 mins',
        price: rider.price
      });
    }
  };

  const confirmRide = () => {
    if (!selectedRider) return;

    // In a real app, you would make an API call to confirm the ride
    // For now, we'll simulate a successful booking
    alert(`Ride confirmed with ${selectedRider.name}! They'll pick you up shortly.`);

    // You might want to navigate to a ride tracking page or show a confirmation screen
    navigate('/ride-history');
  };

  return (
    <div className={`find-riders-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="theme-toggle">
        <button onClick={toggleTheme} aria-label="Toggle theme">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="find-riders-header">
        <h1>Find Riders Near You</h1>
        <p>Enter your locations to find available riders</p>
      </div>

      <div className="find-riders-content">
        <div className="search-section">
          <form onSubmit={handleFindRiders}>
            <div className="form-group">
              <label htmlFor="pickup">Pickup Location</label>
              <input
                type="text"
                id="pickup"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Enter your pickup location"
                className="location-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dropoff">Drop-off Location</label>
              <input
                type="text"
                id="dropoff"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Enter your destination"
                className="location-input"
                required
              />
            </div>

            <button
              type="submit"
              className="search-button"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading-spinner"></span> : 'Request Ride'}
            </button>
          </form>
        </div>

        <div className="map-section">
          {!leafletLoaded ? (
            <div className="map-error">
              <p>Map could not be loaded. Please check your internet connection.</p>
            </div>
          ) : (
            <div id="map" ref={mapRef}></div>
          )}
        </div>

        {searchComplete && (
          <div className="riders-section">
            <h2>Available Riders</h2>

            {availableRiders.length === 0 ? (
              <p className="no-riders">No riders found in your area. Try again later.</p>
            ) : (
              <div className="riders-list">
                {availableRiders.map(rider => (
                  <div
                    key={rider.id}
                    className={`rider-card ${selectedRider?.id === rider.id ? 'selected' : ''}`}
                    onClick={() => handleSelectRider(rider)}
                  >
                    <div className="rider-avatar">
                      <img src={rider.avatar} alt={rider.name} />
                    </div>
                    <div className="rider-info">
                      <h3>{rider.name} <span className="rider-rating">★ {rider.rating}</span></h3>
                      <p>{rider.vehicle} • {rider.licensePlate}</p>
                      <div className="rider-details">
                        <span className="rider-eta">ETA: {rider.eta}</span>
                        <span className="rider-price">${rider.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedRider && routeInfo && (
              <div className="ride-confirmation">
                <h3>Ride Summary</h3>
                <div className="ride-details">
                  <div className="detail-row">
                    <span>Distance:</span>
                    <span>{routeInfo.distance}</span>
                  </div>
                  <div className="detail-row">
                    <span>Duration:</span>
                    <span>{routeInfo.duration}</span>
                  </div>
                  <div className="detail-row total-price">
                    <span>Total Price:</span>
                    <span>${routeInfo.price.toFixed(2)}</span>
                  </div>
                </div>
                <button className="confirm-button" onClick={confirmRide}>
                  Confirm Ride
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FindRiders;
