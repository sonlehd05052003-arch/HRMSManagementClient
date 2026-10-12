import { Layout, Typography, Table, Tag, Button, Row, Col, Card, Statistic } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchPendingOvertimeRequests, selectPendingOvertimeRequests, selectOvertimeLoading } from "../../../../store/overtimeSlide";
import ReviewOvertimeModal from "./components/ReviewOvertimeModal";
import dayjs from "dayjs";
import { ClockCircleOutlined, TeamOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

const ManageOvertimeRequest = () => {
    const dispatch = useAppDispatch();
    const pendingRequests = useAppSelector(selectPendingOvertimeRequests);
    const loading = useAppSelector(selectOvertimeLoading);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchPendingOvertimeRequests());
    }, [dispatch]);

    const handleReview = (record: any) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const columns = [
        {
            title: "Nhân viên",
            key: "employee",
            render: (_: any, record: any) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Text className="font-bold text-slate-800">{record.employeeName}</Text>
                        {record.isTopLevel && (
                            <Tag color="blue" className="rounded-full px-3 m-0 border-blue-100 text-[10px] font-bold uppercase tracking-wider">
                                Quản lý
                            </Tag>
                        )}
                    </div>
                    <Text type="secondary" className="text-xs">Mã NV: {record.employeeId}</Text>
                </div>
            ),
        },
        {
            title: "Mã yêu cầu",
            dataIndex: "requestNumber",
            key: "requestNumber",
            render: (text: string) => <Tag color="blue" className="font-mono">{text}</Tag>,
        },
        {
            title: "Ngày tăng ca",
            dataIndex: "overtimeDate",
            key: "overtimeDate",
            render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Phân loại",
            key: "typeMode",
            render: (_: any, record: any) => (
                <div className="flex flex-col gap-1">
                    <Tag color={record.otType === "NormalDay" ? "blue" : "orange"} className="w-fit border-none font-bold text-[10px] uppercase">
                        {record.otType === "NormalDay" ? "Ngày thường" : "Ngày nghỉ"}
                    </Tag>
                    <Text className="text-xs text-slate-500 font-medium">
                        {record.otMode === "AfterShift" ? "Sau ca" : 
                         record.otMode === "BeforeShift" ? "Trước ca" : "Linh hoạt"}
                    </Text>
                </div>
            )
        },
        {
            title: "Thời gian",
            key: "time",
            render: (_: any, record: any) => (
                <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-slate-400" />
                    <span className="font-medium text-slate-700">
                        {record.startTime?.slice(0, 5) || "—"} - {record.endTime?.slice(0, 5) || "—"}
                    </span>
                    <Tag color="orange" className="border-none font-bold">{record.totalHours}h</Tag>
                </div>
            ),
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            ellipsis: true,
        },
        {
            title: "Ngày gửi",
            dataIndex: "submittedDate",
            key: "submittedDate",
            render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Thao tác",
            key: "action",
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Button 
                    type="primary" 
                    ghost 
                    onClick={() => handleReview(record)}
                    className="rounded-lg font-semibold hover:bg-blue-50"
                >
                    Xem xét
                </Button>
            ),
        },
    ];

    return (
        <Layout className="bg-slate-50/30 p-4 min-h-screen">
            <Content>
                <div className="mb-10">
                    <Title level={2} className="m-0 text-slate-900 font-extrabold tracking-tight">Duyệt yêu cầu làm thêm giờ</Title>
                    <p className="text-slate-500 mt-2 text-lg font-medium opacity-80">Xem và phê duyệt các yêu cầu tăng ca từ nhân viên trong bộ phận.</p>
                </div>

                <Row gutter={[24, 24]} className="mb-10">
                    <Col xs={24} md={8}>
                        <Card className="rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden group">
                            <div className="p-2">
                                <Statistic
                                    title={<span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chờ phê duyệt</span>}
                                    value={pendingRequests.length}
                                    prefix={<ClockCircleOutlined className="mr-3 p-3 rounded-2xl bg-orange-50 text-orange-500 transition-transform group-hover:scale-110" />}
                                    styles={{ content: { color: '#f59e0b', fontWeight: 900, fontSize: '2.5rem' } }}
                                />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="rounded-3xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden group">
                            <div className="p-2">
                                <Statistic
                                    title={<span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tổng nhân viên</span>}
                                    value={new Set(pendingRequests.map(r => r.employeeId)).size}
                                    prefix={<TeamOutlined className="mr-3 p-3 rounded-2xl bg-blue-50 text-blue-500 transition-transform group-hover:scale-110" />}
                                    styles={{ content: { color: '#3b82f6', fontWeight: 900, fontSize: '2.5rem' } }}
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Card className="rounded-3xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.02)] bg-white/80 backdrop-blur-xl p-4 overflow-hidden">
                    <div className="mb-8 flex items-center justify-between">
                        <Title level={4} className="m-0 flex items-center font-bold text-slate-800">
                            <span className="w-2 h-8 bg-blue-500 rounded-full mr-5 shadow-[0_0_15px_rgba(59,130,246,0.3)]"></span>
                            Danh sách yêu cầu đang chờ
                        </Title>
                        <Tag icon={<ClockCircleOutlined />} color="warning" className="px-4 py-1.5 rounded-full font-bold border-none shadow-sm">
                            Cập nhật trực tiếp
                        </Tag>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={pendingRequests}
                        rowKey="overtimeRequestId"
                        loading={loading}
                        pagination={{ 
                            pageSize: 8,
                            showTotal: (total) => `Tổng cộng ${total} yêu cầu`
                        }}
                        className="custom-ant-table"
                    />
                </Card>

                <ReviewOvertimeModal
                    open={isModalOpen}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedRecord(null);
                    }}
                    record={selectedRecord}
                />
            </Content>
        </Layout>
    );
};

export default ManageOvertimeRequest;
