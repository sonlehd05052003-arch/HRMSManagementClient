import { useEffect, useState } from "react";
import { Table, Button, Space, Input, message, Tooltip, Typography, Tag } from "antd";
import { PlusOutlined, EditOutlined, ClockCircleOutlined, SettingOutlined, StopOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAllShifts, selectShifts, selectShiftLoading, deactivateShift, activateShift, type IShift } from "../../../../store/shiftSlide";
import { useNavigate } from "react-router-dom";
import URL from "../../../../constants/url";
import { FilterCard, PageHeader, TableCard } from "../../components/listPage";

const { Text } = Typography;

const ManageShift = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const shifts = useAppSelector(selectShifts);
    const loading = useAppSelector(selectShiftLoading);
    
    const [searchText, setSearchText] = useState("");
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchAllShifts());
    }, [dispatch]);

    const handleToggleStatus = (record: IShift) => {
        setTogglingId(record.shiftId);
        const action = record.isActive ? deactivateShift(record.shiftId) : activateShift(record.shiftId);
        
        dispatch(action)
            .unwrap()
            .then(() => {
                message.success(`${record.isActive ? 'Ngưng sử dụng' : 'Kích hoạt'} ca làm việc thành công.`);
                dispatch(fetchAllShifts());
            })
            .catch((error: any) => {
                message.error(error.message || "Không thể cập nhật trạng thái.");
            })
            .finally(() => {
                setTogglingId(null);
            });
    };

    const handleEdit = (record: IShift) => {
        navigate(URL.EditShift.replace(":id", record.shiftId.toString()));
    };

    const filteredShifts = shifts.filter((shift) => {
        const query = searchText.toLowerCase();
        return shift.shiftName.toLowerCase().includes(query) || 
               shift.shiftCode.toLowerCase().includes(query);
    });

    const columns = [
        {
            title: "Mã Ca",
            dataIndex: "shiftCode",
            key: "shiftCode",
            width: 100,
            render: (code: string) => <Tag color="blue" className="font-semibold">{code}</Tag>
        },
        {
            title: "Tên Ca",
            dataIndex: "shiftName",
            key: "shiftName",
            width: 180,
            render: (name: string) => <Text className="font-medium text-gray-800">{name}</Text>
        },
        {
            title: "Thời gian",
            key: "time",
            width: 180,
            render: (_: any, record: IShift) => (
                <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-gray-400" />
                    <span>{record.startTime.substring(0, 5)} - {record.endTime.substring(0, 5)}</span>
                    {record.isOvernight && <Tag color="orange" className="text-[10px]">Qua đêm</Tag>}
                </div>
            )
        },
        {
            title: "Giờ công",
            dataIndex: "workingHours",
            key: "workingHours",
            width: 100,
            align: 'center' as const,
            render: (val: number) => <Tag color="purple">{val}h</Tag>
        },
        {
            title: "Loại ca",
            dataIndex: "shiftType",
            key: "shiftType",
            width: 120,
            render: (type: string) => {
                let color = "blue";
                if (type === "Flexible") color = "cyan";
                if (type === "Night") color = "purple";
                if (type === "Morning") color = "orange";
                if (type === "Afternoon") color = "gold";
                return <Tag color={color}>{type}</Tag>
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            width: 120,
            render: (isActive: boolean) => (
                 <Tag color={isActive ? "success" : "error"} className="px-3 py-1 rounded-full border-none">
                    {isActive ? "Đang hoạt động" : "Ngưng sử dụng"}
                 </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_: any, record: IShift) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            className="bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100 flex items-center justify-center"
                            icon={<EditOutlined />} 
                            onClick={() => handleEdit(record)} 
                        />
                    </Tooltip>
                    {record.isActive ? (
                        <Tooltip title="Ngưng sử dụng">
                            <Button 
                                className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 flex items-center justify-center"
                                icon={<StopOutlined />} 
                                loading={togglingId === record.shiftId}
                                onClick={() => handleToggleStatus(record)} 
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip title="Kích hoạt">
                            <Button 
                                className="bg-green-50 text-green-600 border-green-100 hover:bg-green-100 flex items-center justify-center"
                                icon={<CheckCircleOutlined />} 
                                loading={togglingId === record.shiftId}
                                onClick={() => handleToggleStatus(record)} 
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-2 bg-gray-50/50 min-h-full">
            <PageHeader
                title={
                    <span className="flex items-center gap-2">
                        <SettingOutlined className="text-indigo-600" />
                        Quản Lý Ca Làm Việc
                    </span>
                }
                subtitle="Thiết lập giờ giấc và quy định chấm công cho nhân viên"
                actions={
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(URL.AddShift)}
                        className="bg-indigo-600 hover:bg-indigo-700 rounded-lg h-10 px-6"
                    >
                        Thêm Ca Mới
                    </Button>
                }
            />
            <FilterCard onReset={() => setSearchText("")}>
                <div className="flex justify-between gap-4">
                    <Input.Search
                        placeholder="Tìm theo mã hoặc tên ca..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="max-w-md custom-search"
                        size="large"
                    />
                </div>
            </FilterCard>
            <TableCard title="Danh sách ca làm việc" count={filteredShifts.length}>
                <Table
                    columns={columns}
                    dataSource={filteredShifts}
                    rowKey="shiftId"
                    loading={loading}
                    pagination={{ 
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50']
                    }}
                    scroll={{ x: 1000 }}
                    size="middle"
                    className="shift-table"
                    locale={{
                        emptyText: searchText ? (
                            <div className="py-10 text-center">
                                <Text type="secondary">Không tìm thấy ca làm việc phù hợp</Text>
                            </div>
                        ) : "Chưa có dữ liệu"
                    }}
                />
            </TableCard>
        </div>
    );
};

export default ManageShift;
