import React from 'react';
import {
  FaUserMd,
  FaBed,
  FaAmbulance,
  FaPills,
  FaFlask,
  FaBaby,
  FaUserGraduate,
  FaStethoscope,
  FaShieldAlt,
  FaDollarSign,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

// Icon mapping for services and features
export const iconMap: Record<string, React.ComponentType<any>> = {
  FaUserMd,
  FaBed,
  FaAmbulance,
  FaPills,
  FaFlask,
  FaBaby,
  FaUserGraduate,
  FaStethoscope,
  FaShieldAlt,
  FaDollarSign,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBars,
  FaTimes
};

// Utility function to get icon component by name
export const getIcon = (iconName: string, props?: any): React.ReactNode => {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in iconMap`);
    return null;
  }
  return <IconComponent {...props} />;
};