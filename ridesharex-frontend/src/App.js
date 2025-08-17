import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import NoPage from './pages/NoPage';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong.</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error && this.state.error.toString()}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load components to prevent one bad component from breaking the entire app
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Profile = React.lazy(() => import('./pages/Profile'));
const RideHistory = React.lazy(() => import('./pages/RideHistory'));
const FindRiders = React.lazy(() => import('./pages/FindRiders'));

function App() {
  // Simple state to verify React is working
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // This will run after the component mounts, confirming React is working
    setIsLoaded(true);
    console.log('App component mounted successfully');
  }, []);

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {/* Debug info to confirm React is working */}
        {isLoaded && <div style={{display: 'none'}}>React is working</div>}

        {/* Use ErrorBoundary and Suspense for each route */}
        <ErrorBoundary>
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Routes>
              <Route index element={<Home />} />
              <Route path='/login' element={<Login />} />
              <Route path='/signup' element={<Signup />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/history' element={<RideHistory />} />
              <Route path='/find-riders' element={<FindRiders />} />
              <Route path="*" element={<NoPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
