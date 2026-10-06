import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as lostFoundApi from '../api/lostFoundApi';

export const getLostFoundsAsync = createAsyncThunk(
  'lostFounds/getLostFounds',
  async (params, { rejectWithValue }) => {
    try {
      const response = await lostFoundApi.getLostFounds(params);
      return response.data.lost_founds || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getLostFoundByIdAsync = createAsyncThunk(
  'lostFounds/getLostFoundById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await lostFoundApi.getLostFoundById(id);
      return response.data.lost_found;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addLostFoundAsync = createAsyncThunk(
  'lostFounds/addLostFound',
  async ({ title, description, status }, { rejectWithValue }) => {
    try {
      const response = await lostFoundApi.addLostFound(title, description, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLostFoundAsync = createAsyncThunk(
  'lostFounds/updateLostFound',
  async ({ id, title, description, status, is_completed }, { rejectWithValue }) => {
    try {
      const response = await lostFoundApi.updateLostFound(id, title, description, status, is_completed);
      return response.data.lost_found;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCoverAsync = createAsyncThunk(
  'lostFounds/updateCover',
  async ({ id, coverFile }, { rejectWithValue }) => {
    try {
      const response = await lostFoundApi.updateCover(id, coverFile);
      return response.data.lost_found;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLostFoundAsync = createAsyncThunk(
  'lostFounds/deleteLostFound',
  async (id, { rejectWithValue }) => {
    try {
      await lostFoundApi.deleteLostFound(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  lostFounds: [],
  lostFound: null,
  isLostFound: false,
  isLostFoundAdd: false,
  isLostFoundAdded: false,
  isLostFoundChange: false,
  isLostFoundChanged: false,
  isLostFoundChangeCover: false,
  isLostFoundChangedCover: false,
  isLostFoundDelete: false,
  isLostFoundDeleted: false,
  error: null,
};

const lostFoundSlice = createSlice({
  name: 'lostFounds',
  initialState,
  reducers: {
    resetLostFoundStatus: (state) => {
      state.isLostFoundAdded = false;
      state.isLostFoundChanged = false;
      state.isLostFoundChangedCover = false;
      state.isLostFoundDeleted = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // getLostFounds
      .addCase(getLostFoundsAsync.pending, (state) => {
        state.isLostFound = true;
      })
      .addCase(getLostFoundsAsync.fulfilled, (state, action) => {
        state.isLostFound = false;
        state.lostFounds = action.payload;
      })
      .addCase(getLostFoundsAsync.rejected, (state, action) => {
        state.isLostFound = false;
        state.error = action.payload;
      })
      // getLostFoundById
      .addCase(getLostFoundByIdAsync.pending, (state) => {
        state.isLostFound = true;
      })
      .addCase(getLostFoundByIdAsync.fulfilled, (state, action) => {
        state.isLostFound = false;
        state.lostFound = action.payload;
      })
      .addCase(getLostFoundByIdAsync.rejected, (state, action) => {
        state.isLostFound = false;
        state.error = action.payload;
      })
      // addLostFound
      .addCase(addLostFoundAsync.pending, (state) => {
        state.isLostFoundAdd = true;
      })
      .addCase(addLostFoundAsync.fulfilled, (state) => {
        state.isLostFoundAdd = false;
        state.isLostFoundAdded = true;
      })
      .addCase(addLostFoundAsync.rejected, (state, action) => {
        state.isLostFoundAdd = false;
        state.error = action.payload;
      })
      // updateLostFound
      .addCase(updateLostFoundAsync.pending, (state) => {
        state.isLostFoundChange = true;
      })
      .addCase(updateLostFoundAsync.fulfilled, (state, action) => {
        state.isLostFoundChange = false;
        state.isLostFoundChanged = true;
        state.lostFound = action.payload;
      })
      .addCase(updateLostFoundAsync.rejected, (state, action) => {
        state.isLostFoundChange = false;
        state.error = action.payload;
      })
      // updateCover
      .addCase(updateCoverAsync.pending, (state) => {
        state.isLostFoundChangeCover = true;
      })
      .addCase(updateCoverAsync.fulfilled, (state, action) => {
        state.isLostFoundChangeCover = false;
        state.isLostFoundChangedCover = true;
        if (state.lostFound) {
          state.lostFound.cover = action.payload.cover;
        }
      })
      .addCase(updateCoverAsync.rejected, (state, action) => {
        state.isLostFoundChangeCover = false;
        state.error = action.payload;
      })
      // deleteLostFound
      .addCase(deleteLostFoundAsync.pending, (state) => {
        state.isLostFoundDelete = true;
      })
      .addCase(deleteLostFoundAsync.fulfilled, (state, action) => {
        state.isLostFoundDelete = false;
        state.isLostFoundDeleted = true;
        state.lostFounds = state.lostFounds.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteLostFoundAsync.rejected, (state, action) => {
        state.isLostFoundDelete = false;
        state.error = action.payload;
      });
  }
});

export const { resetLostFoundStatus } = lostFoundSlice.actions;
export default lostFoundSlice.reducer;
