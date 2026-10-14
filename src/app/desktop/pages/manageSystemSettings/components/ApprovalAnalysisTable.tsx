import React from "react";
import { Table, Tag, Badge, Button, Alert, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { TableCard } from "../../../components/listPage";

const { Text } = Typography;

interface ApprovalAnalysisTableProps {
    data: any[];
    loading: boolean;
    onRefresh: () => void;
}

const ApprovalAnalysisTable: React.FC<ApprovalAnalysisTableProps> = ({
    data, loading, onRefresh
}) => {
    const columns = [
        { title: 'Mã NV', dataIndex: 'employeeCode', key: 'employeeCode', width: 100 },
        { title: 'Họ Tên', dataIndex: 'fullName', key: 'fullName', ellipsis: true },
        {
            title: 'Quản lý trực tiếp',
            dataIndex: 'managerName',
            key: 'managerName',
            render: (name: string) => name || <Text type="secondary">N/A</Text>
        },
        {
            title: 'Loại định tuyến',
            dataIndex: 'approvalRouteType',
            key: 'approvalRouteType',
            render: (type: string) => {
                const colors: any = {
                    'Direct': 'green',
                    'TopLevelFallback': 'orange',
                    'DefaultFallback': 'blue',
                    'SystemAdminFallback': 'purple',
                    'None': 'red'
                };
                return <Tag color={colors[type] || 'default'}>{type}</Tag>
            }
        },
        {
            title: 'Người duyệt đích',
            dataIndex: 'targetApproverName',
            key: 'targetApproverName',
            render: (name: string) => name || <Text type="danger">Chưa cấu hình</Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isValid',
            key: 'isValid',
            render: (valid: boolean) => valid ? <Badge status="success" text="Hợp lệ" /> : <Badge status="error" text="Lỗi định tuyến" />
        }
    ];

    return (
        <TableCard
            title="Phân tích Lộ trình Phê duyệt (Audit)"
            count={data.length}
            extra={
                <Button
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    loading={loading}
                >
                    Làm mới báo cáo
                </Button>
            }
        >
            <Alert
                message="Giải thích báo cáo"
                description="Báo cáo này giúp bạn kiểm tra xem mỗi nhân viên sẽ gửi đơn cho ai. Hãy chú ý các trường hợp 'DefaultFallback' hoặc 'SystemAdminFallback' - đây là những nhân viên chưa có sếp trực tiếp."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />
            <Table
                dataSource={data}
                rowKey="employeeId"
                loading={loading}
                pagination={{ pageSize: 5 }}
                columns={columns}
            />
        </TableCard>
    );
};

export default ApprovalAnalysisTable;
