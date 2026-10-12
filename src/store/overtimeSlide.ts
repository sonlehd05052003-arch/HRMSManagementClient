import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { apiErrorMessage } from "../utils/apiError";

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface CreateOvertimeRequestDto {
  overtimeDate: string;
  startTime?: string | null;
  endTime?: string | null;
  otMode?: string;
  reason: string;
  taskDescription?: string;
}

export interface ApproveOvertimeRequestDto {
  comments?: string;
}

export interface RejectOvertimeRequestDto {
  reason: string;
}

export interface CancelOvertimeRequestDto {
  reason: string;
}

export interface MyOvertimeRequestDto {
  overtimeRequestId: number;
  requestNumber: string;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  otType?: string;
  otMode?: string;
  reason?: string;
  status: string;
  submittedDate: string;
}

export interface PendingOvertimeRequestDto {
  overtimeRequestId: number;
  requestNumber: string;
  employeeId: number;
  employeeName: string;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  otType?: string;
  otMode?: string;
  reason?: string;
  taskDescription?: string;
  status: string;
  submittedDate: string;
  isTopLevel: boolean;
}

interface IOvertimeState {
  myRequests: MyOvertimeRequestDto[];
  pendingRequests: PendingOvertimeRequestDto[];
  loading: boolean;
  error: any | null;
  lastResponse: any | null;
}

const initialState: IOvertimeState = {
  myRequests: [],
  pendingRequests: [],
  loading: false,
  error: null,
  lastResponse: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────

export const createOvertimeRequest = createAsyncThunk(
  "overtime/create",
  async (data: CreateOvertimeRequestDto, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/OvertimeRequests",
        method: "POST",
        data,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
    }
  }
);

export const fetchMyOvertimeRequests = createAsyncThunk(
  "overtime/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/OvertimeRequests/my-requests",
        method: "GET",
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
    }
  }
);

export const fetchPendingOvertimeRequests = createAsyncThunk(
  "overtime/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/OvertimeRequests/pending",
        method: "GET",
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
    }
  }
);

export const approveOvertimeRequest = createAsyncThunk(
  "overtime/approve",
  async ({ id, data }: { id: number; data: ApproveOvertimeRequestDto }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/OvertimeRequests/${id}/approve`,
        method: "POST",
        data,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
    }
  }
);

export const rejectOvertimeRequest = createAsyncThunk(
  "overtime/reject",
  async ({ id, data }: { id: number; data: RejectOvertimeRequestDto }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/OvertimeRequests/${id}/reject`,
        method: "POST",
        data,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
    }
  }
);

export const cancelOvertimeRequest = createAsyncThunk(
  "overtime/cancel",
  async ({ id, data }: { id: number; data: CancelOvertimeRequestDto }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/OvertimeRequests/${id}/cancel`,
        method: "POST",
        data,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

export const overtimeSlice = createSlice({
  name: "overtime",
  initialState,
  reducers: {
    clearLastResponse(state) {
      state.lastResponse = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Requests
      .addCase(fetchMyOvertimeRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOvertimeRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests = action.payload.data || action.payload;
      })
      .addCase(fetchMyOvertimeRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Pending Requests
      .addCase(fetchPendingOvertimeRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingOvertimeRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload.data || action.payload;
      })
      .addCase(fetchPendingOvertimeRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Request
      .addCase(createOvertimeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastResponse = null;
      })
      .addCase(createOvertimeRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })
      .addCase(createOvertimeRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve Request
      .addCase(approveOvertimeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveOvertimeRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })
      .addCase(approveOvertimeRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject Request
      .addCase(rejectOvertimeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectOvertimeRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })
      .addCase(rejectOvertimeRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Request
      .addCase(cancelOvertimeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOvertimeRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })
      .addCase(cancelOvertimeRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLastResponse, clearError } = overtimeSlice.actions;

export const selectMyOvertimeRequests = (state: RootState) => state.overtime.myRequests;
export const selectPendingOvertimeRequests = (state: RootState) => state.overtime.pendingRequests;
export const selectOvertimeLoading = (state: RootState) => state.overtime.loading;
export const selectOvertimeError = (state: RootState) => state.overtime.error;
export const selectOvertimeLastResponse = (state: RootState) => state.overtime.lastResponse;

export default overtimeSlice.reducer;
