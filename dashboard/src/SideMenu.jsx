import React from 'react';

export default function SideMenu({ userRole }) {
  // Common links for all roles
  const commonLinks = [
    { name: 'Dashboard', path: '/dashboard' },
  ];
  
  // Role-specific links
  const roleLinks = {
    doctor: [
      { name: 'Patients', path: '/patients' },
      { name: 'Appointments', path: '/appointments' },
      { name: 'Prescriptions', path: '/prescriptions' },
    ],
    nurse: [
      { name: 'Tasks', path: '/tasks' },
      { name: 'Medication Schedule', path: '/medication' },
    ],
    receptionist: [
      { name: 'Patient Registration', path: '/registration' },
      { name: 'Appointments', path: '/appointments' },
      { name: 'Billing', path: '/billing' },
    ],
    admin: [
      { name: 'Staff Management', path: '/staff' },
      { name: 'Bed Management', path: '/beds' },
      { name: 'Reports', path: '/reports' },
    ],
  };
  
  const links = [...commonLinks, ...(roleLinks[userRole] || [])];
  
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <nav>
        <ul className="p-4">
          {links.map((link, index) => (
            <li key={index} className="mb-2">
              <a 
                href={link.path} 
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
