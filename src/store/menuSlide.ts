import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { logout } from "./authSlide";
import { companyScopeHeader } from "./companySlide";
import { apiErrorMessage } from "../utils/apiError";

export interface IMyMenuNode {
  menuId: number;
  code: string;
  title: string;
  route: string | null;
  iconName: string | null;
  children: IMyMenuNode[];
}

export interface IMenuAdminNode {
  menuId: number;
  parentId: number | null;
  code: string;
  title: string;
  route: string | null;
  iconName: string | null;
  displayOrder: number;
  isActive: boolean;
  roleIds: number[];
  isGranted: boolean | null;
  children: IMenuAdminNode[];
}

export interface IMenuWrite {
  parentId: number | null;
  code: string;
  title: string;
  route?: string | null;
  iconName?: string | null;
  displayOrder: number;
  isActive: boolean;
  roleIds?: number[];
}

interface IMenuState {
  myMenu: IMyMenuNode[];
  myMenuLoaded: boolean;
  tree: IMenuAdminNode[];
  treeLoading: boolean;
  roleTree: IMenuAdminNode[];
  roleTreeLoading: boolean;
}

const initialState: IMenuState = {
  myMenu: [],
  myMenuLoaded: false,
  tree: [],
  treeLoading: false,
  roleTree: [],
  roleTreeLoading: false,
};

const authHeader = (getState: () => unknown) => {
  const state: any = getState();
  return { ...companyScopeHeader(state) };
};


// GET /api/Menu/my
export const fetchMyMenu = createAsyncThunk("menu/fetchMyMenu", async (_, { rejectWithValue, getState }) => {
  try {
    const response = await request({ url: "/Menu/my", method: "GET", headers: authHeader(getState) });
    return response.data as IMyMenuNode[];
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, "Không tải được menu"));
  }
});

// GET /api/Menu
export const fetchMenuTree = createAsyncThunk("menu/fetchMenuTree", async (_, { rejectWithValue, getState }) => {
  try {
    const response = await request({ url: "/Menu", method: "GET", headers: authHeader(getState) });
    return response.data as IMenuAdminNode[];
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, "Không tải được cây menu"));
  }
});

// POST /api/Menu
export const createMenu = createAsyncThunk("menu/createMenu", async (data: IMenuWrite, { rejectWithValue, getState }) => {
  try {
    const response = await request({ url: "/Menu", method: "POST", data, headers: authHeader(getState) });
    return response.data;
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, "Tạo menu thất bại"));
  }
});

// PUT /api/Menu/{id}
export const updateMenu = createAsyncThunk(
  "menu/updateMenu",
  async ({ id, data }: { id: number; data: IMenuWrite }, { rejectWithValue, getState }) => {
    try {
      const response = await request({ url: `/Menu/${id}`, method: "PUT", data, headers: authHeader(getState) });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Cập nhật menu thất bại"));
    }
  }
);

// DELETE /api/Menu/{id}
export const deleteMenu = createAsyncThunk("menu/deleteMenu", async (id: number, { rejectWithValue, getState }) => {
  try {
    const response = await request({ url: `/Menu/${id}`, method: "DELETE", headers: authHeader(getState) });
    return response.data as { deletedCount: number };
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, "Xóa menu thất bại"));
  }
});

// GET /api/Menu/roles/{roleId}
export const fetchRoleMenus = createAsyncThunk("menu/fetchRoleMenus", async (roleId: number, { rejectWithValue, getState }) => {
  try {
    const response = await request({ url: `/Menu/roles/${roleId}`, method: "GET", headers: authHeader(getState) });
    return response.data as IMenuAdminNode[];
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, "Không tải được menu của vai trò"));
  }
});

// PUT /api/Menu/roles/{roleId}
export const updateRoleMenus = createAsyncThunk(
  "menu/updateRoleMenus",
  async ({ roleId, menuIds }: { roleId: number; menuIds: number[] }, { rejectWithValue, getState }) => {
    try {
      const response = await request({
        url: `/Menu/roles/${roleId}`,
        method: "PUT",
        data: { menuIds },
        headers: authHeader(getState),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Lưu phân menu thất bại"));
    }
  }
);

// GET /api/Menu/superadmin
export const fetchSuperAdminMenus = createAsyncThunk("menu/fetchSuperAdminMenus", async (_, { rejectWithValue, getState }) => {
  try {
    const response = await request({ url: "/Menu/superadmin", method: "GET", headers: authHeader(getState) });
    return response.data as IMenuAdminNode[];
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, "Không tải được menu của SuperAdmin"));
  }
});

// PUT /api/Menu/superadmin
export const updateSuperAdminMenus = createAsyncThunk(
  "menu/updateSuperAdminMenus",
  async (menuIds: number[], { rejectWithValue, getState }) => {
    try {
      const response = await request({
        url: "/Menu/superadmin",
        method: "PUT",
        data: { menuIds },
        headers: authHeader(getState),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Lưu menu SuperAdmin thất bại"));
    }
  }
);

export const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyMenu.fulfilled, (state, action) => {
        state.myMenu = action.payload;
        state.myMenuLoaded = true;
      })
      .addCase(fetchMyMenu.rejected, (state) => {
        state.myMenuLoaded = true;
      })
      .addCase(fetchMenuTree.pending, (state) => {
        state.treeLoading = true;
      })
      .addCase(fetchMenuTree.fulfilled, (state, action) => {
        state.treeLoading = false;
        state.tree = action.payload;
      })
      .addCase(fetchMenuTree.rejected, (state) => {
        state.treeLoading = false;
      })
      .addCase(fetchRoleMenus.pending, (state) => {
        state.roleTreeLoading = true;
      })
      .addCase(fetchRoleMenus.fulfilled, (state, action) => {
        state.roleTreeLoading = false;
        state.roleTree = action.payload;
      })
      .addCase(fetchRoleMenus.rejected, (state) => {
        state.roleTreeLoading = false;
      })
      // The SuperAdmin's tree is shown in the same role-menu tab
      .addCase(fetchSuperAdminMenus.pending, (state) => {
        state.roleTreeLoading = true;
      })
      .addCase(fetchSuperAdminMenus.fulfilled, (state, action) => {
        state.roleTreeLoading = false;
        state.roleTree = action.payload;
      })
      .addCase(fetchSuperAdminMenus.rejected, (state) => {
        state.roleTreeLoading = false;
      })
      .addCase(logout, () => initialState);
  },
});

export const selectMyMenu = (state: RootState) => state.menu.myMenu;
export const selectMyMenuLoaded = (state: RootState) => state.menu.myMenuLoaded;
export const selectMenuTree = (state: RootState) => state.menu.tree;
export const selectMenuTreeLoading = (state: RootState) => state.menu.treeLoading;
export const selectRoleMenuTree = (state: RootState) => state.menu.roleTree;
export const selectRoleMenuTreeLoading = (state: RootState) => state.menu.roleTreeLoading;

export default menuSlice.reducer;
