import { useEffect, useMemo } from "react";
import {
    Alert,
    AutoComplete,
    Form,
    Input,
    Modal,
    Radio,
    Select,
    Space,
    Tag,
    TimePicker,
    Typography,
    Divider,
} from "antd";
import {
    ExclamationCircleOutlined,
    BulbOutlined,
    CalendarOutlined,
    CloseCircleOutlined,
    SendOutlined,
    ClockCircleOutlined,
    ScheduleOutlined,
} from "@ant-design/icons";
import type { FormInstance } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import type { AttendanceResponseDto } from "../../../../../store/attendanceSlide";
import { fetchMyBalance, selectMyLeaveBalances } from "../../../../../store/leaveBalanceSlide";
import { fetchActiveLeaveTypes, selectActiveLeaveTypes } from "../../../../../store/leaveTypeSlide";
import {
    SUGGESTIONS_INVALID_LOCATION,
    SUGGESTIONS_ABSENT,
    SUGGESTIONS_INCOMPLETE,
    CASE_CONFIG,
} from "../../../../../constants/explanationTemplates";

const { Text } = Typography;

interface ExplanationModalProps {
    open: boolean;
    loading: boolean;
    selectedRecord: AttendanceResponseDto | null;
    form: FormInstance;
    onOk: () => void;
    onCancel: () => void;
}

const TIME_BASE_DATE = "2000-01-01";

const parseTimeValue = (value?: string) => {
    if (!value) return undefined;
    return dayjs(`${TIME_BASE_DATE}T${value}`);
};

const formatWindow = (value?: string) => (value ? dayjs(value).format("HH:mm") : "—");

const buildRequestedDateTime = (
    attendanceDate: string,
    value: Dayjs,
    shiftStartTime?: string,
    shiftIsOvernight?: boolean,
    isCheckOut?: boolean
) => {
    let dateTime = dayjs(`${attendanceDate}T${value.format("HH:mm:ss")}`);
    if (
        isCheckOut &&
        shiftIsOvernight &&
        shiftStartTime &&
        value.isBefore(dayjs(`${TIME_BASE_DATE}T${shiftStartTime}`))
    ) {
        dateTime = dateTime.add(1, "day");
    }
    return dateTime;
};

const ExplanationModal: React.FC<ExplanationModalProps> = ({
    open, loading, selectedRecord, form, onOk, onCancel
}) => {
    const dispatch = useAppDispatch();
    const leaveBalances = useAppSelector(selectMyLeaveBalances);
    const leaveTypes = useAppSelector(selectActiveLeaveTypes);

    const isInvalidLocation = selectedRecord?.location?.includes("[INVALID]");
    const isAbsent = selectedRecord?.status === "Absent";
    const needsCheckIn = !selectedRecord?.checkInTime;
    const needsCheckOut = !selectedRecord?.checkOutTime;

    const cfg = isInvalidLocation
        ? CASE_CONFIG.location
        : isAbsent
        ? CASE_CONFIG.absent
        : CASE_CONFIG.incomplete;

    const suggestions = isInvalidLocation
        ? SUGGESTIONS_INVALID_LOCATION
        : isAbsent
        ? SUGGESTIONS_ABSENT
        : SUGGESTIONS_INCOMPLETE;

    const defaultExplanationType = isAbsent
        ? (selectedRecord?.explanationType ?? "LeaveRequest")
        : (needsCheckIn || needsCheckOut ? "Regularization" : undefined);

    const explanationTypeValue = Form.useWatch("explanationType", form) ?? defaultExplanationType;
    const messageValue: string = Form.useWatch("message", form) ?? "";
    const isRejected = selectedRecord?.explanationStatus === "Rejected";
    const isLeaveRequest = explanationTypeValue === "LeaveRequest";
    const isRegularization = explanationTypeValue === "Regularization";

    useEffect(() => {
        if (!open || !selectedRecord) return;

        form.setFieldsValue({
            message: selectedRecord.explanationMessage ?? "",
            explanationType: defaultExplanationType,
            leaveTypeId: selectedRecord.explanationLeaveTypeId,
            requestedCheckInTime: parseTimeValue(selectedRecord.explanationRequestedCheckInTime),
            requestedCheckOutTime: parseTimeValue(selectedRecord.explanationRequestedCheckOutTime),
        });

        if (isAbsent) {
            dispatch(fetchMyBalance());
            dispatch(fetchActiveLeaveTypes());
        }
    }, [defaultExplanationType, dispatch, form, isAbsent, open, selectedRecord]);

    const options = useMemo(() =>
        suggestions
            .filter(s => !messageValue.trim() || s.toLowerCase().includes(messageValue.toLowerCase()))
            .map(s => ({ value: s, label: s })),
        [suggestions, messageValue]
    );

    const leaveBalanceMap = useMemo(
        () => new Map(leaveBalances.map(item => [item.leaveTypeId, item])),
        [leaveBalances]
    );

    const leaveTypeOptions = useMemo(
        () =>
            leaveTypes
                .filter(item => item.isActive)
                .filter(item => item.annualEntitlement <= 0 || (leaveBalanceMap.get(item.leaveTypeId)?.remainingDays ?? 0) >= 1)
                .map(item => {
                    const balance = leaveBalanceMap.get(item.leaveTypeId);
                    const remainingText = item.annualEntitlement <= 0
                        ? "không giới hạn"
                        : `${balance?.remainingDays ?? 0} ngày còn lại`;

                    return {
                        label: `${item.leaveTypeName} (${remainingText})`,
                        value: item.leaveTypeId,
                    };
                }),
        [leaveBalanceMap, leaveTypes]
    );

    const validateRequestedTime = (isCheckOutField: boolean) => async (_: unknown, value?: Dayjs) => {
        if (!value || !selectedRecord) return Promise.resolve();

        const requested = buildRequestedDateTime(
            selectedRecord.attendanceDate,
            value,
            selectedRecord.shiftStartTime,
            selectedRecord.shiftIsOvernight,
            isCheckOutField
        );

        const allowedFrom = isCheckOutField ? selectedRecord.allowedCheckOutFrom : selectedRecord.allowedCheckInFrom;
        const allowedTo = isCheckOutField ? selectedRecord.allowedCheckOutTo : selectedRecord.allowedCheckInTo;

        if (allowedFrom && requested.isBefore(dayjs(allowedFrom))) {
            return Promise.reject(new Error("Thời gian đã chọn sớm hơn khung ca cho phép."));
        }

        if (allowedTo && requested.isAfter(dayjs(allowedTo))) {
            return Promise.reject(new Error("Thời gian đã chọn muộn hơn khung ca cho phép."));
        }

        const otherFieldName = isCheckOutField ? "requestedCheckInTime" : "requestedCheckOutTime";
        const otherValue = form.getFieldValue(otherFieldName) as Dayjs | undefined;

        const finalCheckIn = otherFieldName === "requestedCheckInTime" && otherValue
            ? buildRequestedDateTime(
                selectedRecord.attendanceDate,
                otherValue,
                selectedRecord.shiftStartTime,
                selectedRecord.shiftIsOvernight,
                false
            )
            : selectedRecord.checkInTime
            ? dayjs(selectedRecord.checkInTime)
            : undefined;

        const finalCheckOut = otherFieldName === "requestedCheckOutTime" && otherValue
            ? buildRequestedDateTime(
                selectedRecord.attendanceDate,
                otherValue,
                selectedRecord.shiftStartTime,
                selectedRecord.shiftIsOvernight,
                true
            )
            : selectedRecord.checkOutTime
            ? dayjs(selectedRecord.checkOutTime)
            : undefined;

        const currentCheckIn = isCheckOutField ? finalCheckIn : requested;
        const currentCheckOut = isCheckOutField ? requested : finalCheckOut;

        if (currentCheckIn && currentCheckOut && !currentCheckOut.isAfter(currentCheckIn)) {
            return Promise.reject(new Error("Giờ check-out phải lớn hơn giờ check-in."));
        }

        return Promise.resolve();
    };

    return (
        <Modal
            title={
                <Space>
                    <ExclamationCircleOutlined style={{ color: "#fa8c16", fontSize: 16 }} />
                    <span style={{ fontWeight: 600 }}>Phiếu giải trình chấm công</span>
                </Space>
            }
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            okText={<Space><SendOutlined />Gửi giải trình</Space>}
            cancelText="Hủy"
            confirmLoading={loading}
            okButtonProps={{ size: "middle" }}
            cancelButtonProps={{ size: "middle" }}
            destroyOnHidden
            width={580}
        >
            {selectedRecord && (
                <div
                    style={{
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        borderRadius: 10,
                        padding: "12px 16px",
                        marginBottom: 16,
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                    }}
                >
                    <span style={{ fontSize: 20, color: cfg.color, marginTop: 2 }}>{cfg.icon}</span>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <Tag color={cfg.tagColor} style={{ margin: 0 }}>
                                {cfg.label}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {dayjs(selectedRecord.attendanceDate).format("dddd, DD/MM/YYYY")}
                            </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: "block" }}>
                            Giờ công ngày này đang bị tạm khóa chờ giải trình được phê duyệt.
                        </Text>
                    </div>
                </div>
            )}

            {isRejected && selectedRecord?.explanationResponse && (
                <div
                    style={{
                        background: "#fff1f0",
                        border: "1px solid #ffa39e",
                        borderRadius: 10,
                        padding: "10px 14px",
                        marginBottom: 16,
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                    }}
                >
                    <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 16, marginTop: 2 }} />
                    <div>
                        <Text strong style={{ color: "#cf1322" }}>Phiếu bị từ chối</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            "{selectedRecord.explanationResponse}"
                        </Text>
                    </div>
                </div>
            )}

            <Divider style={{ margin: "0 0 16px" }} />

            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <BulbOutlined style={{ color: "#faad14" }} />
                <Text strong>Lý do giải trình</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>— nhập hoặc chọn gợi ý từ danh sách</Text>
            </div>

            <Form form={form} layout="vertical" style={{ marginBottom: 12 }}>
                {isAbsent && (
                    <Form.Item
                        name="explanationType"
                        label="Hình thức xử lý"
                        rules={[{ required: true, message: "Vui lòng chọn hình thức xử lý." }]}
                    >
                        <Radio.Group optionType="button" buttonStyle="solid">
                            <Radio.Button value="LeaveRequest">Chuyển sang nghỉ phép</Radio.Button>
                            <Radio.Button value="Regularization">Bổ sung giờ chấm công</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                )}

                {selectedRecord?.shiftName && (
                    <Alert
                        type="info"
                        showIcon
                        icon={<ScheduleOutlined />}
                        style={{ marginBottom: 16 }}
                        message={`Ca làm: ${selectedRecord.shiftName}`}
                        description={
                            <Space direction="vertical" size={4}>
                                <Text type="secondary">
                                    Giờ ca: {selectedRecord.shiftStartTime?.slice(0, 5) ?? "—"} - {selectedRecord.shiftEndTime?.slice(0, 5) ?? "—"}
                                    {selectedRecord.shiftIsOvernight ? " (qua đêm)" : ""}
                                </Text>
                                <Text type="secondary">
                                    Check-in hợp lệ: {formatWindow(selectedRecord.allowedCheckInFrom)} - {formatWindow(selectedRecord.allowedCheckInTo)}
                                </Text>
                                <Text type="secondary">
                                    Check-out hợp lệ: {formatWindow(selectedRecord.allowedCheckOutFrom)} - {formatWindow(selectedRecord.allowedCheckOutTo)}
                                </Text>
                            </Space>
                        }
                    />
                )}

                {isLeaveRequest && (
                    <>
                        <Form.Item
                            name="leaveTypeId"
                            label="Loại phép muốn dùng"
                            rules={[{ required: true, message: "Vui lòng chọn loại phép." }]}
                        >
                            <Select
                                placeholder="Chọn loại phép còn khả dụng"
                                options={leaveTypeOptions}
                                notFoundContent="Không có loại phép phù hợp với số dư hiện tại"
                            />
                        </Form.Item>
                        <Alert
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                            message="Manager sẽ duyệt ngày vắng này như một đơn nghỉ phép."
                        />
                    </>
                )}

                {isRegularization && (
                    <>
                        {needsCheckIn && (
                            <Form.Item
                                name="requestedCheckInTime"
                                label="Giờ check-in đề xuất"
                                rules={[
                                    { required: true, message: "Vui lòng chọn giờ check-in." },
                                    { validator: validateRequestedTime(false) },
                                ]}
                                help={`Khung hợp lệ: ${formatWindow(selectedRecord?.allowedCheckInFrom)} - ${formatWindow(selectedRecord?.allowedCheckInTo)}`}
                            >
                                <TimePicker format="HH:mm" className="w-full" minuteStep={5} />
                            </Form.Item>
                        )}

                        {needsCheckOut && (
                            <Form.Item
                                name="requestedCheckOutTime"
                                label="Giờ check-out đề xuất"
                                rules={[
                                    { required: true, message: "Vui lòng chọn giờ check-out." },
                                    { validator: validateRequestedTime(true) },
                                ]}
                                help={`Khung hợp lệ: ${formatWindow(selectedRecord?.allowedCheckOutFrom)} - ${formatWindow(selectedRecord?.allowedCheckOutTo)}`}
                            >
                                <TimePicker format="HH:mm" className="w-full" minuteStep={5} />
                            </Form.Item>
                        )}

                        <Alert
                            type="info"
                            showIcon
                            icon={<ClockCircleOutlined />}
                            style={{ marginBottom: 16 }}
                            message="Manager sẽ duyệt theo giờ bạn đã tự khai báo."
                        />
                    </>
                )}

                <Form.Item
                    name="message"
                    rules={[{ required: true, message: "Vui lòng nhập lý do giải trình!" }]}
                    style={{ marginBottom: 0 }}
                >
                    <AutoComplete
                        options={options}
                        style={{ width: "100%" }}
                        popupMatchSelectWidth
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Nhập lý do hoặc gõ để lọc gợi ý từ danh sách..."
                            showCount
                            maxLength={500}
                            style={{ borderRadius: 8 }}
                        />
                    </AutoComplete>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ExplanationModal;
