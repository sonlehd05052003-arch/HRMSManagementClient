import React, { useEffect, useMemo, useState } from "react";
import {
    Table, Button, Input, Space, Tag, Tooltip,
    Popconfirm, message, Typography
} from "antd";
import {
    SearchOutlined, ReloadOutlined, UserOutlined,
    CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined,
    CameraOutlined, TeamOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchAllEmployeesFaceStatus, adminDeleteFace,
    selectEmployeesFaceStatus, selectFaceLoading,
    type EmployeeFaceStatusDto
} from "../../../../store/faceSlide";
import dayjs from "dayjs";
import HRFaceRegisterModal from "./HRFaceRegisterModal";
import { errorText } from "../../../../utils/apiError";
import { FilterCard, PageHeader, StatRow, TableCard } from "../../components/listPage";

const ManageFaceRegistrationPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const employees = useAppSelector(selectEmployeesFaceStatus);
    const loading = useAppSelector(selectFaceLoading);

    const [search, setSearch] = useState("");
    const [modal, setModal] = useState<{ open: boolean; employeeId: number; employeeName: string }>({
        open: false, employeeId: 0, employeeName: ""
    });

    useEffect(() => {
        dispatch(fetchAllEmployeesFaceStatus());
    }, [dispatch]);

    const filtered = useMemo(() => {
        if (!search.trim()) return employees;
        const q = search.toLowerCase();
        return employees.filter(e =>
            e.fullName.toLowerCase().includes(q) ||
            e.employeeCode.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q) ||
            (e.departmentName ?? "").toLowerCase().includes(q)
        );
    }, [employees, search]);

    const stats = useMemo(() => ({
        total: employees.length,
        registered: employees.filter(e => e.isRegistered).length,
        unregistered: employees.filter(e => !e.isRegistered).length,
    }), [employees]);

    const handleDelete = async (employeeId: number, name: string) => {
        try {
            await dispatch(adminDeleteFace(employeeId)).unwrap();
            message.success(`Đã xóa hồ sơ khuôn mặt của ${name}`);
            dispatch(fetchAllEmployeesFaceStatus());
        } catch (error) {
            message.error(errorText(error, "Xóa thất bại"));
        }
    };

    const handleRegisterSuccess = () => {
        setModal({ open: false, employeeId: 0, employeeName: "" });
        dispatch(fetchAllEmployeesFaceStatus());
    };

    const columns = [
        {
            title: "Mã NV", dataIndex: "employeeCode", key: "employeeCode",
            width: 90, align: "center" as const,
        },
        {
            title: "Họ và tên", dataIndex: "fullName", key: "fullName", ellipsis: true,
            render: (name: string) => (
                <Space>
                    <UserOutlined className="text-slate-400" />
                    <span className="font-medium">{name}</span>
                </Space>
            )
        },
        {
            title: "Phòng ban", dataIndex: "departmentName", key: "departmentName",
            render: (v: string) => v ?? <span className="text-slate-400">—</span>
        },
        {
            title: "Chức vụ", dataIndex: "positionName", key: "positionName",
            render: (v: string) => v ?? <span className="text-slate-400">—</span>
        },
        {
            title: "Trạng thái khuôn mặt", key: "isRegistered", align: "center" as const,
            render: (_: any, r: EmployeeFaceStatusDto) => r.isRegistered
                ? <Tag color="success" icon={<CheckCircleOutlined />}>Đã đăng ký</Tag>
                : <Tag color="error" icon={<CloseCircleOutlined />}>Chưa đăng ký</Tag>
        },
        {
            title: "Ngày đăng ký", key: "registeredAt", align: "center" as const, width: 150,
            render: (_: any, r: EmployeeFaceStatusDto) => r.registeredAt
                ? <span style={{ whiteSpace: "nowrap" }}>{dayjs(r.registeredAt).format("DD/MM/YYYY HH:mm")}</span>
                : <span className="text-slate-400">—</span>
        },
        {
            title: "Cập nhật lần cuối", key: "lastUpdatedAt", align: "center" as const, width: 150,
            render: (_: any, r: EmployeeFaceStatusDto) => r.lastUpdatedAt
                ? <span className="text-slate-500" style={{ whiteSpace: "nowrap" }}>{dayjs(r.lastUpdatedAt).format("DD/MM/YYYY HH:mm")}</span>
                : <span className="text-slate-400">—</span>
        },
        {
            title: "Thao tác", key: "action", align: "center" as const,
            render: (_: any, r: EmployeeFaceStatusDto) => (
                <Space>
                    <Tooltip title={r.isRegistered ? "Cập nhật khuôn mặt" : "Đăng ký khuôn mặt"}>
                        <Button
                            type="primary"
                            size="small"
                            icon={<CameraOutlined />}
                            onClick={() => setModal({ open: true, employeeId: r.employeeId, employeeName: r.fullName })}
                        >
                            {r.isRegistered ? "Cập nhật" : "Đăng ký"}
                        </Button>
                    </Tooltip>
                    {r.isRegistered && (
                        <Tooltip title="Xóa hồ sơ khuôn mặt">
                            <Popconfirm
                                title={`Xóa hồ sơ khuôn mặt của ${r.fullName}?`}
                                description="Nhân viên sẽ không thể chấm công bằng khuôn mặt cho đến khi đăng ký lại."
                                onConfirm={() => handleDelete(r.employeeId, r.fullName)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button danger size="small" icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="p-2">
            <PageHeader
                title="Quản lý đăng ký khuôn mặt"
                subtitle="HR phụ trách đăng ký và quản lý khuôn mặt cho từng nhân viên. Nhân viên không thể tự đăng ký."
            />

            <StatRow
                items={[
                    { title: "Tổng nhân viên", value: stats.total, prefix: <TeamOutlined />, color: "#1d4ed8" },
                    { title: "Đã đăng ký", value: stats.registered, prefix: <CheckCircleOutlined />, color: "#15803d" },
                    { title: "Chưa đăng ký", value: stats.unregistered, prefix: <CloseCircleOutlined />, color: "#dc2626" },
                ]}
            />

            <FilterCard
                onReset={() => setSearch("")}
                extra={
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => dispatch(fetchAllEmployeesFaceStatus())}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                }
            >
                <Input
                    placeholder="Tìm theo tên, mã NV, phòng ban..."
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
            </FilterCard>

            <TableCard
                title="Danh sách nhân viên"
                count={filtered.length}
                extra={
                    <Typography.Text type={stats.unregistered > 0 ? "danger" : "secondary"}>
                        {stats.unregistered > 0
                            ? `${stats.unregistered} nhân viên chưa đăng ký khuôn mặt`
                            : "Tất cả nhân viên đã đăng ký"}
                    </Typography.Text>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="employeeId"
                    loading={loading}
                    pagination={{ pageSize: 15, showSizeChanger: false }}
                    bordered
                    rowClassName={(r) => !r.isRegistered ? "bg-red-50" : ""}
                />
            </TableCard>

            <HRFaceRegisterModal
                open={modal.open}
                employeeId={modal.employeeId}
                employeeName={modal.employeeName}
                onCancel={() => setModal({ open: false, employeeId: 0, employeeName: "" })}
                onSuccess={handleRegisterSuccess}
            />
        </div>
    );
};

export default ManageFaceRegistrationPage;
