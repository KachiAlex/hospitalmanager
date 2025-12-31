import React, { useState, useEffect } from 'react';
import { getPatients } from './services/patient';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Your Patients</h2>
      
      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul>
          {patients.map(patient => (
            <li key={patient.id} className="mb-2 p-2 border-b">
              <div className="font-semibold">{patient.first_name} {patient.last_name}</div>
              <div>DOB: {patient.date_of_birth}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
