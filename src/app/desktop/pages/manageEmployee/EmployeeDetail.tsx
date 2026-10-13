import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card, Tabs, Descriptions, Tag, Spin, Button, Space,
    Typography, Avatar, Divider, Row, Col,
} from "antd";
import {
    ArrowLeftOutlined, UserOutlined,
    FileTextOutlined, MailOutlined, PhoneOutlined, EditOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchEmployeeById,
    selectSelectedEmployee,
    selectEmployeeLoading,
} from "../../../../store/employeeSlide";
import DocumentsTab from "./tabs/DocumentsTab";
import ContractsTab from "./tabs/ContractsTab";
import { FileProtectOutlined } from "@ant-design/icons";
import URL from "../../../../constants/url";

const { Title, Text } = Typography;

const STATUS_COLOR: Record<string, string> = {
    Active: "green",
    Inactive: "default",
    Resigned: "red",
    Terminated: "red",
    "On Leave": "orange",
};

const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "—";

const formatCurrency = (v: number | null) =>
    v != null ? v.toLocaleString("vi-VN") + " VND" : "—";

const EmployeeDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const employee = useAppSelector(selectSelectedEmployee);
    const loading = useAppSelector(selectEmployeeLoading);
    const [activeTab, setActiveTab] = useState("info");

    useEffect(() => {
        if (id) dispatch(fetchEmployeeById(Number(id)));
    }, [id, dispatch]);

    if (loading && !employee) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!employee) return null;

    const tabItems = [
        {
            key: "info",
            label: (
                <Space><UserOutlined />Thông tin chung</Space>
            ),
            children: (
                <div>
                    <Row gutter={24}>
                        <Col span={24}>
                            <Divider style={{ fontSize: 14, color: "#1890ff" }}>
                                Thông tin cá nhân
                            </Divider>
                            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                                <Descriptions.Item label="Mã nhân viên">
                                    <Text strong>{employee.employeeCode}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Họ và tên">{employee.fullName}</Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    <Space><MailOutlined />{employee.email}</Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    <Space><PhoneOutlined />{employee.phone ?? "—"}</Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày sinh">{formatDate(employee.dateOfBirth)}</Descriptions.Item>
                                <Descriptions.Item label="Giới tính">{employee.gender ?? "—"}</Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ">{employee.address ?? "—"}</Descriptions.Item>
                                <Descriptions.Item label="Thành phố">{employee.city ?? "—"}</Descriptions.Item>
                                <Descriptions.Item label="Quốc gia">{employee.country ?? "—"}</Descriptions.Item>
                            </Descriptions>
                        </Col>

                        {/* Work info */}
                        <Col span={24}>
                            <Divider style={{ fontSize: 14, color: "#1890ff", marginTop: 20 }}>
                                Thông tin công việc
                            </Divider>
                            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                                <Descriptions.Item label="Phòng ban">{employee.departmentName ?? "—"}</Descriptions.Item>
                                <Descriptions.Item label="Chức vụ">{employee.positionName ?? "—"}</Descriptions.Item>
                                <Descriptions.Item label="Quản lý trực tiếp">{employee.managerName ?? "—"}</Descriptions.Item>
                                <Descriptions.Item label="Lương cơ bản">{formatCurrency(employee.baseSalary)}</Descriptions.Item>
                                <Descriptions.Item label="Mức lương đóng BH">{employee.insuranceSalary ? formatCurrency(employee.insuranceSalary) : "— (dùng lương cơ bản)"}</Descriptions.Item>
                                <Descriptions.Item label="Số người phụ thuộc (NPT)">{employee.numberOfDependents ?? 0}</Descriptions.Item>
                                <Descriptions.Item label="Ngày vào làm">{formatDate(employee.joinDate)}</Descriptions.Item>
                                <Descriptions.Item label="Ngày nghỉ việc">{formatDate(employee.resignationDate)}</Descriptions.Item>
                                <Descriptions.Item label="Loại hình">{employee.employmentType}</Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color={STATUS_COLOR[employee.employmentStatus] ?? "default"}>
                                        {employee.employmentStatus}
                                    </Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                </div>
            ),
        },
        {
            key: "contracts",
            label: (
                <Space><FileProtectOutlined />Hợp đồng</Space>
            ),
            children: <ContractsTab employeeId={employee.employeeId} canManage={true} />,
        },
        {
            key: "documents",
            label: (
                <Space><FileTextOutlined />Tài liệu</Space>
            ),
            children: (
                <DocumentsTab
                    employeeId={employee.employeeId}
                    employeeName={employee.fullName}
                />
            ),
        },
    ];

    return (
        <div className="p-2">
            {/* Header card */}
            <Card
                style={{ marginBottom: 16 }}
                styles={{ body: { padding: "16px 24px" } }}
            >
                <Row align="middle" justify="space-between">
                    <Col>
                        <Space size={16}>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(URL.ManageEmployee)}
                                type="text"
                            />
                            <Avatar
                                size={45}
                                style={{ backgroundColor: "#1890ff", fontSize: 22, fontWeight: 600 }}
                            >
                                {employee.lastName?.[0]?.toUpperCase()}
                            </Avatar>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>{employee.fullName}</Title>
                                <Space style={{ marginTop: 2 }}>
                                    <Text type="secondary">·</Text>
                                    <Text type="secondary">{employee.positionName ?? "—"}</Text>
                                    <Text type="secondary">·</Text>
                                    <Tag color={STATUS_COLOR[employee.employmentStatus] ?? "default"}>
                                        {employee.employmentStatus}
                                    </Tag>
                                </Space>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Button 
                            type="primary" 
                            icon={<EditOutlined />} 
                            onClick={() => navigate(URL.EditEmployee.replace(":id", employee.employeeId.toString()))}
                        >
                            Chỉnh sửa
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Tabs */}
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    size="large"
                />
            </Card>
        </div>
    );
};

export default EmployeeDetail;
