import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Async thunks
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/doctors');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }
);

export const fetchDoctorById = createAsyncThunk(
  'doctors/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor');
    }
  }
);

export const updateDoctorSchedule = createAsyncThunk(
  'doctors/updateSchedule',
  async ({ id, schedule }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/doctors/${id}/schedule`, { schedule });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update schedule');
    }
  }
);

// Initial state
const initialState = {
  doctors: [],
  currentDoctor: null,
  loading: false,
  error: null,
};

// Slice
const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDoctor: (state) => {
      state.currentDoctor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch doctor by ID
      .addCase(fetchDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDoctor = action.payload;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update doctor schedule
      .addCase(updateDoctorSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.doctors.findIndex(d => d._id === action.payload._id);
        if (index !== -1) {
          state.doctors[index] = action.payload;
        }
        state.currentDoctor = action.payload;
      })
      .addCase(updateDoctorSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;
