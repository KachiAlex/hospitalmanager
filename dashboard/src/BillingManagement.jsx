import React, { useState } from 'react';
import { createInvoice } from './services/billing';

export default function BillingManagement() {
  const [formData, setFormData] = useState({
    patientId: '',
    amount: '',
    description: ''
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
      await createInvoice(formData);
      setMessage('Invoice created successfully!');
      setFormData({
        patientId: '',
        amount: '',
        description: ''
      });
    } catch (error) {
      setMessage('Error creating invoice');
      console.error(error);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg mb-2">Billing Management</h3>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Patient ID</label>
          <input
            type="text"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Invoice
        </button>
      </form>
      
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
