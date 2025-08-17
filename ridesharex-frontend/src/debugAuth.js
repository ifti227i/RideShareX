// This is a debug helper file to assist with authentication issues
// It adds temporary authentication for testing purposes

// Run this function in your browser console to create a temporary auth session
function createDebugAuthSession() {
  // Create a debug token
  localStorage.setItem('user-token', 'debug-token-' + Date.now());

  // Create a sample user profile
  const debugUser = {
    id: 'debug-123',
    username: 'DebugUser',
    email: 'debug@example.com',
    phone: '123-456-7890',
    address: '123 Debug Street, Test City',
    bio: 'This is a debug user profile for testing',
    createdAt: new Date().toISOString()
  };

  // Save to localStorage
  localStorage.setItem('user', JSON.stringify(debugUser));

  console.log('Debug authentication created! You should now be able to access the profile page.');
  console.log('Refresh the page and try accessing the profile again.');

  return true;
}

// Export the function for potential import usage
export default createDebugAuthSession;
