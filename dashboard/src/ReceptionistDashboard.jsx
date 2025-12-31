import React, { useState } from 'react';
import { registerPatient } from './services/patient';
import AppointmentScheduler from './AppointmentScheduler';
import BillingManagement from './BillingManagement';

export default function ReceptionistDashboard() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    contact_info: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerPatient(formData);
      setMessage('Patient registered successfully!');
      setFormData({
        first_name: '',
        last_name: '',
        gender: '',
        date_of_birth: '',
        contact_info: ''
      });
    } catch (error) {
      setMessage('Error registering patient');
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Receptionist Dashboard</h2>
      
      <div>
        <h3 className="text-lg mb-2">Patient Registration</h3>
        <form onSubmit={handleSubmit} className="max-w-md mb-8">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Contact Info</label>
            <input
              type="text"
              name="contact_info"
              value={formData.contact_info}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Register Patient
          </button>
        </form>
      </div>
      
      {message && <p className="mt-4">{message}</p>}
      
      <AppointmentScheduler />
      <BillingManagement />
    </div>
  );
}
