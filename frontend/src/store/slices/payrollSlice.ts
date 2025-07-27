import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface PayrollState {
  payrolls: any[];
  stats: any;
  isLoading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

const initialState: PayrollState = {
  payrolls: [],
  stats: null,
  isLoading: false,
  error: null,
  pagination: { current: 1, pages: 1, total: 0 },
};

export const fetchPayrolls = createAsyncThunk(
  'payroll/fetchPayrolls',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/payroll', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payrolls');
    }
  }
);

export const generatePayroll = createAsyncThunk(
  'payroll/generatePayroll',
  async ({ month, year }: { month: number; year: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/payroll/generate', { month, year });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate payroll');
    }
  }
);

export const fetchPayrollStats = createAsyncThunk(
  'payroll/fetchPayrollStats',
  async (year: number, { rejectWithValue }) => {
    try {
      const response = await api.get('/payroll/stats/summary', { params: { year } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payroll stats');
    }
  }
);

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrolls.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayrolls.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payrolls = action.payload.payrollRecords;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPayrolls.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPayrollStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError } = payrollSlice.actions;
export default payrollSlice.reducer;
