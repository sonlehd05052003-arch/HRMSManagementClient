// src/store/payrollSlide.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { request } from "../utils/request"
import type { RootState } from "./index"
import type {
  IPayrollPeriod, ICreatePayrollPeriod,
  IPayrollRecord, IPayrollSummary,
  IPayslip,
  IPayrollAllowance, IPayrollDeduction,
  IAttendanceSummary, IRejectPayrollPeriod,
} from "../types/payroll"
import { apiErrorMessage } from "../utils/apiError";

// ─────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────
interface IPayrollState {
  periods: IPayrollPeriod[]
  currentPeriod: IPayrollPeriod | null
  periodSummary: IPayrollSummary | null
  records: IPayrollRecord[]
  currentRecord: IPayrollRecord | null
  myPayslips: IPayslip[]
  myPeriods: IPayrollPeriod[]
  myAttendanceSummary: IAttendanceSummary | null
  loading: boolean
  calculating: boolean
  error: string | null
  lastResponse: any | null
}

const initialState: IPayrollState = {
  periods: [],
  currentPeriod: null,
  periodSummary: null,
  records: [],
  currentRecord: null,
  myPayslips: [],
  myPeriods: [],
  myAttendanceSummary: null,
  loading: false,
  calculating: false,
  error: null,
  lastResponse: null,
}

// ─────────────────────────────────────────────────────────
// THUNKS — KỲ LƯƠNG
// ─────────────────────────────────────────────────────────
export const fetchPayrollPeriods = createAsyncThunk(
  "payroll/fetchPeriods",
  async (_, { rejectWithValue }) => {
    try {
      const res = await request({ url: "/payroll/periods", method: "GET" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tải danh sách kỳ lương"))
    }
  }
)

export const fetchPayrollPeriodById = createAsyncThunk(
  "payroll/fetchPeriodById",
  async (periodId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/periods/${periodId}`, method: "GET" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tải kỳ lương"))
    }
  }
)

export const fetchPayrollPeriodSummary = createAsyncThunk(
  "payroll/fetchPeriodSummary",
  async (periodId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/periods/${periodId}/summary`, method: "GET" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tải tổng hợp kỳ lương"))
    }
  }
)

export const createPayrollPeriod = createAsyncThunk(
  "payroll/createPeriod",
  async (data: ICreatePayrollPeriod, { rejectWithValue }) => {
    try {
      const res = await request({ url: "/payroll/periods", method: "POST", data })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tạo kỳ lương"))
    }
  }
)

export const approvePayrollPeriod = createAsyncThunk(
  "payroll/approvePeriod",
  async (periodId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/periods/${periodId}/approve`, method: "PUT" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi duyệt kỳ lương"))
    }
  }
)

export const rejectPayrollPeriod = createAsyncThunk(
  "payroll/rejectPeriod",
  async ({ periodId, data }: { periodId: number; data: IRejectPayrollPeriod }, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/periods/${periodId}/reject`, method: "PUT", data })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi từ chối kỳ lương"))
    }
  }
)

export const triggerAttendanceReview = createAsyncThunk(
  "payroll/triggerAttendanceReview",
  async (periodId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/periods/${periodId}/trigger-attendance-review`, method: "PUT" })
      return res.data as IPayrollPeriod
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi kích hoạt review chấm công"))
    }
  }
)

// ─────────────────────────────────────────────────────────
// THUNKS — TÍNH LƯƠNG
// ─────────────────────────────────────────────────────────
export const calculateAllEmployees = createAsyncThunk(
  "payroll/calculateAll",
  async (periodId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/periods/${periodId}/calculate`, method: "POST" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tính lương"))
    }
  }
)

export const calculateOneEmployee = createAsyncThunk(
  "payroll/calculateOne",
  async ({ periodId, employeeId }: { periodId: number; employeeId: number }, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/periods/${periodId}/calculate/${employeeId}`, method: "POST" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tính lương nhân viên"))
    }
  }
)

// ─────────────────────────────────────────────────────────
// THUNKS — RECORDS
// ─────────────────────────────────────────────────────────
export const fetchRecordsByPeriod = createAsyncThunk(
  "payroll/fetchRecordsByPeriod",
  async (periodId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/records/${periodId}`, method: "GET" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tải bảng lương"))
    }
  }
)

export const fetchRecordById = createAsyncThunk(
  "payroll/fetchRecordById",
  async (recordId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/records/detail/${recordId}`, method: "GET" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tải chi tiết lương"))
    }
  }
)

export const updateBonus = createAsyncThunk(
  "payroll/updateBonus",
  async ({ recordId, bonusAmount }: { recordId: number; bonusAmount: number }, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/records/${recordId}/bonus`, method: "PUT", data: bonusAmount })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi cập nhật thưởng"))
    }
  }
)

export const addAllowance = createAsyncThunk(
  "payroll/addAllowance",
  async (
    { recordId, data }: { recordId: number; data: Omit<IPayrollAllowance, "allowanceId" | "payrollRecordId"> },
    { rejectWithValue }
  ) => {
    try {
      const res = await request({ url: `/payroll/records/${recordId}/allowance`, method: "POST", data })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi thêm phụ cấp"))
    }
  }
)

export const removeAllowance = createAsyncThunk(
  "payroll/removeAllowance",
  async ({ recordId, allowanceId }: { recordId: number; allowanceId: number }, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/records/${recordId}/allowance/${allowanceId}`, method: "DELETE" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi xóa phụ cấp"))
    }
  }
)

export const addDeduction = createAsyncThunk(
  "payroll/addDeduction",
  async (
    { recordId, data }: { recordId: number; data: Omit<IPayrollDeduction, "deductionId" | "payrollRecordId"> },
    { rejectWithValue }
  ) => {
    try {
      const res = await request({ url: `/payroll/records/${recordId}/deduction`, method: "POST", data })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi thêm khấu trừ"))
    }
  }
)

export const removeDeduction = createAsyncThunk(
  "payroll/removeDeduction",
  async ({ recordId, deductionId }: { recordId: number; deductionId: number }, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/records/${recordId}/deduction/${deductionId}`, method: "DELETE" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi xóa khấu trừ"))
    }
  }
)

// ─────────────────────────────────────────────────────────
// THUNKS — PHIẾU LƯƠNG
// ─────────────────────────────────────────────────────────
export const generatePayslipsForPeriod = createAsyncThunk(
  "payroll/generatePayslipsForPeriod",
  async (periodId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/payslips/period/${periodId}/generate-all`, method: "POST" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tạo phiếu lương"))
    }
  }
)

export const generatePayslip = createAsyncThunk(
  "payroll/generatePayslip",
  async (recordId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/payslips/${recordId}/generate`, method: "POST" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tạo phiếu lương"))
    }
  }
)

export const fetchMyPayslips = createAsyncThunk(
  "payroll/fetchMyPayslips",
  async (employeeId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/payslips/employee/${employeeId}`, method: "GET" })
      return res.data
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tải phiếu lương"))
    }
  }
)

export const downloadPayslipPdf = createAsyncThunk(
  "payroll/downloadPayslipPdf",
  async (payslipId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/payslips/${payslipId}/pdf`, method: "GET", responseType: "blob" })
      return res.data as Blob
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Tải PDF thất bại"))
    }
  }
)

export const exportPayrollExcel = createAsyncThunk(
  "payroll/exportPayrollExcel",
  async (periodId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/export/${periodId}`, method: "GET", responseType: "blob" })
      return res.data as Blob
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Xuất Excel thất bại"))
    }
  }
)

// ─────────────────────────────────────────────────────────
// THUNKS — NV XEM CHẤM CÔNG & KỲ LƯƠNG
// ─────────────────────────────────────────────────────────
export const fetchMyAttendanceSummary = createAsyncThunk(
  "payroll/fetchMyAttendanceSummary",
  async (periodId: number, { rejectWithValue }) => {
    try {
      const res = await request({ url: `/payroll/records/my/${periodId}/attendance`, method: "GET" })
      return res.data as IAttendanceSummary
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tải dữ liệu chấm công"))
    }
  }
)

export const fetchMyPeriods = createAsyncThunk(
  "payroll/fetchMyPeriods",
  async (_, { rejectWithValue }) => {
    try {
      const res = await request({ url: "/payroll/periods/my", method: "GET" })
      return res.data as IPayrollPeriod[]
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Lỗi tải danh sách kỳ lương"))
    }
  }
)

// ─────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────
const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    clearCurrentPeriod(state) { state.currentPeriod = null },
    clearCurrentRecord(state) { state.currentRecord = null },
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    const setLoading = (state: IPayrollState) => { state.loading = true; state.error = null }
    const setError   = (state: IPayrollState, action: any) => {
      state.loading = false
      state.calculating = false
      state.error = typeof action.payload === "string"
        ? action.payload
        : action.payload?.message || "Có lỗi xảy ra"
    }

    builder
      // Periods
      .addCase(fetchPayrollPeriods.pending, setLoading)
      .addCase(fetchPayrollPeriods.fulfilled, (state, action) => { state.loading = false; state.periods = action.payload })
      .addCase(fetchPayrollPeriods.rejected, setError)

      .addCase(fetchPayrollPeriodById.pending, setLoading)
      .addCase(fetchPayrollPeriodById.fulfilled, (state, action) => { state.loading = false; state.currentPeriod = action.payload })
      .addCase(fetchPayrollPeriodById.rejected, setError)

      .addCase(fetchPayrollPeriodSummary.pending, setLoading)
      .addCase(fetchPayrollPeriodSummary.fulfilled, (state, action) => { state.loading = false; state.periodSummary = action.payload })
      .addCase(fetchPayrollPeriodSummary.rejected, setError)

      .addCase(createPayrollPeriod.pending, setLoading)
      .addCase(createPayrollPeriod.fulfilled, (state, action) => { state.loading = false; state.periods.unshift(action.payload) })
      .addCase(createPayrollPeriod.rejected, setError)

      .addCase(approvePayrollPeriod.pending, setLoading)
      .addCase(approvePayrollPeriod.fulfilled, (state, action) => {
        state.loading = false
        state.currentPeriod = action.payload
        const idx = state.periods.findIndex(p => p.periodId === action.payload.periodId)
        if (idx !== -1) state.periods[idx] = action.payload
      })
      .addCase(approvePayrollPeriod.rejected, setError)

      .addCase(rejectPayrollPeriod.pending, setLoading)
      .addCase(rejectPayrollPeriod.fulfilled, (state, action) => {
        state.loading = false
        state.currentPeriod = action.payload
        const idx = state.periods.findIndex(p => p.periodId === action.payload.periodId)
        if (idx !== -1) state.periods[idx] = action.payload
      })
      .addCase(rejectPayrollPeriod.rejected, setError)

      .addCase(triggerAttendanceReview.pending, setLoading)
      .addCase(triggerAttendanceReview.fulfilled, (state, action) => {
        state.loading = false
        state.currentPeriod = action.payload
        const idx = state.periods.findIndex(p => p.periodId === action.payload.periodId)
        if (idx !== -1) state.periods[idx] = action.payload
      })
      .addCase(triggerAttendanceReview.rejected, setError)

      // Calculate
      .addCase(calculateAllEmployees.pending, (state) => { state.calculating = true; state.error = null })
      .addCase(calculateAllEmployees.fulfilled, (state, action) => { state.calculating = false; state.records = action.payload })
      .addCase(calculateAllEmployees.rejected, setError)

      .addCase(calculateOneEmployee.pending, (state) => { state.calculating = true; state.error = null })
      .addCase(calculateOneEmployee.fulfilled, (state, action) => {
        state.calculating = false
        state.currentRecord = action.payload
        const idx = state.records.findIndex(r => r.payrollRecordId === action.payload.payrollRecordId)
        if (idx !== -1) state.records[idx] = action.payload
        else state.records.push(action.payload)
      })
      .addCase(calculateOneEmployee.rejected, setError)

      // Records
      .addCase(fetchRecordsByPeriod.pending, setLoading)
      .addCase(fetchRecordsByPeriod.fulfilled, (state, action) => { state.loading = false; state.records = action.payload })
      .addCase(fetchRecordsByPeriod.rejected, setError)

      .addCase(fetchRecordById.pending, setLoading)
      .addCase(fetchRecordById.fulfilled, (state, action) => { state.loading = false; state.currentRecord = action.payload })
      .addCase(fetchRecordById.rejected, setError)

      .addCase(updateBonus.pending, setLoading)
      .addCase(updateBonus.fulfilled, (state, action) => { state.loading = false; state.currentRecord = action.payload })
      .addCase(updateBonus.rejected, setError)

      .addCase(addAllowance.pending, setLoading)
      .addCase(addAllowance.fulfilled, (state, action) => { state.loading = false; state.currentRecord = action.payload })
      .addCase(addAllowance.rejected, setError)

      .addCase(removeAllowance.pending, setLoading)
      .addCase(removeAllowance.fulfilled, (state, action) => { state.loading = false; state.currentRecord = action.payload })
      .addCase(removeAllowance.rejected, setError)

      .addCase(addDeduction.pending, setLoading)
      .addCase(addDeduction.fulfilled, (state, action) => { state.loading = false; state.currentRecord = action.payload })
      .addCase(addDeduction.rejected, setError)

      .addCase(removeDeduction.pending, setLoading)
      .addCase(removeDeduction.fulfilled, (state, action) => { state.loading = false; state.currentRecord = action.payload })
      .addCase(removeDeduction.rejected, setError)

      // Payslips
      .addCase(generatePayslip.pending, setLoading)
      .addCase(generatePayslip.fulfilled, (state, action) => { state.loading = false; state.lastResponse = action.payload })
      .addCase(generatePayslip.rejected, setError)

      .addCase(fetchMyPayslips.pending, setLoading)
      .addCase(fetchMyPayslips.fulfilled, (state, action) => { state.loading = false; state.myPayslips = action.payload })
      .addCase(fetchMyPayslips.rejected, setError)

      // NV xem chấm công & kỳ lương
      .addCase(fetchMyAttendanceSummary.pending, setLoading)
      .addCase(fetchMyAttendanceSummary.fulfilled, (state, action) => { state.loading = false; state.myAttendanceSummary = action.payload })
      .addCase(fetchMyAttendanceSummary.rejected, setError)

      .addCase(fetchMyPeriods.pending, setLoading)
      .addCase(fetchMyPeriods.fulfilled, (state, action) => { state.loading = false; state.myPeriods = action.payload })
      .addCase(fetchMyPeriods.rejected, setError)
  },
})

export const { clearCurrentPeriod, clearCurrentRecord, clearError } = payrollSlice.actions

export const selectPayrollPeriods     = (state: RootState) => state.payroll.periods
export const selectCurrentPeriod      = (state: RootState) => state.payroll.currentPeriod
export const selectPeriodSummary      = (state: RootState) => state.payroll.periodSummary
export const selectPayrollRecords     = (state: RootState) => state.payroll.records
export const selectCurrentRecord      = (state: RootState) => state.payroll.currentRecord
export const selectMyPayslips         = (state: RootState) => state.payroll.myPayslips
export const selectMyPeriods          = (state: RootState) => state.payroll.myPeriods
export const selectMyAttendanceSummary = (state: RootState) => state.payroll.myAttendanceSummary
export const selectPayrollLoading     = (state: RootState) => state.payroll.loading
export const selectPayrollCalculating = (state: RootState) => state.payroll.calculating
export const selectPayrollError       = (state: RootState) => state.payroll.error

export default payrollSlice.reducer
