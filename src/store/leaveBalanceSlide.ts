import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface MyLeaveBalanceDto {
  leaveTypeId: number;
  leaveTypeName: string;
  totalEntitlement: number;
  usedDays: number;
  remainingDays: number;
  carriedForward: number;
  year: number;
}

export interface LeaveBalanceListDto {
  balanceId: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  year: number;
  totalEntitlement: number;
  usedDays: number;
  remainingDays: number;
  carriedForward: number;
  lastUpdated: string;
}

export interface CreateLeaveBalanceDto {
  employeeId: number;
  leaveTypeId: number;
  year: number;
  totalEntitlement: number;
  usedDays?: number;
  carriedForward?: number;
}

export interface AdjustLeaveBalanceDto {
  employeeId: number;
  leaveTypeId: number;
  adjustmentType: string;
  numberOfDays: number;
  reason: string;
  effectiveDate: string;
}

export interface GenerateBalanceResultDto {
  year: number;
  totalEmployees: number;
  totalLeaveTypes: number;
  created: number;
  skipped: number;
  carriedForward: number;
}

interface ILeaveBalanceState {
  myBalances: MyLeaveBalanceDto[];
  allBalances: LeaveBalanceListDto[];
  employeeBalances: LeaveBalanceListDto[];
  loading: boolean;
  error: any | null;
  lastResponse: any | null;
}

const initialState: ILeaveBalanceState = {
  myBalances: [],
  allBalances: [],
  employeeBalances: [],
  loading: false,
  error: null,
  lastResponse: null,
};

export const fetchMyBalance = createAsyncThunk(
  "leaveBalance/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/LeaveBalances/my-balance",
        method: "GET",
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchAllBalances = createAsyncThunk(
  "leaveBalance/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/LeaveBalances",
        method: "GET",
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchBalancesByEmployee = createAsyncThunk(
  "leaveBalance/fetchByEmployee",
  async (employeeId: number, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/LeaveBalances/employee/${employeeId}`,
        method: "GET",
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const createLeaveBalance = createAsyncThunk(
  "leaveBalance/create",
  async (data: CreateLeaveBalanceDto, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/LeaveBalances",
        method: "POST",
        data,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const adjustLeaveBalance = createAsyncThunk(
  "leaveBalance/adjust",
  async (data: AdjustLeaveBalanceDto, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/LeaveBalances/adjust",
        method: "POST",
        data,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const generateLeaveBalances = createAsyncThunk(
  "leaveBalance/generate",
  async ({ year, carryForward }: { year: number; carryForward: boolean }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/LeaveBalances/generate?year=${year}&carryForward=${carryForward}`,
        method: "POST",
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const leaveBalanceSlice = createSlice({
  name: "leaveBalance",
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
      // Fetch My Balance
      .addCase(fetchMyBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.myBalances = action.payload;
      })
      .addCase(fetchMyBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch All Balances
      .addCase(fetchAllBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBalances.fulfilled, (state, action) => {
        state.loading = false;
        state.allBalances = action.payload;
      })
      .addCase(fetchAllBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By Employee
      .addCase(fetchBalancesByEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBalancesByEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeBalances = action.payload;
      })
      .addCase(fetchBalancesByEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Balance
      .addCase(createLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastResponse = null;
      })
      .addCase(createLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })
      .addCase(createLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Adjust Balance
      .addCase(adjustLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastResponse = null;
      })
      .addCase(adjustLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })
      .addCase(adjustLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate Balances
      .addCase(generateLeaveBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastResponse = null;
      })
      .addCase(generateLeaveBalances.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })
      .addCase(generateLeaveBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLastResponse, clearError } = leaveBalanceSlice.actions;

export const selectMyLeaveBalances = (state: RootState) => state.leaveBalance.myBalances;
export const selectAllLeaveBalances = (state: RootState) => state.leaveBalance.allBalances;
export const selectEmployeeLeaveBalances = (state: RootState) => state.leaveBalance.employeeBalances;
export const selectLeaveBalanceLoading = (state: RootState) => state.leaveBalance.loading;
export const selectLeaveBalanceError = (state: RootState) => state.leaveBalance.error;
export const selectLeaveBalanceLastResponse = (state: RootState) => state.leaveBalance.lastResponse;

export default leaveBalanceSlice.reducer;

