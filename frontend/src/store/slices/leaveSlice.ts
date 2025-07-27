import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Leave {
  _id: string;
  employeeId: any;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedDate: string;
  approvedBy?: any;
  approvedDate?: string;
  rejectionReason?: string;
}

interface LeaveState {
  leaves: Leave[];
  currentLeave: Leave | null;
  leaveBalance: any;
  isLoading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

const initialState: LeaveState = {
  leaves: [],
  currentLeave: null,
  leaveBalance: null,
  isLoading: false,
  error: null,
  pagination: { current: 1, pages: 1, total: 0 },
};

export const fetchLeaves = createAsyncThunk(
  'leaves/fetchLeaves',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaves', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaves');
    }
  }
);

export const applyLeave = createAsyncThunk(
  'leaves/applyLeave',
  async (leaveData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/leaves', leaveData);
      return response.data.data.leave;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply leave');
    }
  }
);

export const approveLeave = createAsyncThunk(
  'leaves/approveLeave',
  async ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/leaves/${id}/approve`, { status, rejectionReason });
      return response.data.data.leave;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process leave');
    }
  }
);

export const fetchLeaveBalance = createAsyncThunk(
  'leaves/fetchLeaveBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaves/balance/me');
      return response.data.data.leaveBalance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leave balance');
    }
  }
);

const leaveSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaves = action.payload.leaves;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.leaves.unshift(action.payload);
      })
      .addCase(approveLeave.fulfilled, (state, action) => {
        const index = state.leaves.findIndex(leave => leave._id === action.payload._id);
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
      })
      .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
        state.leaveBalance = action.payload;
      });
  },
});

export const { clearError } = leaveSlice.actions;
export default leaveSlice.reducer;
