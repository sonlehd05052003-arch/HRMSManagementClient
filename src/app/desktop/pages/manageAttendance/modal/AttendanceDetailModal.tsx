import { Modal, Descriptions, Spin, Tag, Button, Space, Typography, Tooltip, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { fetchAttendanceDetail, selectSelectedDetail, selectAttendanceLoading, lockAttendance, unlockAttendance } from "../../../../../store/attendanceSlide";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { LockOutlined, UnlockOutlined, HistoryOutlined } from "@ant-design/icons";
import AttendanceLogsModal from "./AttendanceLogsModal";
import { errorText } from "../../../../../utils/apiError";

const { Text } = Typography;

interface AttendanceDetailModalProps {
    open: boolean;
    onClose: () => void;
    employeeId: number;
    employeeName: string;
    date: string;
}

const AttendanceDetailModal = ({ open, onClose, employeeId, employeeName, date }: AttendanceDetailModalProps) => {
    const dispatch = useAppDispatch();
    const detailPayload = useAppSelector(selectSelectedDetail);
    const loading = useAppSelector(selectAttendanceLoading);
    const [logsOpen, setLogsOpen] = useState(false);
    const [isPayrollLocked, setIsPayrollLocked] = useState(false);

    useEffect(() => {
        if (open && employeeId && date) {
            dispatch(fetchAttendanceDetail({ employeeId, date }));
            setIsPayrollLocked(false);
        }
    }, [open, employeeId, date, dispatch]);

    const detail = detailPayload?.attendance;

    const handleLock = async () => {
        if (!detail?.attendanceId) return;
        try {
            await dispatch(lockAttendance(detail.attendanceId)).unwrap();
            message.success("Đã khóa bản ghi chấm công.");
        } catch (err) {
            message.error(errorText(err, "Khóa bản ghi thất bại."));
        }
    };

    const handleUnlock = async () => {
        if (!detail?.attendanceId) return;
        try {
            await dispatch(unlockAttendance(detail.attendanceId)).unwrap();
            message.success("Đã mở khóa bản ghi chấm công.");
        } catch (err) {
            const errMsg = errorText(err, "Mở khóa bản ghi thất bại.");
            message.error(errMsg);
            if (errMsg.includes("kỳ lương")) setIsPayrollLocked(true);
        }
    };

    return (
        <Modal
            title={`Chi tiết chấm công - ${employeeName}`}
            open={open}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="logs" icon={<HistoryOutlined />} onClick={() => setLogsOpen(true)}>
                    Lịch sử chỉnh sửa
                </Button>,
                <Button key="close" onClick={onClose} type="primary">
                    Đóng
                </Button>
            ]}
        >
            {loading && !detail ? (
                <div className="text-center p-6"><Spin /></div>
            ) : detail ? (
                <div className="mt-4">
                    <Descriptions column={2} bordered size="small">
                        <Descriptions.Item label="Ngày">
                            {dayjs(detail.attendanceDate).format("DD/MM/YYYY")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            {detail.status === "Present" && <Tag color="green">Hiện diện</Tag>}
                            {detail.status === "Late" && <Tag color="orange">Đi muộn</Tag>}
                            {detail.status === "Absent" && <Tag color="red">Vắng mặt</Tag>}
                            {detail.status === "Incomplete" && <Tag color="blue">Chưa hoàn tất</Tag>}
                            {detail.status === "PaidLeave" && <Tag color="cyan">Nghỉ phép có lương</Tag>}
                            {detail.status === "UnpaidLeave" && <Tag color="purple">Nghỉ phép không lương</Tag>}
                        </Descriptions.Item>

                        <Descriptions.Item label="Giờ Check-in">
                            {detail.checkInTime ? dayjs(detail.checkInTime).format("HH:mm:ss") : "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giờ Check-out">
                            {detail.checkOutTime ? dayjs(detail.checkOutTime).format("HH:mm:ss") : "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Giờ làm việc">
                            <Text strong>{detail.workingHours ?? "0"}h</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Đi muộn/Về sớm">
                            {detail.lateMinutes! > 0 ? (
                                <Text type="danger">{detail.lateMinutes} phút muộn</Text>
                            ) : detail.earlyLeaveMinutes! > 0 ? (
                                <Text type="warning">{detail.earlyLeaveMinutes} phút về sớm</Text>
                            ) : (
                                "Không"
                            )}
                        </Descriptions.Item>

                        <Descriptions.Item label="Nguồn">
                            {detail.source} {detail.isManualAdjusted && <Tag color="gold">Manual Adjusted</Tag>}
                        </Descriptions.Item>
                        <Descriptions.Item label="Vị trí">
                            {detail.location || "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ghi chú" span={2}>
                            {detail.remarks || "—"}
                        </Descriptions.Item>
                    </Descriptions>

                    <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 border rounded">
                        <div>
                            <Text strong>Trạng thái khóa: </Text>
                            {detail.isLocked ? (
                                isPayrollLocked
                                    ? <Tag color="red" icon={<LockOutlined />}>Khóa bởi kỳ lương</Tag>
                                    : <Tag color="red" icon={<LockOutlined />}>Đã khóa</Tag>
                            ) : (
                                <Tag color="green" icon={<UnlockOutlined />}>Đang mở</Tag>
                            )}
                            <br />
                            <Text type="secondary" className="text-xs">
                                {isPayrollLocked
                                    ? "Bản ghi thuộc kỳ lương đã phê duyệt, không thể mở khóa."
                                    : "Bản ghi bị khóa sẽ không thể điều chỉnh được."}
                            </Text>
                        </div>
                        <Space>
                            {detail.isLocked ? (
                                <Tooltip title={isPayrollLocked ? "Bản ghi thuộc kỳ lương đã phê duyệt, không thể mở khóa" : ""}>
                                    <Button
                                        danger
                                        icon={<UnlockOutlined />}
                                        onClick={handleUnlock}
                                        disabled={isPayrollLocked}
                                    >
                                        Mở khóa bản ghi
                                    </Button>
                                </Tooltip>
                            ) : (
                                <Button type="primary" icon={<LockOutlined />} onClick={handleLock}>
                                    Khóa bản ghi
                                </Button>
                            )}
                        </Space>
                    </div>

                    <AttendanceLogsModal
                        open={logsOpen}
                        onClose={() => setLogsOpen(false)}
                        employeeId={employeeId}
                        employeeName={employeeName}
                        date={date}
                    />
                </div>
            ) : (
                <div className="text-center p-6 text-gray-500">Chưa có dữ liệu chấm công ngày này.</div>
            )}
        </Modal>
    );
};

export default AttendanceDetailModal;
