import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getStaff = async () => {
  try {
    const response = await axios.get(`${API_URL}/doctors`);
    return response.data;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
};

export const addStaff = async (staffData) => {
  try {
    const response = await axios.post(`${API_URL}/doctors`, staffData);
    return response.data;
  } catch (error) {
    console.error('Error adding staff:', error);
    throw error;
  }
};
