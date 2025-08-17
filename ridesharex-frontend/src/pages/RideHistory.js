import React, { useState, useEffect } from 'react';
import '../styles/RideHistory.css';

function RideHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's ride history
    // This is a placeholder - replace with actual API call
    const fetchRideHistory = async () => {
      try {
        setLoading(true);
        // Simulate API call with timeout
        setTimeout(() => {
          const dummyRides = [
            {
              id: '1',
              date: '2025-08-15',
              pickup: 'Dhanmondi',
              dropoff: 'Airport',
              fare: 350,
              driver: 'Mohammed Ali',
              status: 'completed'
            },
            {
              id: '2',
              date: '2025-08-10',
              pickup: 'Gulshan',
              dropoff: 'Mirpur',
              fare: 280,
              driver: 'Sarah Khan',
              status: 'completed'
            },
            {
              id: '3',
              date: '2025-08-05',
              pickup: 'Uttara',
              dropoff: 'Motijheel',
              fare: 320,
              driver: 'Rahul Dev',
              status: 'completed'
            }
          ];
          setRides(dummyRides);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching ride history:", error);
        setLoading(false);
      }
    };

    fetchRideHistory();
  }, []);

  return (
    <div className="ride-history-container">
      <h1>Your Ride History</h1>

      {loading ? (
        <div className="loading">Loading your ride history...</div>
      ) : (
        <>
          {rides.length === 0 ? (
            <div className="no-rides">
              <p>You haven't taken any rides yet.</p>
            </div>
          ) : (
            <div className="rides-list">
              {rides.map(ride => (
                <div key={ride.id} className="ride-card">
                  <div className="ride-header">
                    <span className="ride-date">{ride.date}</span>
                    <span className={`ride-status ${ride.status}`}>{ride.status}</span>
                  </div>
                  <div className="ride-details">
                    <div className="ride-route">
                      <div className="pickup">
                        <span className="label">From:</span>
                        <span className="location">{ride.pickup}</span>
                      </div>
                      <div className="dropoff">
                        <span className="label">To:</span>
                        <span className="location">{ride.dropoff}</span>
                      </div>
                    </div>
                    <div className="ride-info">
                      <div className="driver">
                        <span className="label">Driver:</span>
                        <span>{ride.driver}</span>
                      </div>
                      <div className="fare">
                        <span className="label">Fare:</span>
                        <span>৳{ride.fare}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RideHistory;
