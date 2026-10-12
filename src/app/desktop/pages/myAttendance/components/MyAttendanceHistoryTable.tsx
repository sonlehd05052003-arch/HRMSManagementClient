import { useState, useEffect, useMemo } from "react";
import { Button, Space, Select, Card, Tooltip, message, Form, Alert, Typography, Row, Col, Statistic, Divider } from "antd";
import {
    SearchOutlined, ReloadOutlined, ExclamationCircleOutlined,
    ClockCircleOutlined, CheckCircleOutlined,
    CalendarOutlined, ThunderboltOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import {
    fetchMyHistory, selectMyHistory, selectAttendanceLoading,
    submitExplanation, submitAbsentExplanation, type AttendanceResponseDto
} from "../../../../../store/attendanceSlide";
import { fetchPayrollSettings, selectPayrollSettings } from "../../../../../store/systemSettingSlide";
import dayjs from "dayjs";
import ExplanationModal from "../modal/ExplanationModal";
import { errorText, isFormValidationError } from "../../../../../utils/apiError";

const { Text } = Typography;

// ─── Payroll Period Utilities ──────────────────────────────────────────────────

interface PayrollPeriod {
    label: string;
    value: string;
    fromDate: string;
    toDate: string;
    displayLabel: string;
}

function generatePayrollPeriods(cutOffDay: number): PayrollPeriod[] {
    const periods: PayrollPeriod[] = [];
    const today = dayjs();

    for (let i = 12; i >= -1; i--) {
        const base = today.subtract(i, "month");
        const periodStart = base.date(cutOffDay);
        const periodEnd = periodStart.add(1, "month").subtract(1, "day");

        const fromDate = periodStart.format("YYYY-MM-DD");
        const toDate = periodEnd.format("YYYY-MM-DD");
        const monthLabel = periodStart.format("MM/YYYY");

        periods.push({
            label: `Kỳ ${monthLabel}`,
            value: fromDate,
            fromDate,
            toDate,
            displayLabel: `Kỳ ${monthLabel}  (${periodStart.format("DD/MM")} → ${periodEnd.format("DD/MM/YYYY")})`
        });
    }

    return periods;
}

function getCurrentPeriod(periods: PayrollPeriod[]): PayrollPeriod | undefined {
    const today = dayjs().format("YYYY-MM-DD");
    return periods.find(p => today >= p.fromDate && today <= p.toDate);
}

// ─── Calendar cell styles ──────────────────────────────────────────────────────

const CELL_STYLE: Record<string, { bg: string; border: string; text: string }> = {
    Present:        { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700"    },
    Late:           { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700"   },
    Absent:         { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-600"     },
    Incomplete:     { bg: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700"  },
    PaidLeave:      { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
    UnpaidLeave:    { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700"  },
    LateEarlyLeave: { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700"  },
    default:        { bg: "bg-gray-50",    border: "border-gray-100",    text: "text-gray-400"    },
};

const STATUS_LABEL: Record<string, string> = {
    Present:        "Có mặt",
    Late:           "Đi trễ",
    Absent:         "Vắng",
    Incomplete:     "Thiếu giờ",
    PaidLeave:      "Nghỉ phép",
    UnpaidLeave:    "Nghỉ NL",
    LateEarlyLeave: "Về sớm",
};

// ──────────────────────────────────────────────────────────────────────────────

const MyAttendanceHistoryTable = () => {
    const dispatch = useAppDispatch();
    const records = useAppSelector(selectMyHistory);
    const loading = useAppSelector(selectAttendanceLoading);
    const payrollSettings = useAppSelector(selectPayrollSettings);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceResponseDto | null>(null);
    const [form] = Form.useForm();

    const cutOffDay = payrollSettings?.payrollCutOffDay ?? 1;
    const payrollPeriods = useMemo(() => generatePayrollPeriods(cutOffDay), [cutOffDay]);
    const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>("");

    useEffect(() => {
        dispatch(fetchPayrollSettings());
    }, [dispatch]);

    useEffect(() => {
        if (payrollPeriods.length === 0) return;
        const current = getCurrentPeriod(payrollPeriods) ?? payrollPeriods[payrollPeriods.length - 2];
        if (!current) return;
        setSelectedPeriodKey(current.value);
        dispatch(fetchMyHistory({ fromDate: current.fromDate, toDate: current.toDate }));
    }, [payrollPeriods]);

    const selectedPeriod = useMemo(
        () => payrollPeriods.find(p => p.value === selectedPeriodKey),
        [payrollPeriods, selectedPeriodKey]
    );

    const handleSearch = () => {
        if (!selectedPeriod) return;
        dispatch(fetchMyHistory({ fromDate: selectedPeriod.fromDate, toDate: selectedPeriod.toDate }));
    };

    const handleCurrentPeriod = () => {
        const current = getCurrentPeriod(payrollPeriods);
        if (!current) return;
        setSelectedPeriodKey(current.value);
        dispatch(fetchMyHistory({ fromDate: current.fromDate, toDate: current.toDate }));
    };

    const handleOpenExplanation = (record: AttendanceResponseDto) => {
        setSelectedRecord(record);
        form.resetFields();
        if (record.explanationMessage) form.setFieldValue("message", record.explanationMessage);
        setModalOpen(true);
    };

    const handleSubmitExplanation = async () => {
        try {
            const values = await form.validateFields();
            if (!selectedRecord) return;

            const payload = {
                message: values.message,
                explanationType: values.explanationType,
                leaveTypeId: values.explanationType === "LeaveRequest" ? values.leaveTypeId : undefined,
                requestedCheckInTime: values.requestedCheckInTime
                    ? values.requestedCheckInTime.format("HH:mm:ss")
                    : undefined,
                requestedCheckOutTime: values.requestedCheckOutTime
                    ? values.requestedCheckOutTime.format("HH:mm:ss")
                    : undefined,
            };

            if (selectedRecord.attendanceId === 0) {
                await dispatch(submitAbsentExplanation({
                    attendanceDate: selectedRecord.attendanceDate,
                    ...payload,
                })).unwrap();
            } else {
                await dispatch(submitExplanation({
                    attendanceId: selectedRecord.attendanceId,
                    ...payload,
                })).unwrap();
            }

            message.success("Phiếu giải trình đã được gửi. Đang chờ Quản lý duyệt.");
            setModalOpen(false);
            handleSearch();
        } catch (error) {
            if (isFormValidationError(error)) return;
            message.error(errorText(error, "Gửi giải trình thất bại."));
        }
    };

    const summary = useMemo(() => {
        const totalRecords = records.length;
        const presentDays = records.filter(r =>
            r.status === "Present" || r.status === "Late" || r.status === "PaidLeave"
        ).length;
        const totalWorkingHours = records.reduce((sum, r) => sum + (r.workingHours ?? 0), 0);
        const totalOvertimeHours = records.reduce((sum, r) => sum + (r.payrollOvertimeHours ?? 0), 0);
        return { totalRecords, presentDays, totalWorkingHours, totalOvertimeHours };
    }, [records]);

    const requiredCount = records.filter(r =>
        r.explanationStatus === "Required" ||
        (r.location?.includes("[INVALID]") && !r.explanationStatus) ||
        ((r.status === "Absent" || r.status === "Incomplete") && !r.explanationStatus)
    ).length;

    // ─── Calendar renderer ─────────────────────────────────────────────────────

    const renderCalendar = () => {
        if (!selectedPeriod) return (
            <div className="text-center py-12 text-gray-400">Chọn kỳ để xem lịch chấm công</div>
        );

        const days: dayjs.Dayjs[] = [];
        let cur = dayjs(selectedPeriod.fromDate);
        const end = dayjs(selectedPeriod.toDate);
        while (!cur.isAfter(end)) { days.push(cur); cur = cur.add(1, "day"); }

        const recMap = new Map<string, AttendanceResponseDto>();
        records.forEach(r => recMap.set(dayjs(r.attendanceDate).format("YYYY-MM-DD"), r));

        const firstDow = days[0].day();
        const offset = firstDow === 0 ? 6 : firstDow - 1;
        const cells: (dayjs.Dayjs | null)[] = [...Array(offset).fill(null), ...days];
        while (cells.length % 7 !== 0) cells.push(null);

        return (
            <div className="overflow-x-auto">
                <div className="min-w-[360px]">
                    {/* Week headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((h, i) => (
                            <div key={h} className={`text-center text-xs font-semibold py-1.5 rounded-md select-none
                                ${i >= 5 ? "bg-red-50 text-red-400" : "bg-gray-100 text-gray-500"}`}>
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((day, idx) => {
                            if (!day) return <div key={`e${idx}`} className="h-20 rounded-lg" />;

                            const dateStr = day.format("YYYY-MM-DD");
                            const rec = recMap.get(dateStr);
                            const isWeekend = day.day() === 0 || day.day() === 6;

                            let expStatus = rec?.explanationStatus;
                            if (rec && !expStatus && (
                                rec.location?.includes("[INVALID]") ||
                                rec.status === "Absent" ||
                                rec.status === "Incomplete"
                            )) expStatus = "Required";

                            const canExplain = expStatus === "Required" || expStatus === "Rejected";
                            const cfg = isWeekend
                                ? CELL_STYLE.default
                                : (rec?.status ? (CELL_STYLE[rec.status] ?? CELL_STYLE.default) : CELL_STYLE.default);

                            const statusLabel = rec?.status
                                ? (STATUS_LABEL[rec.status] ?? rec.status)
                                : (isWeekend ? "Nghỉ" : "—");

                            const tooltipParts = [
                                `${day.format("DD/MM")} – ${statusLabel}`,
                                rec?.workingHours ? `${rec.workingHours.toFixed(1)}h` : null,
                                (rec?.payrollOvertimeHours ?? 0) > 0 ? `OT ${(rec?.payrollOvertimeHours ?? 0).toFixed(1)}h` : null,
                            ].filter(Boolean).join(" · ");

                            return (
                                <Tooltip key={dateStr} title={tooltipParts}>
                                    <div
                                        className={`
                                            rounded-lg border h-20 p-1.5 flex flex-col justify-between
                                            select-none transition-all
                                            ${cfg.bg} ${cfg.border}
                                            ${isWeekend ? "opacity-50" : ""}
                                            ${canExplain ? "cursor-pointer hover:opacity-80 ring-1 ring-red-300" : "cursor-default"}
                                        `}
                                        onClick={() => canExplain && rec && handleOpenExplanation(rec)}
                                    >
                                        <div className="flex items-start justify-between gap-0.5">
                                            <span className={`text-sm font-bold leading-none ${cfg.text}`}>
                                                {day.date()}
                                            </span>
                                            <div className="flex flex-col gap-0.5 items-end">
                                                {expStatus === "Required" && (
                                                    <span className="text-[8px] font-bold px-1 rounded bg-red-100 text-red-600 leading-tight">!</span>
                                                )}
                                                {expStatus === "Pending" && (
                                                    <span className="text-[8px] font-bold px-1 rounded bg-yellow-100 text-yellow-700 leading-tight">đợi</span>
                                                )}
                                                {expStatus === "Rejected" && (
                                                    <span className="text-[8px] font-bold px-1 rounded bg-red-100 text-red-600 leading-tight">x</span>
                                                )}
                                                {expStatus === "Approved" && (
                                                    <span className="text-[8px] font-bold px-1 rounded bg-green-100 text-green-700 leading-tight">ok</span>
                                                )}
                                                {(rec?.payrollOvertimeHours ?? 0) > 0 && (
                                                    <span className="text-[8px] font-bold px-1 rounded bg-purple-100 text-purple-600 leading-tight">OT</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className={`text-[10px] font-medium leading-tight truncate ${cfg.text}`}>
                                                {statusLabel !== "—" ? statusLabel : ""}
                                            </div>
                                            {(rec?.workingHours ?? 0) > 0 && (
                                                <div className={`text-[9px] leading-none ${cfg.text} opacity-70`}>
                                                    {(rec?.workingHours ?? 0).toFixed(1)}h
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Tooltip>
                            );
                        })}
                    </div>

                    {/* Footer: totals + legend */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                        <div className="flex items-center gap-4">
                            {records.length > 0 && (
                                <>
                                    <div className="text-sm">
                                        <span className="text-gray-500 text-xs">Tổng giờ công: </span>
                                        <span className="font-semibold text-gray-800">{summary.totalWorkingHours.toFixed(1)}h</span>
                                    </div>
                                    {summary.totalOvertimeHours > 0 && (
                                        <div className="text-sm">
                                            <span className="text-gray-500 text-xs">Tăng ca: </span>
                                            <span className="font-semibold text-purple-600">{summary.totalOvertimeHours.toFixed(1)}h</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                            {[
                                { dot: "bg-blue-500",    label: "Có mặt"    },
                                { dot: "bg-amber-500",   label: "Đi trễ"    },
                                { dot: "bg-red-500",     label: "Vắng"      },
                                { dot: "bg-indigo-500",  label: "Thiếu giờ" },
                                { dot: "bg-emerald-500", label: "Nghỉ phép" },
                                { dot: "bg-violet-500",  label: "Nghỉ NL"   },
                            ].map(l => (
                                <span key={l.label} className="flex items-center gap-1">
                                    <span className={`inline-block w-2 h-2 rounded-full ${l.dot}`} />
                                    <span className="text-[10px] text-gray-500">{l.label}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ──────────────────────────────────────────────────────────────────────────

    return (
        <Card
            title={
                <Space>
                    <CalendarOutlined className="text-blue-500" />
                    <span>Lịch sử chấm công của tôi</span>
                </Space>
            }
            className="shadow-sm rounded-xl"
            style={{ overflow: "hidden" }}
        >
            {requiredCount > 0 && (
                <Alert
                    type="warning" showIcon icon={<ExclamationCircleOutlined />} className="!mb-4"
                    message={`Bạn có ${requiredCount} ngày chấm công cần giải trình. Giờ công những ngày này đang bị tạm khóa.`}
                />
            )}

            {/* ── Bộ lọc kỳ lương ── */}
            <Space className="mb-4" wrap style={{ rowGap: 8 }}>
                <Select
                    style={{ width: "min(320px, 100%)" }}
                    value={selectedPeriodKey || undefined}
                    onChange={setSelectedPeriodKey}
                    options={payrollPeriods.map(p => ({ label: p.displayLabel, value: p.value }))}
                    suffixIcon={<CalendarOutlined />}
                    placeholder="Chọn kỳ lương"
                />
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>
                    Xem
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleCurrentPeriod}>
                    Kỳ hiện tại
                </Button>
            </Space>

            {/* ── Thông tin kỳ đang xem ── */}
            {selectedPeriod && (
                <div className="mb-4 text-sm text-slate-500 flex items-center gap-2">
                    <CalendarOutlined />
                    <span>
                        Đang xem: <strong>{selectedPeriod.displayLabel}</strong>
                        &nbsp;·&nbsp; Ngày chốt: <strong>ngày {cutOffDay} hàng tháng</strong>
                    </span>
                </div>
            )}

            {/* ── 4 thẻ thống kê ── */}
            {records.length > 0 && (
                <>
                    <Row gutter={[12, 12]} className="mb-4">
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small" className="bg-blue-50 border-blue-200 text-center">
                                <Statistic
                                    title={<span className="text-blue-600 text-xs font-medium">Tổng bản ghi</span>}
                                    value={summary.totalRecords}
                                    suffix="ngày"
                                    valueStyle={{ color: "#1d4ed8", fontSize: 20 }}
                                    prefix={<CalendarOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small" className="bg-green-50 border-green-200 text-center">
                                <Statistic
                                    title={<span className="text-green-600 text-xs font-medium">Ngày có mặt</span>}
                                    value={summary.presentDays}
                                    suffix="ngày"
                                    valueStyle={{ color: "#15803d", fontSize: 20 }}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small" className="bg-indigo-50 border-indigo-200 text-center">
                                <Statistic
                                    title={<span className="text-indigo-600 text-xs font-medium">Tổng giờ công</span>}
                                    value={summary.totalWorkingHours}
                                    precision={1}
                                    suffix="h"
                                    valueStyle={{ color: "#4338ca", fontSize: 20 }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card size="small" className="bg-orange-50 border-orange-200 text-center">
                                <Statistic
                                    title={<span className="text-orange-600 text-xs font-medium">Tổng giờ OT (tính lương)</span>}
                                    value={summary.totalOvertimeHours}
                                    precision={1}
                                    suffix="h"
                                    valueStyle={{ color: "#c2410c", fontSize: 20 }}
                                    prefix={<ThunderboltOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Divider style={{ margin: "0 0 16px 0" }} />
                </>
            )}

            {/* ── Calendar ── */}
            {renderCalendar()}

            {requiredCount > 0 && (
                <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                    <ExclamationCircleOutlined />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Nhấn vào ô có dấu <strong>!</strong> hoặc <strong>x</strong> để gửi giải trình
                    </Text>
                </div>
            )}

            {/* ── Modal giải trình ── */}
            <ExplanationModal
                open={modalOpen}
                loading={loading}
                selectedRecord={selectedRecord}
                form={form}
                onOk={handleSubmitExplanation}
                onCancel={() => setModalOpen(false)}
            />
        </Card>
    );
};

export default MyAttendanceHistoryTable;
