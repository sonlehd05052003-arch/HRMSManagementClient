import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { EUserRole, type DynamicKeyObject } from "../interface/app";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { apiErrorMessage, apiErrorStatus } from "../utils/apiError";

/**
 * Profile of the signed-in user, as returned by the login / me endpoints. Kept in memory only: the JWT
 * stays in an HttpOnly cookie, and on every page load the session is asked from the API (fetchCurrentUser).
 */
interface IInfoLogin {
  role: EUserRole;
  userId: string;
  employeeId?: number;
  userName: string;
  expiresTime: number;
  isTopLevel: boolean;
  positionName: string;
}

type IInitialState = {
  infoLogin: IInfoLogin | null;
  isLogin: boolean;
  /** False until the API has said whether the cookie holds a valid session, so guards do not redirect too early. */
  sessionChecked: boolean;
}

const toInfoLogin = (user: any): IInfoLogin => ({
  role: user.role as EUserRole,
  userId: user.userId,
  employeeId: user.employeeId ?? undefined,
  userName: user.userName,
  expiresTime: user.expiresTime,
  isTopLevel: !!user.isTopLevel,
  positionName: user.positionName || "",
});

const initialState: IInitialState = {
  infoLogin: {
    role: EUserRole.EMPLOYEE,
    userId: "",
    employeeId: undefined,
    userName: "",
    expiresTime: 0,
    isTopLevel: false,
    positionName: "",
  },
  isLogin: false,
  sessionChecked: false,
}

// GET /api/Auth/me: who the cookie belongs to (401 when there is no valid session)
export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await request({ url: `/Auth/me`, method: "GET" });
    return response.data;
  } catch (error) {
    return rejectWithValue(apiErrorStatus(error));
  }
});

export const actionLogin = createAsyncThunk(
  "auth/actionLogin",
  async (data: DynamicKeyObject, { rejectWithValue }) => {
    try {
      return await request({
        url: `/Auth/login`,
        method: "POST",
        data,
      });
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Login failed"));
    }
  }
);

// The cookie is HttpOnly, so only the API can clear it; the local session is cleared either way
export const actionLogout = createAsyncThunk("auth/actionLogout", async (_, { dispatch }) => {
  try {
    await request({ url: `/Auth/logout`, method: "POST" });
  } catch {
    // The cookie still expires on its own
  }
  dispatch(slice.actions.logout());
});

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/Auth/change-password`,
        method: "POST",
        data
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Failed to change password"));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data: { emailOrUsername: string }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/Auth/forgot-password`,
        method: "POST",
        data,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Failed to send OTP"));
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/Auth/reset-password`,
        method: "POST",
        data,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Failed to reset password"));
    }
  }
);

export const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.infoLogin = initialState.infoLogin;
      state.isLogin = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(actionLogin.fulfilled, (state, action) => {
      const user = action.payload?.data?.user;
      if (user) {
        state.infoLogin = toInfoLogin(user);
        state.isLogin = true;
        state.sessionChecked = true;
      }
    })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.infoLogin = toInfoLogin(action.payload);
        state.isLogin = true;
        state.sessionChecked = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.infoLogin = initialState.infoLogin;
        state.isLogin = false;
        state.sessionChecked = true;
      })
      .addCase(actionLogin.rejected, (state) => {
        state.infoLogin = initialState.infoLogin;
        state.isLogin = false;
      });
  }
})

export const { logout } = slice.actions;
export const selectIsLogin = (state: RootState) => state.auth.isLogin;
export const selectInfoLogin = (state: RootState) => state.auth.infoLogin;
export const selectSessionChecked = (state: RootState) => state.auth.sessionChecked;
export default slice.reducer;