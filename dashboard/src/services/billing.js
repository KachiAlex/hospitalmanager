import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const createInvoice = async (invoiceData) => {
  try {
    const response = await axios.post(`${API_URL}/billing`, invoiceData);
    return response.data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};
