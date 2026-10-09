import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IDepartmentList {
    departmentId: number;
    departmentCode: string;
    departmentName: string;
    managerName: string | null;
    employeeCount: number;
    isActive: boolean;
}

export interface IDepartmentEmployee {
    employeeId: number;
    employeeCode: string;
    fullName: string;
    positionName: string | null;
    email: string;
    phone: string | null;
    employmentStatus: string;
    gender: string | null;
}

export interface IDepartmentResponse {
    departmentId: number;
    departmentCode: string;
    departmentName: string;
    description: string | null;
    managerId: number | null;
    managerName: string | null;
    isActive: boolean;
    employeeCount: number;
    employees: IDepartmentEmployee[];
    createdDate: string;
    createdBy: number | null;
    createdByName: string | null;
    modifiedDate: string | null;
    modifiedBy: number | null;
    modifiedByName: string | null;
}

interface IDepartmentState {
    departments: IDepartmentList[];
    activeDepartments: IDepartmentList[];
    selectedDepartment: IDepartmentResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: IDepartmentState = {
    departments: [],
    activeDepartments: [],
    selectedDepartment: null,
    loading: false,
    error: null,
};

export const fetchAllDepartments = createAsyncThunk(
    "department/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Department",
                method: "GET",
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const fetchActiveDepartments = createAsyncThunk(
    "department/fetchActive",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Department/active",
                method: "GET",
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const fetchDepartmentById = createAsyncThunk(
    "department/fetchById",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Department/${id}`,
                method: "GET",
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const createDepartment = createAsyncThunk(
    "department/create",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Department",
                method: "POST",
                data,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const updateDepartment = createAsyncThunk(
    "department/update",
    async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Department/${id}`,
                method: "PUT",
                data,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const deactivateDepartment = createAsyncThunk(
    "department/deactivate",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Department/${id}/deactivate`,
                method: "PATCH",
            });
            return { id, message: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const activateDepartment = createAsyncThunk(
    "department/activate",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Department/${id}/activate`,
                method: "PATCH",
            });
            return { id, message: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const departmentSlice = createSlice({
    name: "department",
    initialState,
    reducers: {
        clearSelectedDepartment(state) {
            state.selectedDepartment = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllDepartments.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllDepartments.fulfilled, (state, action) => {
                state.loading = false;
                state.departments = action.payload;
            })
            .addCase(fetchAllDepartments.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            
            .addCase(fetchActiveDepartments.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchActiveDepartments.fulfilled, (state, action) => {
                state.loading = false;
                state.activeDepartments = action.payload;
            })
            .addCase(fetchActiveDepartments.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(fetchDepartmentById.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchDepartmentById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDepartment = action.payload;
            })
            .addCase(fetchDepartmentById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(createDepartment.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(createDepartment.fulfilled, (state) => { state.loading = false; })
            .addCase(createDepartment.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(updateDepartment.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateDepartment.fulfilled, (state) => { state.loading = false; })
            .addCase(updateDepartment.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(deactivateDepartment.fulfilled, (state, action) => {
                const dept = state.departments.find(d => d.departmentId === action.payload.id);
                if (dept) dept.isActive = false;
                if (state.selectedDepartment && state.selectedDepartment.departmentId === action.payload.id) {
                    state.selectedDepartment.isActive = false;
                }
            })
            .addCase(activateDepartment.fulfilled, (state, action) => {
                const dept = state.departments.find(d => d.departmentId === action.payload.id);
                if (dept) dept.isActive = true;
                if (state.selectedDepartment && state.selectedDepartment.departmentId === action.payload.id) {
                    state.selectedDepartment.isActive = true;
                }
            });
    },
});

export const { clearSelectedDepartment } = departmentSlice.actions;

export const selectDepartments = (state: RootState) => state.department.departments;
export const selectActiveDepartments = (state: RootState) => state.department.activeDepartments;
export const selectSelectedDepartment = (state: RootState) => state.department.selectedDepartment;
export const selectDepartmentLoading = (state: RootState) => state.department.loading;
export const selectDepartmentError = (state: RootState) => state.department.error;

export default departmentSlice.reducer;
