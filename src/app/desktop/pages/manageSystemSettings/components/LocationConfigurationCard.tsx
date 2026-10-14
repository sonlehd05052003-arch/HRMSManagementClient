import React from "react";
import { Form, Button, InputNumber, Space, Alert, Row, Col, Divider, Slider, Radio, Input, Typography } from "antd";
import { ReloadOutlined, SaveOutlined, EnvironmentOutlined, AimOutlined, WifiOutlined, GlobalOutlined } from "@ant-design/icons";
import { SectionCard } from "../../../components/listPage";

const { TextArea } = Input;
const { Text } = Typography;

interface LocationConfigurationCardProps {
    form: any;
    loading: boolean;
    detecting: boolean;
    detectingIp: boolean;
    onFinish: (values: any) => Promise<void>;
    onRefresh: () => void;
    onDetect: () => void;
    onDetectIp: () => void;
}

const LocationConfigurationCard: React.FC<LocationConfigurationCardProps> = ({
    form, loading, detecting, detectingIp, onFinish, onRefresh, onDetect, onDetectIp
}) => {
    const checkInMethod = Form.useWatch("checkInMethod", form) ?? "Location";

    const showGps = checkInMethod === "Location" || checkInMethod === "Either";
    const showIp  = checkInMethod === "IP"       || checkInMethod === "Either";

    return (
        <SectionCard
            title="Cấu hình Điểm danh"
            icon={<EnvironmentOutlined />}
            gap={0}
            extra={
                <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
                    Làm mới
                </Button>
            }
        >
            <Alert
                description="Cấu hình phương thức xác minh khi nhân viên Check-in/Check-out. Có thể dùng GPS, IP mạng văn phòng, hoặc cho phép cả hai."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    officeLatitude: 0,
                    officeLongitude: 0,
                    attendanceAllowedRadius: 50,
                    checkInMethod: "Location",
                    allowedIpAddresses: "",
                }}
            >
                {/* Chọn phương thức */}
                <Form.Item
                    label="Phương thức xác minh điểm danh"
                    name="checkInMethod"
                    tooltip="Chọn cách hệ thống xác minh vị trí khi nhân viên điểm danh."
                >
                    <Radio.Group>
                        <Radio.Button value="Location">
                            <Space><EnvironmentOutlined />Theo GPS</Space>
                        </Radio.Button>
                        <Radio.Button value="IP">
                            <Space><WifiOutlined />Theo IP WiFi</Space>
                        </Radio.Button>
                        <Radio.Button value="Either">
                            <Space><GlobalOutlined />Cho phép cả hai</Space>
                        </Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Divider />

                {/* GPS Section */}
                {showGps && (
                    <>
                        <Text strong style={{ display: "block", marginBottom: 12 }}>
                            <EnvironmentOutlined style={{ marginRight: 6, color: "#1677ff" }} />
                            Cấu hình vị trí GPS
                        </Text>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Vĩ độ (Latitude)"
                                    name="officeLatitude"
                                    rules={[{ required: showGps, message: "Vui lòng nhập vĩ độ" }]}
                                >
                                    <InputNumber style={{ width: "100%" }} precision={15} step={0.000001} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Kinh độ (Longitude)"
                                    name="officeLongitude"
                                    rules={[{ required: showGps, message: "Vui lòng nhập kinh độ" }]}
                                >
                                    <InputNumber style={{ width: "100%" }} precision={15} step={0.000001} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Bán kính cho phép (Mét)"
                            name="attendanceAllowedRadius"
                            tooltip="Nhân viên phải đứng trong vòng tròn có bán kính này. Cho phép từ 10m đến 200m."
                            rules={[
                                { required: showGps, message: "Vui lòng nhập bán kính" },
                                { type: "number", min: 10, message: "Bán kính tối thiểu là 10 mét" },
                                { type: "number", max: 200, message: "Bán kính tối đa là 200 mét" },
                            ]}
                        >
                            <Slider
                                min={10}
                                max={200}
                                step={10}
                                marks={{ 10: "10m", 50: "50m", 100: "100m", 150: "150m", 200: "200m" }}
                                tooltip={{ formatter: (v) => `${v} mét` }}
                            />
                        </Form.Item>

                        <Button icon={<AimOutlined />} onClick={onDetect} loading={detecting} style={{ marginBottom: 16 }}>
                            Lấy toạ độ tại đây
                        </Button>

                        {showIp && <Divider />}
                    </>
                )}

                {/* IP Section */}
                {showIp && (
                    <>
                        <Text strong style={{ display: "block", marginBottom: 12 }}>
                            <WifiOutlined style={{ marginRight: 6, color: "#52c41a" }} />
                            Cấu hình IP WiFi văn phòng
                        </Text>
                        <Form.Item
                            label="Danh sách IP được phép"
                            name="allowedIpAddresses"
                            tooltip="Nhập các IP public của mạng văn phòng, cách nhau bằng dấu phẩy. Nhân viên phải kết nối đúng mạng này."
                            rules={[{ required: showIp, message: "Vui lòng nhập ít nhất 1 địa chỉ IP" }]}
                            extra={<Text type="secondary" style={{ fontSize: 12 }}>Ví dụ: 113.190.x.x, 42.115.x.x</Text>}
                        >
                            <TextArea
                                rows={3}
                                placeholder="113.190.x.x, 42.115.x.x"
                            />
                        </Form.Item>

                        <Button icon={<WifiOutlined />} onClick={onDetectIp} loading={detectingIp} style={{ marginBottom: 16 }}>
                            Thêm IP hiện tại
                        </Button>
                    </>
                )}

                <Divider />

                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                    Lưu cấu hình
                </Button>
            </Form>
        </SectionCard>
    );
};

export default LocationConfigurationCard;
