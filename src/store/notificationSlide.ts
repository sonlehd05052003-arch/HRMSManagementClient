import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import { apiErrorMessage } from "../utils/apiError";
import type { RootState } from "./index";
import type { IPagedResult } from "./attendanceSlide";

export interface INotification {
    notificationId: number;
    /** "...Approval": the recipient has a request to review; "...Result": their own request was decided */
    notificationType: string;
    title: string;
    message: string;
    relatedEntity?: string | null;
    relatedEntityId?: number | null;
    isRead: boolean;
    sentDate: string;
}

interface INotificationState {
    items: INotification[];
    total: number;
    unreadCount: number;
    loading: boolean;
}

const initialState: INotificationState = {
    items: [],
    total: 0,
    unreadCount: 0,
    loading: false,
};

export const fetchNotifications = createAsyncThunk(
    "notification/fetch",
    async (params: { page: number; pageSize: number; unreadOnly?: boolean }, { rejectWithValue }) => {
        try {
            const response = await request({ url: "/Notification", method: "GET", params });
            return response.data as IPagedResult<INotification>;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Không tải được thông báo"));
        }
    }
);

export const fetchUnreadCount = createAsyncThunk("notification/unreadCount", async (_, { rejectWithValue }) => {
    try {
        const response = await request({ url: "/Notification/unread-count", method: "GET" });
        return (response.data as { count: number }).count;
    } catch (error) {
        return rejectWithValue(apiErrorMessage(error, "Không tải được số thông báo"));
    }
});

export const markNotificationRead = createAsyncThunk("notification/markRead", async (id: number, { rejectWithValue }) => {
    try {
        await request({ url: `/Notification/${id}/read`, method: "PUT" });
        return id;
    } catch (error) {
        return rejectWithValue(apiErrorMessage(error, "Không cập nhật được thông báo"));
    }
});

export const markAllNotificationsRead = createAsyncThunk("notification/markAllRead", async (_, { rejectWithValue }) => {
    try {
        await request({ url: "/Notification/read-all", method: "PUT" });
    } catch (error) {
        return rejectWithValue(apiErrorMessage(error, "Không cập nhật được thông báo"));
    }
});

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            .addCase(fetchNotifications.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const item = state.items.find(n => n.notificationId === action.payload);
                if (item && !item.isRead) {
                    item.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markAllNotificationsRead.fulfilled, (state) => {
                state.items.forEach(n => { n.isRead = true; });
                state.unreadCount = 0;
            });
    },
});

export const selectNotifications = (state: RootState) => state.notification.items;
export const selectNotificationsTotal = (state: RootState) => state.notification.total;
export const selectUnreadNotificationCount = (state: RootState) => state.notification.unreadCount;
export const selectNotificationsLoading = (state: RootState) => state.notification.loading;

export default notificationSlice.reducer;
