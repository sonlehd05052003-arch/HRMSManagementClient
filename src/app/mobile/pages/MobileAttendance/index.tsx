import { useState, useEffect, useMemo } from "react";
import { Drawer, Select, Button, Tag, Skeleton, message, Form } from "antd";
import { useAndroidBack } from "../../../../hooks/useAndroidBack";
import {
    CheckCircleOutlined, LogoutOutlined,
    CalendarOutlined, SearchOutlined, ScheduleOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    checkIn, checkOut, fetchMyToday, fetchMyHistory,
    selectMyToday, selectMyHistory, selectAttendanceLoading,
    submitExplanation, submitAbsentExplanation, type AttendanceResponseDto
} from "../../../../store/attendanceSlide";
import ExplanationModal from "../../../desktop/pages/myAttendance/modal/ExplanationModal";
import { fetchLocationSettings, selectLocationSettings, fetchPayrollSettings, selectPayrollSettings } from "../../../../store/systemSettingSlide";
import {
    fetchMySchedule, selectMySchedule, selectShiftAssignmentLoading as selectScheduleLoading,
} from "../../../../store/shiftAssignmentSlide";
import CameraCaptureModal from "../../../desktop/pages/myAttendance/modal/CameraCaptureModal";
import MobilePageWrapper from "../../components/MobilePageWrapper";
import MobileCard from "../../components/MobileCard";
import { errorText, isFormValidationError } from "../../../../utils/apiError";

// ── Payroll period helpers (same logic as desktop) ────────────────────────────
interface PayrollPeriod { label: string; value: string; fromDate: string; toDate: string; }

function generatePayrollPeriods(cutOffDay: number): PayrollPeriod[] {
    const periods: PayrollPeriod[] = [];
    const today = dayjs();
    for (let i = 12; i >= -1; i--) {
        const base = today.subtract(i, "month");
        const start = base.date(cutOffDay);
        const end = start.add(1, "month").subtract(1, "day");
        const fromDate = start.format("YYYY-MM-DD");
        periods.push({
            label: `Kỳ ${start.format("MM/YYYY")} (${start.format("DD/MM")} → ${end.format("DD/MM")})`,
            value: fromDate,
            fromDate,
            toDate: end.format("YYYY-MM-DD"),
        });
    }
    return periods;
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string }> = {
    Present:         { label: "Đi làm",      color: "success"    },
    Late:            { label: "Đi trễ",      color: "warning"    },
    Absent:          { label: "Vắng mặt",    color: "error"      },
    Incomplete:      { label: "Thiếu giờ",   color: "processing" },
    PaidLeave:       { label: "Nghỉ phép",   color: "cyan"       },
    UnpaidLeave:     { label: "Nghỉ không lương", color: "purple" },
    Holiday:         { label: "Nghỉ lễ",     color: "magenta"    },
    LateEarlyLeave:  { label: "Về sớm",      color: "orange"     },
};

// ── Main component ────────────────────────────────────────────────────────────
const MobileAttendance = () => {
    const dispatch = useAppDispatch();
    const myToday = useAppSelector(selectMyToday);
    const history = useAppSelector(selectMyHistory);
    const loading = useAppSelector(selectAttendanceLoading);
    const locationSettings = useAppSelector(selectLocationSettings);
    const payrollSettings = useAppSelector(selectPayrollSettings);
    const checkInMethod = locationSettings?.checkInMethod ?? "Location";
    const cutOffDay = payrollSettings?.payrollCutOffDay ?? 1;

    const schedule = useAppSelector(selectMySchedule);
    const scheduleLoading = useAppSelector(selectScheduleLoading);

    const [activeTab, setActiveTab] = useState<"attendance" | "schedule">("attendance");
    const [checkInOpen, setCheckInOpen] = useState(false);
    const [checkOutOpen, setCheckOutOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedPeriodKey, setSelectedPeriodKey] = useState("");
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [scheduleLabel, setScheduleLabel] = useState("Tuần này");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceResponseDto | null>(null);
    const [form] = Form.useForm();

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
            handleFetchHistory();
        } catch (error) {
            if (isFormValidationError(error)) return;
            message.error(errorText(error, "Gửi giải trình thất bại."));
        }
    };

    const payrollPeriods = useMemo(() => generatePayrollPeriods(cutOffDay), [cutOffDay]);

    useEffect(() => {
        dispatch(fetchMyToday());
        dispatch(fetchLocationSettings());
        dispatch(fetchPayrollSettings());
        dispatch(fetchMySchedule({
            fromDate: dayjs().startOf("week").format("YYYY-MM-DD"),
            toDate: dayjs().endOf("month").format("YYYY-MM-DD"),
        }));
    }, [dispatch]);

    // Load current period on first load
    useEffect(() => {
        if (!payrollPeriods.length) return;
        const today = dayjs().format("YYYY-MM-DD");
        const current = payrollPeriods.find(p => today >= p.fromDate && today <= p.toDate)
            ?? payrollPeriods[payrollPeriods.length - 2];
        if (!current) return;
        setSelectedPeriodKey(current.value);
        dispatch(fetchMyHistory({ fromDate: current.fromDate, toDate: current.toDate }));
    }, [payrollPeriods.length]);

    const handleFetchHistory = () => {
        const p = payrollPeriods.find(p => p.value === selectedPeriodKey);
        if (p) dispatch(fetchMyHistory({ fromDate: p.fromDate, toDate: p.toDate }));
    };

    // ── GPS / IP location helpers ──────────────────────────────────────────────
    const getGpsCoords = (): Promise<{ latitude: number; longitude: number } | null> =>
        new Promise((resolve) => {
            if (!navigator.geolocation) { resolve(null); return; }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                () => resolve(null),
                { timeout: 10000, enableHighAccuracy: true }
            );
        });

    const getCurrentPublicIp = async (): Promise<string | undefined> => {
        try {
            const res = await fetch("https://api.ipify.org?format=json");
            const data = await res.json();
            return data.ip;
        } catch { return undefined; }
    };

    const buildLocationPayload = async () => {
        let latitude: number | undefined;
        let longitude: number | undefined;
        let ipAddress: string | undefined;
        let location: string | undefined;

        if (checkInMethod === "Location") {
            const coords = await getGpsCoords();
            if (!coords) {
                message.error("Cần quyền truy cập vị trí GPS. Vui lòng cấp quyền trong trình duyệt.");
                return null;
            }
            latitude = coords.latitude; longitude = coords.longitude;
            location = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        } else if (checkInMethod === "IP") {
            ipAddress = await getCurrentPublicIp();
            if (!ipAddress) { message.error("Không xác định được địa chỉ IP."); return null; }
            location = `IP: ${ipAddress}`;
        } else {
            const [coords, ip] = await Promise.all([getGpsCoords(), getCurrentPublicIp()]);
            latitude = coords?.latitude; longitude = coords?.longitude; ipAddress = ip;
            location = coords ? `GPS: ${latitude!.toFixed(6)}, ${longitude!.toFixed(6)}` : `IP: ${ipAddress ?? "unknown"}`;
        }
        return { latitude, longitude, ipAddress, location };
    };

    const handleCheckIn = async (faceImage: string) => {
        const payload = await buildLocationPayload();
        if (!payload) return;
        try {
            await dispatch(checkIn({ ...payload, remarks: "Check-in từ Mobile", faceImageBase64: faceImage, deviceInfo: navigator.userAgent })).unwrap();
            message.success("Check-in thành công!");
            setCheckInOpen(false);
            dispatch(fetchMyToday());
        } catch (err) { message.error(errorText(err, "Check-in thất bại")); }
    };

    const handleCheckOut = async (faceImage: string) => {
        const payload = await buildLocationPayload();
        if (!payload) return;
        try {
            await dispatch(checkOut({ ...payload, remarks: "Check-out từ Mobile", faceImageBase64: faceImage, deviceInfo: navigator.userAgent })).unwrap();
            message.success("Check-out thành công!");
            setCheckOutOpen(false);
            dispatch(fetchMyToday());
        } catch (err) { message.error(errorText(err, "Check-out thất bại")); }
    };

    useAndroidBack(checkInOpen,   () => setCheckInOpen(false));
    useAndroidBack(checkOutOpen,  () => setCheckOutOpen(false));
    useAndroidBack(historyOpen,   () => setHistoryOpen(false));
    useAndroidBack(scheduleOpen,  () => setScheduleOpen(false));

    const attendance = myToday?.attendance;
    const hasCheckedIn = !!attendance?.checkInTime;
    const hasCheckedOut = !!attendance?.checkOutTime;
    const todayStr = dayjs().format("dddd, DD/MM/YYYY");

    return (
        <MobilePageWrapper title="Chấm công của tôi">
            {/* ── Tab switcher ── */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        activeTab === "attendance"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500"
                    }`}
                    onClick={() => setActiveTab("attendance")}
                >
                    Chấm công
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        activeTab === "schedule"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500"
                    }`}
                    onClick={() => setActiveTab("schedule")}
                >
                    Lịch làm việc
                </button>
            </div>

            {activeTab === "attendance" && (
                <>
                    {/* ── Today card ── */}
                    {loading && !myToday ? (
                        <Skeleton active paragraph={{ rows: 4 }} className="mb-4" />
                    ) : (
                        <MobileCard className="mb-4">
                            <p className="text-xs text-gray-400 mb-3 capitalize">{todayStr}</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-green-50 rounded-xl p-3">
                                    <p className="text-xs text-green-600 font-medium mb-1">Giờ vào</p>
                                    <p className={`text-xl font-bold ${hasCheckedIn ? "text-green-700" : "text-gray-300"}`}>
                                        {attendance?.checkInTime ? dayjs(attendance.checkInTime).format("HH:mm") : "--:--"}
                                    </p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-3">
                                    <p className="text-xs text-blue-600 font-medium mb-1">Giờ ra</p>
                                    <p className={`text-xl font-bold ${hasCheckedOut ? "text-blue-700" : "text-gray-300"}`}>
                                        {attendance?.checkOutTime ? dayjs(attendance.checkOutTime).format("HH:mm") : "--:--"}
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-3">
                                    <p className="text-xs text-purple-600 font-medium mb-1">Giờ công</p>
                                    <p className="text-xl font-bold text-purple-700">
                                        {attendance?.workingHours ?? 0}h
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Trạng thái</p>
                                    {attendance?.status ? (
                                        <Tag color={STATUS_MAP[attendance.status]?.color ?? "default"} className="text-xs m-0">
                                            {STATUS_MAP[attendance.status]?.label ?? attendance.status}
                                        </Tag>
                                    ) : (
                                        <p className="text-sm text-gray-400">Chưa chấm</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    size="large"
                                    block
                                    onClick={() => setCheckInOpen(true)}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 border-green-600 h-12 rounded-xl font-semibold"
                                >
                                    Check In
                                </Button>
                                <Button
                                    danger
                                    type="primary"
                                    icon={<LogoutOutlined />}
                                    size="large"
                                    block
                                    onClick={() => setCheckOutOpen(true)}
                                    disabled={!hasCheckedIn || loading}
                                    className="h-12 rounded-xl font-semibold"
                                >
                                    Check Out
                                </Button>
                            </div>
                        </MobileCard>
                    )}

                    {/* ── History section ── */}
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-gray-700">Lịch sử chấm công</h2>
                        <button
                            className="text-blue-500 text-sm font-medium flex items-center gap-1"
                            onClick={() => setHistoryOpen(true)}
                        >
                            <CalendarOutlined /> Chọn kỳ
                        </button>
                    </div>

                    {loading && !history.length ? (
                        [1, 2, 3].map(i => <Skeleton key={i} active paragraph={{ rows: 1 }} className="mb-2" />)
                    ) : history.length === 0 ? (
                        <MobileCard>
                            <p className="text-center text-gray-400 text-sm py-6">Chưa có dữ liệu chấm công</p>
                        </MobileCard>
                    ) : (
                        <MobileCard className="overflow-hidden p-0">
                            {history.slice(0, 20).map((r) => {
                                let expStatus = r.explanationStatus;
                                if (!expStatus && (
                                    r.location?.includes("[INVALID]") ||
                                    r.status === "Absent" ||
                                    r.status === "Incomplete"
                                )) expStatus = "Required";

                                const canExplain = expStatus === "Required" || expStatus === "Rejected";

                                return (
                                    <div key={r.attendanceId > 0 ? r.attendanceId : `v-${r.attendanceDate}`}
                                        className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-b-0"
                                        onClick={() => canExplain && handleOpenExplanation(r)}
                                    >
                                        <div className="flex-1 min-w-0 mr-2">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {dayjs(r.attendanceDate).format("DD/MM/YYYY")}
                                                </p>
                                                {canExplain && (
                                                    <ExclamationCircleOutlined className="text-red-500 text-xs" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {r.checkInTime ? dayjs(r.checkInTime).format("HH:mm") : "--:--"}
                                                {" → "}
                                                {r.checkOutTime ? dayjs(r.checkOutTime).format("HH:mm") : "--:--"}
                                                {r.workingHours ? ` · ${r.workingHours}h` : ""}
                                            </p>
                                            {expStatus === "Pending" && (
                                                <p className="text-[10px] text-yellow-600 mt-0.5">Đang chờ duyệt giải trình</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Tag color={STATUS_MAP[r.status]?.color ?? "default"} className="text-xs m-0">
                                                {STATUS_MAP[r.status]?.label ?? r.status}
                                            </Tag>
                                            {canExplain && (
                                                <Button size="small" type="primary" danger ghost className="text-[10px] px-2 h-5 mt-1" onClick={(e) => { e.stopPropagation(); handleOpenExplanation(r); }}>
                                                    Giải trình
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </MobileCard>
                    )}
                </>
            )}

            {activeTab === "schedule" && (
                <>
                    {/* ── Schedule header ── */}
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-gray-700">Lịch làm việc</h2>
                        <button
                            className="text-blue-500 text-sm font-medium flex items-center gap-1"
                            onClick={() => setScheduleOpen(true)}
                        >
                            <ScheduleOutlined /> {scheduleLabel}
                        </button>
                    </div>

                    {scheduleLoading && !schedule.length ? (
                        [1, 2, 3].map(i => <Skeleton key={i} active paragraph={{ rows: 1 }} className="mb-2" />)
                    ) : schedule.length === 0 ? (
                        <MobileCard>
                            <p className="text-center text-gray-400 text-sm py-6">Không có lịch làm việc</p>
                        </MobileCard>
                    ) : (
                        <MobileCard className="overflow-hidden p-0">
                            {schedule.map((s) => (
                                <div
                                    key={s.assignmentId}
                                    className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-b-0"
                                >
                                    <div className="flex-1 min-w-0 mr-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-medium text-gray-800">
                                                {dayjs(s.assignmentDate).format("DD/MM/YYYY")}
                                            </p>
                                            <span className="text-xs text-gray-400 capitalize">
                                                {dayjs(s.assignmentDate).format("dddd")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <Tag color="blue" className="text-xs m-0">{s.shiftCode}</Tag>
                                            <span className="text-xs text-gray-600 truncate">{s.shiftName}</span>
                                            {s.startTime && s.endTime && (
                                                <Tag color="orange" className="text-xs m-0">
                                                    {s.startTime.slice(0, 5)}–{s.endTime.slice(0, 5)}
                                                </Tag>
                                            )}
                                        </div>
                                    </div>
                                    <Tag
                                        color={s.status === "Active" ? "success" : "default"}
                                        className="text-xs flex-shrink-0"
                                    >
                                        {s.status === "Active" ? "Đang áp dụng" : "Đã hủy"}
                                    </Tag>
                                </div>
                            ))}
                        </MobileCard>
                    )}
                </>
            )}

            {/* ── Schedule period drawer ── */}
            <Drawer
                title="Chọn khoảng thời gian"
                placement="bottom"
                height="auto"
                open={scheduleOpen}
                onClose={() => setScheduleOpen(false)}
                styles={{ body: { padding: "16px" } }}
            >
                <div className="grid grid-cols-2 gap-3">
                    {([
                        {
                            label: "Tuần này",
                            fromDate: dayjs().startOf("week").format("YYYY-MM-DD"),
                            toDate: dayjs().endOf("week").format("YYYY-MM-DD"),
                        },
                        {
                            label: "Tuần tới",
                            fromDate: dayjs().add(1, "week").startOf("week").format("YYYY-MM-DD"),
                            toDate: dayjs().add(1, "week").endOf("week").format("YYYY-MM-DD"),
                        },
                        {
                            label: "Tháng này",
                            fromDate: dayjs().startOf("month").format("YYYY-MM-DD"),
                            toDate: dayjs().endOf("month").format("YYYY-MM-DD"),
                        },
                        {
                            label: "Tháng tới",
                            fromDate: dayjs().add(1, "month").startOf("month").format("YYYY-MM-DD"),
                            toDate: dayjs().add(1, "month").endOf("month").format("YYYY-MM-DD"),
                        },
                    ] as { label: string; fromDate: string; toDate: string }[]).map((preset) => (
                        <Button
                            key={preset.label}
                            type={scheduleLabel === preset.label ? "primary" : "default"}
                            block
                            size="large"
                            className="rounded-xl h-12"
                            onClick={() => {
                                setScheduleLabel(preset.label);
                                dispatch(fetchMySchedule({ fromDate: preset.fromDate, toDate: preset.toDate }));
                                setScheduleOpen(false);
                            }}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
            </Drawer>

            {/* ── Period selector drawer ── */}
            <Drawer
                title="Chọn kỳ chấm công"
                placement="bottom"
                height="auto"
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                styles={{ body: { padding: "16px" } }}
            >
                <Select
                    className="w-full mb-4"
                    value={selectedPeriodKey || undefined}
                    onChange={setSelectedPeriodKey}
                    options={payrollPeriods.map(p => ({ label: p.label, value: p.value }))}
                    size="large"
                    suffixIcon={<CalendarOutlined />}
                    placeholder="Chọn kỳ lương"
                />
                <Button
                    type="primary"
                    block
                    size="large"
                    icon={<SearchOutlined />}
                    className="rounded-xl h-12"
                    onClick={() => { handleFetchHistory(); setHistoryOpen(false); }}
                >
                    Xem kỳ này
                </Button>
            </Drawer>

            {/* ── Camera modals ── */}
            <CameraCaptureModal
                open={checkInOpen}
                title="Check In"
                onCancel={() => setCheckInOpen(false)}
                onCapture={handleCheckIn}
                loading={loading}
            />
            <CameraCaptureModal
                open={checkOutOpen}
                title="Check Out"
                onCancel={() => setCheckOutOpen(false)}
                onCapture={handleCheckOut}
                loading={loading}
            />
            <ExplanationModal
                open={modalOpen}
                loading={loading}
                selectedRecord={selectedRecord}
                form={form}
                onOk={handleSubmitExplanation}
                onCancel={() => setModalOpen(false)}
            />
        </MobilePageWrapper>
    );
};

export default MobileAttendance;
