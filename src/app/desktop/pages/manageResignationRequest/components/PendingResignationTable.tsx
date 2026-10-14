import { Table, Button, Space, Modal, Input, message, Tag, Badge, Tooltip, Typography } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import {
    fetchPendingResignationRequests,
    approveResignationRequest,
    rejectResignationRequest,
    selectPendingResignationRequests,
    selectResignationRequestLoading,
} from "../../../../../store/resignationRequestSlide";
import dayjs from "dayjs";
import { TableCard } from "../../../components/listPage";

const { TextArea } = Input;

const PendingResignationTable = () => {
    const dispatch = useAppDispatch();
    const requests = useAppSelector(selectPendingResignationRequests);
    const loading = useAppSelector(selectResignationRequestLoading);

    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [comments, setComments] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [detailModal, setDetailModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchPendingResignationRequests());
    }, [dispatch]);

    const handleApprove = () => {
        if (!selectedId) return;
        dispatch(approveResignationRequest({ id: selectedId, data: { comments } }))
            .unwrap()
            .then(() => {
                message.success("Đã phê duyệt đơn xin thôi việc. HR có thể tiến hành thủ tục thôi việc.");
                setApproveModal(false);
                setComments("");
                dispatch(fetchPendingResignationRequests());
            })
            .catch((err: any) => message.error(err?.message || "Lỗi khi phê duyệt."));
    };

    const handleReject = () => {
        if (!selectedId) return;
        if (!rejectReason.trim()) {
            message.warning("Vui lòng nhập lý do từ chối.");
            return;
        }
        dispatch(rejectResignationRequest({ id: selectedId, data: { rejectionReason: rejectReason } }))
            .unwrap()
            .then(() => {
                message.success("Đã từ chối đơn xin thôi việc.");
                setRejectModal(false);
                setRejectReason("");
                dispatch(fetchPendingResignationRequests());
            })
            .catch((err: any) => message.error(err?.message || "Lỗi khi từ chối."));
    };

    const columns = [
        {
            title: "Nhân viên",
            key: "employee",
            render: (_: any, record: any) => (
                <div>
                    <div className="font-medium" style={{ whiteSpace: "nowrap" }}>{record.employeeName}</div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>{record.employeeCode}</Typography.Text>
                </div>
            ),
        },
        {
            title: "Ngày nộp",
            dataIndex: "submittedDate",
            key: "submittedDate",
            render: (d: string) => <span style={{ whiteSpace: "nowrap" }}>{dayjs(d).format("DD/MM/YYYY")}</span>,
        },
        {
            title: "Ngày nghỉ dự kiến",
            dataIndex: "expectedLastWorkingDate",
            key: "expectedLastWorkingDate",
            render: (d: string) => (
                <span className="font-medium text-red-600" style={{ whiteSpace: "nowrap" }}>{dayjs(d).format("DD/MM/YYYY")}</span>
            ),
        },
        {
            title: "Bàn giao cho",
            dataIndex: "handoverToEmployeeName",
            key: "handoverToEmployeeName",
            render: (text: string) => text || <Typography.Text type="secondary" italic>Chưa chỉ định</Typography.Text>,
        },
        {
            title: "Task tồn đọng",
            dataIndex: "incompleteTaskCount",
            key: "incompleteTaskCount",
            align: "center" as const,
            render: (count: number) =>
                count > 0 ? (
                    <Tooltip title={`${count} task chưa hoàn thành`}>
                        <Badge count={count} color="red" />
                    </Tooltip>
                ) : (
                    <Tag color="success">Không có</Tag>
                ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: any) => (
                <Space size="small">
                    <Button
                        onClick={() => { setSelectedRecord(record); setDetailModal(true); }}
                    >
                        Xem chi tiết
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => { setSelectedId(record.resignationRequestId); setApproveModal(true); }}
                    >
                        Duyệt
                    </Button>
                    <Button
                        danger
                        onClick={() => { setSelectedId(record.resignationRequestId); setRejectModal(true); }}
                    >
                        Từ chối
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <TableCard title="Đơn xin thôi việc chờ phê duyệt" count={(requests || []).length}>

            <Table
                columns={columns}
                dataSource={requests || []}
                loading={loading}
                rowKey="resignationRequestId"
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: "Không có đơn nào chờ phê duyệt." }}
                scroll={{ x: "max-content" }}
            />

            {/* Detail Modal */}
            <Modal
                title={`Chi tiết đơn — ${selectedRecord?.requestNumber}`}
                open={detailModal}
                onOk={() => setDetailModal(false)}
                onCancel={() => setDetailModal(false)}
                okText="Đóng"
                cancelButtonProps={{ style: { display: "none" } }}
                width={600}
            >
                {selectedRecord && (
                    <div className="space-y-3 py-2">
                        <div><span className="font-medium">Nhân viên:</span> {selectedRecord.employeeName} ({selectedRecord.employeeCode})</div>
                        <div><span className="font-medium">Ngày nghỉ dự kiến:</span> {dayjs(selectedRecord.expectedLastWorkingDate).format("DD/MM/YYYY")}</div>
                        <div><span className="font-medium">Lý do:</span> {selectedRecord.reason || <span className="text-gray-400 italic">Không có</span>}</div>
                        <div><span className="font-medium">Bàn giao cho:</span> {selectedRecord.handoverToEmployeeName || <span className="text-gray-400 italic">Chưa chỉ định</span>}</div>
                        {selectedRecord.handoverNote && (
                            <div>
                                <div className="font-medium mb-1">Nội dung bàn giao:</div>
                                <div className="bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{selectedRecord.handoverNote}</div>
                            </div>
                        )}
                        {selectedRecord.incompleteTaskCount > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <span className="text-red-600 font-medium">⚠️ {selectedRecord.incompleteTaskCount} task chưa hoàn thành</span>
                                <p className="text-red-500 mt-1">Nhân viên cần xử lý hoặc bàn giao các task này trước ngày nghỉ.</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Approve Modal */}
            <Modal
                title="Phê duyệt đơn xin thôi việc"
                open={approveModal}
                onOk={handleApprove}
                confirmLoading={loading}
                onCancel={() => { setApproveModal(false); setComments(""); }}
                okText="Xác nhận duyệt"
            >
                <Typography.Paragraph type="secondary">Bạn xác nhận phê duyệt đơn xin thôi việc này. HR sẽ tiến hành thủ tục thôi việc sau khi được duyệt.</Typography.Paragraph>
                <label className="block font-medium mb-2">Ghi chú (không bắt buộc)</label>
                <TextArea
                    rows={3}
                    placeholder="Nhập ghi chú..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                />
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="Từ chối đơn xin thôi việc"
                open={rejectModal}
                onOk={handleReject}
                confirmLoading={loading}
                onCancel={() => { setRejectModal(false); setRejectReason(""); }}
                okText="Xác nhận từ chối"
                okButtonProps={{ danger: true }}
            >
                <label className="block font-medium mb-2">Lý do từ chối (bắt buộc)</label>
                <TextArea
                    rows={4}
                    placeholder="Vui lòng nhập lý do từ chối..."
                    status={!rejectReason ? "error" : ""}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
            </Modal>
        </TableCard>
    );
};

export default PendingResignationTable;
