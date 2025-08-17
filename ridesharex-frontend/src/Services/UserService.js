const API_URL = 'http://localhost:8081';

class UserService {
    async login(credentials) {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        if (response.ok) {
            // Store the token and user data in localStorage
            localStorage.setItem('user-token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        }
        throw new Error(data.message || 'Login failed');
    }

    async register(userData) {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (response.ok) {
            return data;
        }
        throw new Error(data.message || 'Registration failed');
    }

    logout() {
        // Remove all authentication data from localStorage
        localStorage.removeItem('user-token');
        localStorage.removeItem('user');
        localStorage.removeItem('user-profile-picture');
        return true;
    }

    getToken() {
        return localStorage.getItem('user-token');
    }

    getUser() {
        const userJson = localStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : null;
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    // Method to create authenticated requests with JWT token
    async fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle token expiration
        if (response.status === 401) {
            this.logout();
            window.location.href = '/login';
            throw new Error('Your session has expired. Please login again.');
        }

        return response;
    }

    // Get user profile - uses authentication
    async getUserProfile() {
        const user = this.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const response = await this.fetchWithAuth(`${API_URL}/api/users/${user.id}`);

        if (response.ok) {
            const data = await response.json();
            return data;
        }

        throw new Error('Failed to fetch user profile');
    }

    // Update user profile - uses authentication
    async updateUserProfile(profileData) {
        const user = this.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const response = await this.fetchWithAuth(`${API_URL}/api/users/${user.id}`, {
            method: 'PATCH',
            body: JSON.stringify(profileData)
        });

        if (response.ok) {
            const updatedUser = await response.json();
            // Update stored user data
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        }

        throw new Error('Failed to update profile');
    }
}

export default new UserService();
