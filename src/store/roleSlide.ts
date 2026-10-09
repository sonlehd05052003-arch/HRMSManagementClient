import { companyScopeHeader } from "./companySlide";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IRole {
    roleId: number;
    roleName: string;
    description?: string;
    userCount: number;
    isActive: boolean;
    lastModifiedDate: string;
}

export interface IPermission {
    permissionId: number;
    permissionKey: string;
    displayName: string;
    category: string;
    description: string | null;
    displayOrder: number;
}

interface IRoleState {
    roles: IRole[];
    loading: boolean;
    error: string | null;
    permissionCatalog: IPermission[];
    rolePermissionKeys: string[];
    permissionsLoading: boolean;
}

const initialState: IRoleState = {
    roles: [],
    loading: false,
    error: null,
    permissionCatalog: [],
    rolePermissionKeys: [],
    permissionsLoading: false,
};

// GET: /api/Role
export const fetchAllRoles = createAsyncThunk(
    "role/fetchAllRoles",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: "/Role",
                method: "GET",
                headers: {
                    ...companyScopeHeader(state),
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// POST: /api/Role
export const createRole = createAsyncThunk(
    "role/createRole",
    async (data: { roleName: string; description?: string }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: "/Role",
                method: "POST",
                data,
                headers: {
                    ...companyScopeHeader(state),
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// GET: /api/Role/permissions
export const fetchPermissionCatalog = createAsyncThunk(
    "role/fetchPermissionCatalog",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: "/Role/permissions",
                method: "GET",
                headers: { ...companyScopeHeader(state), },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// GET: /api/Role/{id}/permissions
export const fetchRolePermissions = createAsyncThunk(
    "role/fetchRolePermissions",
    async (roleId: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: `/Role/${roleId}/permissions`,
                method: "GET",
                headers: { ...companyScopeHeader(state), },
            });
            return response.data as string[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// PUT: /api/Role/{id}/permissions
export const updateRolePermissions = createAsyncThunk(
    "role/updateRolePermissions",
    async ({ roleId, permissionKeys }: { roleId: number; permissionKeys: string[] }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: `/Role/${roleId}/permissions`,
                method: "PUT",
                data: { permissionKeys },
                headers: { ...companyScopeHeader(state), },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// PATCH: /api/Role/{id}/status?isActive=...
export const changeRoleStatus = createAsyncThunk(
    "role/changeRoleStatus",
    async ({ id, isActive }: { id: number; isActive: boolean }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const response = await request({
                url: `/Role/${id}/status`,
                method: "PATCH",
                params: { isActive },
                headers: {
                    ...companyScopeHeader(state),
                },
            });
            return { id, isActive, message: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const roleSlice = createSlice({
    name: "role",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All Roles
            .addCase(fetchAllRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = action.payload;
            })
            .addCase(fetchAllRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Role
            .addCase(createRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createRole.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Change Role Status
            .addCase(changeRoleStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changeRoleStatus.fulfilled, (state, action) => {
                state.loading = false;
                const { id, isActive } = action.payload;
                const role = state.roles.find((r) => r.roleId === id);
                if (role) {
                    role.isActive = isActive;
                }
            })
            .addCase(changeRoleStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Permission catalog
            .addCase(fetchPermissionCatalog.pending, (state) => {
                state.permissionsLoading = true;
            })
            .addCase(fetchPermissionCatalog.fulfilled, (state, action) => {
                state.permissionsLoading = false;
                state.permissionCatalog = action.payload;
            })
            .addCase(fetchPermissionCatalog.rejected, (state, action) => {
                state.permissionsLoading = false;
                state.error = action.payload as string;
            })
            // Role's granted permission keys
            .addCase(fetchRolePermissions.pending, (state) => {
                state.permissionsLoading = true;
            })
            .addCase(fetchRolePermissions.fulfilled, (state, action) => {
                state.permissionsLoading = false;
                state.rolePermissionKeys = action.payload;
            })
            .addCase(fetchRolePermissions.rejected, (state, action) => {
                state.permissionsLoading = false;
                state.error = action.payload as string;
            })
            // Save role permissions
            .addCase(updateRolePermissions.pending, (state) => {
                state.permissionsLoading = true;
            })
            .addCase(updateRolePermissions.fulfilled, (state) => {
                state.permissionsLoading = false;
            })
            .addCase(updateRolePermissions.rejected, (state, action) => {
                state.permissionsLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const selectRoles = (state: RootState) => state.role.roles;
export const selectRoleLoading = (state: RootState) => state.role.loading;
export const selectRoleError = (state: RootState) => state.role.error;
export const selectPermissionCatalog = (state: RootState) => state.role.permissionCatalog;
export const selectRolePermissionKeys = (state: RootState) => state.role.rolePermissionKeys;
export const selectPermissionsLoading = (state: RootState) => state.role.permissionsLoading;

export default roleSlice.reducer;
