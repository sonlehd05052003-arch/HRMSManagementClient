import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, message, Tooltip } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchAllProcedures,
    selectHRProcedures,
    selectHRProcedureLoading,   
    approveProcedure,
    rejectProcedure,
    fetchProcedureById,
} from "../../../../store/hrProcedureSlide";
import type { IHRProcedureList } from "../../../../store/hrProcedureSlide";
import Condition from "./Condition";
import AddHRProcedureModal from "./modal/AddHRProcedureModal";
import ReviewHRProcedureModal from "./modal/ReviewHRProcedureModal";
import RejectHRProcedureModal from "./modal/RejectHRProcedureModal";
import { selectInfoLogin } from "../../../../store/authSlide";
import { EUserRole } from "../../../../interface/app";
import { FilterCard, PageHeader, TableCard } from "../../components/listPage";

const STATUS_COLOR: Record<string, string> = {
    Approved: "green",
    Pending: "orange",
    Rejected: "red",
    Applied: "blue",
};

const STATUS_TEXT: Record<string, string> = {
    Approved: "Đã duyệt",
    Pending: "Chờ duyệt",
    Rejected: "Từ chối",
    Applied: "Đã áp dụng",
};

const PROCEDURE_TYPE_MAP: Record<string, string> = {
    Appointment: "Bổ nhiệm",
    Transfer: "Điều chuyển",
    Demotion: "Giáng chức",
    Termination: "Sa thải",
};

const ManageHRProcedure = () => {
    const dispatch = useAppDispatch();
    const procedures = useAppSelector(selectHRProcedures);
    const loading = useAppSelector(selectHRProcedureLoading);
    const infoLogin = useAppSelector(selectInfoLogin);
    
    const currentRole = infoLogin?.role;
    const isTopLevel = infoLogin?.isTopLevel ?? false;

    const canCreate = currentRole === EUserRole.ADMIN || currentRole === EUserRole.HR;
    const canApprove = currentRole === EUserRole.ADMIN || (currentRole === EUserRole.MANAGE && isTopLevel);
    const isHR = currentRole === EUserRole.HR || currentRole === EUserRole.ADMIN;

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [selectedProcedureId, setSelectedProcedureId] = useState<number | null>(null);
    const [editingData, setEditingData] = useState<any>(null);

    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchAllProcedures());
    }, [dispatch]);

    const handleReview = (id: number) => {
        setSelectedProcedureId(id);
        setIsReviewOpen(true);
    };

    const handleUpdate = (id: number) => {
        dispatch(fetchProcedureById(id))
            .unwrap()
            .then((data) => {
                setEditingData(data);
                setIsAddOpen(true);
            })
            .catch(() => {
                message.error("Không thể lấy thông tin chi tiết để cập nhật!");
            });
    };

    const handleApprove = (id: number) => {
        dispatch(approveProcedure({ id, data: {} }))
            .unwrap()
            .then(() => {
                message.success("Đã phê duyệt thủ tục HR!");
                setIsReviewOpen(false);
                dispatch(fetchAllProcedures());
            })
            .catch((err: any) => {
                message.error(typeof err === "string" ? err : "Phê duyệt thất bại!");
            });
    };

    const handleReject = (id: number, reason: string) => {
        dispatch(rejectProcedure({ id, data: { rejectionReason: reason } }))
            .unwrap()
            .then(() => {
                message.success("Đã từ chối thủ tục HR!");
                setIsRejectOpen(false);
                setIsReviewOpen(false);
                dispatch(fetchAllProcedures());
            })
            .catch((err: any) => {
                message.error(typeof err === "string" ? err : "Từ chối thất bại!");
            });
    };

    const filtered = procedures.filter(p => {
        const q = searchText.toLowerCase();
        const matchSearch = p.employeeFullName.toLowerCase().includes(q) ||
                            p.employeeCode.toLowerCase().includes(q) ||
                            p.procedureNumber.toLowerCase().includes(q);
        const matchStatus = statusFilter ? p.status === statusFilter : true;
        const matchType = typeFilter ? p.procedureType === typeFilter : true;
        return matchSearch && matchStatus && matchType;
    });

    const columns = [
        { title: "Mã thủ tục", dataIndex: "procedureNumber", key: "procedureNumber", width: 130 },
        { title: "Mã NV", dataIndex: "employeeCode", key: "employeeCode", width: 100 },
        { 
            title: "Họ và tên", dataIndex: "employeeFullName", key: "employeeFullName", width: 170,
            render: (name: string) => (
                <span style={{ fontWeight: 500 }}>{name}</span>
            )
        },
        { 
            title: "Loại thủ tục", dataIndex: "procedureType", key: "procedureType", width: 150,
            render: (type: string) => <Tag color="blue">{PROCEDURE_TYPE_MAP[type] || type}</Tag>
        },
        { title: "Ngày hiệu lực", dataIndex: "effectiveDate", key: "effectiveDate", width: 130, render: (date: string) => date ? new Date(date).toLocaleDateString("vi-VN") : "N/A" },
        { 
            title: "Trạng thái", dataIndex: "status", key: "status", width: 130,
            render: (status: string) => (
                <Tag color={STATUS_COLOR[status] ?? "default"} style={{ margin: 0 }}>
                    {STATUS_TEXT[status] ?? status}
                </Tag>
            ),
        },
        { title: "Ngày gửi", dataIndex: "submittedDate", key: "submittedDate", width: 150, render: (date: string) => new Date(date).toLocaleString("vi-VN") },
        {
            title: "Thao tác", key: "action", width: 140,
            render: (_: any, record: IHRProcedureList) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button icon={<EyeOutlined />} onClick={() => handleReview(record.procedureId)} />
                    </Tooltip>
                    {isHR && record.status === "Pending" && (
                        <Tooltip title="Chỉnh sửa">
                            <Button icon={<EditOutlined />} onClick={() => handleUpdate(record.procedureId)} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-2">
            <PageHeader
                title="Quản lý Thủ tục HR"
                actions={canCreate && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddOpen(true)}>
                        Tạo thủ tục mới
                    </Button>
                )}
            />
            <FilterCard
                onReset={() => {
                    setSearchText("");
                    setStatusFilter(null);
                    setTypeFilter(null);
                }}
            >
                <Condition
                    searchText={searchText} setSearchText={setSearchText}
                    statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                    typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                />
            </FilterCard>
            <TableCard title="Danh sách thủ tục HR" count={filtered.length}>
                <Table
                    columns={columns} 
                    dataSource={filtered} 
                    rowKey="procedureId"
                    loading={loading} 
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }} 
                    size="middle"
                />
            </TableCard>

            <AddHRProcedureModal 
                open={isAddOpen} 
                initialValues={editingData}
                onCancel={() => { setIsAddOpen(false); setEditingData(null); }}
                onSuccess={() => { 
                    setIsAddOpen(false); 
                    setEditingData(null);
                    dispatch(fetchAllProcedures()); 
                }} 
            />

            {selectedProcedureId && (
                <ReviewHRProcedureModal 
                    open={isReviewOpen} 
                    procedureId={selectedProcedureId}
                    canApprove={canApprove}
                    onCancel={() => setIsReviewOpen(false)}
                    onApprove={() => handleApprove(selectedProcedureId)}
                    onReject={() => setIsRejectOpen(true)}
                />
            )}

            {selectedProcedureId && (
                <RejectHRProcedureModal
                    open={isRejectOpen}
                    onCancel={() => setIsRejectOpen(false)}
                    onSubmit={(reason: string) => handleReject(selectedProcedureId, reason)}
                />
            )}
        </div>
    );
};

export default ManageHRProcedure;
