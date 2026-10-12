import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";
import { apiErrorMessage } from "../utils/apiError";

export interface IPositionList {
    positionId: number;
    positionCode: string;
    positionName: string;
    level: number;
    isTopLevel: boolean;
    employeeCount: number;
    isActive: boolean;
}

export interface IPositionResponse {
    positionId: number;
    positionCode: string;
    positionName: string;
    description: string | null;
    level: number;
    isTopLevel: boolean;
    isActive: boolean;
    employeeCount: number;
    createdDate: string;
    createdBy: number | null;
    createdByName: string | null;
    modifiedDate: string | null;
    modifiedBy: number | null;
    modifiedByName: string | null;
}

interface IPositionState {
    positions: IPositionList[];
    activePositions: IPositionList[];
    selectedPosition: IPositionResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: IPositionState = {
    positions: [],
    activePositions: [],
    selectedPosition: null,
    loading: false,
    error: null,
};

export const fetchAllPositions = createAsyncThunk(
    "position/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Position",
                method: "GET",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const fetchActivePositions = createAsyncThunk(
    "position/fetchActive",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Position/active",
                method: "GET",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const fetchPositionById = createAsyncThunk(
    "position/fetchById",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Position/${id}`,
                method: "GET",
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const createPosition = createAsyncThunk(
    "position/create",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Position",
                method: "POST",
                data,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const updatePosition = createAsyncThunk(
    "position/update",
    async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Position/${id}`,
                method: "PUT",
                data,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const deactivatePosition = createAsyncThunk(
    "position/deactivate",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Position/${id}/deactivate`,
                method: "PATCH",
            });
            return { id, message: response.data };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const activatePosition = createAsyncThunk(
    "position/activate",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Position/${id}/activate`,
                method: "PATCH",
            });
            return { id, message: response.data };
        } catch (error) {
            return rejectWithValue(apiErrorMessage(error, "Something went wrong"));
        }
    }
);

export const positionSlice = createSlice({
    name: "position",
    initialState,
    reducers: {
        clearSelectedPosition(state) {
            state.selectedPosition = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllPositions.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllPositions.fulfilled, (state, action) => {
                state.loading = false;
                state.positions = action.payload;
            })
            .addCase(fetchAllPositions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(fetchActivePositions.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchActivePositions.fulfilled, (state, action) => {
                state.loading = false;
                state.activePositions = action.payload;
            })
            .addCase(fetchActivePositions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(fetchPositionById.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchPositionById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedPosition = action.payload;
            })
            .addCase(fetchPositionById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(createPosition.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(createPosition.fulfilled, (state) => { state.loading = false; })
            .addCase(createPosition.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(updatePosition.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updatePosition.fulfilled, (state) => { state.loading = false; })
            .addCase(updatePosition.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(deactivatePosition.fulfilled, (state, action) => {
                const pos = state.positions.find(p => p.positionId === action.payload.id);
                if (pos) pos.isActive = false;
                if (state.selectedPosition && state.selectedPosition.positionId === action.payload.id) {
                    state.selectedPosition.isActive = false;
                }
            })
            .addCase(activatePosition.fulfilled, (state, action) => {
                const pos = state.positions.find(p => p.positionId === action.payload.id);
                if (pos) pos.isActive = true;
                if (state.selectedPosition && state.selectedPosition.positionId === action.payload.id) {
                    state.selectedPosition.isActive = true;
                }
            });
    },
});

export const { clearSelectedPosition } = positionSlice.actions;

export const selectPositions = (state: RootState) => state.position.positions;
export const selectActivePositions = (state: RootState) => state.position.activePositions;
export const selectSelectedPosition = (state: RootState) => state.position.selectedPosition;
export const selectPositionLoading = (state: RootState) => state.position.loading;
export const selectPositionError = (state: RootState) => state.position.error;

export default positionSlice.reducer;
