import { Row, Col, DatePicker, Typography, Space, List, Badge, Spin, Tag } from "antd";
import {
    UserOutlined, TeamOutlined, ApartmentOutlined, FileTextOutlined,
    CheckCircleOutlined, ClockCircleOutlined, RiseOutlined,
    MonitorOutlined, WarningOutlined, RocketOutlined,
    SafetyCertificateOutlined, CodeOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAdminDashboardData, selectDashboardData, selectDashboardLoading } from "../../../../store/dashboardSlide";
import dayjs from "dayjs";
import { PageHeader, SectionCard, StatRow } from "../../components/listPage";


const { Text } = Typography;
const { RangePicker } = DatePicker;

const TASK_STATUS: Record<string, string> = {
    Completed: "Lần chạy gần nhất thành công",
    Running: "Đang chạy",
    Failed: "Lần chạy gần nhất lỗi",
    Pending: "Chưa chạy",
};

const DashboardAdmin = () => {
    const dispatch = useAppDispatch();
    const data = useAppSelector(selectDashboardData);
    const loading = useAppSelector(selectDashboardLoading);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'day'), dayjs()]);

    useEffect(() => {
        dispatch(fetchAdminDashboardData({
            fromDate: dateRange[0].format("YYYY-MM-DD"),
            toDate: dateRange[1].format("YYYY-MM-DD")
        }));
    }, [dispatch, dateRange]);

    const stats = data?.statistics;

    const cards = [
        { title: "Tổng tài khoản", value: stats?.totalUsers, icon: <UserOutlined />, color: "#4f46e5", description: "Tổng số tài khoản đã đăng ký" },
        { title: "Tài khoản hoạt động", value: stats?.activeUsers, icon: <SafetyCertificateOutlined />, color: "#10b981", description: "Hoạt động trong 30 ngày qua" },
        { title: "Tài khoản mới", value: stats?.newUsers, icon: <RiseOutlined />, color: "#8b5cf6", description: "Đăng ký trong kỳ đã chọn" },
        { title: "Tổng nhân viên", value: stats?.totalEmployees, icon: <TeamOutlined />, color: "#f59e0b", description: "Quy mô nhân lực hiện tại" },
        { title: "Tổng phòng ban", value: stats?.totalDepartments, icon: <ApartmentOutlined />, color: "#06b6d4", description: "Số đơn vị tổ chức" },
        { title: "Tổng đơn nghỉ phép", value: stats?.totalLeaveRequests, icon: <FileTextOutlined />, color: "#ec4899", description: "Đã nộp trong kỳ" },
        { title: "Chờ phê duyệt", value: stats?.pendingApprovals, icon: <ClockCircleOutlined />, color: "#f97316", description: "Yêu cầu đang chờ xử lý" },
        { title: "Tỉ lệ chuyên cần", value: `${stats?.attendanceRate ?? 0}%`, icon: <CheckCircleOutlined />, color: "#3b82f6", description: "Trung bình có mặt trong kỳ" },
        { title: "Giờ tăng ca", value: stats?.overtimeHours, icon: <RocketOutlined />, color: "#ef4444", description: "Tổng giờ OT đã duyệt" },
        { title: "Thời gian hoạt động", value: stats?.systemUptime, icon: <MonitorOutlined />, color: "#84cc16", description: "Kể từ lần khởi động lại" },
    ];

    return (
        <div className="p-2">
            <PageHeader
                title="Tổng quan quản trị hệ thống"
                subtitle="Phân tích hệ thống và tình trạng vận hành theo thời gian thực"
                actions={
                    <>
                        <Text strong>Kỳ:</Text>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => {
                                if (dates && dates[0] && dates[1]) setDateRange([dates[0], dates[1]]);
                            }}
                        />
                    </>
                }
            />

            {loading ? (
                <div className="flex flex-col items-center justify-center gap-4" style={{ padding: '120px 0' }}>
                    <Spin size="large" />
                    <Text type="secondary">Đang tải dữ liệu hệ thống...</Text>
                </div>
            ) : (
                <>
                    <StatRow items={cards} />

                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <SectionCard title="Hoạt động gần đây" icon={<ClockCircleOutlined />} gap={0}>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={data?.recentActivities || []}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Badge status="processing" color="#4f46e5" />}
                                                title={item.description}
                                                description={<Text type="secondary">{dayjs(item.timestamp).format("DD/MM/YYYY HH:mm")}</Text>}
                                            />
                                        </List.Item>
                                    )}
                                    locale={{ emptyText: "Không có log hệ thống gần đây" }}
                                />
                            </SectionCard>
                        </Col>
                        <Col xs={24} lg={12}>
                            <SectionCard title="Cảnh báo & Thông báo" icon={<WarningOutlined />}>
                                <List
                                    dataSource={data?.alerts || []}
                                    locale={{ emptyText: "Không có việc gì cần xử lý." }}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <Space>
                                                <Tag
                                                    color={item.level === "Error" ? "error" : item.level === "Warning" ? "warning" : "processing"}
                                                    style={{ minWidth: 64, textAlign: 'center' }}
                                                >
                                                    {item.level.toUpperCase()}
                                                </Tag>
                                                <Text>{item.message}</Text>
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            </SectionCard>

                            <SectionCard title="Trạng thái tác vụ định kỳ" icon={<CodeOutlined />} gap={0}>
                                <List
                                    dataSource={data?.scheduledTasks || []}
                                    locale={{ emptyText: "Chưa có tác vụ định kỳ nào." }}
                                    renderItem={(item) => (
                                        <List.Item
                                            extra={
                                                <Badge
                                                    status={item.status === "Completed" ? "success" : item.status === "Running" ? "processing" : item.status === "Failed" ? "error" : "default"}
                                                    text={<Text type="secondary">{TASK_STATUS[item.status] ?? item.status}</Text>}
                                                />
                                            }
                                        >
                                            <Text strong>{item.name}</Text>
                                        </List.Item>
                                    )}
                                />
                            </SectionCard>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default DashboardAdmin;
