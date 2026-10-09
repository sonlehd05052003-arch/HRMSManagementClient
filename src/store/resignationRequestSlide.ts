import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IResignationRequest {
  resignationRequestId: number;
  requestNumber: string;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  expectedLastWorkingDate: string;
  reason?: string;
  handoverNote?: string;
  handoverToEmployeeId?: number;
  handoverToEmployeeName?: string;
  status: string;
  rejectionReason?: string;
  reviewerComments?: string;
  reviewedByName?: string;
  submittedDate: string;
  reviewedDate?: string;
  incompleteTaskCount: number;
}

export interface CreateResignationRequestDto {
  expectedLastWorkingDate: string;
  reason?: string;
  handoverNote?: string;
  handoverToEmployeeId?: number;
}

export interface ApproveResignationRequestDto {
  comments?: string;
}

export interface RejectResignationRequestDto {
  rejectionReason: string;
}

interface IResignationRequestState {
  myRequests: IResignationRequest[];
  pendingRequests: IResignationRequest[];
  loading: boolean;
  error: any | null;
  lastResponse: any | null;
}

const initialState: IResignationRequestState = {
  myRequests: [],
  pendingRequests: [],
  loading: false,
  error: null,
  lastResponse: null,
};

export const createResignationRequest = createAsyncThunk(
  "resignationRequest/create",
  async (data: CreateResignationRequestDto, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/ResignationRequests",
        method: "POST",
        data,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchMyResignationRequests = createAsyncThunk(
  "resignationRequest/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/ResignationRequests/my",
        method: "GET",
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const cancelResignationRequest = createAsyncThunk(
  "resignationRequest/cancel",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/ResignationRequests/${id}/cancel`,
        method: "POST",
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchPendingResignationRequests = createAsyncThunk(
  "resignationRequest/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/ResignationRequests/pending",
        method: "GET",
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const approveResignationRequest = createAsyncThunk(
  "resignationRequest/approve",
  async ({ id, data }: { id: number; data: ApproveResignationRequestDto }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/ResignationRequests/${id}/approve`,
        method: "POST",
        data,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const rejectResignationRequest = createAsyncThunk(
  "resignationRequest/reject",
  async ({ id, data }: { id: number; data: RejectResignationRequestDto }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/ResignationRequests/${id}/reject`,
        method: "POST",
        data,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const resignationRequestSlice = createSlice({
  name: "resignationRequest",
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
      .addCase(fetchMyResignationRequests.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyResignationRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests = action.payload?.data || [];
      })
      .addCase(fetchMyResignationRequests.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createResignationRequest.pending, (state) => { state.loading = true; state.error = null; state.lastResponse = null; })
      .addCase(createResignationRequest.fulfilled, (state, action) => { state.loading = false; state.lastResponse = action.payload; })
      .addCase(createResignationRequest.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(cancelResignationRequest.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(cancelResignationRequest.fulfilled, (state) => { state.loading = false; })
      .addCase(cancelResignationRequest.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchPendingResignationRequests.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPendingResignationRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload?.data || [];
      })
      .addCase(fetchPendingResignationRequests.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(approveResignationRequest.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(approveResignationRequest.fulfilled, (state) => { state.loading = false; })
      .addCase(approveResignationRequest.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(rejectResignationRequest.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(rejectResignationRequest.fulfilled, (state) => { state.loading = false; })
      .addCase(rejectResignationRequest.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearLastResponse, clearError } = resignationRequestSlice.actions;

export const selectMyResignationRequests = (state: RootState) => state.resignationRequest.myRequests;
export const selectPendingResignationRequests = (state: RootState) => state.resignationRequest.pendingRequests;
export const selectResignationRequestLoading = (state: RootState) => state.resignationRequest.loading;
export const selectResignationRequestError = (state: RootState) => state.resignationRequest.error;
export const selectResignationRequestLastResponse = (state: RootState) => state.resignationRequest.lastResponse;

export default resignationRequestSlice.reducer;
