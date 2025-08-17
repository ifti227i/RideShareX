import UserService from './UserService';

const RIDES_ENDPOINT = 'http://localhost:8081/rides';

class RideService {
  async getAvailableRides() {
    try {
      const response = await UserService.fetchWithAuth(RIDES_ENDPOINT);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(`Error fetching rides: ${error}`);
      throw error;
    }
  };
};

export default new RideService();
