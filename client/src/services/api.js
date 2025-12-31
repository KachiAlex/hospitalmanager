// API Service Layer for T-Happy Hospital
// Handles all backend communications with proper error handling and loading states

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request handler with error handling
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.get('/health');
      return { status: 'healthy', ...response };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Patient Management
  async getPatients() {
    return this.get('/patients');
  }

  async getPatient(id) {
    return this.get(`/patients/${id}`);
  }

  async createPatient(patientData) {
    return this.post('/patients', patientData);
  }

  // Doctor Management
  async getDoctors() {
    return this.get('/doctors');
  }

  async createDoctor(doctorData) {
    return this.post('/doctors', doctorData);
  }

  // Encounter Management
  async createEncounter(encounterData) {
    return this.post('/encounters', encounterData);
  }

  // Diagnosis Management
  async createDiagnosis(diagnosisData) {
    return this.post('/diagnoses', diagnosisData);
  }

  // Lab Orders
  async createLabOrder(labOrderData) {
    return this.post('/lab-orders', labOrderData);
  }

  async updateLabOrder(id, updateData) {
    return this.patch(`/lab-orders/${id}`, updateData);
  }

  // Prescriptions
  async createPrescription(prescriptionData) {
    return this.post('/prescriptions', prescriptionData);
  }

  // Bed Management
  async getBeds(status = null) {
    const endpoint = status ? `/beds?status=${status}` : '/beds';
    return this.get(endpoint);
  }

  // Admission Management
  async getAdmissions() {
    return this.get('/admissions');
  }

  async createAdmission(admissionData) {
    return this.post('/admissions', admissionData);
  }

  async dischargePatient(admissionId, dischargeData) {
    return this.post(`/admissions/${admissionId}/discharge`, dischargeData);
  }

  // Dashboard Statistics
  async getDashboardStats() {
    try {
      const [patients, doctors, beds, admissions] = await Promise.all([
        this.getPatients(),
        this.getDoctors(),
        this.getBeds(),
        this.getAdmissions()
      ]);

      const availableBeds = beds.filter(bed => bed.status === 'available').length;
      const occupiedBeds = beds.filter(bed => bed.status === 'occupied').length;
      const activeAdmissions = admissions.filter(admission => !admission.dischargeDate).length;

      return {
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalBeds: beds.length,
        availableBeds,
        occupiedBeds,
        activeAdmissions,
        todayAppointments: Math.floor(Math.random() * 20) + 10, // Placeholder until encounters are date-filtered
        emergencyCases: Math.floor(Math.random() * 5) + 1, // Placeholder
        revenue: Math.floor(Math.random() * 1000000) + 2000000 // Placeholder
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return fallback data if API fails
      return {
        totalPatients: 0,
        totalDoctors: 0,
        totalBeds: 0,
        availableBeds: 0,
        occupiedBeds: 0,
        activeAdmissions: 0,
        todayAppointments: 0,
        emergencyCases: 0,
        revenue: 0,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;