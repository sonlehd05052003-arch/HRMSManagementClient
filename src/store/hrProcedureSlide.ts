import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { apiErrorMessage } from "../utils/apiError";

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface IHRProcedureList {
    procedureId: number;
    procedureNumber: string;
    employeeFullName: string;
    employeeCode: string;
    procedureType: string;
    effectiveDate: string;
    status: string;
    submittedDate: string;
    submittedByName: string;
}

export interface IHRProcedureResponse {
    procedureId: number;
    procedureNumber: string;
    employeeId: number;
    employeeFullName: string;
    employeeCode: string;
    procedureType: string;
    effectiveDate: string;
    newDepartmentId: number | null;
    newDepartmentName: string | null;
    newPositionId: number | null;
    newPositionName: string | null;
    newSalary: number | null;
    newManagerId: number | null;
    newManagerName: string | null;
    reason: string | null;
    status: string;
    rejectionReason: string | null;
    submittedDate: string;
    submittedBy: number;
    submittedByName: string;
    reviewedDate: string | null;
    reviewedBy: number | null;
    reviewedByName: string | null;
    approvedDate: string | null;
    approvedBy: number | null;
    approvedByName: string | null;
    appliedDate: string | null;
    appliedBy: number | null;
    appliedByName: string | null;
}

interface IHRProcedureState {
    procedures: IHRProcedureList[];
    selectedProcedure: IHRProcedureResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: IHRProcedureState = {
    procedures: [],
    selectedProcedure: null,
    loading: false,
    error: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAllProcedures = createAsyncThunk(
    "hrProcedure/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({ url: "/HRProcedure", method: "GET" });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const fetchProcedureById = createAsyncThunk(
    "hrProcedure/fetchById",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({ url: `/HRProcedure/${id}`, method: "GET" });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const fetchPendingProcedures = createAsyncThunk(
    "hrProcedure/fetchPending",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({ url: "/HRProcedure/pending", method: "GET" });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const fetchProceduresByEmployee = createAsyncThunk(
    "hrProcedure/fetchByEmployee",
    async (employeeId: number, { rejectWithValue }) => {
        try {
            const response = await request({ url: `/HRProcedure/employee/${employeeId}`, method: "GET" });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const fetchProceduresByStatus = createAsyncThunk(
    "hrProcedure/fetchByStatus",
    async (status: string, { rejectWithValue }) => {
        try {
            const response = await request({ url: `/HRProcedure/status/${status}`, method: "GET" });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const submitProcedure = createAsyncThunk(
    "hrProcedure/submit",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await request({ url: "/HRProcedure", method: "POST", data });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const updateProcedure = createAsyncThunk(
    "hrProcedure/update",
    async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
        try {
            const response = await request({ url: `/HRProcedure/${id}`, method: "PUT", data });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const approveProcedure = createAsyncThunk(
    "hrProcedure/approve",
    async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
        try {
            const response = await request({ url: `/HRProcedure/${id}/approve`, method: "POST", data });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const rejectProcedure = createAsyncThunk(
    "hrProcedure/reject",
    async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
        try {
            const response = await request({ url: `/HRProcedure/${id}/reject`, method: "POST", data });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const applyProcedure = createAsyncThunk(
    "hrProcedure/apply",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({ url: `/HRProcedure/${id}/apply`, method: "POST" });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const deleteProcedure = createAsyncThunk(
    "hrProcedure/delete",
    async (id: number, { rejectWithValue }) => {
        try {
            await request({ url: `/HRProcedure/${id}`, method: "DELETE" });
            return id;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

export const hrProcedureSlice = createSlice({
    name: "hrProcedure",
    initialState,
    reducers: {
        clearSelectedProcedure(state) { state.selectedProcedure = null; },
    },
    extraReducers: (builder) => {
        builder
            // fetchAllProcedures
            .addCase(fetchAllProcedures.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllProcedures.fulfilled, (state, action) => {
                state.loading = false;
                state.procedures = action.payload;
            })
            .addCase(fetchAllProcedures.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            
            // fetchProcedureById
            .addCase(fetchProcedureById.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProcedureById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedProcedure = action.payload;
            })
            .addCase(fetchProcedureById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            
            // fetchPendingProcedures
            .addCase(fetchPendingProcedures.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchPendingProcedures.fulfilled, (state, action) => {
                state.loading = false;
                state.procedures = action.payload;
            })
            .addCase(fetchPendingProcedures.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            // fetchProceduresByEmployee
            .addCase(fetchProceduresByEmployee.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProceduresByEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.procedures = action.payload;
            })
            .addCase(fetchProceduresByEmployee.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            // fetchProceduresByStatus
            .addCase(fetchProceduresByStatus.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProceduresByStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.procedures = action.payload;
            })
            .addCase(fetchProceduresByStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            // submitProcedure
            .addCase(submitProcedure.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(submitProcedure.fulfilled, (state) => { state.loading = false; })
            .addCase(submitProcedure.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            
            // updateProcedure
            .addCase(updateProcedure.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateProcedure.fulfilled, (state) => { state.loading = false; })
            .addCase(updateProcedure.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            
            // approveProcedure
            .addCase(approveProcedure.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(approveProcedure.fulfilled, (state) => { state.loading = false; })
            .addCase(approveProcedure.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            // rejectProcedure
            .addCase(rejectProcedure.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(rejectProcedure.fulfilled, (state) => { state.loading = false; })
            .addCase(rejectProcedure.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            // applyProcedure
            .addCase(applyProcedure.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(applyProcedure.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedProcedure = action.payload;
                // update in list as well
                const idx = state.procedures.findIndex(p => p.procedureId === action.payload.procedureId);
                if (idx !== -1) {
                    state.procedures[idx].status = action.payload.status;
                }
            })
            .addCase(applyProcedure.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            // deleteProcedure
            .addCase(deleteProcedure.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteProcedure.fulfilled, (state, action) => {
                state.loading = false;
                state.procedures = state.procedures.filter(p => p.procedureId !== action.payload);
            })
            .addCase(deleteProcedure.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export const { clearSelectedProcedure } = hrProcedureSlice.actions;

export const selectHRProcedures = (state: RootState) => state.hrProcedure.procedures;
export const selectHRProcedureSelected = (state: RootState) => state.hrProcedure.selectedProcedure;
export const selectHRProcedureLoading = (state: RootState) => state.hrProcedure.loading;
export const selectHRProcedureError = (state: RootState) => state.hrProcedure.error;

export default hrProcedureSlice.reducer;
