import { Form, Input, InputNumber, TimePicker, Switch, message, Row, Col, Select, Button, Space } from "antd";
import { ArrowLeftOutlined, ClockCircleOutlined, LoginOutlined, SaveOutlined } from "@ant-design/icons";
import { useAppDispatch } from "../../../../store";
import { createShift, fetchAllShifts } from "../../../../store/shiftSlide";
import { useNavigate } from "react-router-dom";
import URL from "../../../../constants/url";

import { PageHeader, SectionCard } from "../../components/listPage";

const AddShift = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const onFinish = (values: any) => {
        const data = {
            ...values,
            startTime: values.startTime.format("HH:mm:ss"),
            endTime: values.endTime.format("HH:mm:ss"),
        };

        dispatch(createShift(data))
            .unwrap()
            .then(() => {
                message.success("Tạo ca làm việc thành công.");
                dispatch(fetchAllShifts());
                navigate(URL.ManageShift);
            })
            .catch((error: any) => {
                message.error(error.message || "Không thể tạo ca làm việc.");
            });
    };

    const handleValuesChange = (changedValues: any, allValues: any) => {
        if (changedValues.startTime || changedValues.endTime || changedValues.isOvernight !== undefined) {
            const { startTime, endTime, isOvernight } = allValues;
            if (startTime && endTime) {
                let diff = endTime.diff(startTime, "hour", true);
                if (diff < 0) {
                    diff += 24;
                    form.setFieldsValue({ isOvernight: true });
                } else if (isOvernight) {
                    // stays positive
                }
                form.setFieldsValue({ workingHours: Math.round(diff * 2) / 2 });
            }
        }
    };

    return (
        <div className="p-2">
            <PageHeader
                title="Thêm ca làm việc mới"
                actions={
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                }
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={handleValuesChange}
                initialValues={{
                    workingHours: 8,
                    shiftType: 'Regular',
                    lateGraceMinutes: 15,
                    earlyCheckInMinutes: 30,
                    latestCheckInMinutes: 60,
                    earliestCheckOutMinutes: 30,
                    latestCheckOutMinutes: 60,
                    isOvernight: false,
                }}
            >
                <SectionCard title="Thông tin ca làm việc" icon={<ClockCircleOutlined />}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="shiftCode"
                                label="Mã Ca"
                                rules={[{ required: true, message: "Vui lòng nhập mã ca" }]}
                            >
                                <Input placeholder="Ví dụ: HC, CA1, CA2" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="shiftName"
                                label="Tên Ca"
                                rules={[{ required: true, message: "Vui lòng nhập tên ca" }]}
                            >
                                <Input placeholder="Ví dụ: Hành chính, Ca sáng" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="startTime"
                                label="Giờ bắt đầu"
                                rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="endTime"
                                label="Giờ kết thúc"
                                rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc" }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="workingHours"
                                label="Số giờ công"
                                rules={[{ required: true, message: "Nhập số giờ công" }]}
                            >
                                <InputNumber min={0} max={24} style={{ width: "100%" }} disabled />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="shiftType"
                                label="Loại ca"
                            >
                                <Select>
                                    <Select.Option value="Regular">Regular</Select.Option>
                                    <Select.Option value="Flexible">Flexible</Select.Option>
                                    <Select.Option value="Morning">Morning</Select.Option>
                                    <Select.Option value="Afternoon">Afternoon</Select.Option>
                                    <Select.Option value="Night">Night</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="isOvernight"
                                label="Ca qua đêm"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                </SectionCard>

                <SectionCard title="Quy định Check-in / Check-out" icon={<LoginOutlined />}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="lateGraceMinutes"
                                label="Phút đi trễ cho phép"
                            >
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="earlyCheckInMinutes"
                                label="Phút check-in sớm"
                            >
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="latestCheckInMinutes"
                                label="Phút check-in muộn"
                            >
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="earliestCheckOutMinutes"
                                label="Phút check-out sớm tối đa"
                            >
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="latestCheckOutMinutes"
                                label="Phút check-out muộn tối đa"
                            >
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </SectionCard>

                <div style={{ textAlign: "right" }}>
                    <Space>
                        <Button onClick={() => navigate(-1)}>Hủy bỏ</Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} className="bg-indigo-600 hover:bg-indigo-700">
                            Lưu thông tin
                        </Button>
                    </Space>
                </div>
            </Form>
        </div>
    );
};

export default AddShift;
