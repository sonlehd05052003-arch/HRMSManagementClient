import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { companyScopeHeader } from "./companySlide";
import { apiErrorMessage } from "../utils/apiError";

export interface IUser {
    userId: number;
    username: string;
    email: string;
    employeeId: number | null;
    isActive: boolean;
    roles: string[];
}

/** An employee an account can be linked to. */
export interface IUserEmployeeOption {
    employeeId: number;
    employeeCode: string;
    fullName: string;
    email: string;
}

interface IUserState {
    users: IUser[];
    employeeOptions: IUserEmployeeOption[];
    loading: boolean;
    error: string | null;
}

const initialState: IUserState = {
    users: [],
    employeeOptions: [],
    loading: false,
    error: null,
};

// GET: /api/User/employee-options
export const fetchEmployeeOptions = createAsyncThunk(
    "user/fetchEmployeeOptions",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: "/User/employee-options",
                method: "GET",
                headers: {
                    ...companyScopeHeader(state),
                },
            });
            return response.data as IUserEmployeeOption[];
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

// GET: /api/User
export const fetchAllUsers = createAsyncThunk(
    "user/fetchAllUsers",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: "/User",
                method: "GET",
                headers: {
                    ...companyScopeHeader(state),
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

// POST: /api/User
export const createUser = createAsyncThunk(
    "user/createUser",
    async (data: any, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: "/User",
                method: "POST",
                data,
                headers: {
                    ...companyScopeHeader(state),
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

// PUT: /api/User/{id}
export const updateUser = createAsyncThunk(
    "user/updateUser",
    async ({ id, data }: { id: number; data: any }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: `/User/${id}`,
                method: "PUT",
                data,
                headers: {
                    ...companyScopeHeader(state),
                },
            });
            return { id, data, message: response.data };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

// PATCH: /api/User/{id}/activate
export const activateUser = createAsyncThunk(
    "user/activateUser",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: `/User/${id}/activate`,
                method: "PATCH",
                headers: {
                    ...companyScopeHeader(state),
                },
            });
            return { id, message: response.data };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

// PATCH: /api/User/{id}/deactivate
export const deactivateUser = createAsyncThunk(
    "user/deactivateUser",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: `/User/${id}/deactivate`,
                method: "PATCH",
                headers: {
                    ...companyScopeHeader(state),
                },
            });
            return { id, message: response.data };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export interface IResetUserPassword {
    newPassword: string;
    confirmNewPassword: string;
}

// POST: /api/User/{id}/reset-password
export const resetUserPassword = createAsyncThunk(
    "user/resetUserPassword",
    async ({ id, data }: { id: number; data: IResetUserPassword }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: `/User/${id}/reset-password`,
                method: "POST",
                data,
                headers: {
                    ...companyScopeHeader(state),
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Đặt lại mật khẩu thất bại"));
        }
    }
);

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All Users
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchEmployeeOptions.fulfilled, (state, action) => {
                state.employeeOptions = action.payload;
            })
            // Create User
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update User
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Activate User
            .addCase(activateUser.fulfilled, (state, action) => {
                const user = state.users.find((u) => u.userId === action.payload.id);
                if (user) {
                    user.isActive = true;
                }
            })
            // Deactivate User
            .addCase(deactivateUser.fulfilled, (state, action) => {
                const user = state.users.find((u) => u.userId === action.payload.id);
                if (user) {
                    user.isActive = false;
                }
            });
    },
});

export const selectUsers = (state: RootState) => state.user.users;
export const selectEmployeeOptions = (state: RootState) => state.user.employeeOptions;
export const selectUserLoading =(state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;

export default userSlice.reducer;
