import React from "react";
import { Form, Button, Select, Alert } from "antd";
import { ReloadOutlined, SaveOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { SectionCard } from "../../../components/listPage";

const { Option } = Select;

interface TopLevelApprovalCardProps {
    form: any;
    users: any[];
    loading: boolean;
    onFinish: (values: any) => Promise<void>;
    onRefresh: () => void;
    gap?: number;
}

const TopLevelApprovalCard: React.FC<TopLevelApprovalCardProps> = ({
    form, users, loading, onFinish, onRefresh, gap
}) => {
    return (
        <SectionCard
            title="Dự phòng Phê duyệt (Cấp quản lý)"
            icon={<SafetyCertificateOutlined />}
            gap={gap}
            extra={
                <Button
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    loading={loading}
                >
                    Làm mới
                </Button>
            }
        >
            <Alert
                description="Dùng cho nhân sự quản lý cấp cao nhất (CEO, Manager không có sếp trực tiếp)."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    label="Người duyệt dự phòng cho cấp cao nhất (Top-Level Fallback)"
                    name="topLevelFallbackUserId"
                    tooltip="Chọn người sẽ phê duyệt cho các nhân sự thuộc vị trí Top-level."
                    rules={[{ required: true, message: 'Vui lòng chọn người duyệt' }]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn một tài khoản người dùng"
                        optionFilterProp="children"
                        allowClear
                    >
                        {users.filter(u => u.isActive).map(user => (
                            <Option key={user.userId} value={user.userId}>
                                {user.username} ({user.email})
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <div className="mt-4">
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}
                    >
                        Lưu cấu hình Top-level
                    </Button>
                </div>
            </Form>
        </SectionCard>
    );
};

export default TopLevelApprovalCard;
