import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { apiErrorMessage } from "../utils/apiError";

export interface LeaveTypeDto {
  leaveTypeId: number;
  leaveTypeCode: string;
  leaveTypeName: string;
  annualEntitlement: number;
  isPaid: boolean;
  requiresApproval: boolean;
  isCarryForward: boolean;
  maxCarryForwardDays: number | null;
  isActive: boolean;
}

export interface CreateLeaveTypeDto {
  leaveTypeCode: string;
  leaveTypeName: string;
  annualEntitlement: number;
  isPaid: boolean;
  requiresApproval: boolean;
  isCarryForward: boolean;
  maxCarryForwardDays: number | null;
  isActive: boolean;
}

interface ILeaveTypeState {
  leaveTypes: LeaveTypeDto[];
  selectedLeaveType: LeaveTypeDto | null;
  loading: boolean;
  error: any | null;
}

const initialState: ILeaveTypeState = {
  leaveTypes: [],
  selectedLeaveType: null,
  loading: false,
  error: null,
};

export const fetchActiveLeaveTypes = createAsyncThunk(
  "leaveType/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/leave-types",
        method: "GET",
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
    }
  }
);

export const fetchAllLeaveTypes = createAsyncThunk(
  "leaveType/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/leave-types/all",
        method: "GET",
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
    }
  }
);

export const fetchLeaveTypeById = createAsyncThunk(
  "leaveType/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/leave-types/${id}`,
        method: "GET",
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
    }
  }
);

export const createLeaveType = createAsyncThunk(
  "leaveType/create",
  async (dto: CreateLeaveTypeDto, { rejectWithValue }) => {
    try {
      const response = await request({
        url: "/leave-types",
        method: "POST",
        data: dto,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
    }
  }
);

export const updateLeaveType = createAsyncThunk(
  "leaveType/update",
  async ({ id, dto }: { id: number; dto: CreateLeaveTypeDto }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/leave-types/${id}`,
        method: "PUT",
        data: dto,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
    }
  }
);

export const deleteLeaveType = createAsyncThunk(
  "leaveType/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      // Note: Soft delete endpoint might need to be verified if the controller adds it
      const response = await request({
        url: `/leave-types/${id}`,
        method: "DELETE",
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
    }
  }
);

export const leaveTypeSlice = createSlice({
  name: "leaveType",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSelectedLeaveType(state) {
      state.selectedLeaveType = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Active
      .addCase(fetchActiveLeaveTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveLeaveTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveTypes = action.payload;
      })
      .addCase(fetchActiveLeaveTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch All
      .addCase(fetchAllLeaveTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLeaveTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveTypes = action.payload;
      })
      .addCase(fetchAllLeaveTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By Id
      .addCase(fetchLeaveTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLeaveType = action.payload;
      })
      .addCase(fetchLeaveTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createLeaveType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLeaveType.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveTypes.push(action.payload);
      })
      .addCase(createLeaveType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateLeaveType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeaveType.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.leaveTypes.findIndex(lt => lt.leaveTypeId === action.payload.leaveTypeId);
        if (index !== -1) {
          state.leaveTypes[index] = action.payload;
        }
      })
      .addCase(updateLeaveType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteLeaveType.fulfilled, (state, action) => {
        const id = action.meta.arg;
        const index = state.leaveTypes.findIndex(lt => lt.leaveTypeId === id);
        if (index !== -1) {
          state.leaveTypes[index].isActive = false; // Assuming soft delete behavior
        }
      });
  },
});

export const { clearError, clearSelectedLeaveType } = leaveTypeSlice.actions;

export const selectLeaveTypes = (state: RootState) => state.leaveType.leaveTypes;
export const selectActiveLeaveTypes = createSelector(
  [selectLeaveTypes],
  (leaveTypes) => leaveTypes.filter(lt => lt.isActive)
);
export const selectSelectedLeaveType = (state: RootState) => state.leaveType.selectedLeaveType;
export const selectLeaveTypeLoading = (state: RootState) => state.leaveType.loading;
export const selectLeaveTypeError = (state: RootState) => state.leaveType.error;

export default leaveTypeSlice.reducer;

