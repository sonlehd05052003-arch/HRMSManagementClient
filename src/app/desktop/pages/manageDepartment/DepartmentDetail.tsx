import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Descriptions, Button, Tag, Spin, message, Modal, Table, Tooltip } from "antd";
import { ApartmentOutlined, ArrowLeftOutlined, EditOutlined, StopOutlined, EyeOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchDepartmentById, selectSelectedDepartment, selectDepartmentLoading, deactivateDepartment } from "../../../../store/departmentSlide";
import EditDepartmentModal from "./modal/EditDepartmentModal";
import type { ColumnsType } from "antd/es/table";
import type { IDepartmentEmployee } from "../../../../store/departmentSlide";

import { PageHeader, SectionCard, TableCard } from "../../components/listPage";

const DepartmentDetail = () => {
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const department = useAppSelector(selectSelectedDepartment);
    const loading = useAppSelector(selectDepartmentLoading);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchDepartmentById(parseInt(id)));
        }
    }, [id, dispatch]);

    const handleDeactivate = () => {
        if (!department) return;
        Modal.confirm({
            title: "Xác nhận ngừng sử dụng",
            content: "Bạn có chắc muốn ngừng sử dụng phòng ban này?",
            onOk: () => {
                dispatch(deactivateDepartment(department.departmentId)).then((res: any) => {
                    if (!res.error) {
                        message.success("Đã ngừng sử dụng phòng ban (MSG-95)");
                        navigate("/hr/manage-department");
                    } else {
                        const error = res.payload;
                        const msg = typeof error === 'string' ? error : error?.message || "Không thể ngừng sử dụng phòng ban (MSG-96)";
                        message.error(msg);
                    }
                });
            }
        });
    };

    const initialValues = useMemo(() => {
        if (!department) return {};
        return {
            departmentCode: department.departmentCode,
            departmentName: department.departmentName,
            description: department.description,
            managerId: department.managerId
        };
    }, [department]);

    const employeeColumns: ColumnsType<IDepartmentEmployee> = [
        {
            title: 'Mã NV',
            dataIndex: 'employeeCode',
            key: 'employeeCode',
            width: 150,
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text, record) => (
                <a onClick={() => navigate(`/hr/manage-employee/${record.employeeId}`)} style={{ fontWeight: 500 }}>
                    {text}
                </a>
            ),
        },
        {
            title: 'Chức vụ',
            dataIndex: 'positionName',
            key: 'positionName',
            render: (text) => text || "—",
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => text || "—",
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            render: (text) => text || "—",
        },
        {
            title: 'Trạng thái',
            dataIndex: 'employmentStatus',
            key: 'employmentStatus',
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'orange'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button 
                        icon={<EyeOutlined />} 
                        onClick={() => navigate(`/hr/manage-employee/${record.employeeId}`)} 
                    />
                </Tooltip>
            ),
        },
    ];

    if (loading && !department) {
        return <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" /></div>;
    }

    if (!department) {
        return <div className="p-2"><PageHeader title="Không tìm thấy phòng ban" /></div>;
    }

    return (
        <div className="p-2">
            <PageHeader
                title="Chi tiết phòng ban"
                subtitle={department.departmentName}
                actions={
                    <>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/hr/manage-department")}>
                            Quay lại
                        </Button>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            Chỉnh sửa
                        </Button>
                        {department.isActive && (
                            <Button
                                danger
                                icon={<StopOutlined />}
                                onClick={handleDeactivate}
                            >
                                Ngừng sử dụng
                            </Button>
                        )}
                    </>
                }
            />
            <SectionCard title="Thông tin phòng ban" icon={<ApartmentOutlined />}>
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Mã phòng ban">{department.departmentCode}</Descriptions.Item>
                    <Descriptions.Item label="Tên phòng ban">{department.departmentName}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={department.isActive ? "green" : "red"}>
                            {department.isActive ? "Đang hoạt động" : "Ngừng sử dụng"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trưởng phòng">{department.managerName || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Số nhân viên">{department.employeeCount}</Descriptions.Item>
                    <Descriptions.Item label="Mô tả" span={1}>{department.description || "—"}</Descriptions.Item>
                </Descriptions>
            </SectionCard>
            <TableCard title="Nhân viên trong phòng ban" count={department.employees?.length}>
                <Table 
                    columns={employeeColumns} 
                    dataSource={department.employees} 
                    rowKey="employeeId"
                    pagination={{ pageSize: 10 }}
                />
            </TableCard>

            <EditDepartmentModal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                departmentId={department.departmentId}
                initialValues={initialValues}
            />
        </div>
    );
};

export default DepartmentDetail;
