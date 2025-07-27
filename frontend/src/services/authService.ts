import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

const authService = {
  // Login user
  login: async (credentials: LoginCredentials) => {
    console.log('🔗 AuthService login called with:', credentials);
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('📡 API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ AuthService login error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update password
  updatePassword: async (passwordData: PasswordUpdate) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export default authService;
