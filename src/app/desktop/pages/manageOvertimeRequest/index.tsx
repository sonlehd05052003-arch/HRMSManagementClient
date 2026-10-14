import { Typography, Table, Tag, Button } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchPendingOvertimeRequests, selectPendingOvertimeRequests, selectOvertimeLoading } from "../../../../store/overtimeSlide";
import ReviewOvertimeModal from "./components/ReviewOvertimeModal";
import dayjs from "dayjs";
import { ClockCircleOutlined, TeamOutlined } from "@ant-design/icons";
import { PageHeader, StatRow, TableCard } from "../../components/listPage";

const { Text } = Typography;

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
                        <Text className="font-bold" style={{ whiteSpace: "nowrap" }}>{record.employeeName}</Text>
                        {record.isTopLevel && (
                            <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                                Quản lý
                            </Tag>
                        )}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Mã NV: {record.employeeId}</Text>
                </div>
            ),
        },
        {
            title: "Mã yêu cầu",
            dataIndex: "requestNumber",
            key: "requestNumber",
            render: (text: string) => <Tag color="blue" className="font-mono" style={{ whiteSpace: "nowrap" }}>{text}</Tag>,
        },
        {
            title: "Ngày tăng ca",
            dataIndex: "overtimeDate",
            key: "overtimeDate",
            render: (date: string) => <span style={{ whiteSpace: "nowrap" }}>{dayjs(date).format("DD/MM/YYYY")}</span>,
        },
        {
            title: "Phân loại",
            key: "typeMode",
            render: (_: any, record: any) => (
                <div className="flex flex-col gap-1">
                    <Tag color={record.otType === "NormalDay" ? "blue" : "orange"} className="w-fit">
                        {record.otType === "NormalDay" ? "Ngày thường" : "Ngày nghỉ"}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
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
                <div className="flex items-center gap-2" style={{ whiteSpace: "nowrap" }}>
                    <ClockCircleOutlined className="text-slate-400" />
                    <span className="font-medium">
                        {record.startTime?.slice(0, 5) || "—"} - {record.endTime?.slice(0, 5) || "—"}
                    </span>
                    <Tag color="orange">{record.totalHours}h</Tag>
                </div>
            ),
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            width: 200,
            ellipsis: true,
        },
        {
            title: "Ngày gửi",
            dataIndex: "submittedDate",
            key: "submittedDate",
            render: (date: string) => <span style={{ whiteSpace: "nowrap" }}>{dayjs(date).format("DD/MM/YYYY HH:mm")}</span>,
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
                >
                    Xem xét
                </Button>
            ),
        },
    ];

    return (
        <div className="p-2">
            <PageHeader
                title="Duyệt yêu cầu làm thêm giờ"
                subtitle="Xem và phê duyệt các yêu cầu tăng ca từ nhân viên trong bộ phận."
            />

            <StatRow
                items={[
                    { title: "Chờ phê duyệt", value: pendingRequests.length, prefix: <ClockCircleOutlined />, color: "#f59e0b" },
                    { title: "Tổng nhân viên", value: new Set(pendingRequests.map(r => r.employeeId)).size, prefix: <TeamOutlined />, color: "#3b82f6" },
                ]}
            />

            <TableCard
                title="Danh sách yêu cầu đang chờ"
                count={pendingRequests.length}
                extra={
                    <Tag icon={<ClockCircleOutlined />} color="warning" style={{ marginInlineEnd: 0 }}>
                        Cập nhật trực tiếp
                    </Tag>
                }
            >
                <Table
                    columns={columns}
                    dataSource={pendingRequests}
                    rowKey="overtimeRequestId"
                    loading={loading}
                    pagination={{
                        pageSize: 8,
                        showTotal: (total) => `Tổng cộng ${total} yêu cầu`
                    }}
                    scroll={{ x: "max-content" }}
                />
            </TableCard>

            <ReviewOvertimeModal
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedRecord(null);
                }}
                record={selectedRecord}
            />
        </div>
    );
};

export default ManageOvertimeRequest;
