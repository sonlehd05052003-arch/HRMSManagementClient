import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IShiftAssignment {
    assignmentId: number;
    employeeId: number;
    employeeName: string;
    shiftId: number;
    shiftCode: string;
    shiftName: string;
    assignmentDate: string; // ISO string date
    startDate: string;
    endDate: string | null;
    recurrencePattern?: string;
    status: string;
    createdDate: string;
    createdBy: number;
    startTime?: string;
    endTime?: string;
}

export interface AssignShiftDto {
    employeeId: number;
    shiftId: number;
    startDate: string;
    endDate: string;
    assignType: "Daily" | "Weekly";
    daysOfWeek?: number[];
}

export interface UpdateShiftAssignmentDto {
    shiftId: number;
    assignmentDate: string;
    status: string;
}

interface IShiftAssignmentState {
    assignments: IShiftAssignment[];
    mySchedule: IShiftAssignment[];
    loading: boolean;
    error: string | null;
}

const initialState: IShiftAssignmentState = {
    assignments: [],
    mySchedule: [],
    loading: false,
    error: null,
};

export const assignShift = createAsyncThunk(
    "shiftAssignment/assign",
    async (data: AssignShiftDto, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/ShiftAssignments/assign",
                method: "POST",
                data,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const fetchShiftAssignments = createAsyncThunk(
    "shiftAssignment/fetchAll",
    async (params: { date?: string; employeeId?: number; status?: string }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/ShiftAssignments",
                method: "GET",
                params,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const fetchMySchedule = createAsyncThunk(
    "shiftAssignment/fetchMySchedule",
    async (params: { fromDate?: string; toDate?: string }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/ShiftAssignments/my-schedule",
                method: "GET",
                params,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const updateShiftAssignment = createAsyncThunk(
    "shiftAssignment/update",
    async ({ id, data }: { id: number; data: UpdateShiftAssignmentDto }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/ShiftAssignments/${id}`,
                method: "PUT",
                data,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const deactivateShiftAssignment = createAsyncThunk(
    "shiftAssignment/deactivate",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/ShiftAssignments/${id}/deactivate`,
                method: "PATCH",
            });
            return { id, ...response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const activateShiftAssignment = createAsyncThunk(
    "shiftAssignment/activate",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/ShiftAssignments/${id}/activate`,
                method: "PATCH",
            });
            return { id, ...response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const deleteShiftAssignment = createAsyncThunk(
    "shiftAssignment/delete",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/ShiftAssignments/${id}`,
                method: "DELETE",
            });
            return { id, ...response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const shiftAssignmentSlice = createSlice({
    name: "shiftAssignment",
    initialState,
    reducers: {
        clearAssignments(state) {
            state.assignments = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchShiftAssignments.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchShiftAssignments.fulfilled, (state, action) => {
                state.loading = false;
                state.assignments = action.payload.data || [];
            })
            .addCase(fetchShiftAssignments.rejected, (state, action) => { state.loading = false; state.error = (action.payload as any)?.message || "Something went wrong"; })
            
            .addCase(fetchMySchedule.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchMySchedule.fulfilled, (state, action) => {
                state.loading = false;
                state.mySchedule = action.payload.data || [];
            })
            .addCase(fetchMySchedule.rejected, (state, action) => { state.loading = false; state.error = (action.payload as any)?.message || "Something went wrong"; })

            .addCase(assignShift.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(assignShift.fulfilled, (state) => { state.loading = false; })
            .addCase(assignShift.rejected, (state, action) => { state.loading = false; state.error = (action.payload as any)?.message || "Something went wrong"; })

            .addCase(updateShiftAssignment.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateShiftAssignment.fulfilled, (state) => { state.loading = false; })
            .addCase(updateShiftAssignment.rejected, (state, action) => { state.loading = false; state.error = (action.payload as any)?.message || "Something went wrong"; })

            .addCase(deactivateShiftAssignment.fulfilled, (state, action) => {
                const item = state.assignments.find(a => a.assignmentId === action.payload.id);
                if (item) item.status = "Inactive";
            })
            .addCase(activateShiftAssignment.fulfilled, (state, action) => {
                const item = state.assignments.find(a => a.assignmentId === action.payload.id);
                if (item) item.status = "Active";
            })
            .addCase(deleteShiftAssignment.fulfilled, (state, action) => {
                state.assignments = state.assignments.filter(a => a.assignmentId !== action.payload.id);
            });
    },
});

export const { clearAssignments } = shiftAssignmentSlice.actions;

export const selectAssignments = (state: RootState) => state.shiftAssignment.assignments;
export const selectMySchedule = (state: RootState) => state.shiftAssignment.mySchedule;
export const selectShiftAssignmentLoading = (state: RootState) => state.shiftAssignment.loading;
export const selectShiftAssignmentError = (state: RootState) => state.shiftAssignment.error;

export default shiftAssignmentSlice.reducer;
