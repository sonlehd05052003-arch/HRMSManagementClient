import { Row, Col, DatePicker, Typography, Space, List, Badge, Spin, Button, Calendar } from "antd";
import {
    TeamOutlined, CheckCircleOutlined, ClockCircleOutlined,
    CalendarOutlined, GiftOutlined,
    LineChartOutlined, BarChartOutlined, HistoryOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchManagerDashboardData, selectManagerDashboardData, selectDashboardLoading } from "../../../../store/dashboardSlide";
import dayjs from "dayjs";
import { PageHeader, SectionCard, StatRow } from "../../components/listPage";


const { Text } = Typography;
const { RangePicker } = DatePicker;

const DashboardManage = () => {
    const dispatch = useAppDispatch();
    const managerData = useAppSelector(selectManagerDashboardData);
    const loading = useAppSelector(selectDashboardLoading);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(30, 'day'), dayjs()]);

    useEffect(() => {
        dispatch(fetchManagerDashboardData({
            fromDate: dateRange[0].format("YYYY-MM-DD"),
            toDate: dateRange[1].format("YYYY-MM-DD")
        }));
    }, [dispatch, dateRange]);

    const stats = managerData?.statistics;

    const cards = [
        { title: "Quy mô nhóm", value: stats?.teamSize, icon: <TeamOutlined />, color: "#1890ff", description: "Tổng số nhân viên trực tiếp" },
        { title: "Có mặt hôm nay", value: stats?.presentToday, icon: <CheckCircleOutlined />, color: "#52c41a", description: "Đang làm việc" },
        { title: "Nghỉ hôm nay", value: stats?.onLeaveToday, icon: <CalendarOutlined />, color: "#faad14", description: "Thành viên đang nghỉ phép" },
        { title: "Tỉ lệ chuyên cần nhóm", value: `${stats?.teamAttendanceRate ?? 0}%`, icon: <LineChartOutlined />, color: "#722ed1", description: "Trung bình trong kỳ đã chọn" },
    ];

    return (
        <div className="p-2">
            <PageHeader
                title="Tổng quan quản lý nhóm"
                subtitle="Hiệu suất nhóm và theo dõi hiệu quả vận hành"
                actions={
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) setDateRange([dates[0], dates[1]]);
                        }}
                    />
                }
            />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <Spin size="large" tip="Đang tổng hợp dữ liệu nhóm..." />
                </div>
            ) : (
                <>
                    <StatRow items={cards} />

                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={16}>
                            <SectionCard title="Đơn nghỉ phép chờ duyệt" icon={<ClockCircleOutlined />}>
                                <List
                                    dataSource={managerData?.pendingLeaveRequests || []}
                                    renderItem={(request) => (
                                        <List.Item extra={<Button type="link">Xem xét</Button>}>
                                            <List.Item.Meta
                                                title={request.employeeName}
                                                description={`${request.leaveType} — ${request.days} ngày`}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </SectionCard>
                            <SectionCard title="Lịch nghỉ sắp tới của nhóm" icon={<CalendarOutlined />} gap={0}>
                                <List
                                    dataSource={managerData?.upcomingTeamLeaves || []}
                                    renderItem={(leave) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={leave.employeeName}
                                                description={`${leave.leaveType} (${leave.dateRange})`}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </SectionCard>
                        </Col>
                        <Col xs={24} lg={8}>
                            <SectionCard>
                                <Calendar fullscreen={false} />
                            </SectionCard>
                            <SectionCard title="Công việc & Hiệu suất" icon={<BarChartOutlined />} gap={0}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div className="flex justify-between">
                                        <Text>Công việc đang mở:</Text><Text strong>{managerData?.taskPerformance.activeTasks}</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Công việc quá hạn:</Text><Text type="danger" strong>{managerData?.taskPerformance.overdueTasks}</Text>
                                    </div>
                                    <div className="flex justify-between">
                                        <Text>Tỉ lệ hoàn thành:</Text><Text strong>{managerData?.taskPerformance.completionRate}%</Text>
                                    </div>
                                </Space>
                            </SectionCard>
                        </Col>

                        <Col xs={24} lg={12}>
                            <SectionCard title="Hoạt động nhóm gần đây" icon={<HistoryOutlined />} gap={0}>
                                <List
                                    dataSource={managerData?.recentTeamActivities || []}
                                    renderItem={(activity) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Badge status="processing" />}
                                                title={activity.description}
                                                description={dayjs(activity.timestamp).format("DD/MM/YYYY HH:mm")}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </SectionCard>
                        </Col>
                        <Col xs={24} lg={12}>
                            <SectionCard title="Cột mốc sắp tới của nhóm" icon={<GiftOutlined />} gap={0}>
                                <List
                                    dataSource={managerData?.teamMilestones || []}
                                    renderItem={(m) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<GiftOutlined />}
                                                title={m.employeeName}
                                                description={`${m.detail} — ${dayjs(m.date).format("DD/MM")}`}
                                            />
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

export default DashboardManage;
