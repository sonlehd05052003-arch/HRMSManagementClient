import { Modal, Table, Tag, Space, Typography, Skeleton } from "antd";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { 
    fetchBalancesByEmployee, 
    selectEmployeeLeaveBalances, 
    selectLeaveBalanceLoading 
} from "../../../../store/leaveBalanceSlide";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface EmployeeBalanceDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    employee: { id: number; name: string } | null;
}

const EmployeeBalanceDetailsModal = ({ visible, onClose, employee }: EmployeeBalanceDetailsModalProps) => {
    const dispatch = useAppDispatch();
    const balances = useAppSelector(selectEmployeeLeaveBalances);
    const loading = useAppSelector(selectLeaveBalanceLoading);

    useEffect(() => {
        if (visible && employee) {
            dispatch(fetchBalancesByEmployee(employee.id));
        }
    }, [visible, employee, dispatch]);

    const columns = [
        {
            title: "Loại nghỉ phép",
            dataIndex: "leaveTypeName",
            key: "leaveTypeName",
            render: (text: string) => <Text className="font-semibold">{text}</Text>
        },
        {
            title: "Tổng ngày",
            dataIndex: "totalEntitlement",
            key: "totalEntitlement",
            align: 'center' as const,
        },
        {
            title: "Cộng dồn",
            dataIndex: "carriedForward",
            key: "carriedForward",
            align: 'center' as const,
        },
        {
            title: "Đã dùng",
            dataIndex: "usedDays",
            key: "usedDays",
            align: 'center' as const,
            render: (val: number) => <span className="text-amber-600">{val}</span>
        },
        {
            title: "Còn lại",
            dataIndex: "remainingDays",
            key: "remainingDays",
            align: 'center' as const,
            render: (val: number) => <Tag color={val > 0 ? "success" : "default"} className="font-bold border-none">{val}</Tag>
        },
        {
            title: "Năm",
            dataIndex: "year",
            key: "year",
            align: 'center' as const,
        }
    ];

    return (
        <Modal
            title={
                <Space>
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <UserOutlined style={{ fontSize: '20px' }} />
                    </div>
                    <div>
                        <div className="font-bold">Chi tiết số dư ngày nghỉ</div>
                        <div className="text-slate-400 font-normal" style={{ fontSize: 12 }}>Nhân viên: {employee?.name}</div>
                    </div>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            className="rounded-2xl overflow-hidden"
        >
            <div className="py-4">
                {loading && balances.length === 0 ? (
                    <Skeleton active paragraph={{ rows: 5 }} />
                ) : (
                    <Table 
                        columns={columns} 
                        dataSource={balances} 
                        rowKey="balanceId"
                        pagination={false}
                        className="custom-table border border-slate-100 rounded-xl"
                    />
                )}
            </div>
        </Modal>
    );
};

export default EmployeeBalanceDetailsModal;
