import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface AnalyticsState {
  dashboard: any;
  salaryPrediction: any;
  leaveTrends: any;
  performanceInsights: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboard: null,
  salaryPrediction: null,
  leaveTrends: null,
  performanceInsights: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardAnalytics = createAsyncThunk(
  'analytics/fetchDashboardAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/dashboard');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard analytics');
    }
  }
);

export const predictSalary = createAsyncThunk(
  'analytics/predictSalary',
  async ({ employeeId, targetYear }: { employeeId: string; targetYear?: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/analytics/salary-prediction', { employeeId, targetYear });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to predict salary');
    }
  }
);

export const fetchLeaveTrends = createAsyncThunk(
  'analytics/fetchLeaveTrends',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/leave-trends', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leave trends');
    }
  }
);

export const fetchPerformanceInsights = createAsyncThunk(
  'analytics/fetchPerformanceInsights',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/performance-insights', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch performance insights');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSalaryPrediction: (state) => {
      state.salaryPrediction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(predictSalary.fulfilled, (state, action) => {
        state.salaryPrediction = action.payload;
      })
      .addCase(fetchLeaveTrends.fulfilled, (state, action) => {
        state.leaveTrends = action.payload;
      })
      .addCase(fetchPerformanceInsights.fulfilled, (state, action) => {
        state.performanceInsights = action.payload;
      });
  },
});

export const { clearError, clearSalaryPrediction } = analyticsSlice.actions;
export default analyticsSlice.reducer;
