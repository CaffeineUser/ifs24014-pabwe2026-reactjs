import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userApi from '../api/userApi';

export const getUsersAsync = createAsyncThunk(
  'users/getUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getUsers();
      return response.data.users;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMeAsync = createAsyncThunk(
  'users/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getMe();
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMeAsync = createAsyncThunk(
  'users/updateMe',
  async (name, { rejectWithValue }) => {
    try {
      const response = await userApi.updateMe(name);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePhotoAsync = createAsyncThunk(
  'users/updatePhoto',
  async (file, { rejectWithValue }) => {
    try {
      const response = await userApi.updatePhoto(file);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePasswordAsync = createAsyncThunk(
  'users/updatePassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await userApi.updatePassword(oldPassword, newPassword);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  users: [],
  user: null,
  profile: null,
  isProfile: false,
  isChangeProfile: false,
  isChangeProfilePhoto: false,
  isChangeProfilePassword: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getUsers
      .addCase(getUsersAsync.pending, (state) => {
        state.isProfile = true;
      })
      .addCase(getUsersAsync.fulfilled, (state, action) => {
        state.isProfile = false;
        state.users = action.payload;
      })
      .addCase(getUsersAsync.rejected, (state, action) => {
        state.isProfile = false;
        state.error = action.payload;
      })
      // getMe
      .addCase(getMeAsync.pending, (state) => {
        state.isProfile = true;
      })
      .addCase(getMeAsync.fulfilled, (state, action) => {
        state.isProfile = false;
        state.profile = action.payload;
        state.user = action.payload;
      })
      .addCase(getMeAsync.rejected, (state, action) => {
        state.isProfile = false;
        state.error = action.payload;
      })
      // updateMe
      .addCase(updateMeAsync.pending, (state) => {
        state.isChangeProfile = true;
      })
      .addCase(updateMeAsync.fulfilled, (state, action) => {
        state.isChangeProfile = false;
        state.profile = action.payload;
        state.user = action.payload;
      })
      .addCase(updateMeAsync.rejected, (state, action) => {
        state.isChangeProfile = false;
        state.error = action.payload;
      })
      // updatePhoto
      .addCase(updatePhotoAsync.pending, (state) => {
        state.isChangeProfilePhoto = true;
      })
      .addCase(updatePhotoAsync.fulfilled, (state, action) => {
        state.isChangeProfilePhoto = false;
        if (state.profile) {
          state.profile.photo = action.payload.photo;
        }
      })
      .addCase(updatePhotoAsync.rejected, (state, action) => {
        state.isChangeProfilePhoto = false;
        state.error = action.payload;
      })
      // updatePassword
      .addCase(updatePasswordAsync.pending, (state) => {
        state.isChangeProfilePassword = true;
      })
      .addCase(updatePasswordAsync.fulfilled, (state) => {
        state.isChangeProfilePassword = false;
      })
      .addCase(updatePasswordAsync.rejected, (state, action) => {
        state.isChangeProfilePassword = false;
        state.error = action.payload;
      });
  }
});

export default usersSlice.reducer;
