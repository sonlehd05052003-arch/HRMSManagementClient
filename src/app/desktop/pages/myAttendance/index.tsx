import { Typography, Row, Col, Tabs } from "antd";
import AttendanceTodayCard from "./components/AttendanceTodayCard";
import MyAttendanceHistoryTable from "./components/MyAttendanceHistoryTable";
import MyScheduleTable from "./components/MyScheduleTable";
import { ClockCircleOutlined, HistoryOutlined, CalendarOutlined, SwapOutlined } from "@ant-design/icons";
import { PageHeader, SectionCard } from "../../components/listPage";

const { Text } = Typography;

const MyAttendance = () => {
    const items = [
        {
            key: '1',
            icon: <ClockCircleOutlined />,
            label: "Hôm Nay",
            children: (
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={10}>
                        <AttendanceTodayCard />
                    </Col>
                    <Col xs={24} lg={14}>
                        <SectionCard title="Giao dịch chấm công" icon={<SwapOutlined />} gap={0}>
                            <Text type="secondary" className="block" style={{ marginBottom: 16 }}>
                                Các hoạt động check-in/out gần đây nhất của bạn sẽ hiển thị tại đây.
                            </Text>
                            <MyAttendanceHistoryTable embedded />
                        </SectionCard>
                    </Col>
                </Row>
            ),
        },
        {
            key: '2',
            icon: <CalendarOutlined />,
            label: "Lịch Làm Việc",
            children: <MyScheduleTable />,
        },
        {
            key: '3',
            icon: <HistoryOutlined />,
            label: "Lịch Sử Chấm Công",
            children: <MyAttendanceHistoryTable />,
        },
    ];

    return (
        <div className="p-2">
            <PageHeader
                title="Chấm công của tôi"
                subtitle="Hệ thống chấm công bằng nhận diện khuôn mặt"
            />

            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
};

export default MyAttendance;
