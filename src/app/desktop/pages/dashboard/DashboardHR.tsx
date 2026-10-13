import { CONTRACT_TYPES } from "../../../../constants/contracts";
import { Row, Col, Card, Statistic, DatePicker, Typography, Space, List, Badge, Spin, Tag } from "antd";
import {
     TeamOutlined, UserAddOutlined, UserDeleteOutlined,
    CheckCircleOutlined,
    CalendarOutlined, FileTextOutlined,
    GiftOutlined, HistoryOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchHrDashboardData, selectHrDashboardData, selectDashboardLoading } from "../../../../store/dashboardSlide";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DashboardHR = () => {
    const dispatch = useAppDispatch();
    const hrData = useAppSelector(selectHrDashboardData);
    const loading = useAppSelector(selectDashboardLoading);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'day'), dayjs()]);

    useEffect(() => {
        dispatch(fetchHrDashboardData({
            fromDate: dateRange[0].format("YYYY-MM-DD"),
            toDate: dateRange[1].format("YYYY-MM-DD")
        }));
    }, [dispatch, dateRange]);

    const stats = hrData?.statistics;

    const cards = [
        { title: "Tổng nhân sự", value: stats?.totalHeadcount, icon: <TeamOutlined />, color: "#1890ff", desc: "Số nhân viên hiện tại" },
        { title: "Tuyển mới", value: stats?.newHires, icon: <UserAddOutlined />, color: "#52c41a", desc: "Nhân viên gia nhập trong kỳ" },
        { title: "Nghỉ việc", value: stats?.terminations, icon: <UserDeleteOutlined />, color: "#f5222d", desc: "Nhân viên đã nghỉ việc" },
        { title: "Tỉ lệ chuyên cần", value: `${stats?.overallAttendanceRate ?? 0}%`, icon: <CheckCircleOutlined />, color: "#722ed1", desc: "Nhân viên có mặt đầy đủ" },
        { title: "Ngày nghỉ trung bình", value: stats?.averageLeaveDays, icon: <CalendarOutlined />, color: "#13c2c2", desc: "Trung bình ngày nghỉ/nhân viên" },
        { title: "Đơn nghỉ chờ duyệt", value: stats?.pendingLeaveRequests, icon: <FileTextOutlined />, color: "#faad14", desc: "Yêu cầu chờ phê duyệt" },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>Tổng quan Nhân sự</Title>
                        <Text type="secondary">Quản lý nhân lực và thống kê gắn kết nhân viên</Text>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <Text strong>Kỳ:</Text>
                            <RangePicker 
                                value={dateRange}
                                onChange={(dates) => {
                                    if (dates && dates[0] && dates[1]) setDateRange([dates[0], dates[1]]);
                                }}
                            />
                        </Space>
                    </Col>
                </Row>
            </motion.div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <Spin size="large" tip="Loading workforce insights..." />
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show">
                    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                        {cards.map((card, idx) => (
                            <Col xs={24} sm={12} md={8} key={idx}>
                                <motion.div variants={item}>
                                    <Card 
                                        bordered={false} 
                                        style={{ 
                                            borderRadius: '12px', 
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                            background: '#fff'
                                        }}
                                        hoverable
                                    >
                                        <Statistic
                                            title={<Text type="secondary" strong>{card.title}</Text>}
                                            value={card.value}
                                            prefix={card.icon}
                                            valueStyle={{ color: card.color, fontWeight: '800', fontSize: '28px' }}
                                        />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>{card.desc}</Text>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                    <Row gutter={24}>
                        <Col span={16}>
                            <Space direction="vertical" style={{ width: '100%' }} size={24}>
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                                    <Card title={<Space><CalendarOutlined />Thử việc & Hợp đồng sắp đến hạn</Space>} bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                        <Row gutter={24}>
                                            <Col span={12}>
                                                <Title level={5}>Hết thời gian thử việc</Title>
                                                <List
                                                    dataSource={hrData?.upcomingProbationEnds || []}
                                                    renderItem={(item) => (
                                                        <List.Item>
                                                            <List.Item.Meta
                                                                title={item.employeeName}
                                                                description={<Space><Tag color="blue">{CONTRACT_TYPES.Probation}</Tag><Text type="secondary">{dayjs(item.date).format("DD/MM/YYYY")}</Text></Space>}
                                                            />
                                                        </List.Item>
                                                    )}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Title level={5}>Gia hạn hợp đồng</Title>
                                                <List
                                                    dataSource={hrData?.contractRenewals || []}
                                                    renderItem={(item) => (
                                                        <List.Item>
                                                            <List.Item.Meta
                                                                title={item.employeeName}
                                                                description={<Space><Tag color="orange">{(item.detail && CONTRACT_TYPES[item.detail]) ?? item.detail}</Tag><Text type="secondary">{dayjs(item.date).format("DD/MM/YYYY")}</Text></Space>}
                                                            />
                                                        </List.Item>
                                                    )}
                                                />
                                            </Col>
                                        </Row>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                    <Card title={<Space><HistoryOutlined />Hoạt động HR gần đây</Space>} bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={hrData?.recentHrActivities || []}
                                            renderItem={(activity) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        avatar={<Badge status="processing" />}
                                                        title={activity.description}
                                                        description={dayjs(activity.timestamp).format("MMM DD, YYYY HH:mm")}
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                </motion.div>
                            </Space>
                        </Col>

                        <Col span={8}>
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                                <Card title={<Space><GiftOutlined />Sinh nhật & Kỷ niệm</Space>} bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minHeight: '520px' }}>
                                    <List
                                        dataSource={hrData?.birthdays || []}
                                        renderItem={(item) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<GiftOutlined style={{ color: '#eb2f96', fontSize: '20px' }} />}
                                                    title={item.employeeName}
                                                    description={<Text type="secondary">{dayjs(item.date).format("MMMM DD")}</Text>}
                                                />
                                                <Tag color="magenta">Sinh nhật</Tag>
                                            </List.Item>
                                        )}
                                        locale={{ emptyText: "Không có sinh nhật tháng này" }}
                                    />
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </motion.div>
            )}
        </div>
    );
};

export default DashboardHR;