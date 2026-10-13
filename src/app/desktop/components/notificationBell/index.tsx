import { useEffect, useState } from "react";
import { Badge, Button, Empty, Popover, Spin, Typography } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchNotifications, fetchUnreadCount, markAllNotificationsRead, markNotificationRead,
    selectNotifications, selectNotificationsLoading, selectUnreadNotificationCount, type INotification,
} from "../../../../store/notificationSlide";
import URL from "../../../../constants/url";

const { Text } = Typography;

const UNREAD_POLL_MS = 30_000;
const PAGE_SIZE = 15;

/** Where a notification leads: the review page for a request to act on, the own-requests page for a decision. */
const TARGETS: Record<string, string> = {
    LeaveApproval: URL.ManageLeaveRequest,
    LeaveResult: URL.MyLeaveRequest,
    OvertimeApproval: URL.ManageOvertimeRequest,
    OvertimeResult: URL.MyOvertimeRequest,
    ResignationApproval: URL.ManageResignationRequest,
    ResignationResult: URL.MyResignationRequest,
    ExplanationApproval: URL.ManageAttendance,
    ExplanationResult: URL.MyAttendance,
    Payslip: URL.MyPayslips,
};

const NotificationBell = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const items = useAppSelector(selectNotifications);
    const unread = useAppSelector(selectUnreadNotificationCount);
    const loading = useAppSelector(selectNotificationsLoading);
    const [open, setOpen] = useState(false);

    // The badge stays current without opening the list
    useEffect(() => {
        dispatch(fetchUnreadCount());
        const timer = setInterval(() => dispatch(fetchUnreadCount()), UNREAD_POLL_MS);
        return () => clearInterval(timer);
    }, [dispatch]);

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (next) dispatch(fetchNotifications({ page: 1, pageSize: PAGE_SIZE }));
    };

    const handleClick = (item: INotification) => {
        if (!item.isRead) dispatch(markNotificationRead(item.notificationId));
        const target = TARGETS[item.notificationType];
        if (target) {
            setOpen(false);
            navigate(target);
        }
    };

    const content = (
        <div style={{ width: 360, maxWidth: "calc(100vw - 32px)" }}>
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-gray-100">
                <Text strong>Thông báo</Text>
                <Button
                    type="link"
                    size="small"
                    icon={<CheckOutlined />}
                    disabled={unread === 0}
                    onClick={() => dispatch(markAllNotificationsRead())}
                >
                    Đánh dấu đã đọc hết
                </Button>
            </div>
            <Spin spinning={loading}>
                <div style={{ maxHeight: 420, overflowY: "auto" }}>
                    {items.length === 0 && !loading && (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo nào" />
                    )}
                    {items.map(item => (
                        <div
                            key={item.notificationId}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleClick(item)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleClick(item); }}
                            className={`flex gap-2 px-2 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 ${item.isRead ? "" : "bg-blue-50/60"}`}
                        >
                            <span
                                className="mt-1.5 shrink-0 rounded-full"
                                style={{ width: 8, height: 8, background: item.isRead ? "transparent" : "#1677ff" }}
                            />
                            <div className="min-w-0">
                                <div className={item.isRead ? "text-gray-700" : "font-semibold text-gray-900"}>{item.title}</div>
                                <div className="text-gray-500 text-sm" style={{ overflowWrap: "anywhere" }}>{item.message}</div>
                                <div className="text-gray-400 text-xs mt-0.5">{dayjs(item.sentDate).format("HH:mm DD/MM/YYYY")}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Spin>
        </div>
    );

    return (
        <Popover content={content} trigger="click" open={open} onOpenChange={handleOpenChange} placement="bottomRight" arrow={false}>
            <Badge count={unread} size="small" overflowCount={99} offset={[-4, 4]}>
                <Button type="text" shape="circle" size="large" aria-label="Thông báo" icon={<BellOutlined style={{ fontSize: 20 }} />} />
            </Badge>
        </Popover>
    );
};

export default NotificationBell;
