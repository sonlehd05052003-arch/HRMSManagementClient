import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { apiErrorMessage } from "../utils/apiError";

// ── DTOs ────────────────────────────────────────────────────────────────────

export interface EmployeeFaceStatusDto {
    employeeId: number;
    employeeCode: string;
    fullName: string;
    email: string;
    departmentName?: string;
    positionName?: string;
    isRegistered: boolean;
    registeredAt?: string;
    lastUpdatedAt?: string;
}

interface IFaceState {
    employeesFaceStatus: EmployeeFaceStatusDto[];
    loading: boolean;
    error: string | null;
}

const initialState: IFaceState = {
    employeesFaceStatus: [],
    loading: false,
    error: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAllEmployeesFaceStatus = createAsyncThunk(
    "face/fetchAllEmployeesFaceStatus",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Face/admin/employees",
                method: "GET"
            });
            return response.data as EmployeeFaceStatusDto[];
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi tải danh sách"));
        }
    }
);

export const adminRegisterFace = createAsyncThunk(
    "face/adminRegisterFace",
    async (dto: { employeeId: number; referenceImageBase64: string }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Face/admin/register/${dto.employeeId}`,
                method: "POST",
                data: { referenceImageBase64: dto.referenceImageBase64 }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi đăng ký khuôn mặt"));
        }
    }
);

export const adminDeleteFace = createAsyncThunk(
    "face/adminDeleteFace",
    async (employeeId: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Face/admin/${employeeId}`,
                method: "DELETE"
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi xóa hồ sơ khuôn mặt"));
        }
    }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const faceSlice = createSlice({
    name: "face",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllEmployeesFaceStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllEmployeesFaceStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.employeesFaceStatus = action.payload;
            })
            .addCase(fetchAllEmployeesFaceStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(adminRegisterFace.pending, (state) => { state.loading = true; })
            .addCase(adminRegisterFace.fulfilled, (state) => { state.loading = false; })
            .addCase(adminRegisterFace.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(adminDeleteFace.pending, (state) => { state.loading = true; })
            .addCase(adminDeleteFace.fulfilled, (state) => { state.loading = false; })
            .addCase(adminDeleteFace.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const selectEmployeesFaceStatus = (state: RootState) => state.face.employeesFaceStatus;
export const selectFaceLoading = (state: RootState) => state.face.loading;

export default faceSlice.reducer;
