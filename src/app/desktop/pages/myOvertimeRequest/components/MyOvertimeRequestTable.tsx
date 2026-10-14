import { Table, Tag, Button, Modal, message, Typography } from "antd";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { fetchMyOvertimeRequests, cancelOvertimeRequest, selectMyOvertimeRequests, selectOvertimeLoading } from "../../../../../store/overtimeSlide";
import dayjs from "dayjs";
import { TableCard } from "../../../components/listPage";

const { Text } = Typography;

const MyOvertimeRequestTable = () => {
    const dispatch = useAppDispatch();
    const requests = useAppSelector(selectMyOvertimeRequests);
    const loading = useAppSelector(selectOvertimeLoading);

    useEffect(() => {
        dispatch(fetchMyOvertimeRequests());
    }, [dispatch]);

    const handleCancel = (id: number) => {
        Modal.confirm({
            title: 'Hủy yêu cầu',
            content: 'Bạn có chắc chắn muốn hủy yêu cầu tăng ca này không?',
            onOk: () => {
                dispatch(cancelOvertimeRequest({ id, data: { reason: "Người dùng tự hủy" } }))
                    .unwrap()
                    .then(() => {
                        message.success("Đã hủy yêu cầu!");
                        dispatch(fetchMyOvertimeRequests());
                    })
                    .catch((err: any) => {
                        const errMsg = typeof err === "string" ? err : err?.message || "Hủy yêu cầu thất bại!";
                        message.error(errMsg);
                    });
            }
        });
    };

    const columns = [
        {
            title: "Mã yêu cầu",
            dataIndex: "requestNumber",
            key: "requestNumber",
            render: (text: string) => <Text className="font-semibold text-blue-600" style={{ whiteSpace: "nowrap" }}>{text}</Text>,
        },
        {
            title: "Ngày",
            dataIndex: "overtimeDate",
            key: "overtimeDate",
            render: (date: string) => <span style={{ whiteSpace: "nowrap" }}>{dayjs(date).format("DD/MM/YYYY")}</span>,
        },
        {
            title: "Thời gian",
            key: "time",
            render: (_: any, record: any) => (
                <span style={{ whiteSpace: "nowrap" }}>
                    {record.startTime.slice(0, 5)} - {record.endTime.slice(0, 5)} ({record.totalHours} giờ)
                </span>
            ),
        },
        {
            title: "Loại & Chế độ",
            key: "typeMode",
            render: (_: any, record: any) => (
                <div className="flex flex-col gap-1">
                    <Tag color={record.otType === "NormalDay" ? "blue" : "orange"} className="w-fit">
                        {record.otType === "NormalDay" ? "Ngày thường" : "Ngày nghỉ"}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.otMode === "AfterShift" ? "Sau ca" : 
                         record.otMode === "BeforeShift" ? "Trước ca" : "Linh hoạt"}
                    </Text>
                </div>
            )
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            width: 200,
            ellipsis: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                let color = "processing";
                if (status === "Approved") color = "success";
                if (status === "Rejected") color = "error";
                if (status === "Cancelled") color = "default";
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: any) => (
                record.status === "Pending" ? (
                    <Button type="link" danger onClick={() => handleCancel(record.overtimeRequestId)}>Hủy</Button>
                ) : null
            ),
        },
    ];

    return (
        <TableCard title="Lịch sử tăng ca" count={requests.length}>
            <Table
                columns={columns}
                dataSource={requests}
                rowKey="overtimeRequestId"
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: "max-content" }}
            />
        </TableCard>
    );
};

export default MyOvertimeRequestTable;
