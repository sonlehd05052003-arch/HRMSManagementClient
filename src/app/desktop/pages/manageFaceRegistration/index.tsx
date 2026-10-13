import React, { useEffect, useMemo, useState } from "react";
import {
    Card, Table, Button, Input, Space, Tag, Tooltip,
    Popconfirm, message, Row, Col, Statistic, Badge
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
import { FilterCard, PageHeader, TableCard } from "../../components/listPage";

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
            title: "Họ và tên", dataIndex: "fullName", key: "fullName",
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
            title: "Ngày đăng ký", key: "registeredAt", align: "center" as const,
            render: (_: any, r: EmployeeFaceStatusDto) => r.registeredAt
                ? <span className="text-sm">{dayjs(r.registeredAt).format("DD/MM/YYYY HH:mm")}</span>
                : <span className="text-slate-400">—</span>
        },
        {
            title: "Cập nhật lần cuối", key: "lastUpdatedAt", align: "center" as const,
            render: (_: any, r: EmployeeFaceStatusDto) => r.lastUpdatedAt
                ? <span className="text-sm text-slate-500">{dayjs(r.lastUpdatedAt).format("DD/MM/YYYY HH:mm")}</span>
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
        <div className="p-6 bg-[#f8fafc] min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <PageHeader
                    title={<><CameraOutlined className="mr-3 text-indigo-600" />Quản lý Đăng ký Khuôn mặt</>}
                    subtitle="HR phụ trách đăng ký và quản lý khuôn mặt cho từng nhân viên. Nhân viên không thể tự đăng ký."
                />

                {/* Thống kê */}
                <Row gutter={16} className="mb-6">
                    <Col xs={8}>
                        <Card size="small" className="bg-blue-50 border-blue-200 text-center">
                            <Statistic
                                title={<span className="text-blue-600 text-xs font-medium">Tổng nhân viên</span>}
                                value={stats.total}
                                valueStyle={{ color: '#1d4ed8', fontSize: 22 }}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={8}>
                        <Card size="small" className="bg-green-50 border-green-200 text-center">
                            <Statistic
                                title={<span className="text-green-600 text-xs font-medium">Đã đăng ký</span>}
                                value={stats.registered}
                                valueStyle={{ color: '#15803d', fontSize: 22 }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={8}>
                        <Card size="small" className="bg-red-50 border-red-200 text-center">
                            <Statistic
                                title={<span className="text-red-600 text-xs font-medium">Chưa đăng ký</span>}
                                value={stats.unregistered}
                                valueStyle={{ color: '#dc2626', fontSize: 22 }}
                                prefix={<CloseCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

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
                        <Badge
                            count={stats.unregistered}
                            showZero={false}
                            color="red"
                            title={`${stats.unregistered} nhân viên chưa đăng ký`}
                        >
                            <span className="text-sm text-slate-500">
                                {stats.unregistered > 0
                                    ? `${stats.unregistered} nhân viên chưa đăng ký khuôn mặt`
                                    : "Tất cả nhân viên đã đăng ký"}
                            </span>
                        </Badge>
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
            </div>

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
