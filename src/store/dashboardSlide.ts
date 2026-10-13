import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { apiErrorMessage } from "../utils/apiError";

export interface IDashboardStats {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalEmployees: number;
    totalDepartments: number;
    totalLeaveRequests: number;
    pendingApprovals: number;
    attendanceRate: number;
    overtimeHours: number;
    systemUptime: string;
}

export interface IRecentActivity {
    description: string;
    timestamp: string;
}

export interface INotification {
    message: string;
    level: string;
}

export interface IScheduledTask {
    name: string;
    status: string;
}

export interface IUpcomingEvent {
    employeeId: number;
    employeeName: string;
    date: string;
    detail: string | null;
}

export interface IHrDashboardData {
    statistics: {
        totalHeadcount: number;
        newHires: number;
        terminations: number;
        overallAttendanceRate: number;
        averageLeaveDays: number;
        pendingLeaveRequests: number;
    };
    upcomingProbationEnds: IUpcomingEvent[];
    contractRenewals: IUpcomingEvent[];
    birthdays: IUpcomingEvent[];
    recentHrActivities: IRecentActivity[];
}

export interface IManagerDashboardData {
    statistics: {
        teamSize: number;
        presentToday: number;
        onLeaveToday: number;
        teamAttendanceRate: number;
    };
    pendingLeaveRequests: {
        requestId: number;
        employeeName: string;
        leaveType: string;
        days: number;
    }[];
    upcomingTeamLeaves: {
        employeeName: string;
        leaveType: string;
        dateRange: string;
    }[];
    taskPerformance: {
        activeTasks: number;
        overdueTasks: number;
        completionRate: number;
    };
    actionSummary: {
        pendingLeaveApprovals: number;
        pendingOvertimeApprovals: number;
        pendingAttendanceCorrections: number;
        totalPendingApprovals: number;
    };
    teamInsights: { label: string; value: string }[];
    recentTeamActivities: IRecentActivity[];
    teamMilestones: IUpcomingEvent[];
}

export interface IDashboardData {
    statistics: IDashboardStats;
    recentActivities: IRecentActivity[];
    alerts: INotification[];
    scheduledTasks: IScheduledTask[];
}

interface IDashboardState {
    data: IDashboardData | null;
    hrData: IHrDashboardData | null;
    managerData: IManagerDashboardData | null;
    loading: boolean;
    error: string | null;
}

const initialState: IDashboardState = {
    data: null,
    hrData: null,
    managerData: null,
    loading: false,
    error: null,
};

export const fetchAdminDashboardData = createAsyncThunk(
    "dashboard/fetchAdminData",
    async (params: { fromDate?: string; toDate?: string } | undefined, { rejectWithValue }) => {
        try {
            const response = await request({ 
                url: "/Dashboard/admin-stats", 
                method: "GET", 
                params 
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Failed to fetch dashboard data"));
        }
    }
);

export const fetchHrDashboardData = createAsyncThunk(
    "dashboard/fetchHrData",
    async (params: { fromDate?: string; toDate?: string } | undefined, { rejectWithValue }) => {
        try {
            const response = await request({ 
                url: "/Dashboard/hr-stats", 
                method: "GET", 
                params 
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Failed to fetch HR dashboard data"));
        }
    }
);

export const fetchManagerDashboardData = createAsyncThunk(
    "dashboard/fetchManagerData",
    async (params: { fromDate?: string; toDate?: string } | undefined, { rejectWithValue }) => {
        try {
            const response = await request({ 
                url: "/Dashboard/manager-stats", 
                method: "GET", 
                params 
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Failed to fetch Manager dashboard data"));
        }
    }
);

export const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAdminDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchHrDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHrDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.hrData = action.payload;
            })
            .addCase(fetchHrDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchManagerDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchManagerDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.managerData = action.payload;
            })
            .addCase(fetchManagerDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const selectDashboardData = (state: RootState) => state.dashboard.data;
export const selectHrDashboardData = (state: RootState) => state.dashboard.hrData;
export const selectManagerDashboardData = (state: RootState) => state.dashboard.managerData;
export const selectDashboardLoading = (state: RootState) => state.dashboard.loading;

export default dashboardSlice.reducer;
