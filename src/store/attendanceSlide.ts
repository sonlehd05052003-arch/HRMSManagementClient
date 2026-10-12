import { createAsyncThunk, createSlice, isPending, isRejected, type PayloadAction } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { apiErrorMessage } from "../utils/apiError";

// ── DTO Interfaces ───────────────────────────────────────────────────────────────

export interface CheckInRequestDto {
    location?: string;
    deviceInfo?: string;
    ipAddress?: string;
    latitude?: number;
    longitude?: number;
    remarks?: string;
    faceImageBase64?: string;
}

export interface CheckOutRequestDto {
    location?: string;
    deviceInfo?: string;
    ipAddress?: string;
    latitude?: number;
    longitude?: number;
    remarks?: string;
    faceImageBase64?: string;
}

export interface AttendanceResponseDto {
    attendanceId: number;
    employeeId: number;
    employeeName: string;
    attendanceDate: string; 
    shiftId?: number;
    shiftName?: string;
    checkInTime?: string; 
    checkOutTime?: string; 
    workingHours?: number; 
    overtimeHours?: number; 
    actualOvertimeHours?: number;
    approvedOvertimeHours?: number;
    payrollOvertimeHours?: number;
    lateMinutes?: number;
    earlyLeaveMinutes?: number;
    status: string;
    source?: string;
    isManualAdjusted?: boolean;
    isLocked?: boolean;
    location?: string;
    remarks?: string;
    explanationMessage?: string;
    explanationStatus?: string;
    explanationResponse?: string;
    explanationType?: string;
    explanationLeaveTypeId?: number;
    explanationLeaveTypeName?: string;
    explanationRequestedCheckInTime?: string;
    explanationRequestedCheckOutTime?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
    shiftIsOvernight?: boolean;
    allowedCheckInFrom?: string;
    allowedCheckInTo?: string;
    allowedCheckOutFrom?: string;
    allowedCheckOutTo?: string;
}

export interface AttendanceLogResponseDto {
    logId: number;
    employeeId: number;
    shiftId?: number;
    logTime: string; 
    logType: string;
    source: string;
    deviceInfo?: string;
    ipAddress?: string;
    location?: string;
    remarks?: string;
}

export interface AttendanceDetailResponseDto {
    attendance: AttendanceResponseDto;
    logs: AttendanceLogResponseDto[];
}

export interface ManualAdjustAttendanceDto {
    checkInTime?: string;
    checkOutTime?: string;
    status: string;
    source?: string;
    remarks?: string;
}

export interface ManualCreateAttendanceDto {
    employeeId: number;
    attendanceDate: string;
    shiftId?: number;
    checkInTime?: string;
    checkOutTime?: string;
    status: string;
    source?: string;
    remarks?: string;
}

/** One page of a server-side paged list (GET /Attendance/search-page). */
export interface IPagedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface IAttendanceSearchParams {
    fromDate?: string;
    toDate?: string;
    employeeId?: number;
    status?: string;
    explanationStatus?: string;
    page?: number;
    pageSize?: number;
}

interface IAttendanceState {
    /** The page of the attendance table currently shown, and how many rows match in total */
    records: AttendanceResponseDto[];
    recordsTotal: number;
    /** Explanations waiting for review: their own list, so the two tabs do not overwrite each other */
    pendingExplanations: AttendanceResponseDto[];
    pendingExplanationsTotal: number;
    selectedDetail: AttendanceDetailResponseDto | null;
    logs: AttendanceLogResponseDto[];
    myToday: AttendanceDetailResponseDto | null;
    myHistory: AttendanceResponseDto[];
    
    // UI states
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: IAttendanceState = {
    records: [],
    recordsTotal: 0,
    pendingExplanations: [],
    pendingExplanationsTotal: 0,
    selectedDetail: null,
    logs: [],
    myToday: null,
    myHistory: [],
    loading: false,
    error: null,
    successMessage: null,
};

// ── Thunks: Employee ───────────────────────────────────────────────────────────────────

export const checkIn = createAsyncThunk(
    "attendance/checkIn",
    async (dto: CheckInRequestDto, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Attendance/checkin",
                method: "POST",
                data: dto
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi check-in"));
        }
    }
);

export const checkOut = createAsyncThunk(
    "attendance/checkOut",
    async (dto: CheckOutRequestDto, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Attendance/checkout",
                method: "POST",
                data: dto
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi check-out"));
        }
    }
);

export const fetchMyToday = createAsyncThunk(
    "attendance/fetchMyToday",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Attendance/my-today",
                method: "GET"
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi lấy dữ liệu chấm công hôm nay"));
        }
    }
);

export const checkFaceRegistration = createAsyncThunk(
    "attendance/checkFaceRegistration",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Face/check-registration",
                method: "GET"
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi kiểm tra trạng thái đăng ký"));
        }
    }
);

export const registerFace = createAsyncThunk(
    "attendance/registerFace",
    async (dto: { referenceImageBase64: string }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Face/register",
                method: "POST",
                data: dto
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi đăng ký khuôn mặt"));
        }
    }
);

export const fetchMyHistory = createAsyncThunk(
    "attendance/fetchMyHistory",
    async (params: { fromDate?: string; toDate?: string }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Attendance/my-history",
                method: "GET",
                params
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi lấy lịch sử chấm công"));
        }
    }
);

export const addLocationReason = createAsyncThunk(
    "attendance/addLocationReason",
    async ({ attendanceId, reason }: { attendanceId: number; reason: string }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Attendance/${attendanceId}/location-reason`,
                method: "PUT",
                data: { reason }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi cập nhật lý do vị trí"));
        }
    }
);

export const submitExplanation = createAsyncThunk(
    "attendance/submitExplanation",
    async (
        {
            attendanceId,
            message,
            explanationType,
            leaveTypeId,
            requestedCheckInTime,
            requestedCheckOutTime,
        }: {
            attendanceId: number;
            message: string;
            explanationType?: "Regularization" | "LeaveRequest";
            leaveTypeId?: number;
            requestedCheckInTime?: string;
            requestedCheckOutTime?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await request({
                url: `/Attendance/${attendanceId}/submit-explanation`,
                method: "POST",
                data: { message, explanationType, leaveTypeId, requestedCheckInTime, requestedCheckOutTime }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi gửi giải trình"));
        }
    }
);

export const submitAbsentExplanation = createAsyncThunk(
    "attendance/submitAbsentExplanation",
    async (
        {
            attendanceDate,
            message,
            explanationType,
            leaveTypeId,
            requestedCheckInTime,
            requestedCheckOutTime,
        }: {
            attendanceDate: string;
            message: string;
            explanationType?: "Regularization" | "LeaveRequest";
            leaveTypeId?: number;
            requestedCheckInTime?: string;
            requestedCheckOutTime?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await request({
                url: `/Attendance/submit-absent-explanation`,
                method: "POST",
                data: { date: attendanceDate, message, explanationType, leaveTypeId, requestedCheckInTime, requestedCheckOutTime }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi gửi giải trình vắng mặt"));
        }
    }
);

export const approveExplanation = createAsyncThunk(
    "attendance/approveExplanation",
    async ({ attendanceId, isApproved, responseMessage, manualCheckInTime, manualCheckOutTime }: { attendanceId: number; isApproved: boolean; responseMessage?: string; manualCheckInTime?: string; manualCheckOutTime?: string; }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Attendance/${attendanceId}/approve-explanation`,
                method: "PUT",
                data: { isApproved, response: responseMessage, manualCheckInTime, manualCheckOutTime }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi duyệt giải trình"));
        }
    }
);

// ── Thunks: Management ───────────────────────────────────────────────────────────────────

export const fetchAttendanceByDate = createAsyncThunk(
    "attendance/fetchByDate",
    async (date: string, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Attendance",
                method: "GET",
                params: { date }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi lấy dữ liệu"));
        }
    }
);

// The server returns one page; a manager only gets their direct reports
export const searchAttendance = createAsyncThunk(
    "attendance/search",
    async (params: IAttendanceSearchParams, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Attendance/search-page",
                method: "GET",
                params
            });
            return response.data as IPagedResult<AttendanceResponseDto>;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi tìm kiếm chấm công"));
        }
    }
);

export const fetchPendingExplanations = createAsyncThunk(
    "attendance/fetchPendingExplanations",
    async (params: { fromDate: string; toDate: string; page: number; pageSize: number }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Attendance/search-page",
                method: "GET",
                params: { ...params, explanationStatus: "Pending" }
            });
            return response.data as IPagedResult<AttendanceResponseDto>;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi tải phiếu giải trình"));
        }
    }
);

export const fetchAttendanceDetail = createAsyncThunk(
    "attendance/fetchDetail",
    async ({ employeeId, date }: { employeeId: number; date: string }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Attendance/${employeeId}/${date}`,
                method: "GET"
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi lấy chi tiết chấm công"));
        }
    }
);

export const manualAdjustAttendance = createAsyncThunk(
    "attendance/manualAdjust",
    async ({ attendanceId, dto }: { attendanceId: number; dto: ManualAdjustAttendanceDto }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Attendance/manual-adjust/${attendanceId}`,
                method: "PUT",
                data: dto
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi điều chỉnh chấm công"));
        }
    }
);

export const manualCreateAttendance = createAsyncThunk(
    "attendance/manualCreate",
    async (dto: ManualCreateAttendanceDto, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Attendance/manual-create",
                method: "POST",
                data: dto
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi tạo chấm công"));
        }
    }
);

export const lockAttendance = createAsyncThunk(
    "attendance/lock",
    async (attendanceId: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Attendance/${attendanceId}/lock`,
                method: "PUT"
            });
            return { attendanceId, message: response.data.message };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi khóa chấm công"));
        }
    }
);

export const unlockAttendance = createAsyncThunk(
    "attendance/unlock",
    async (attendanceId: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Attendance/${attendanceId}/unlock`,
                method: "PUT"
            });
            return { attendanceId, message: response.data.message };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi mở khóa chấm công"));
        }
    }
);

export const fetchAttendanceLogs = createAsyncThunk(
    "attendance/fetchLogs",
    async (params: { employeeId: number; date: string }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Attendance/logs",
                method: "GET",
                params
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Lỗi lấy lịch sử check-in"));
        }
    }
);


// ── Slice ─────────────────────────────────────────────────────────────────────

export const attendanceSlice = createSlice({
    name: "attendance",
    initialState,
    reducers: {
        clearMessages(state) {
            state.error = null;
            state.successMessage = null;
        },
        clearDetail(state) {
            state.selectedDetail = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // View All / Search
            .addCase(searchAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload.items;
                state.recordsTotal = action.payload.total;
            })
            .addCase(fetchPendingExplanations.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingExplanations = action.payload.items;
                state.pendingExplanationsTotal = action.payload.total;
            })
            .addCase(fetchAttendanceByDate.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload;
            })
            
            // Detail
            .addCase(fetchAttendanceDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDetail = action.payload;
            })
            
            // My actions
            .addCase(fetchMyToday.fulfilled, (state, action) => {
                state.loading = false;
                state.myToday = action.payload;
            })
            .addCase(fetchMyHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.myHistory = action.payload;
            })
            
            // Adjustments -> Refresh record in list
            .addCase(manualAdjustAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = "Điều chỉnh chấm công thành công";
                const index = state.records.findIndex(r => r.attendanceId === action.payload.attendanceId);
                if (index !== -1) {
                    state.records[index] = action.payload;
                }
                if (state.selectedDetail && state.selectedDetail.attendance.attendanceId === action.payload.attendanceId) {
                    state.selectedDetail.attendance = action.payload;
                }
            })
            .addCase(manualCreateAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = "Tạo chấm công thành công";
                state.records.unshift(action.payload);
                state.recordsTotal += 1;
            })
            
            // Lock/Unlock
            .addCase(lockAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                const record = state.records.find(r => r.attendanceId === action.payload.attendanceId);
                if (record) record.isLocked = true;
                if (state.selectedDetail && state.selectedDetail.attendance.attendanceId === action.payload.attendanceId) {
                    state.selectedDetail.attendance.isLocked = true;
                }
            })
            .addCase(unlockAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                const record = state.records.find(r => r.attendanceId === action.payload.attendanceId);
                if (record) record.isLocked = false;
                if (state.selectedDetail && state.selectedDetail.attendance.attendanceId === action.payload.attendanceId) {
                    state.selectedDetail.attendance.isLocked = false;
                }
            })
            
            // Explanations
            .addCase(submitExplanation.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                const updatedRecord = action.payload.data;
                const index = state.myHistory.findIndex(r => r.attendanceId === updatedRecord.attendanceId);
                if (index !== -1) {
                    state.myHistory[index] = updatedRecord;
                }
                if (state.myToday && state.myToday.attendance?.attendanceId === updatedRecord.attendanceId) {
                    state.myToday.attendance = updatedRecord;
                }
            })
            .addCase(submitAbsentExplanation.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                const updatedRecord = action.payload.data;
                const index = state.myHistory.findIndex(r => r.attendanceDate === updatedRecord.attendanceDate);
                if (index !== -1) {
                    state.myHistory[index] = updatedRecord;
                }
            })
            .addCase(approveExplanation.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                const updatedRecord = action.payload.data;
                const index = state.records.findIndex(r => r.attendanceId === updatedRecord.attendanceId);
                if (index !== -1) {
                    state.records[index] = updatedRecord;
                }
                // Reviewed: no longer waiting
                const pendingIndex = state.pendingExplanations.findIndex(r => r.attendanceId === updatedRecord.attendanceId);
                if (pendingIndex !== -1) {
                    state.pendingExplanations.splice(pendingIndex, 1);
                    state.pendingExplanationsTotal = Math.max(0, state.pendingExplanationsTotal - 1);
                }
            })
            
            // Logs
            .addCase(fetchAttendanceLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.logs = action.payload;
            })
            

            // Common State matchers (only handles the common async actions, specific thunks have logic above)
            .addMatcher(isPending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addMatcher(isRejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addMatcher(
                (action) => action.type.endsWith('/fulfilled') && 
                            // Exclude those that are specifically handled to prevent double overriding loading/msg unnecessarily
                            !action.type.includes('manualAdjust') &&
                            !action.type.includes('manualCreate') && 
                            !action.type.includes('lock') &&
                            !action.type.includes('unlock'),
                (state, action: PayloadAction<any>) => {
                    state.loading = false;
                    // For checkin/checkout success
                    if (action.type.includes("checkIn") || action.type.includes("checkOut")) {
                        state.successMessage = "Thành công!";
                        state.myToday = {
                            ...state.myToday,
                            attendance: action.payload as AttendanceResponseDto,
                            logs: state.myToday?.logs || [] // In real scenario, would re-fetch myToday
                        };
                    }
                }
            );
    },
});

export const { clearMessages, clearDetail } = attendanceSlice.actions;

export const selectRecords = (state: RootState) => state.attendance.records;
export const selectSelectedDetail = (state: RootState) => state.attendance.selectedDetail;
export const selectLogs = (state: RootState) => state.attendance.logs;
export const selectMyToday = (state: RootState) => state.attendance.myToday;
export const selectMyHistory = (state: RootState) => state.attendance.myHistory;
export const selectAttendanceLoading = (state: RootState) => state.attendance.loading;
export const selectAttendanceError = (state: RootState) => state.attendance.error;
export const selectAttendanceSuccess = (state: RootState) => state.attendance.successMessage;

export const selectAdminAttendance = (state: RootState) => state.attendance.records; 
export const selectAdminAttendanceTotal = (state: RootState) => state.attendance.recordsTotal;
export const selectPendingExplanations = (state: RootState) => state.attendance.pendingExplanations;
export const selectPendingExplanationsTotal = (state: RootState) => state.attendance.pendingExplanationsTotal;
export const fetchAdminAttendance = searchAttendance;

export default attendanceSlice.reducer;
