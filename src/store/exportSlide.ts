import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface ExportRequestDTO {
    module: string; // dashboard, workforce, cost, payroll, leave, attendance
    format: "csv" | "excel" | "pdf" | "powerpoint";
    scope: "current" | "all" | "custom";
    startDate?: string;
    endDate?: string;
    includeCharts: boolean;
    includeRawData: boolean;
    addCompanyBranding: boolean;
    passwordProtect: boolean;
    sendToEmail: boolean;
    emailAddress?: string;
    sourceScreen: string; // Default "SR-18"
}

export interface ExportResponseDTO {
    success: boolean;
    message: string;
    fileName: string;
    contentType: string;
    sentToEmail: boolean;
}

interface ExportState {
    loading: boolean;
    error: string | null;
    success: boolean;
    message: string | null;
}

const initialState: ExportState = {
    loading: false,
    error: null,
    success: false,
    message: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────

export const exportReport = createAsyncThunk(
    "export/report",
    async (payload: ExportRequestDTO, { rejectWithValue }) => {
        try {
            
            // Set responseType to blob because we might receive a file
            const response = await request({
                url: "/reports/export",
                method: "POST",
                data: payload,
                responseType: payload.sendToEmail ? "json" : "blob",
            });

            if (payload.sendToEmail) {
                // If it's pure JSON
                return { 
                    sentToEmail: true, 
                    message: response.data.message || "Báo cáo đã được gửi qua email thành công." 
                };
            } else {
                // If it's a file blob
                const contentDisposition = response.headers["content-disposition"];
                let fileName = `export_${new Date().getTime()}.${payload.format === "excel" ? "xls" : payload.format}`;
                
                if (contentDisposition) {
                    const fileNameMatch = contentDisposition.match(/filename=(.+)/);
                    if (fileNameMatch) fileName = fileNameMatch[1];
                }

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                
                return { 
                    sentToEmail: false, 
                    message: "Tải báo cáo xuống thành công." 
                };
            }
        } catch (error: any) {
            // Error handling for blob responses is tricky:
            if (error.response && error.response.data instanceof Blob) {
                const text = await error.response.data.text();
                try {
                    const json = JSON.parse(text);
                    return rejectWithValue(json.message || "Xuất báo cáo thất bại.");
                } catch (e) {
                    return rejectWithValue("Xuất báo cáo thất bại.");
                }
            }
            return rejectWithValue(error.response?.data?.message || error.message || "Xuất báo cáo thất bại.");
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

export const exportSlice = createSlice({
    name: "export",
    initialState,
    reducers: {
        resetExportState(state) {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(exportReport.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
                state.message = null;
            })
            .addCase(exportReport.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;
            })
            .addCase(exportReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetExportState } = exportSlice.actions;

export const selectExportLoading = (state: RootState) => state.export.loading;
export const selectExportError = (state: RootState) => state.export.error;
export const selectExportSuccess = (state: RootState) => state.export.success;
export const selectExportMessage = (state: RootState) => state.export.message;

export default exportSlice.reducer;
