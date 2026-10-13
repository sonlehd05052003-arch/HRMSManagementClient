import { useEffect, useState } from "react";
import { Table, Button, Card, Space, Input, message, Tooltip, Typography, Tag } from "antd";
import { PlusOutlined, EyeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import StatusToggleButton from "../../components/statusToggleButton";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAllPositions, selectPositions, selectPositionLoading, deactivatePosition, activatePosition } from "../../../../store/positionSlide";
import AddPositionModal from "./modal/AddPositionModal";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ManagePosition = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const positions = useAppSelector(selectPositions);
    const loading = useAppSelector(selectPositionLoading);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchAllPositions());
    }, [dispatch]);

    const handleToggleStatus = (record: any) => {
        const action = record.isActive ? deactivatePosition(record.positionId) : activatePosition(record.positionId);
        const successMsg = record.isActive ? "Vô hiệu hóa chức vụ thành công" : "Kích hoạt chức vụ thành công";

        setTogglingId(record.positionId);
        dispatch(action)
            .unwrap()
            .then(() => {
                message.success(successMsg);
                dispatch(fetchAllPositions());
            })
            .catch((error: any) => {
                const msg = typeof error === 'string' ? error : error?.message || (record.isActive ? "Không thể vô hiệu hóa chức vụ" : "Không thể kích hoạt chức vụ");
                message.error(msg);
            })
            .finally(() => {
                setTogglingId(null);
            });
    };

    const filteredPositions = positions.filter((pos) => {
        const query = searchText.toLowerCase();
        return pos.positionName.toLowerCase().includes(query) || 
               pos.positionCode.toLowerCase().includes(query);
    });

    const columns = [
        {
            title: "Mã",
            dataIndex: "positionCode",
            key: "positionCode",
            width: 100,
        },
        {
            title: "Tên chức vụ",
            dataIndex: "positionName",
            key: "positionName",
            width: 250,
            render: (name: string, record: any) => (
                <a onClick={() => navigate(`/hr/manage-position/${record.positionId}`)} style={{ fontWeight: 500 }}>
                    {name}
                </a>
            ),
        },
        {
            title: "Cấp bậc",
            dataIndex: "level",
            key: "level",
            width: 100,
        },
        {
            title: "Cấp cao nhất",
            dataIndex: "isTopLevel",
            key: "isTopLevel",
            width: 120,
            render: (isTopLevel: boolean) => (
                isTopLevel ? <Tag color="blue" icon={<CheckCircleOutlined />}>Cấp cao nhất</Tag> : <Text type="secondary">-</Text>
            ),
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
                            onClick={() => navigate(`/hr/manage-position/${record.positionId}`)}
                        />
                    </Tooltip>
                    <StatusToggleButton
                        active={record.isActive}
                        loading={togglingId === record.positionId}
                        onToggle={() => handleToggleStatus(record)}
                        deactivateTitle="Ngừng sử dụng chức vụ này?"
                        restoreTitle="Khôi phục chức vụ này?"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-2">
            <Card
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={4} style={{ margin: 0 }}>Quản lý chức vụ</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                            Thêm chức vụ mới
                        </Button>
                    </div>
                }
            >
                <div style={{ marginBottom: 16 }}>
                    <Input.Search
                        placeholder="Tìm kiếm theo mã hoặc tên chức vụ..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredPositions}
                    rowKey="positionId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                    size="middle"
                    locale={{
                        emptyText: searchText ? (
                            <div style={{ padding: "20px 0" }}>
                                <Text type="secondary">
                                    Không tìm thấy chức vụ phù hợp
                                </Text>
                            </div>
                        ) : "Không có dữ liệu"
                    }}
                />
            </Card>

            <AddPositionModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
            />
        </div>
    );
};

export default ManagePosition;
