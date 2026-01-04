import axios from 'axios';

const API_URL = '/api';

export const getPatients = async () => {
  try {
    const response = await axios.get(`${API_URL}/patients`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

export const getPatientDetails = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
};

export const registerPatient = async (patientData) => {
  try {
    const response = await axios.post(`${API_URL}/patients`, patientData);
    return response.data;
  } catch (error) {
    console.error('Error registering patient:', error);
    throw error;
  }
};
