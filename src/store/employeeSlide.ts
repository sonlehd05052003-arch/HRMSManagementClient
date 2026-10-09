import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface IEmployeeList {
    employeeId: number;
    employeeCode: string;
    fullName: string;
    email: string;
    phone: string | null;
    gender: string | null;
    employmentStatus: string;
    departmentName: string;
    positionName: string;
    managerId: number | null;
    managerName: string | null;
    departmentId?: number;
    roleName?: string;
}

export interface IEmployeeDetail {
    employeeId: number;
    employeeCode: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    departmentId: number | null;
    departmentName: string | null;
    positionId: number | null;
    positionName: string | null;
    managerId: number | null;
    managerName: string | null;
    joinDate: string;
    resignationDate: string | null;
    employmentStatus: string;
    employmentType: string;
    baseSalary: number | null;
    insuranceSalary: number | null;
    numberOfDependents: number;
}

export interface IEmployeeApprovalAnalysis {
    employeeId: number;
    employeeCode: string;
    fullName: string;
    managerId: number | null;
    managerName: string | null;
    isTopLevel: boolean;
    targetApproverId: number | null;
    targetApproverName: string | null;
    approvalRouteType: string;
    isValid: boolean;
}

interface IEmployeeState {
    employees: IEmployeeList[];
    selectedEmployee: IEmployeeDetail | null;
    approvalAnalysis: IEmployeeApprovalAnalysis[];
    loading: boolean;
    error: string | null;
}

const initialState: IEmployeeState = {
    employees: [],
    selectedEmployee: null,
    approvalAnalysis: [],
    loading: false,
    error: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAllEmployees = createAsyncThunk(
    "employee/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({ url: "/Employee", method: "GET" });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const fetchActiveEmployees = createAsyncThunk(
    "employee/fetchActive",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({ url: "/Employee/active", method: "GET" });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const fetchEmployeeById = createAsyncThunk(
    "employee/fetchById",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({ url: `/Employee/${id}`, method: "GET" });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const createEmployee = createAsyncThunk(
    "employee/create",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await request({ url: "/Employee", method: "POST", data });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const updateEmployee = createAsyncThunk(
    "employee/update",
    async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
        try {
            const response = await request({ url: `/Employee/${id}`, method: "PUT", data });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const updateEmployeeStatus = createAsyncThunk(
    "employee/updateStatus",
    async ({ id, status, disabledBy }: { id: number; status: string; disabledBy?: number }, { rejectWithValue }) => {
        try {
            const params: any = { status };
            if (disabledBy !== undefined) params.disabledBy = disabledBy;
            await request({ url: `/Employee/${id}/status`, method: "PATCH", params });
            return { id, status };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const fetchApprovalAnalysis = createAsyncThunk(
    "employee/fetchApprovalAnalysis",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({ url: "/Employee/approval-analysis", method: "GET" });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

export const employeeSlice = createSlice({
    name: "employee",
    initialState,
    reducers: {
        clearSelectedEmployee(state) { state.selectedEmployee = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllEmployees.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload.map((e: any) => ({
                    ...e,
                    employeeId: e.employeeId || e.id
                }));
            })
            .addCase(fetchAllEmployees.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            .addCase(fetchActiveEmployees.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchActiveEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload.map((e: any) => ({
                    ...e,
                    employeeId: e.employeeId || e.id
                }));
            })
            .addCase(fetchActiveEmployees.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            .addCase(fetchEmployeeById.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchEmployeeById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedEmployee = {
                    ...action.payload,
                    employeeId: action.payload.employeeId || action.payload.id
                };
            })
            .addCase(fetchEmployeeById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            .addCase(createEmployee.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(createEmployee.fulfilled, (state) => { state.loading = false; })
            .addCase(createEmployee.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            .addCase(updateEmployee.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateEmployee.fulfilled, (state) => { state.loading = false; })
            .addCase(updateEmployee.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            .addCase(updateEmployeeStatus.fulfilled, (state, action) => {
                const emp = state.employees.find(e => e.employeeId === action.payload.id);
                if (emp) emp.employmentStatus = action.payload.status;
            })
            .addCase(fetchApprovalAnalysis.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchApprovalAnalysis.fulfilled, (state, action) => {
                state.loading = false;
                state.approvalAnalysis = action.payload;
            })
            .addCase(fetchApprovalAnalysis.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSelectedEmployee } = employeeSlice.actions;

export const selectEmployees = (state: RootState) => state.employee.employees;
export const selectSelectedEmployee = (state: RootState) => state.employee.selectedEmployee;
export const selectApprovalAnalysis = (state: RootState) => state.employee.approvalAnalysis;
export const selectEmployeeLoading = (state: RootState) => state.employee.loading;
export const selectEmployeeError = (state: RootState) => state.employee.error;

export default employeeSlice.reducer;
