import React, { useState, useEffect } from 'react';
import { getStaff, addStaff } from './services/staff';
import { getBeds } from './services/bed';

export default function AdminDashboard() {
  const [staff, setStaff] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStaff, setNewStaff] = useState({
    first_name: '',
    last_name: '',
    specialty: '',
    contact_info: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const staffData = await getStaff();
        const bedData = await getBeds();
        setStaff(staffData);
        setBeds(bedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStaffChange = (e) => {
    setNewStaff({
      ...newStaff,
      [e.target.name]: e.target.value
    });
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await addStaff(newStaff);
      const staffData = await getStaff();
      setStaff(staffData);
      setNewStaff({
        first_name: '',
        last_name: '',
        specialty: '',
        contact_info: ''
      });
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Admin Dashboard</h2>
      
      <div className="mb-8">
        <h3 className="text-lg mb-2">Staff Management</h3>
        <form onSubmit={handleAddStaff} className="mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={newStaff.first_name}
                onChange={handleStaffChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={newStaff.last_name}
                onChange={handleStaffChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Specialty</label>
              <input
                type="text"
                name="specialty"
                value={newStaff.specialty}
                onChange={handleStaffChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Contact Info</label>
              <input
                type="text"
                name="contact_info"
                value={newStaff.contact_info}
                onChange={handleStaffChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Staff
          </button>
        </form>
        
        <div>
          <h4 className="font-semibold mb-2">Staff List</h4>
          <ul>
            {staff.map(person => (
              <li key={person.id} className="mb-2">
                {person.first_name} {person.last_name} - {person.specialty}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg mb-2">Bed Management</h3>
        <ul>
          {beds.map(bed => (
            <li key={bed.id} className="mb-2">
              {bed.ward} {bed.bed_number} - {bed.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
