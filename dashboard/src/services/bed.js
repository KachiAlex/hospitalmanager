import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getBeds = async () => {
  try {
    const response = await axios.get(`${API_URL}/beds`);
    return response.data;
  } catch (error) {
    console.error('Error fetching beds:', error);
    throw error;
  }
};
