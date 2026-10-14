import { Table, Tag, Button, Popconfirm, message, Tooltip } from "antd";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import {
    fetchMyResignationRequests,
    cancelResignationRequest,
    selectMyResignationRequests,
    selectResignationRequestLoading,
} from "../../../../../store/resignationRequestSlide";
import dayjs from "dayjs";
import { TableCard } from "../../../components/listPage";

const statusMap: Record<string, { label: string; color: string }> = {
    Pending:   { label: "Chờ duyệt",  color: "orange"  },
    Approved:  { label: "Đã duyệt",   color: "success" },
    Rejected:  { label: "Từ chối",    color: "error"   },
    Cancelled: { label: "Đã hủy",     color: "default" },
};

const MyResignationRequestTable = () => {
    const dispatch = useAppDispatch();
    const requests = useAppSelector(selectMyResignationRequests);
    const loading = useAppSelector(selectResignationRequestLoading);

    useEffect(() => {
        dispatch(fetchMyResignationRequests());
    }, [dispatch]);

    const handleCancel = (id: number) => {
        dispatch(cancelResignationRequest(id))
            .unwrap()
            .then(() => {
                message.success("Đã hủy đơn xin thôi việc.");
                dispatch(fetchMyResignationRequests());
            })
            .catch((err: any) => {
                message.error(err?.message || "Không thể hủy đơn.");
            });
    };

    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "requestNumber",
            key: "requestNumber",
            render: (text: string) => <span className="font-semibold text-red-600" style={{ whiteSpace: "nowrap" }}>{text}</span>,
        },
        {
            title: "Ngày nộp",
            dataIndex: "submittedDate",
            key: "submittedDate",
            render: (d: string) => <span style={{ whiteSpace: "nowrap" }}>{dayjs(d).format("DD/MM/YYYY HH:mm")}</span>,
        },
        {
            title: "Ngày nghỉ dự kiến",
            dataIndex: "expectedLastWorkingDate",
            key: "expectedLastWorkingDate",
            render: (d: string) => (
                <span className="font-medium" style={{ whiteSpace: "nowrap" }}>{dayjs(d).format("DD/MM/YYYY")}</span>
            ),
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            width: 200,
            ellipsis: true,
            render: (text: string) => text || <span className="text-gray-400 italic">Không có</span>,
        },
        {
            title: "Bàn giao cho",
            dataIndex: "handoverToEmployeeName",
            key: "handoverToEmployeeName",
            render: (text: string) => text || <span className="text-gray-400 italic">Chưa chỉ định</span>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string, record: any) => {
                const s = statusMap[status] || { label: status, color: "default" };
                return (
                    <div className="flex flex-col gap-1">
                        <Tag color={s.color}>{s.label}</Tag>
                        {status === "Rejected" && record.rejectionReason && (
                            <Tooltip title={record.rejectionReason}>
                                <span className="text-red-500 cursor-pointer truncate max-w-[120px]" style={{ fontSize: 12 }}>
                                    {record.rejectionReason}
                                </span>
                            </Tooltip>
                        )}
                        {status === "Approved" && record.reviewerComments && (
                            <span className="text-gray-400 italic truncate max-w-[120px]" style={{ fontSize: 12 }}>
                                {record.reviewerComments}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Ngày duyệt",
            dataIndex: "reviewedDate",
            key: "reviewedDate",
            render: (d: string) => <span style={{ whiteSpace: "nowrap" }}>{d ? dayjs(d).format("DD/MM/YYYY") : "—"}</span>,
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: any) =>
                record.status === "Pending" ? (
                    <Popconfirm
                        title="Hủy đơn xin thôi việc?"
                        description="Bạn có chắc chắn muốn hủy đơn này không?"
                        onConfirm={() => handleCancel(record.resignationRequestId)}
                        okText="Hủy đơn"
                        cancelText="Đóng"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger ghost>Hủy đơn</Button>
                    </Popconfirm>
                ) : null,
        },
    ];

    return (
        <TableCard title="Lịch sử đơn thôi việc" count={(requests || []).length}>
            <Table
                columns={columns}
                dataSource={requests || []}
                loading={loading}
                rowKey="resignationRequestId"
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: "Bạn chưa có đơn xin thôi việc nào." }}
                scroll={{ x: "max-content" }}
            />
        </TableCard>
    );
};

export default MyResignationRequestTable;
