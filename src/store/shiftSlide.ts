import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { apiErrorMessage } from "../utils/apiError";

export interface IShift {
    shiftId: number;
    shiftCode: string;
    shiftName: string;
    startTime: string; // TimeSpan in C# is typically string in JSON (HH:mm:ss)
    endTime: string;
    workingHours: number;
    shiftType: string;
    lateGraceMinutes: number;
    earlyCheckInMinutes: number;
    latestCheckInMinutes: number;
    earliestCheckOutMinutes: number;
    latestCheckOutMinutes: number;
    isOvernight: boolean;
    isActive: boolean;
    createdDate: string;
    createdBy: number;
}

interface IShiftState {
    shifts: IShift[];
    selectedShift: IShift | null;
    loading: boolean;
    error: string | null;
}

const initialState: IShiftState = {
    shifts: [],
    selectedShift: null,
    loading: false,
    error: null,
};

export const fetchAllShifts = createAsyncThunk(
    "shift/fetchAll",
    async (isActive: boolean | undefined, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Shifts",
                method: "GET",
                params: { isActive },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const fetchShiftById = createAsyncThunk(
    "shift/fetchById",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Shifts/${id}`,
                method: "GET",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const createShift = createAsyncThunk(
    "shift/create",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Shifts",
                method: "POST",
                data,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const updateShift = createAsyncThunk(
    "shift/update",
    async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Shifts/${id}`,
                method: "PUT",
                data,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const deactivateShift = createAsyncThunk(
    "shift/deactivate",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Shifts/${id}/deactivate`,
                method: "PATCH",
            });
            return { id, message: response.data.message };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const activateShift = createAsyncThunk(
    "shift/activate",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Shifts/${id}/activate`,
                method: "PATCH",
            });
            return { id, message: response.data.message };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const shiftSlice = createSlice({
    name: "shift",
    initialState,
    reducers: {
        clearSelectedShift(state) {
            state.selectedShift = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllShifts.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllShifts.fulfilled, (state, action) => {
                state.loading = false;
                state.shifts = action.payload;
            })
            .addCase(fetchAllShifts.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            
            .addCase(fetchShiftById.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchShiftById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedShift = action.payload;
            })
            .addCase(fetchShiftById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(createShift.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(createShift.fulfilled, (state) => { state.loading = false; })
            .addCase(createShift.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(updateShift.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateShift.fulfilled, (state) => { state.loading = false; })
            .addCase(updateShift.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(deactivateShift.fulfilled, (state, action) => {
                const shift = state.shifts.find(s => s.shiftId === action.payload.id);
                if (shift) shift.isActive = false;
                if (state.selectedShift && state.selectedShift.shiftId === action.payload.id) {
                    state.selectedShift.isActive = false;
                }
            })
            .addCase(activateShift.fulfilled, (state, action) => {
                const shift = state.shifts.find(s => s.shiftId === action.payload.id);
                if (shift) shift.isActive = true;
                if (state.selectedShift && state.selectedShift.shiftId === action.payload.id) {
                    state.selectedShift.isActive = true;
                }
            });
    },
});

export const { clearSelectedShift } = shiftSlice.actions;

export const selectShifts = (state: RootState) => state.shift.shifts;
export const selectSelectedShift = (state: RootState) => state.shift.selectedShift;
export const selectShiftLoading = (state: RootState) => state.shift.loading;
export const selectShiftError = (state: RootState) => state.shift.error;

export default shiftSlice.reducer;
