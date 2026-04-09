import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from './api.js';

/* ===========================
   GENERATE UPI QR
=========================== */
export const generateUserDepositUpiQR = createAsyncThunk(
  "userUpi/generateUserDepositUpiQR",
  async (amount, { rejectWithValue }) => {
    try {

      const { data } = await api.post(
        "/upi-pay",
        { amount },

      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "QR generation failed"
      );
    }
  }
);

const userUpiSlice = createSlice({
  name: "userUpi",
  initialState: {
    loading: false,
    qrData: null,
    success: false,
    error: null,
  },
  reducers: {
    resetUserUpiState: (state) => {
      state.loading = false;
      state.qrData = null;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateUserDepositUpiQR.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(generateUserDepositUpiQR.fulfilled, (state, action) => {
        state.loading = false;
        state.qrData = action.payload;
        state.success = true;
      })
      .addCase(generateUserDepositUpiQR.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetUserUpiState } = userUpiSlice.actions;

export default userUpiSlice.reducer;