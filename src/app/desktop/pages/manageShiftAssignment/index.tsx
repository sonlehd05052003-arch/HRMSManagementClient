import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Table, Button, Space, Select, DatePicker, Typography, Tag, Avatar, Popconfirm, message, Tooltip } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchShiftAssignments, selectAssignments, selectShiftAssignmentLoading, deactivateShiftAssignment, activateShiftAssignment, deleteShiftAssignment, type IShiftAssignment } from "../../../../store/shiftAssignmentSlide";
import { selectEmployees, fetchActiveEmployees } from "../../../../store/employeeSlide";
import AssignShiftModal from "./modal/AssignShiftModal";
import EditAssignmentModal from "./modal/EditAssignmentModal";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FilterCard, PageHeader, TableCard } from "../../components/listPage";

const { Text } = Typography;

const ManageShiftAssignment = () => {
    const dispatch = useAppDispatch();
    const assignments = useAppSelector(selectAssignments);
    const loading = useAppSelector(selectShiftAssignmentLoading);
    const employees = useAppSelector(selectEmployees);
    
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<IShiftAssignment | null>(null);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>(undefined);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchActiveEmployees());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchShiftAssignments({ 
            date: selectedDate.format("YYYY-MM-DD"),
            employeeId: selectedEmployeeId
        }));
    }, [dispatch, selectedDate, selectedEmployeeId]);

    const handleDateChange = (date: dayjs.Dayjs | null) => {
        if (date) setSelectedDate(date);
    };

    const handleEmployeeChange = (val: number | undefined) => {
        setSelectedEmployeeId(val);
    };

    const handleRefresh = () => {
        dispatch(fetchShiftAssignments({ 
            date: selectedDate.format("YYYY-MM-DD"),
            employeeId: selectedEmployeeId
        }));
    };

    const handleAction = (id: number, action: any, successMsg: string) => {
        setActionLoadingId(id);
        dispatch(action(id))
            .unwrap()
            .then(() => {
                message.success(successMsg);
                handleRefresh();
            })
            .catch((err: any) => {
                message.error(err.message || "Đã xảy ra lỗi.");
            })
            .finally(() => {
                setActionLoadingId(null);
            });
    };

    const handleEdit = (record: IShiftAssignment) => {
        setSelectedAssignment(record);
        setIsEditModalOpen(true);
    };

    const columns = [
        {
            title: "Nhân viên",
            key: "employeeName",
            width: 250,
            render: (_: any, record: IShiftAssignment) => {
                const employee = employees.find(e => e.employeeId === record.employeeId);
                const name = employee ? employee.fullName : record.employeeName || "N/A";
                return (
                    <Space>
                        <Avatar icon={<UserOutlined />} className="bg-indigo-100 text-indigo-600" />
                        <div>
                            <div className="font-semibold text-gray-800">{name}</div>
                        </div>
                    </Space>
                );
            }
        },
        {
            title: "Phân ca cho ngày",
            dataIndex: "assignmentDate",
            key: "assignmentDate",
            width: 150,
            render: (date: string) => dayjs(date).format("DD/MM/YYYY")
        },
        {
            title: "Ca làm việc",
            key: "shiftName",
            width: 150,
            render: (_: any, record: IShiftAssignment) => {
                const name = record.shiftName || (record as any).shift?.shiftName;
                return <Tag color="blue" className="px-3 py-1 font-medium">{name || "N/A"}</Tag>
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 130,
            render: (status: string) => (
                <Tag color={status === "Active" ? "success" : "error"} className="px-3 py-1 rounded-full border-none">
                    {status === "Active" ? "Đang hoạt động" : "Ngưng sử dụng"}
                </Tag>
            )
        },
        {
            title: "Thao tác",
            key: "action",
            width: 180,
            render: (_: any, record: IShiftAssignment) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            className="bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100 flex items-center justify-center"
                            icon={<EditOutlined />} 
                            onClick={() => handleEdit(record)} 
                        />
                    </Tooltip>
                    
                    {record.status === "Active" ? (
                        <Tooltip title="Ngưng sử dụng">
                            <Popconfirm
                                title="Ngưng sử dụng phân ca?"
                                description="Bạn có chắc chắn muốn ngưng sử dụng phân ca này?"
                                onConfirm={() => handleAction(record.assignmentId, deactivateShiftAssignment, "Đã ngưng sử dụng phân ca.")}
                                okText="Đồng ý"
                                cancelText="Hủy"
                            >
                                <Button 
                                    className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 flex items-center justify-center"
                                    icon={<StopOutlined />} 
                                    loading={actionLoadingId === record.assignmentId}
                                />
                            </Popconfirm>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Kích hoạt lại">
                            <Button 
                                className="bg-green-50 text-green-600 border-green-100 hover:bg-green-100 flex items-center justify-center"
                                icon={<CheckCircleOutlined />} 
                                loading={actionLoadingId === record.assignmentId}
                                onClick={() => handleAction(record.assignmentId, activateShiftAssignment, "Đã kích hoạt lại phân ca.")}
                            />
                        </Tooltip>
                    )}

                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xác nhận xóa?"
                            description="Bạn có chắc chắn muốn xóa bản ghi này? Hành động này không thể hoàn tác."
                            onConfirm={() => handleAction(record.assignmentId, deleteShiftAssignment, "Đã xóa phân ca.")}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button 
                                className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 flex items-center justify-center"
                                icon={<DeleteOutlined />} 
                                loading={actionLoadingId === record.assignmentId}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-2">
            <PageHeader
                title="Phân ca làm việc"
                subtitle="Giao ca làm việc cho nhân viên theo từng ngày"
                actions={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAssignModalOpen(true)}
                    >
                        Phân Ca Mới
                    </Button>
                }
            />
            <FilterCard
                onReset={() => {
                    setSelectedDate(dayjs());
                    setSelectedEmployeeId(undefined);
                }}
            >
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Text strong>Chọn ngày:</Text>
                        <DatePicker 
                            value={selectedDate} 
                            onChange={handleDateChange} 
                            format="DD/MM/YYYY"
                            className="w-48"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Text strong>Nhân viên:</Text>
                        <Select
                            allowClear
                            placeholder="Tất cả nhân viên"
                            className="w-64"
                            value={selectedEmployeeId}
                            onChange={handleEmployeeChange}
                            options={employees.map(e => ({ value: e.employeeId, label: e.fullName }))}
                        />
                    </div>
                </div>
            </FilterCard>
            <TableCard title="Danh sách phân ca" count={assignments.length}>
                <Table
                    columns={columns}
                    dataSource={assignments}
                    rowKey="assignmentId"
                    loading={loading}
                    pagination={{ 
                        pageSize: 10,
                        showSizeChanger: true
                    }}
                    scroll={{ x: 1000 }}
                    className="assignment-table"
                    locale={{
                        emptyText: (
                            <div className="py-10 text-center">
                                <Text type="secondary">Chưa có bản ghi phân ca nào phù hợp</Text>
                            </div>
                        )
                    }}
                />
            </TableCard>

            <AssignShiftModal
                open={isAssignModalOpen}
                onCancel={() => setIsAssignModalOpen(false)}
                initialDate={selectedDate.format("YYYY-MM-DD")}
            />

            <EditAssignmentModal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                assignment={selectedAssignment}
                onSuccess={handleRefresh}
            />

        </div>
    );
};

export default ManageShiftAssignment;
