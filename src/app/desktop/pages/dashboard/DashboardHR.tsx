import { CONTRACT_TYPES } from "../../../../constants/contracts";
import { Row, Col, DatePicker, Typography, Space, List, Badge, Spin, Tag } from "antd";
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
import { PageHeader, SectionCard, StatRow } from "../../components/listPage";


const { Text } = Typography;
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
        { title: "Tổng nhân sự", value: stats?.totalHeadcount, icon: <TeamOutlined />, color: "#1890ff", description: "Số nhân viên hiện tại" },
        { title: "Tuyển mới", value: stats?.newHires, icon: <UserAddOutlined />, color: "#52c41a", description: "Nhân viên gia nhập trong kỳ" },
        { title: "Nghỉ việc", value: stats?.terminations, icon: <UserDeleteOutlined />, color: "#f5222d", description: "Nhân viên đã nghỉ việc" },
        { title: "Tỉ lệ chuyên cần", value: `${stats?.overallAttendanceRate ?? 0}%`, icon: <CheckCircleOutlined />, color: "#722ed1", description: "Nhân viên có mặt đầy đủ" },
        { title: "Ngày nghỉ trung bình", value: stats?.averageLeaveDays, icon: <CalendarOutlined />, color: "#13c2c2", description: "Trung bình ngày nghỉ/nhân viên" },
        { title: "Đơn nghỉ chờ duyệt", value: stats?.pendingLeaveRequests, icon: <FileTextOutlined />, color: "#faad14", description: "Yêu cầu chờ phê duyệt" },
    ];

    return (
        <div className="p-2">
            <PageHeader
                title="Tổng quan nhân sự"
                subtitle="Quản lý nhân lực và thống kê gắn kết nhân viên"
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
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <Spin size="large" tip="Đang tải dữ liệu nhân sự..." />
                </div>
            ) : (
                <>
                    <StatRow items={cards} />

                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={16}>
                            <SectionCard title="Thử việc & Hợp đồng sắp đến hạn" icon={<CalendarOutlined />}>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} md={12}>
                                        <Text strong>Hết thời gian thử việc</Text>
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
                                    <Col xs={24} md={12}>
                                        <Text strong>Gia hạn hợp đồng</Text>
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
                            </SectionCard>

                            <SectionCard title="Hoạt động HR gần đây" icon={<HistoryOutlined />} gap={0}>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={hrData?.recentHrActivities || []}
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

                        <Col xs={24} lg={8}>
                            <SectionCard title="Sinh nhật & Kỷ niệm" icon={<GiftOutlined />} gap={0}>
                                <List
                                    dataSource={hrData?.birthdays || []}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<GiftOutlined style={{ color: '#eb2f96', fontSize: 20 }} />}
                                                title={item.employeeName}
                                                description={<Text type="secondary">{dayjs(item.date).format("DD/MM")}</Text>}
                                            />
                                            <Tag color="magenta">Sinh nhật</Tag>
                                        </List.Item>
                                    )}
                                    locale={{ emptyText: "Không có sinh nhật tháng này" }}
                                />
                            </SectionCard>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default DashboardHR;
