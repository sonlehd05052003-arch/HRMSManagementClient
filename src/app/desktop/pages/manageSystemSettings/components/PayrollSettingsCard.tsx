import React from "react";
import { Form, InputNumber, Button, Typography, Alert } from "antd";
import { SaveOutlined, ReloadOutlined, CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { SectionCard } from "../../../components/listPage";

const { Text } = Typography;

interface Props {
    form: any;
    loading: boolean;
    onFinish: (values: any) => void;
    onRefresh: () => void;
    gap?: number;
}

const PayrollSettingsCard: React.FC<Props> = ({ form, loading, onFinish, onRefresh, gap }) => {
    return (
        <SectionCard title="Ngày chốt lương" icon={<CalendarOutlined />} gap={gap}>
            <Text type="secondary" className="block" style={{ marginBottom: 16 }}>
                Cấu hình ngày bắt đầu kỳ tính lương hàng tháng
            </Text>

            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Cách tính kỳ lương"
                description={
                    <div className="mt-1">
                        <p>Nếu ngày chốt = <strong>5</strong>, các kỳ lương sẽ là:</p>
                        <ul className="list-disc ml-4 mt-1 space-y-1">
                            <li>Kỳ tháng 1: <strong>05/01 → 04/02</strong></li>
                            <li>Kỳ tháng 2: <strong>05/02 → 04/03</strong></li>
                            <li>Kỳ tháng 3: <strong>05/03 → 04/04</strong></li>
                            <li>... và tiếp tục theo quy tắc tương tự</li>
                        </ul>
                    </div>
                }
            />

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="payrollCutOffDay"
                    label="Ngày chốt lương (1 - 28)"
                    rules={[
                        { required: true, message: "Vui lòng nhập ngày chốt lương" },
                        { type: "number", min: 1, max: 28, message: "Ngày chốt phải từ 1 đến 28" }
                    ]}
                    extra="Giới hạn đến ngày 28 để tránh lỗi với tháng 2"
                >
                    <InputNumber
                        min={1}
                        max={28}
                        style={{ width: 180 }}
                        addonBefore={<CalendarOutlined />}
                        addonAfter="hàng tháng"
                    />
                </Form.Item>

                <Form.Item
                    name="defaultReviewWindowDays"
                    label="Số ngày nhân viên được review chấm công (mặc định)"
                    rules={[
                        { required: true, message: "Vui lòng nhập số ngày review" },
                        { type: "number", min: 1, max: 30, message: "Phải từ 1 đến 30 ngày" }
                    ]}
                    extra="Số ngày này sẽ được tự động điền khi tạo kỳ lương mới"
                >
                    <InputNumber
                        min={1}
                        max={30}
                        style={{ width: 180 }}
                        addonBefore={<ClockCircleOutlined />}
                        addonAfter="ngày"
                    />
                </Form.Item>

                <div className="flex gap-2 mt-2">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                    >
                        Lưu cấu hình
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                        Làm mới
                    </Button>
                </div>
            </Form>
        </SectionCard>
    );
};

export default PayrollSettingsCard;
