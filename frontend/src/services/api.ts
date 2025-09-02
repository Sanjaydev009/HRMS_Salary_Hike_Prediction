import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface EmployeeData {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: any;
    address: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  jobDetails: {
    employeeId: string;
    department: string;
    position: string;
    jobTitle: string;
    workLocation: string;
    employmentType: string;
    startDate: any;
    workSchedule: string;
  };
  compensation: {
    baseSalary: number;
    currency: string;
    payFrequency: string;
    benefits: string[];
  };
  role: string;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

// Auth API
export const authAPI = {
  login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Employee API
export const employeeAPI = {
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  create: async (employee: Omit<EmployeeData, 'id'>) => {
    const response = await api.post('/employees', employee);
    return response.data;
  },

  update: async (id: string, employee: Partial<EmployeeData>) => {
    const response = await api.put(`/employees/${id}`, employee);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/employees/dashboard/stats');
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  get: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  update: async (profileData: any) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    
    const response = await api.post('/profile/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Certifications API
export const certificationsAPI = {
  getAll: async () => {
    const response = await api.get('/certifications');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/certifications/${id}`);
    return response.data;
  },

  create: async (certificationData: any) => {
    const response = await api.post('/certifications', certificationData);
    return response.data;
  },

  update: async (id: string, certificationData: any) => {
    const response = await api.put(`/certifications/${id}`, certificationData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/certifications/${id}`);
    return response.data;
  },

  uploadDocument: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await api.post(`/certifications/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/certifications/analytics');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/certifications/categories');
    return response.data;
  },

  getSalaryPrediction: async () => {
    const response = await api.get('/certifications/salary-prediction');
    return response.data;
  }
};

// Attendance API
export const attendanceAPI = {
  checkIn: async (location: string = 'Office', notes?: string) => {
    const response = await api.post('/attendance/check-in', { location, notes });
    return response.data;
  },

  checkOut: async (breakTime?: number, notes?: string) => {
    const response = await api.post('/attendance/check-out', { breakTime, notes });
    return response.data;
  },

  getTodaysAttendance: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  getRecords: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/attendance/records?${params.toString()}`);
    return response.data;
  },

  getSummary: async (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const response = await api.get(`/attendance/summary?${params.toString()}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/attendance/stats');
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getEmployeeDashboard: async () => {
    const response = await api.get('/dashboard/employee');
    return response.data;
  },

  getUserDashboard: async () => {
    const response = await api.get('/dashboard/user');
    return response.data;
  },

  getHRDashboard: async () => {
    const response = await api.get('/dashboard/hr');
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },
};

// Leave API
export const leaveAPI = {
  getAll: async (params?: any) => {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await api.get(`/leaves${queryParams}`);
    return response.data;
  },

  getMyLeaves: async (params?: any) => {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await api.get(`/leaves/my${queryParams}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/leaves/${id}`);
    return response.data;
  },

  apply: async (leaveData: any) => {
    const response = await api.post('/leaves/apply', leaveData);
    return response.data;
  },

  approve: async (id: string, data: { status: 'approved' | 'rejected', rejectionReason?: string }) => {
    const response = await api.put(`/leaves/${id}/approve`, data);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.put(`/leaves/${id}/cancel`);
    return response.data;
  },

  getBalance: async () => {
    const response = await api.get('/leaves/balance/me');
    return response.data;
  },
};

// Payroll API
export const payrollAPI = {
  getAll: async (params?: any) => {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await api.get(`/payroll${queryParams}`);
    return response.data;
  },

  getMyPayroll: async (params?: any) => {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await api.get(`/payroll/my${queryParams}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/payroll/${id}`);
    return response.data;
  },

  processPayroll: async (month: number, year: number) => {
    const response = await api.post('/payroll/process', { month, year });
    return response.data;
  },

  getPayslip: async (id: string) => {
    const response = await api.get(`/payroll/${id}/payslip`);
    return response.data;
  },

  downloadPayslip: async (id: string) => {
    const response = await api.get(`/payroll/${id}/payslip/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
