import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Async thunks
export const fetchLabTests = createAsyncThunk(
  'lab/fetchTests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/lab/tests');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lab tests');
    }
  }
);

export const fetchLabTestById = createAsyncThunk(
  'lab/fetchTestById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/lab/tests/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lab test');
    }
  }
);

export const createLabTest = createAsyncThunk(
  'lab/createTest',
  async (testData, { rejectWithValue }) => {
    try {
      const response = await api.post('/lab/tests', testData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create lab test');
    }
  }
);

export const updateLabTest = createAsyncThunk(
  'lab/updateTest',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/lab/tests/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lab test');
    }
  }
);

export const updateTestResults = createAsyncThunk(
  'lab/updateResults',
  async ({ id, results }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/lab/tests/${id}/results`, { results });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update test results');
    }
  }
);

// Initial state
const initialState = {
  tests: [],
  currentTest: null,
  loading: false,
  error: null,
};

// Slice
const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTest: (state) => {
      state.currentTest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all lab tests
      .addCase(fetchLabTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
      })
      .addCase(fetchLabTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch lab test by ID
      .addCase(fetchLabTestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabTestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTest = action.payload;
      })
      .addCase(fetchLabTestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create lab test
      .addCase(createLabTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLabTest.fulfilled, (state, action) => {
        state.loading = false;
        state.tests.push(action.payload);
      })
      .addCase(createLabTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update lab test
      .addCase(updateLabTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLabTest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tests.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tests[index] = action.payload;
        }
        state.currentTest = action.payload;
      })
      .addCase(updateLabTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update test results
      .addCase(updateTestResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTestResults.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tests.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tests[index] = action.payload;
        }
        state.currentTest = action.payload;
      })
      .addCase(updateTestResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentTest } = labSlice.actions;
export default labSlice.reducer;
