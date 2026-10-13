import { Row, Col, Card, Statistic, DatePicker, Typography, Space, List, Badge, Spin, Tooltip, Tag } from "antd";
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
import { motion } from "framer-motion";

const { Title, Text } = Typography;
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
        { title: "Tổng tài khoản", value: stats?.totalUsers, icon: <UserOutlined />, color: "#4f46e5", desc: "Tổng số tài khoản đã đăng ký" },
        { title: "Tài khoản hoạt động", value: stats?.activeUsers, icon: <SafetyCertificateOutlined />, color: "#10b981", desc: "Hoạt động trong 30 ngày qua" },
        { title: "Tài khoản mới", value: stats?.newUsers, icon: <RiseOutlined />, color: "#8b5cf6", desc: "Đăng ký trong kỳ đã chọn" },
        { title: "Tổng nhân viên", value: stats?.totalEmployees, icon: <TeamOutlined />, color: "#f59e0b", desc: "Quy mô nhân lực hiện tại" },
        { title: "Tổng phòng ban", value: stats?.totalDepartments, icon: <ApartmentOutlined />, color: "#06b6d4", desc: "Số đơn vị tổ chức" },
        { title: "Tổng đơn nghỉ phép", value: stats?.totalLeaveRequests, icon: <FileTextOutlined />, color: "#ec4899", desc: "Đã nộp trong kỳ" },
        { title: "Chờ phê duyệt", value: stats?.pendingApprovals, icon: <ClockCircleOutlined />, color: "#f97316", desc: "Yêu cầu đang chờ xử lý" },
        { title: "Tỉ lệ chuyên cần", value: `${stats?.attendanceRate ?? 0}%`, icon: <CheckCircleOutlined />, color: "#3b82f6", desc: "Trung bình có mặt trong kỳ" },
        { title: "Giờ tăng ca", value: stats?.overtimeHours, icon: <RocketOutlined />, color: "#ef4444", desc: "Tổng giờ OT đã duyệt" },
        { title: "Thời gian hoạt động", value: stats?.systemUptime, icon: <MonitorOutlined />, color: "#84cc16", desc: "Kể từ lần khởi động lại" },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div style={{ padding: '28px 24px', background: '#f8fafc', minHeight: '100vh' }}>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 28 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>Tổng quan Quản trị hệ thống</Title>
                        <Text style={{ color: '#64748b', fontSize: 14 }}>Phân tích hệ thống và tình trạng vận hành theo thời gian thực</Text>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <Text strong style={{ color: '#374151' }}>Kỳ:</Text>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => {
                                    if (dates && dates[0] && dates[1]) setDateRange([dates[0], dates[1]]);
                                }}
                                style={{ borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                            />
                        </Space>
                    </Col>
                </Row>
            </motion.div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 0', gap: 16 }}>
                    <Spin size="large" />
                    <Text style={{ color: '#94a3b8', fontSize: 14 }}>Đang tải dữ liệu hệ thống...</Text>
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show">
                    <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
                        {cards.map((card, idx) => (
                            <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={idx} style={{ flex: card.title === "API Response Time" ? '0 0 20%' : undefined }}>
                                <motion.div variants={item}>
                                    <Tooltip title={card.desc} placement="top">
                                        <Card
                                            bordered={false}
                                            style={{
                                                borderRadius: 12,
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.04)',
                                                borderLeft: `4px solid ${card.color}`,
                                                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                                            }}
                                            hoverable
                                        >
                                            <Statistic
                                                title={<Text style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{card.title}</Text>}
                                                value={card.value}
                                                prefix={<span style={{ color: card.color }}>{card.icon}</span>}
                                                valueStyle={{ color: card.color, fontWeight: 700, fontSize: 22 }}
                                            />
                                            <div style={{ fontSize: 12, marginTop: 8, color: '#94a3b8', lineHeight: '1.4' }}>{card.desc}</div>
                                        </Card>
                                    </Tooltip>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                    <Row gutter={[24, 24]}>
                        <Col span={12}>
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                <Card
                                    title={
                                        <Space>
                                            <ClockCircleOutlined style={{ color: '#4f46e5' }} />
                                            <Text strong style={{ fontSize: 15 }}>Hoạt động gần đây</Text>
                                        </Space>
                                    }
                                    bordered={false}
                                    style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.04)', minHeight: 400 }}
                                >
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={data?.recentActivities || []}
                                        renderItem={(item) => (
                                            <List.Item style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                                                <List.Item.Meta
                                                    avatar={<Badge status="processing" color="#4f46e5" />}
                                                    title={<Text style={{ fontSize: 13, color: '#1e293b' }}>{item.description}</Text>}
                                                    description={<Text style={{ fontSize: 12, color: '#94a3b8' }}>{dayjs(item.timestamp).format("DD/MM/YYYY HH:mm")}</Text>}
                                                />
                                            </List.Item>
                                        )}
                                        locale={{ emptyText: "Không có log hệ thống gần đây" }}
                                    />
                                </Card>
                            </motion.div>
                        </Col>
                        <Col span={12}>
                            <Space direction="vertical" style={{ width: '100%' }} size={20}>
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                                    <Card
                                        title={
                                            <Space>
                                                <WarningOutlined style={{ color: '#f59e0b' }} />
                                                <Text strong style={{ fontSize: 15 }}>Cảnh báo & Thông báo</Text>
                                            </Space>
                                        }
                                        bordered={false}
                                        style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.04)' }}
                                    >
                                        <List
                                            dataSource={data?.alerts || []}
                                            locale={{ emptyText: "Không có việc gì cần xử lý." }}
                                            renderItem={(item) => (
                                                <List.Item style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                                                    <Space>
                                                        <Tag
                                                            color={item.level === "Error" ? "error" : item.level === "Warning" ? "warning" : "processing"}
                                                            style={{ minWidth: 64, textAlign: 'center', fontWeight: 600 }}
                                                        >
                                                            {item.level.toUpperCase()}
                                                        </Tag>
                                                        <Text style={{ fontSize: 13, color: '#374151' }}>{item.message}</Text>
                                                    </Space>
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
                                    <Card
                                        title={
                                            <Space>
                                                <CodeOutlined style={{ color: '#8b5cf6' }} />
                                                <Text strong style={{ fontSize: 15 }}>Trạng thái tác vụ định kỳ</Text>
                                            </Space>
                                        }
                                        bordered={false}
                                        style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.04)' }}
                                    >
                                        <List
                                            dataSource={data?.scheduledTasks || []}
                                            locale={{ emptyText: "Chưa có tác vụ định kỳ nào." }}
                                            renderItem={(item) => (
                                                <List.Item
                                                    style={{ padding: '10px 0' }}
                                                    extra={
                                                        <Badge
                                                            status={item.status === "Completed" ? "success" : item.status === "Running" ? "processing" : item.status === "Failed" ? "error" : "default"}
                                                            text={<Text style={{ fontSize: 12, color: '#64748b' }}>{TASK_STATUS[item.status] ?? item.status}</Text>}
                                                        />
                                                    }
                                                >
                                                    <Text strong style={{ fontSize: 13, color: '#1e293b' }}>{item.name}</Text>
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                </motion.div>
                            </Space>
                        </Col>
                    </Row>
                </motion.div>
            )}
        </div>
    );
};

export default DashboardAdmin;