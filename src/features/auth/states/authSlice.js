import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../api/authApi';
import { putAccessToken } from '../../../helpers/apiHelper';

export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(email, password);
      putAccessToken(response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.register(name, email, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isAuthLogin: false,
  isAuthRegister: false,
  isAuthLogout: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      putAccessToken(null);
      state.isAuthLogout = true;
    },
    resetAuthState: (state) => {
      state.error = null;
      state.isAuthLogin = false;
      state.isAuthRegister = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isAuthLogin = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state) => {
        state.isAuthLogin = false;
        state.isAuthLogout = false;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isAuthLogin = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerAsync.pending, (state) => {
        state.isAuthRegister = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.isAuthRegister = false;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isAuthRegister = false;
        state.error = action.payload;
      });
  }
});

export const { logout, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
