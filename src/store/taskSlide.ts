import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { apiErrorMessage } from "../utils/apiError";

export interface ITask {
    taskId: number;
    taskTitle: string;
    taskType: string;
    taskDescription: string | null;
    priority: string;
    status: string;
    dueDate: string | null;
    createdDate: string;
    assignedTo: number;
    assignedUsername: string | null;
    createdBy: number;
    completedDate: string | null;
    completionNotes: string | null;
}

export interface ICreateTaskDTO {
    taskTitle: string;
    taskType: string;
    taskDescription?: string;
    assignedTo: number;
    priority: string;
    dueDate?: string;
}

export interface IUpdateTaskDTO {
    taskTitle?: string;
    taskType?: string;
    taskDescription?: string;
    assignedTo?: number;
    priority?: string;
    dueDate?: string;
    completionNotes?: string;
}

interface ITaskState {
    tasks: ITask[];
    loading: boolean;
    error: string | null;
}

const initialState: ITaskState = {
    tasks: [],
    loading: false,
    error: null,
};

// GET: /api/Task
export const fetchAllTasks = createAsyncThunk(
    "task/fetchAllTasks",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Task",
                method: "GET",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

// GET: /api/Task/{id}
export const fetchTaskById = createAsyncThunk(
    "task/fetchTaskById",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Task/${id}`,
                method: "GET",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

// POST: /api/Task
export const createTask = createAsyncThunk(
    "task/createTask",
    async (data: ICreateTaskDTO, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Task",
                method: "POST",
                data,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

// PUT: /api/Task/{id}
export const updateTask = createAsyncThunk(
    "task/updateTask",
    async ({ id, data }: { id: number; data: IUpdateTaskDTO }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Task/${id}`,
                method: "PUT",
                data,
            });
            return { id, data, message: response.data };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

// PATCH: /api/Task/{id}/approve
export const approveTask = createAsyncThunk(
    "task/approveTask",
    async ({ id, comments }: { id: number; comments?: string }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Task/${id}/approve`,
                method: "PATCH",
                data: { comments },
            });
            return { id, message: response.data };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

// PATCH: /api/Task/{id}/reject
export const rejectTask = createAsyncThunk(
    "task/rejectTask",
    async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Task/${id}/reject`,
                method: "PATCH",
                data: { reason },
            });
            return { id, message: response.data };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

// DELETE: /api/Task/{id}
export const cancelTask = createAsyncThunk(
    "task/cancelTask",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Task/${id}`,
                method: "DELETE",
            });
            return { id, message: response.data };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const taskSlice = createSlice({
    name: "task",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All Tasks
            .addCase(fetchAllTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchAllTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Task
            .addCase(createTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks.unshift(action.payload);
            })
            .addCase(createTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Task
            .addCase(updateTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTask.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Approve Task
            .addCase(approveTask.fulfilled, (state, action) => {
                const task = state.tasks.find((t) => t.taskId === action.payload.id);
                if (task) {
                    task.status = "Approved";
                }
            })
            // Reject Task
            .addCase(rejectTask.fulfilled, (state, action) => {
                const task = state.tasks.find((t) => t.taskId === action.payload.id);
                if (task) {
                    task.status = "Rejected";
                }
            })
            // Cancel Task
            .addCase(cancelTask.fulfilled, (state, action) => {
                const task = state.tasks.find((t) => t.taskId === action.payload.id);
                if (task) {
                    task.status = "Cancelled";
                }
            });
    },
});

export const selectTasks = (state: RootState) => state.task.tasks;
export const selectTaskLoading = (state: RootState) => state.task.loading;
export const selectTaskError = (state: RootState) => state.task.error;

export default taskSlice.reducer;
