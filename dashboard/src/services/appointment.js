import axios from 'axios';

const API_URL = '/api';

export const scheduleAppointment = async (appointmentData) => {
  try {
    const response = await axios.post(`${API_URL}/encounters`, {
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      visitDate: appointmentData.appointmentDate,
      reason: appointmentData.reason
    });
    return response.data;
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    throw error;
  }
};
