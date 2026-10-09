import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface IEmployeeDocumentList {
    employeeDocumentId: number;
    employeeId: number;
    documentTitle: string;
    documentCategory: string;
    fileName: string;
    fileType: string;
    fileSizeFormatted: string;
    isConfidential: boolean;
    uploadDate: string;
    uploadedByName: string;
}

export interface IEmployeeDocumentDetail {
    employeeDocumentId: number;
    employeeId: number;
    employeeFullName: string;
    documentTitle: string;
    documentCategory: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    fileSizeFormatted: string;
    isConfidential: boolean;
    uploadDate: string;
    uploadedBy: number;
    uploadedByName: string;
    modifiedDate: string | null;
    modifiedBy: number | null;
    modifiedByName: string | null;
}

interface IEmployeeDocumentState {
    documents: IEmployeeDocumentList[];
    selectedDocument: IEmployeeDocumentDetail | null;
    loading: boolean;
    uploading: boolean;
    error: string | null;
}

const initialState: IEmployeeDocumentState = {
    documents: [],
    selectedDocument: null,
    loading: false,
    uploading: false,
    error: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────

// POST /api/EmployeeDocument/upload  (multipart/form-data)
export const uploadEmployeeDocument = createAsyncThunk(
    "employeeDocument/upload",
    async (
        { formData }: { formData: FormData },
        { rejectWithValue }
    ) => {
        try {
            const response = await request({
                url: "/EmployeeDocument/upload",
                method: "POST",
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data as IEmployeeDocumentDetail;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Upload thất bại");
        }
    }
);

// PUT /api/EmployeeDocument/{id}  (update metadata)
export const updateEmployeeDocument = createAsyncThunk(
    "employeeDocument/update",
    async (
        { id, data }: { id: number; data: { documentTitle: string; documentCategory: string; isConfidential: boolean; modifiedBy?: number } },
        { rejectWithValue }
    ) => {
        try {
            const response = await request({
                url: `/EmployeeDocument/${id}`,
                method: "PUT",
                data: {
                    ...data,
                    employeeDocumentId: id, // Thêm ID vào body nếu backend yêu cầu PascalCase hoặc camelCase tùy cấu hình
                },
            });
            return response.data as IEmployeeDocumentDetail;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Cập nhật thất bại");
        }
    }
);

// GET /api/EmployeeDocument/employee/{employeeId}
export const fetchDocumentsByEmployee = createAsyncThunk(
    "employeeDocument/fetchByEmployee",
    async (employeeId: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/EmployeeDocument/employee/${employeeId}`,
                method: "GET",
            });
            return response.data as IEmployeeDocumentList[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Không thể tải danh sách tài liệu");
        }
    }
);

// GET /api/EmployeeDocument/{id}
export const fetchDocumentById = createAsyncThunk(
    "employeeDocument/fetchById",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/EmployeeDocument/${id}`,
                method: "GET",
            });
            return response.data as IEmployeeDocumentDetail;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Không thể tải tài liệu");
        }
    }
);

// GET /api/EmployeeDocument/{id}/download
// Returns a blob URL (handled outside Redux - called directly in component)
export const downloadEmployeeDocument = createAsyncThunk(
    "employeeDocument/download",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/EmployeeDocument/${id}/download`,
                method: "GET",
                responseType: "blob",
            });
            // Return a temporary object URL for the browser to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const contentDisposition = response.headers["content-disposition"];
            let fileName = "download";
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match) fileName = match[1];
            }
            return { url, fileName };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Tải file thất bại");
        }
    }
);

// DELETE /api/EmployeeDocument/{id}
export const deleteEmployeeDocument = createAsyncThunk(
    "employeeDocument/delete",
    async (id: number, { rejectWithValue }) => {
        try {
            await request({
                url: `/EmployeeDocument/${id}`,
                method: "DELETE",
            });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Xóa tài liệu thất bại");
        }
    }
);

// GET /api/EmployeeDocument/employee/{employeeId}/category/{category}
export const fetchDocumentsByCategory = createAsyncThunk(
    "employeeDocument/fetchByCategory",
    async (
        { employeeId, category }: { employeeId: number; category: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await request({
                url: `/EmployeeDocument/employee/${employeeId}/category/${category}`,
                method: "GET",
            });
            return response.data as IEmployeeDocumentList[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Không thể tải tài liệu theo danh mục");
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

export const employeeDocumentSlice = createSlice({
    name: "employeeDocument",
    initialState,
    reducers: {
        clearSelectedDocument(state) {
            state.selectedDocument = null;
        },
        clearDocuments(state) {
            state.documents = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Upload
            .addCase(uploadEmployeeDocument.pending, (state) => {
                state.uploading = true;
                state.error = null;
            })
            .addCase(uploadEmployeeDocument.fulfilled, (state) => {
                state.uploading = false;
            })
            .addCase(uploadEmployeeDocument.rejected, (state, action) => {
                state.uploading = false;
                state.error = action.payload as string;
            })

            // Update
            .addCase(updateEmployeeDocument.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEmployeeDocument.fulfilled, (state, action) => {
                state.loading = false;
                // Update the item in the list if present
                const idx = state.documents.findIndex(
                    (d) => d.employeeDocumentId === action.payload.employeeDocumentId
                );
                if (idx !== -1) {
                    state.documents[idx] = {
                        ...state.documents[idx],
                        documentTitle: action.payload.documentTitle,
                        documentCategory: action.payload.documentCategory,
                        isConfidential: action.payload.isConfidential,
                    };
                }
                if (state.selectedDocument?.employeeDocumentId === action.payload.employeeDocumentId) {
                    state.selectedDocument = action.payload;
                }
            })
            .addCase(updateEmployeeDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch by Employee
            .addCase(fetchDocumentsByEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocumentsByEmployee.fulfilled, (state, action) => {
                state.loading = false;
                // Ensure field names match our interface if backend returns documentId or id
                state.documents = action.payload.map((d: any) => ({
                    ...d,
                    employeeDocumentId: d.employeeDocumentId || d.documentId || d.id
                }));
            })
            .addCase(fetchDocumentsByEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.documents = [];
            })

            // Fetch By Id
            .addCase(fetchDocumentById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocumentById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDocument = {
                    ...action.payload,
                    employeeDocumentId: action.payload.employeeDocumentId || (action.payload as any).documentId || (action.payload as any).id
                };
            })
            .addCase(fetchDocumentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Download (no state change needed, just loading)
            .addCase(downloadEmployeeDocument.pending, (state) => {
                state.loading = true;
            })
            .addCase(downloadEmployeeDocument.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(downloadEmployeeDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Delete
            .addCase(deleteEmployeeDocument.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEmployeeDocument.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = state.documents.filter(
                    (d) => d.employeeDocumentId !== action.payload
                );
                if (state.selectedDocument?.employeeDocumentId === action.payload) {
                    state.selectedDocument = null;
                }
            })
            .addCase(deleteEmployeeDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch by Category
            .addCase(fetchDocumentsByCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocumentsByCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = action.payload.map((d: any) => ({
                    ...d,
                    employeeDocumentId: d.employeeDocumentId || d.documentId || d.id
                }));
            })
            .addCase(fetchDocumentsByCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.documents = [];
            });
    },
});

export const { clearSelectedDocument, clearDocuments } = employeeDocumentSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectEmployeeDocuments = (state: RootState) => state.employeeDocument.documents;
export const selectSelectedDocument = (state: RootState) => state.employeeDocument.selectedDocument;
export const selectDocumentLoading = (state: RootState) => state.employeeDocument.loading;
export const selectDocumentUploading = (state: RootState) => state.employeeDocument.uploading;
export const selectDocumentError = (state: RootState) => state.employeeDocument.error;

export default employeeDocumentSlice.reducer;
