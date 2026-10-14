import { Table, Tag, Button, Popconfirm, message, Space } from "antd";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { 
    fetchMyLeaveRequests, 
    cancelLeaveRequest, 
    selectMyLeaveRequests, 
    selectLeaveRequestLoading 
} from "../../../../../store/leaveRequestSlide";
import dayjs from "dayjs";
import { TableCard } from "../../../components/listPage";

const MyLeaveRequestTable = () => {
    const dispatch = useAppDispatch();
    const requests = useAppSelector(selectMyLeaveRequests);
    const loading = useAppSelector(selectLeaveRequestLoading);

    useEffect(() => {
        dispatch(fetchMyLeaveRequests());
    }, [dispatch]);

    const handleCancel = (id: number) => {
        const payload = { reason: "Người dùng tự hủy yêu cầu" };
        dispatch(cancelLeaveRequest({ id, data: payload }))
            .unwrap()
            .then(() => {
                message.success("Đã hủy yêu cầu nghỉ phép thành công.");
                dispatch(fetchMyLeaveRequests());
            })
            .catch((err: any) => {
                message.error(err?.message || "Không thể hủy yêu cầu.");
            });
    };

    const columns = [
        {
            title: "Mã yêu cầu",
            dataIndex: "requestNumber",
            key: "requestNumber",
            render: (text: string) => <span className="font-semibold text-blue-600" style={{ whiteSpace: "nowrap" }}>{text}</span>
        },
        {
            title: "Loại nghỉ",
            dataIndex: "leaveTypeName",
            key: "leaveTypeName",
        },
        {
            title: "Thời gian",
            key: "dates",
            render: (_: any, record: any) => (
                <span style={{ whiteSpace: "nowrap" }}>
                    {dayjs(record.startDate).format("DD/MM/YYYY")} - {dayjs(record.endDate).format("DD/MM/YYYY")}
                </span>
            )
        },
        {
            title: "Số ngày",
            dataIndex: "numberOfDays",
            key: "numberOfDays",
            align: "center" as const
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            width: 200,
            ellipsis: true
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                let color = "default";
                switch (status) {
                    case "Approved": color = "success"; break;
                    case "Rejected": color = "error"; break;
                    case "Pending": color = "processing"; break;
                    case "Cancelled": color = "default"; break;
                }
                const statusMap: Record<string, string> = {
                    "Approved": "Đã duyệt",
                    "Rejected": "Từ chối",
                    "Pending": "Chờ duyệt",
                    "Cancelled": "Đã hủy"
                };
                return <Tag color={color}>{statusMap[status] || status}</Tag>;
            }
        },
        {
            title: "Ngày gửi",
            dataIndex: "submittedDate",
            key: "submittedDate",
            render: (date: string) => <span style={{ whiteSpace: "nowrap" }}>{dayjs(date).format("DD/MM/YYYY HH:mm")}</span>
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: any) => (
                <Space size="middle">
                    {record.status === "Pending" && (
                        <Popconfirm
                            title="Bạn có chắc chắn muốn hủy yêu cầu này?"
                            onConfirm={() => handleCancel(record.leaveRequestID)}
                            okText="Hủy yêu cầu"
                            cancelText="Đóng"
                        >
                            <Button danger ghost>Hủy</Button>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <TableCard title="Lịch sử nghỉ phép" count={(requests || []).length}>
            <Table
                columns={columns}
                dataSource={requests || []}
                loading={loading}
                rowKey="leaveRequestID"
                pagination={{ pageSize: 10 }}
                scroll={{ x: "max-content" }}
            />
        </TableCard>
    );
};

export default MyLeaveRequestTable;
