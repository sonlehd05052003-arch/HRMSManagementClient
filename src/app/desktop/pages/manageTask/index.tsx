import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, message, Space, Button, Tooltip, Modal, Descriptions } from "antd";
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchAllTasks,
    selectTasks,
    selectTaskLoading,
    approveTask,
    rejectTask
} from "../../../../store/taskSlide";
import { selectInfoLogin } from "../../../../store/authSlide";
import { EUserRole } from "../../../../interface/app";
import TaskCondition from "./TaskCondition";
import AddTaskModal from "./modal/AddTaskModal";
import dayjs from "dayjs";
import { FilterCard, PageHeader, TableCard } from "../../components/listPage";

const { Text } = Typography;

const ManageTask: React.FC = () => {
    const dispatch = useAppDispatch();
    const tasks = useAppSelector(selectTasks);
    const loading = useAppSelector(selectTaskLoading);
    const infoLogin = useAppSelector(selectInfoLogin);

    const [searchText, setSearchText] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const currentUserId = Number(infoLogin?.userId);
    const isEmployee = infoLogin?.role === EUserRole.EMPLOYEE;
    const canCreateTask = infoLogin?.role && [EUserRole.ADMIN, EUserRole.MANAGE, EUserRole.HR].includes(infoLogin.role as any);

    useEffect(() => {
        dispatch(fetchAllTasks());
    }, [dispatch]);

    const handleViewDetail = (record: any) => {
        setSelectedTask(record);
        setIsDetailModalOpen(true);
    };

    const handleApprove = (id: number) => {
        dispatch(approveTask({ id, comments: "Đã duyệt qua Quản lý Công việc" }))
            .unwrap()
            .then(() => {
                message.success("Đã duyệt công việc thành công");
                dispatch(fetchAllTasks());
            })
            .catch((err) => message.error(err));
    };

    const handleReject = (id: number) => {
        Modal.confirm({
            title: 'Từ chối công việc',
            content: (
                <div className="mt-2">
                    <Text>Bạn có chắc chắn muốn từ chối công việc này?</Text>
                </div>
            ),
            onOk: () => {
                dispatch(rejectTask({ id, reason: "Từ chối qua Quản lý Công việc (Lý do tối thiểu 10 ký tự)" }))
                    .unwrap()
                    .then(() => {
                        message.success("Đã từ chối công việc thành công");
                        dispatch(fetchAllTasks());
                    })
                    .catch((err) => message.error(err));
            }
        });
    };

    const filteredTasks = tasks.filter((task) => {
        // Only show tasks assigned to me or created by me (for follow up)
        const isRelated = task.assignedTo === currentUserId || task.createdBy === currentUserId;
        if (!isRelated) return false;

        const matchesSearch =
            task.taskId.toString().includes(searchText) ||
            task.taskTitle.toLowerCase().includes(searchText.toLowerCase()) ||
            task.taskType.toLowerCase().includes(searchText.toLowerCase());

        const matchesPriority = priorityFilter ? task.priority === priorityFilter : true;
        const matchesStatus = statusFilter ? task.status === statusFilter : true;

        return matchesSearch && matchesPriority && matchesStatus;
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'red';
            case 'Medium': return 'orange';
            case 'Low': return 'blue';
            default: return 'default';
        }
    };

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'Pending': return <Tag icon={<ClockCircleOutlined />} color="default">CHỜ XỬ LÝ</Tag>;
            case 'InProgress': return <Tag icon={<ClockCircleOutlined />} color="processing">ĐANG THỰC HIỆN</Tag>;
            case 'Approved': return <Tag icon={<CheckCircleOutlined />} color="success">ĐÃ DUYỆT</Tag>;
            case 'Rejected': return <Tag icon={<CloseCircleOutlined />} color="error">TỪ CHỐI</Tag>;
            case 'Cancelled': return <Tag icon={<CloseCircleOutlined />} color="default">ĐÃ HỦY</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: "Mã CV",
            dataIndex: "taskId",
            key: "taskId",
            width: 90,
            sorter: (a: any, b: any) => a.taskId - b.taskId,
        },
        {
            title: "Loại",
            dataIndex: "taskType",
            key: "taskType",
            width: 150,
        },
        {
            title: "Mô tả",
            dataIndex: "taskTitle",
            key: "taskTitle",
            ellipsis: true,
        },
        {
            title: "Người thực hiện",
            dataIndex: "assignedUsername",
            key: "assignedUsername",
            render: (text: string) => text || "Chưa phân công",
        },
        {
            title: "Độ ưu tiên",
            dataIndex: "priority",
            key: "priority",
            width: 100,
            render: (priority: string) => (
                <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
            ),
            sorter: (a: any, b: any) => a.priority.localeCompare(b.priority),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: string) => getStatusTag(status),
        },
        !isEmployee && {
            title: "Vai trò",
            key: "taskRole",
            width: 120,
            render: (_: any, record: any) => (
                record.assignedTo === currentUserId
                    ? <Tag color="orange">ĐƯỢC GIAO</Tag>
                    : <Tag color="default">THEO DÕI</Tag>
            )
        },
        {
            title: "Hạn hoàn thành",
            dataIndex: "dueDate",
            key: "dueDate",
            width: 120,
            render: (date: string, record: any) => {
                if (!date) return "-";
                const isOverdue = dayjs(date).isBefore(dayjs(), 'day') &&
                    ['Pending', 'InProgress'].includes(record.status);
                return (
                    <Text style={{ color: isOverdue ? '#ff4d4f' : 'inherit', fontWeight: isOverdue ? 'bold' : 'normal' }}>
                        {dayjs(date).format("YYYY-MM-DD")}
                    </Text>
                );
            },
            sorter: (a: any, b: any) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
        },
        {
            title: "Thao tác",
            key: "action",
            fixed: "right" as const,
            width: 100,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            <PageHeader
                title={isEmployee ? "Công việc được giao" : "Quản lý công việc"}
                subtitle={isEmployee ? "Danh sách các công việc bạn cần thực hiện." : "Quản lý các công việc và yêu cầu phê duyệt trong hệ thống."}
                actions={canCreateTask && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                        Tạo công việc
                    </Button>
                )}
            />

            <FilterCard
                onReset={() => {
                    setSearchText("");
                    setPriorityFilter(null);
                    setStatusFilter(null);
                }}
            >
                <TaskCondition
                    searchText={searchText}
                    setSearchText={setSearchText}
                    priorityFilter={priorityFilter}
                    setPriorityFilter={setPriorityFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />
            </FilterCard>

            <TableCard title="Danh sách công việc" count={filteredTasks.length}>
                <Table
                    columns={columns.filter(Boolean) as any}
                    dataSource={filteredTasks}
                    rowKey="taskId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1300 }}
                    size="middle"
                    rowClassName={(record) => {
                        const isOverdue = record.dueDate &&
                            dayjs(record.dueDate).isBefore(dayjs(), 'day') &&
                            ['Pending', 'InProgress'].includes(record.status);
                        return isOverdue ? 'overdue-row' : '';
                    }}
                />
            </TableCard>

            <Modal
                title={`Chi tiết công việc #${selectedTask?.taskId}`}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="back" onClick={() => setIsDetailModalOpen(false)}>
                        Đóng
                    </Button>,
                    (selectedTask?.status === 'Pending' || selectedTask?.status === 'InProgress') &&
                    selectedTask?.assignedTo === currentUserId && (
                        <>
                            <Button
                                key="reject"
                                danger
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    handleReject(selectedTask.taskId);
                                }}
                            >
                                Từ chối
                            </Button>
                            <Button
                                key="approve"
                                type="primary"
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    handleApprove(selectedTask.taskId);
                                }}
                            >
                                Duyệt
                            </Button>
                        </>
                    )
                ]}
                width={700}
            >
                {selectedTask && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Tiêu đề" span={2}>{selectedTask.taskTitle}</Descriptions.Item>
                        <Descriptions.Item label="Loại">{selectedTask.taskType}</Descriptions.Item>
                        <Descriptions.Item label="Độ ưu tiên">
                            <Tag color={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">{getStatusTag(selectedTask.status)}</Descriptions.Item>
                        <Descriptions.Item label="Người thực hiện">{selectedTask.assignedUsername || "Chưa phân công"}</Descriptions.Item>
                        <Descriptions.Item label="Hạn hoàn thành">
                            {selectedTask.dueDate ? dayjs(selectedTask.dueDate).format("DD/MM/YYYY") : "Không có"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {dayjs(selectedTask.createdDate).format("DD/MM/YYYY HH:mm")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả" span={2}>
                            {selectedTask.taskDescription || "Không có mô tả."}
                        </Descriptions.Item>
                        {selectedTask.completedDate && (
                            <Descriptions.Item label="Ngày hoàn thành" span={2}>
                                {dayjs(selectedTask.completedDate).format("DD/MM/YYYY HH:mm")}
                            </Descriptions.Item>
                        )}
                        {selectedTask.completionNotes && (
                            <Descriptions.Item label="Ghi chú / Lý do" span={2}>
                                {selectedTask.completionNotes}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>

            <AddTaskModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
            />

            <style>{`
                .overdue-row {
                    background-color: #fff1f0 !important;
                }
                .overdue-row:hover > td {
                    background-color: #ffccc7 !important;
                }
                .overdue-row td {
                    border-bottom: 1px solid #ff4d4f44 !important;
                }
            `}</style>
        </div>
    );
};

export default ManageTask;
