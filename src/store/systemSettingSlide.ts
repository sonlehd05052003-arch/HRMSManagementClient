import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import { apiErrorMessage } from "../utils/apiError";

interface LocationSettings {
    officeLatitude: number;
    officeLongitude: number;
    attendanceAllowedRadius: number;
    checkInMethod: string;
    allowedIpAddresses: string | null;
}

interface ApprovalSettings {
    topLevelFallbackUserId: number | null;
    defaultFallbackUserId: number | null;
}

interface PayrollSettings {
    payrollCutOffDay: number;
    defaultReviewWindowDays: number;
}

interface CompanySettings {
    companyName: string;
    address: string;
    phone: string;
    email: string;
}

export interface PayrollCalculationSettings {
    bhxhRate: number;            // % BHXH NLĐ đóng, mặc định 8
    bhytRate: number;            // % BHYT NLĐ đóng, mặc định 1.5
    bhtnRate: number;            // % BHTN NLĐ đóng, mặc định 1
    insuranceCap: number;        // Mức trần BH, mặc định 46,800,000
    insuranceBaseMode: string;   // "Gross" | "Fixed"
    insuranceFixedBase: number;  // Mức cố định (khi mode = "Fixed")
    personalDeduction: number;   // Giảm trừ bản thân, mặc định 11,000,000
    dependentDeduction: number;  // Giảm trừ mỗi NPT, mặc định 4,400,000
    otWeekdayMultiplier: number; // Hệ số OT ngày thường, mặc định 1.5
    otWeekendMultiplier: number; // Hệ số OT cuối tuần (T7+CN), mặc định 2.0
    otHolidayMultiplier: number; // Hệ số OT ngày lễ/Tết, mặc định 3.0
}

interface SystemSettingState {
    locationSettings: LocationSettings | null;
    approvalSettings: ApprovalSettings | null;
    payrollSettings: PayrollSettings | null;
    companySettings: CompanySettings | null;
    payrollCalcSettings: PayrollCalculationSettings | null;
    loading: boolean;
    error: string | null;
}

const initialState: SystemSettingState = {
    locationSettings: null,
    approvalSettings: null,
    payrollSettings: null,
    companySettings: null,
    payrollCalcSettings: null,
    loading: false,
    error: null,
};

export const fetchLocationSettings = createAsyncThunk(
    "systemSetting/fetchLocationSettings",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/SystemSettings/location",
                method: "GET"
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi lấy cấu hình vị trí"));
        }
    }
);

export const updateLocationSettings = createAsyncThunk(
    "systemSetting/updateLocationSettings",
    async (dto: LocationSettings, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/SystemSettings/location",
                method: "PUT",
                data: dto
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi cập nhật cấu hình vị trí"));
        }
    }
);

export const fetchApprovalSettings = createAsyncThunk(
    "systemSetting/fetchApprovalSettings",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/SystemSettings/approval",
                method: "GET"
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi lấy cấu hình phê duyệt"));
        }
    }
);

export const fetchPayrollSettings = createAsyncThunk(
    "systemSetting/fetchPayrollSettings",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/SystemSettings/payroll",
                method: "GET"
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi lấy cấu hình kỳ lương"));
        }
    }
);

export const updatePayrollSettings = createAsyncThunk(
    "systemSetting/updatePayrollSettings",
    async (dto: PayrollSettings, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/SystemSettings/payroll",
                method: "PUT",
                data: dto
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi cập nhật cấu hình kỳ lương"));
        }
    }
);

export const fetchCompanySettings = createAsyncThunk(
    "systemSetting/fetchCompanySettings",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({ url: "/SystemSettings/company", method: "GET" });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi lấy thông tin công ty"));
        }
    }
);

export const updateCompanySettings = createAsyncThunk(
    "systemSetting/updateCompanySettings",
    async (dto: CompanySettings, { rejectWithValue }) => {
        try {
            const response = await request({ url: "/SystemSettings/company", method: "PUT", data: dto });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi cập nhật thông tin công ty"));
        }
    }
);

export const fetchPayrollCalcSettings = createAsyncThunk(
    "systemSetting/fetchPayrollCalcSettings",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({ url: "/SystemSettings/payroll-calculation", method: "GET" });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi lấy cấu hình tính lương"));
        }
    }
);

export const updatePayrollCalcSettings = createAsyncThunk(
    "systemSetting/updatePayrollCalcSettings",
    async (dto: PayrollCalculationSettings, { rejectWithValue }) => {
        try {
            const response = await request({ url: "/SystemSettings/payroll-calculation", method: "PUT", data: dto });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi cập nhật cấu hình tính lương"));
        }
    }
);

export const updateApprovalSettings = createAsyncThunk(
    "systemSetting/updateApprovalSettings",
    async (dto: ApprovalSettings, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/SystemSettings/approval",
                method: "PUT",
                data: dto
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi cập nhật cấu hình phê duyệt"));
        }
    }
);

const systemSettingSlice = createSlice({
    name: "systemSetting",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocationSettings.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchLocationSettings.fulfilled, (state, action) => { state.loading = false; state.locationSettings = action.payload; })
            .addCase(fetchLocationSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(updateLocationSettings.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateLocationSettings.fulfilled, (state) => { state.loading = false; })
            .addCase(updateLocationSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(fetchApprovalSettings.pending, (state) => { state.loading = true; })
            .addCase(fetchApprovalSettings.fulfilled, (state, action) => { state.loading = false; state.approvalSettings = action.payload; })
            .addCase(fetchApprovalSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(updateApprovalSettings.pending, (state) => { state.loading = true; })
            .addCase(updateApprovalSettings.fulfilled, (state) => { state.loading = false; })
            .addCase(updateApprovalSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(fetchPayrollSettings.pending, (state) => { state.loading = true; })
            .addCase(fetchPayrollSettings.fulfilled, (state, action) => { state.loading = false; state.payrollSettings = action.payload; })
            .addCase(fetchPayrollSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(updatePayrollSettings.pending, (state) => { state.loading = true; })
            .addCase(updatePayrollSettings.fulfilled, (state) => { state.loading = false; })
            .addCase(updatePayrollSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(fetchCompanySettings.pending, (state) => { state.loading = true; })
            .addCase(fetchCompanySettings.fulfilled, (state, action) => { state.loading = false; state.companySettings = action.payload; })
            .addCase(fetchCompanySettings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(updateCompanySettings.pending, (state) => { state.loading = true; })
            .addCase(updateCompanySettings.fulfilled, (state) => { state.loading = false; })
            .addCase(updateCompanySettings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(fetchPayrollCalcSettings.pending, (state) => { state.loading = true; })
            .addCase(fetchPayrollCalcSettings.fulfilled, (state, action) => { state.loading = false; state.payrollCalcSettings = action.payload; })
            .addCase(fetchPayrollCalcSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(updatePayrollCalcSettings.pending, (state) => { state.loading = true; })
            .addCase(updatePayrollCalcSettings.fulfilled, (state) => { state.loading = false; })
            .addCase(updatePayrollCalcSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export const selectLocationSettings = (state: any) => state.systemSetting.locationSettings;
export const selectApprovalSettings = (state: any) => state.systemSetting.approvalSettings;
export const selectPayrollSettings = (state: any) => state.systemSetting.payrollSettings;
export const selectCompanySettings = (state: any) => state.systemSetting.companySettings;
export const selectPayrollCalcSettings = (state: any) => state.systemSetting.payrollCalcSettings;
export const selectSystemSettingLoading = (state: any) => state.systemSetting.loading;

export default systemSettingSlice.reducer;
