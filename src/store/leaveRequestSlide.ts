import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface ILeaveRequest {
  leaveRequestID: number;
  requestNumber: string;
  employeeID: number;
  leaveTypeID: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: string;
  submittedDate: string;
  currentBalance?: number;
  remainingAfterRequest?: number;
  messageCode?: string;
  message?: string;
}

export interface CreateLeaveRequestDto {
  leaveTypeID: number;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  submitAnyway?: boolean;
}

export interface ApproveLeaveRequestDto {
  comments: string;
}

export interface RejectLeaveRequestDto {
  rejectionReason: string;
}

export interface CancelLeaveRequestDto {
  reason: string;
}

export interface TeamLeaveCalendarDto {
  leaveRequestId: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: string;
  isTopLevel: boolean;
}

export interface PendingLeaveRequestDto {
  leaveRequestId: number;
  requestNumber: string;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason?: string;
  status: string;
  submittedDate: string;
  isTopLevel: boolean;
}

export interface LeaveBalanceDto {
  leaveTypeId: number;
  leaveTypeName: string;
  year: number;
  totalEntitlement: number;
  usedDays: number;
  carriedForward: number;
  remainingDays: number;
}

interface ILeaveRequestState {
  myRequests: ILeaveRequest[];
  pendingRequests: PendingLeaveRequestDto[];
  teamCalendar: TeamLeaveCalendarDto[];
  myBalance: LeaveBalanceDto[];
  loading: boolean;
  error: any | null;
  lastResponse: any | null;
}

const initialState: ILeaveRequestState = {
  myRequests: [],
  pendingRequests: [],
  teamCalendar: [],
  myBalance: [],
  loading: false,
  error: null,
  lastResponse: null,
};

export const createLeaveRequest = createAsyncThunk(
  "leaveRequest/create",
  async (data: CreateLeaveRequestDto, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/LeaveRequests",
        method: "POST",
        data,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchMyLeaveRequests = createAsyncThunk(
  "leaveRequest/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/LeaveRequests/my-requests",
        method: "GET",
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const approveLeaveRequest = createAsyncThunk(
  "leaveRequest/approve",
  async ({ id, data }: { id: number; data: ApproveLeaveRequestDto }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/LeaveRequests/${id}/approve`,
        method: "POST",
        data,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const rejectLeaveRequest = createAsyncThunk(
  "leaveRequest/reject",
  async ({ id, data }: { id: number; data: RejectLeaveRequestDto }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/LeaveRequests/${id}/reject`,
        method: "POST",
        data,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const cancelLeaveRequest = createAsyncThunk(
  "leaveRequest/cancel",
  async ({ id, data }: { id: number; data: CancelLeaveRequestDto }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/LeaveRequests/${id}/cancel`,
        method: "POST",
        data,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchTeamLeaveCalendar = createAsyncThunk(
  "leaveRequest/fetchTeamCalendar",
  async (_, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/LeaveRequests/team-calendar",
        method: "GET",
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchPendingLeaveRequests = createAsyncThunk(
  "leaveRequest/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/LeaveRequests/pending",
        method: "GET",
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const leaveRequestSlice = createSlice({
  name: "leaveRequest",
  initialState,
  reducers: {
    clearLastResponse(state) {
      state.lastResponse = null;
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Requests
      .addCase(fetchMyLeaveRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyLeaveRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests = action.payload.data || action.payload;
      })
      .addCase(fetchMyLeaveRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Request
      .addCase(createLeaveRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastResponse = null;
      })
      .addCase(createLeaveRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })
      .addCase(createLeaveRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve Request
      .addCase(approveLeaveRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveLeaveRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })
      .addCase(approveLeaveRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject Request
      .addCase(rejectLeaveRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectLeaveRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })
      .addCase(rejectLeaveRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Request
      .addCase(cancelLeaveRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelLeaveRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })
      .addCase(cancelLeaveRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Team Calendar
      .addCase(fetchTeamLeaveCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamLeaveCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.teamCalendar = action.payload.data || action.payload;
      })
      .addCase(fetchTeamLeaveCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Pending Requests
      .addCase(fetchPendingLeaveRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingLeaveRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload.data || action.payload;
      })
      .addCase(fetchPendingLeaveRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLastResponse, clearError } = leaveRequestSlice.actions;

export const selectMyLeaveRequests = (state: RootState) => state.leaveRequest.myRequests;
export const selectPendingLeaveRequests = (state: RootState) => state.leaveRequest.pendingRequests;
export const selectTeamLeaveCalendar = (state: RootState) => state.leaveRequest.teamCalendar;
export const selectLeaveRequestLoading = (state: RootState) => state.leaveRequest.loading;
export const selectLeaveRequestError = (state: RootState) => state.leaveRequest.error;
export const selectLeaveRequestLastResponse = (state: RootState) => state.leaveRequest.lastResponse;

export default leaveRequestSlice.reducer;

