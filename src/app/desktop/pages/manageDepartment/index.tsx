import { useEffect, useState } from "react";
import { Table, Button, Space, Input, Tag, message, Tooltip, Typography } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import StatusToggleButton from "../../components/statusToggleButton";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAllDepartments, selectDepartments, selectDepartmentLoading, deactivateDepartment, activateDepartment } from "../../../../store/departmentSlide";
import AddDepartmentModal from "./modal/AddDepartmentModal";
import { useNavigate } from "react-router-dom";
import { FilterCard, PageHeader, TableCard } from "../../components/listPage";

const { Text } = Typography;

const ManageDepartment = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const departments = useAppSelector(selectDepartments);
    const loading = useAppSelector(selectDepartmentLoading);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchAllDepartments());
    }, [dispatch]);

    const handleToggleStatus = (record: any) => {
        const action = record.isActive ? deactivateDepartment(record.departmentId) : activateDepartment(record.departmentId);
        const successMsg = record.isActive ? "Vô hiệu hóa phòng ban thành công" : "Kích hoạt phòng ban thành công";

        setTogglingId(record.departmentId);
        dispatch(action)
            .unwrap()
            .then(() => {
                message.success(successMsg);
                dispatch(fetchAllDepartments());
            })
            .catch((error: any) => {
                const msg = typeof error === 'string' ? error : error?.message || (record.isActive ? "Không thể vô hiệu hóa phòng ban" : "Không thể kích hoạt phòng ban");
                message.error(msg);
            })
            .finally(() => {
                setTogglingId(null);
            });
    };

    const filteredDepartments = departments.filter((dept) => {
        const query = searchText.toLowerCase();
        return dept.departmentName.toLowerCase().includes(query) || 
               dept.departmentCode.toLowerCase().includes(query);
    });

    const columns = [
        {
            title: "Mã",
            dataIndex: "departmentCode",
            key: "departmentCode",
            width: 100,
        },
        {
            title: "Tên phòng ban",
            dataIndex: "departmentName",
            key: "departmentName",
            width: 200,
            render: (name: string, record: any) => (
                <a onClick={() => navigate(`/hr/manage-department/${record.departmentId}`)} style={{ fontWeight: 500 }}>
                    {name}
                </a>
            ),
        },
        {
            title: "Quản lý",
            dataIndex: "managerName",
            key: "managerName",
            width: 200,
            render: (val: string) => val || "—"
        },
        {
            title: "Số nhân viên",
            dataIndex: "employeeCount",
            key: "employeeCount",
            width: 100,
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            width: 100,
            render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "default"}>{isActive ? "Hoạt động" : "Ngừng sử dụng"}</Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 110,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/hr/manage-department/${record.departmentId}`)}
                        />
                    </Tooltip>
                    <StatusToggleButton
                        active={record.isActive}
                        loading={togglingId === record.departmentId}
                        onToggle={() => handleToggleStatus(record)}
                        deactivateTitle="Ngừng sử dụng phòng ban này?"
                        restoreTitle="Khôi phục phòng ban này?"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-2">
            <PageHeader
                title="Quản lý phòng ban"
                actions={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                        Thêm phòng ban mới
                    </Button>
                }
            />
            <FilterCard onReset={() => setSearchText("")}>
                <Input.Search
                    placeholder="Tìm kiếm theo mã hoặc tên phòng ban..."
                    allowClear
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
            </FilterCard>
            <TableCard title="Danh sách phòng ban" count={filteredDepartments.length}>
                <Table
                    columns={columns}
                    dataSource={filteredDepartments}
                    rowKey="departmentId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                    size="middle"
                    locale={{
                        emptyText: searchText ? (
                            <div style={{ padding: "20px 0" }}>
                                <Text type="secondary">
                                    Không tìm thấy phòng ban nào phù hợp
                                </Text>
                            </div>
                        ) : "Không có dữ liệu"
                    }}
                />
            </TableCard>

            <AddDepartmentModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
            />
        </div>
    );
};

export default ManageDepartment;
