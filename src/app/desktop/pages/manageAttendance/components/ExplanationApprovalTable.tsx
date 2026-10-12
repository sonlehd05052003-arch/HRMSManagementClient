import { useEffect, useState } from "react";
import { Table, Button, Space, Card, Tag, Modal, Input, message, Form, Alert, Badge, Typography, TimePicker, Row, Col, Tooltip } from "antd";
import {
    ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
    FileTextOutlined, ClockCircleOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import {
    fetchPendingExplanations, approveExplanation, selectPendingExplanations, selectPendingExplanationsTotal,
    selectAttendanceLoading, type AttendanceResponseDto
} from "../../../../../store/attendanceSlide";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;

const formatClock = (value?: string | null) => (value ? value.slice(0, 5) : "—");
const formatWindow = (value?: string) => (value ? dayjs(value).format("HH:mm") : "—");

const ExplanationApprovalTable = () => {
    const dispatch = useAppDispatch();
    // The server filters to pending explanations and sends one page; it used to send 90 days of attendance
    const pendingRecords = useAppSelector(selectPendingExplanations);
    const pendingTotal = useAppSelector(selectPendingExplanationsTotal);
    const loading = useAppSelector(selectAttendanceLoading);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceResponseDto | null>(null);
    const [form] = Form.useForm();
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const fetchPage = (nextPage: number) => dispatch(fetchPendingExplanations({
        fromDate: dayjs().subtract(90, "day").format("YYYY-MM-DD"),
        toDate: dayjs().format("YYYY-MM-DD"),
        page: nextPage,
        pageSize,
    }));

    const loadPage = (nextPage: number) => {
        setPage(nextPage);
        fetchPage(nextPage);
    };

    useEffect(() => {
        dispatch(fetchPendingExplanations({
            fromDate: dayjs().subtract(90, "day").format("YYYY-MM-DD"),
            toDate: dayjs().format("YYYY-MM-DD"),
            page: 1,
            pageSize,
        }));
    }, [dispatch]);

    const handleRefresh = () => loadPage(page);

    const handleOpenReview = (record: AttendanceResponseDto) => {
        setSelectedRecord(record);
        form.resetFields();
        setModalOpen(true);
    };

    const handleDecision = async (isApproved: boolean) => {
        try {
            const values = await form.validateFields();
            if (!selectedRecord) return;

            await dispatch(approveExplanation({
                attendanceId: selectedRecord.attendanceId,
                isApproved,
                responseMessage: values.response,
                manualCheckInTime: values.manualCheckInTime ? values.manualCheckInTime.format("HH:mm:ss") : undefined,
                manualCheckOutTime: values.manualCheckOutTime ? values.manualCheckOutTime.format("HH:mm:ss") : undefined,
            })).unwrap();

            const successMessage = isApproved
                ? selectedRecord.explanationType === "LeaveRequest"
                    ? "Đã duyệt chuyển ngày vắng thành nghỉ phép."
                    : "Đã duyệt giải trình chấm công."
                : "Đã từ chối giải trình.";

            message.success(successMessage);
            setModalOpen(false);
            handleRefresh();
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error?.message || "Xử lý thất bại.");
        }
    };

    const renderExplanationType = (record: AttendanceResponseDto) => {
        if (record.explanationType === "LeaveRequest") {
            return (
                <Space direction="vertical" size={2}>
                    <Tag color="green">Nghỉ phép</Tag>
                    <Text type="secondary">{record.explanationLeaveTypeName || "Chưa chọn loại phép"}</Text>
                </Space>
            );
        }

        if (record.explanationType === "Regularization") {
            return (
                <Space direction="vertical" size={2}>
                    <Tag color="blue">Bổ sung giờ</Tag>
                    <Text type="secondary">
                        In: {formatClock(record.explanationRequestedCheckInTime)} | Out: {formatClock(record.explanationRequestedCheckOutTime)}
                    </Text>
                </Space>
            );
        }

        return <Tag color="default">Đơn cũ</Tag>;
    };

    const columns = [
        {
            title: "Nhân viên", dataIndex: "employeeName", key: "employeeName",
            render: (v: string) => <Text strong>{v}</Text>
        },
        {
            title: "Ngày", dataIndex: "attendanceDate", key: "attendanceDate",
            render: (v: string) => dayjs(v).format("DD/MM/YYYY")
        },
        {
            title: "Check In", dataIndex: "checkInTime", key: "checkInTime",
            render: (v: string) => v ? dayjs(v).format("HH:mm:ss") : <Tag color="red">Không có</Tag>
        },
        {
            title: "Check Out", dataIndex: "checkOutTime", key: "checkOutTime",
            render: (v: string) => v ? dayjs(v).format("HH:mm:ss") : <Tag color="red">Không có</Tag>
        },
        {
            title: "Trạng thái", dataIndex: "status", key: "status",
            render: (s: string) => {
                const map: Record<string, string> = { Present: "success", Late: "warning", Absent: "error", Incomplete: "blue" };
                return <Tag color={map[s] || "default"}>{s}</Tag>;
            }
        },
        {
            title: "Loại yêu cầu", key: "explanationType",
            render: (_: unknown, record: AttendanceResponseDto) => renderExplanationType(record)
        },
        {
            title: "Nội dung giải trình", dataIndex: "explanationMessage", key: "explanationMessage",
            render: (v: string) => v
                ? <Paragraph ellipsis={{ rows: 2, expandable: true }} style={{ marginBottom: 0 }}>{v}</Paragraph>
                : <Text type="secondary">—</Text>
        },
        {
            title: "Hành động", key: "action", align: "center" as const,
            render: (_: unknown, record: AttendanceResponseDto) => {
                const isToday = dayjs(record.attendanceDate).isSame(dayjs(), "day") || dayjs(record.attendanceDate).isAfter(dayjs(), "day");

                return (
                    <Tooltip title={isToday ? "Giải trình cho ngày hiện tại chỉ có thể duyệt vào ngày mai để tránh lỗi chấm công." : ""}>
                        <Button
                            type="primary"
                            size="small"
                            icon={<FileTextOutlined />}
                            onClick={() => handleOpenReview(record)}
                            disabled={isToday}
                        >
                            Xem xét
                        </Button>
                    </Tooltip>
                );
            }
        }
    ];

    const isLegacyRecord = !!selectedRecord && !selectedRecord.explanationType;
    const showLegacyCheckIn = isLegacyRecord && !selectedRecord?.checkInTime;
    const showLegacyCheckOut = isLegacyRecord && !selectedRecord?.checkOutTime;

    return (
        <Card
            title={
                <Space>
                    <ClockCircleOutlined style={{ color: "#fa8c16" }} />
                    <span>Giải trình chấm công chờ duyệt</span>
                    <Badge count={pendingTotal} showZero color="#fa8c16" />
                </Space>
            }
            extra={<Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>Làm mới</Button>}
        >
            {pendingTotal === 0 && !loading && (
                <Alert type="success" showIcon message="Không có phiếu giải trình nào đang chờ duyệt." />
            )}

            {pendingTotal > 0 && (
                <Table
                    columns={columns}
                    dataSource={pendingRecords}
                    rowKey="attendanceId"
                    loading={loading}
                    pagination={{ current: page, pageSize, total: pendingTotal, onChange: loadPage }}
                    bordered
                />
            )}

            <Modal
                title={<Space><FileTextOutlined /><span>Xem xét phiếu giải trình</span></Space>}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={
                    <Space>
                        <Button onClick={() => setModalOpen(false)}>Hủy</Button>
                        <Button danger icon={<CloseCircleOutlined />} onClick={() => handleDecision(false)}>Từ chối</Button>
                        <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleDecision(true)}>
                            {selectedRecord?.explanationType === "LeaveRequest" ? "Duyệt nghỉ phép" : "Duyệt yêu cầu"}
                        </Button>
                    </Space>
                }
                width={640}
                destroyOnHidden
            >
                {selectedRecord && (
                    <>
                        <Alert
                            type="info"
                            showIcon
                            className="mb-4"
                            message={`${selectedRecord.employeeName} — ${dayjs(selectedRecord.attendanceDate).format("DD/MM/YYYY")}`}
                            description={`Check-in: ${selectedRecord.checkInTime ? dayjs(selectedRecord.checkInTime).format("HH:mm") : "Không có"} | Check-out: ${selectedRecord.checkOutTime ? dayjs(selectedRecord.checkOutTime).format("HH:mm") : "Không có"} | Trạng thái: ${selectedRecord.status}`}
                        />

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                            <Text type="secondary" className="block mb-1 text-xs uppercase tracking-wide">Lý do nhân viên giải trình</Text>
                            <Text>{selectedRecord.explanationMessage}</Text>
                        </div>

                        {selectedRecord.explanationType === "LeaveRequest" && (
                            <Alert
                                type="success"
                                showIcon
                                className="mb-4"
                                message={`Nhân viên đề nghị chuyển ngày này sang nghỉ phép: ${selectedRecord.explanationLeaveTypeName || "Chưa rõ loại phép"}`}
                            />
                        )}

                        {selectedRecord.explanationType === "Regularization" && (
                            <Alert
                                type="info"
                                showIcon
                                className="mb-4"
                                message="Nhân viên đã tự khai báo giờ chấm công cần khôi phục"
                                description={`Check-in đề xuất: ${formatClock(selectedRecord.explanationRequestedCheckInTime)} | Check-out đề xuất: ${formatClock(selectedRecord.explanationRequestedCheckOutTime)} | Khung check-in: ${formatWindow(selectedRecord.allowedCheckInFrom)} - ${formatWindow(selectedRecord.allowedCheckInTo)} | Khung check-out: ${formatWindow(selectedRecord.allowedCheckOutFrom)} - ${formatWindow(selectedRecord.allowedCheckOutTo)}`}
                            />
                        )}

                        {isLegacyRecord && (
                            <Alert
                                type="warning"
                                showIcon
                                className="mb-4"
                                message="Đây là đơn cũ chưa có loại yêu cầu mới. Manager vẫn có thể nhập giờ bổ sung thủ công."
                            />
                        )}
                    </>
                )}

                <Form form={form} layout="vertical">
                    {(showLegacyCheckIn || showLegacyCheckOut) && (
                        <Row gutter={16}>
                            {showLegacyCheckIn && (
                                <Col span={12}>
                                    <Form.Item
                                        name="manualCheckInTime"
                                        label="Giờ Check-in bổ sung"
                                        help="Chỉ dùng cho các đơn cũ chưa có giờ nhân viên tự khai"
                                    >
                                        <TimePicker format="HH:mm" className="w-full" />
                                    </Form.Item>
                                </Col>
                            )}
                            {showLegacyCheckOut && (
                                <Col span={12}>
                                    <Form.Item
                                        name="manualCheckOutTime"
                                        label="Giờ Check-out bổ sung"
                                        help="Chỉ dùng cho các đơn cũ chưa có giờ nhân viên tự khai"
                                    >
                                        <TimePicker format="HH:mm" className="w-full" />
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>
                    )}

                    <Form.Item
                        name="response"
                        label="Phản hồi của Quản lý (tùy chọn)"
                    >
                        <Input.TextArea rows={3} placeholder="Nhập ghi chú hoặc lý do từ chối (nếu có)..." />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default ExplanationApprovalTable;
