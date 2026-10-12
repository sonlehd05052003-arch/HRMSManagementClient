import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { apiErrorMessage } from "../utils/apiError";

export interface ICompany {
  companyId: number;
  companyCode: string;
  companyName: string;
  taxCode: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdDate: string;
  employeeCount: number;
  userCount: number;
  admins: ICompanyAdmin[];
}

export interface ICompanyAdmin {
  userId: number;
  username: string;
  email: string;
  isActive: boolean;
}

export interface ICompanyWrite {
  companyCode: string;
  companyName: string;
  taxCode?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface ICreateCompany extends ICompanyWrite {
  admin: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  };
}

export interface ICreateCompanyResult {
  companyId: number;
  adminUsername: string;
  temporaryPassword: string;
}

export interface IResetAdminPasswordResult {
  username: string;
  temporaryPassword: string;
}

interface ICompanyState {
  list: ICompany[];
  loading: boolean;
  /** Company whose roles, permissions and role menus the SuperAdmin is currently configuring. */
  scopeCompanyId: number | null;
}

const initialState: ICompanyState = {
  list: [],
  loading: false,
  scopeCompanyId: null,
};

/**
 * Header telling the API which company the SuperAdmin is configuring.
 * The backend honors it only for the SuperAdmin and only on role / permission / menu endpoints.
 */
export const companyScopeHeader = (state: any): Record<string, string> => {
  const scopeCompanyId = state.company?.scopeCompanyId;
  return state.auth?.infoLogin?.role === "SUPERADMIN" && scopeCompanyId != null
    ? { "X-Company-Id": String(scopeCompanyId) }
    : {};
};


// GET /api/Company
export const fetchCompanies = createAsyncThunk("company/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await request({ url: "/Company", method: "GET" });
    return response.data as ICompany[];
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error, "Không tải được danh sách công ty"));
  }
});

// POST /api/Company
export const createCompany = createAsyncThunk(
  "company/create",
  async (data: ICreateCompany, { rejectWithValue }) => {
    try {
      const response = await request({ url: "/Company", method: "POST", data });
      return response.data as ICreateCompanyResult;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Tạo công ty thất bại"));
    }
  }
);

// PUT /api/Company/{id}
export const updateCompany = createAsyncThunk(
  "company/update",
  async ({ companyId, data }: { companyId: number; data: ICompanyWrite }, { rejectWithValue }) => {
    try {
      const response = await request({ url: `/Company/${companyId}`, method: "PUT", data });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Cập nhật công ty thất bại"));
    }
  }
);

// PATCH /api/Company/{id}/status
export const setCompanyStatus = createAsyncThunk(
  "company/setStatus",
  async ({ companyId, isActive }: { companyId: number; isActive: boolean }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/Company/${companyId}/status`,
        method: "PATCH",
        data: { isActive }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Đổi trạng thái công ty thất bại"));
    }
  }
);

// POST /api/Company/{id}/admins/{userId}/reset-password
export const resetCompanyAdminPassword = createAsyncThunk(
  "company/resetAdminPassword",
  async ({ companyId, userId }: { companyId: number; userId: number }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/Company/${companyId}/admins/${userId}/reset-password`,
        method: "POST"
      });
      return response.data as IResetAdminPasswordResult;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Đặt lại mật khẩu thất bại"));
    }
  }
);

export const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setScopeCompany: (state, action: { payload: number | null }) => {
      state.scopeCompanyId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const selectCompanies = (state: RootState) => state.company.list;
export const selectCompaniesLoading = (state: RootState) => state.company.loading;
export const selectScopeCompanyId = (state: RootState) => state.company.scopeCompanyId;

export const { setScopeCompany } = companySlice.actions;

export default companySlice.reducer;
