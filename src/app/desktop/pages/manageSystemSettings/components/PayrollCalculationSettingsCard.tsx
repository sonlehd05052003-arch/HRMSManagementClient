import { Form, InputNumber, Button, Space, Alert, Divider, Row, Col, Tooltip, Typography } from "antd"
import { CalculatorOutlined, ReloadOutlined, SaveOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import { SectionCard } from "../../../components/listPage";

interface Props {
    form: any
    loading: boolean
    onFinish: (values: any) => void
    onRefresh: () => void
    gap?: number
}

const PayrollCalculationSettingsCard = ({ form, loading, onFinish, onRefresh, gap }: Props) => {
    const totalInsuranceRate = () => {
        const bhxh = form.getFieldValue("bhxhRate") ?? 8
        const bhyt = form.getFieldValue("bhytRate") ?? 1.5
        const bhtn = form.getFieldValue("bhtnRate") ?? 1
        return (Number(bhxh) + Number(bhyt) + Number(bhtn)).toFixed(1)
    }

    return (
        <SectionCard
            title="Cấu hình Tính Lương (Bảo hiểm & Thuế)"
            icon={<CalculatorOutlined />}
            gap={gap}
            extra={
                <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                    Làm mới
                </Button>
            }
        >
            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Các tỷ lệ được lưu vào SystemSettings và dùng ngay trong lần tính lương tiếp theo. Không cần sửa code khi nhà nước thay đổi quy định."
            />

            <Form form={form} layout="vertical" onFinish={onFinish}>

                {/* ── Bảo hiểm NLĐ ── */}
                <Divider className="font-semibold text-slate-600">
                    Tỷ lệ Bảo hiểm (phần Người lao động đóng)
                </Divider>

                <Row gutter={16}>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="bhxhRate"
                            label={
                                <Space>
                                    BHXH (%)
                                    <Tooltip title="Luật BHXH 58/2014 — Điều 85. Mặc định: 8%">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0, max: 100 }]}
                        >
                            <InputNumber min={0} max={100} step={0.5} addonAfter="%" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="bhytRate"
                            label={
                                <Space>
                                    BHYT (%)
                                    <Tooltip title="Luật BHYT 46/2014 — Điều 13. Mặc định: 1.5%">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0, max: 100 }]}
                        >
                            <InputNumber min={0} max={100} step={0.5} addonAfter="%" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="bhtnRate"
                            label={
                                <Space>
                                    BHTN (%)
                                    <Tooltip title="Luật Việc làm 38/2013 — Điều 57. Mặc định: 1%">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0, max: 100 }]}
                        >
                            <InputNumber min={0} max={100} step={0.5} addonAfter="%" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <div className="bg-slate-50 rounded-lg px-4 py-2" style={{ marginBottom: 16 }}>
                    Tổng NLĐ đóng: <strong className="text-indigo-600">{totalInsuranceRate()}%</strong>
                    &emsp;|&emsp;Theo luật: <span className="text-gray-500">8% + 1.5% + 1% = 10.5%</span>
                </div>

                {/* ── Trần BH ── */}
                <Divider className="font-semibold text-slate-600">
                    Mức trần đóng Bảo hiểm
                </Divider>

                <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="Căn cứ tính BH lấy theo mức lương đóng bảo hiểm đã đăng ký của từng nhân viên (khai báo trong hồ sơ nhân viên). Mức trần dưới đây được áp dụng làm giới hạn tối đa."
                />

                <Form.Item
                    name="insuranceCap"
                    label={
                        <Space>
                            Mức trần đóng BH (đồng)
                            <Tooltip title="Mặc định: 46,800,000 = 20 × LTT vùng I. Cập nhật khi Nghị định điều chỉnh lương tối thiểu vùng.">
                                <QuestionCircleOutlined className="text-gray-400" />
                            </Tooltip>
                        </Space>
                    }
                    rules={[{ required: true }, { type: "number", min: 0 }]}
                >
                    <InputNumber
                        min={0} step={100000}
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(v) => Number(v!.replace(/,/g, "")) as any}
                        addonAfter="đ" style={{ width: "100%" }}
                    />
                </Form.Item>

                {/* ── Giảm trừ Thuế TNCN ── */}
                <Divider className="font-semibold text-slate-600">
                    Giảm trừ Thuế TNCN
                    <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 400, marginLeft: 8 }}>(Nghị quyết 954/2020/UBTVQH14)</Typography.Text>
                </Divider>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="personalDeduction"
                            label={
                                <Space>
                                    Giảm trừ bản thân (đ/tháng)
                                    <Tooltip title="Mặc định: 11,000,000 đ. Cập nhật khi Nghị quyết UBTVQH điều chỉnh.">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0 }]}
                        >
                            <InputNumber
                                min={0} step={500000}
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(v) => Number(v!.replace(/,/g, "")) as any}
                                addonAfter="đ" style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="dependentDeduction"
                            label={
                                <Space>
                                    Giảm trừ mỗi người phụ thuộc (đ/tháng)
                                    <Tooltip title="Mặc định: 4,400,000 đ. Cập nhật khi Nghị quyết UBTVQH điều chỉnh.">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0 }]}
                        >
                            <InputNumber
                                min={0} step={500000}
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(v) => Number(v!.replace(/,/g, "")) as any}
                                addonAfter="đ" style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Alert
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="Biểu thuế lũy tiến 7 bậc (5%–35%) được cố định trong code theo luật hiện hành. Chỉ giảm trừ bản thân và người phụ thuộc được cấu hình tại đây."
                />

                {/* ── Hệ số lương tăng ca (OT) ── */}
                <Divider className="font-semibold text-slate-600">
                    Hệ số lương tăng ca (OT)
                </Divider>

                <div className="bg-slate-50 rounded-lg px-4 py-3 text-gray-500" style={{ marginBottom: 16 }}>
                    <table className="w-full">
                        <thead>
                            <tr className="text-gray-400">
                                <th className="text-left font-medium pb-1">Loại ngày tăng ca</th>
                                <th className="text-left font-medium pb-1">Căn cứ pháp lý</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-1">
                            <tr><td>Ngày làm việc thường</td><td className="text-gray-400">Điều 98.1a – BLLĐ 2019</td></tr>
                            <tr><td>Ngày nghỉ hàng tuần (Thứ 7 & Chủ Nhật)</td><td className="text-gray-400">Điều 98.1b – BLLĐ 2019</td></tr>
                            <tr><td>Ngày lễ, Tết</td><td className="text-gray-400">Điều 98.1c – BLLĐ 2019</td></tr>
                        </tbody>
                    </table>
                </div>

                <Row gutter={16}>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="otWeekdayMultiplier"
                            label={
                                <Space>
                                    Ngày thường (×)
                                    <Tooltip title="Điều 98.1a – BLLĐ 2019. Mặc định: 1.5">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0.01 }]}
                        >
                            <InputNumber min={0.01} step={0.1} precision={2} addonBefore="×" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="otWeekendMultiplier"
                            label={
                                <Space>
                                    Thứ 7 & Chủ Nhật (×)
                                    <Tooltip title="Điều 98.1b – BLLĐ 2019. Mặc định: 2.0">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0.01 }]}
                        >
                            <InputNumber min={0.01} step={0.1} precision={2} addonBefore="×" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name="otHolidayMultiplier"
                            label={
                                <Space>
                                    Ngày lễ, Tết (×)
                                    <Tooltip title="Điều 98.1c – BLLĐ 2019. Mặc định: 3.0">
                                        <QuestionCircleOutlined className="text-gray-400" />
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{ required: true }, { type: "number", min: 0.01 }]}
                        >
                            <InputNumber min={0.01} step={0.1} precision={2} addonBefore="×" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item className="mb-0">
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                        Lưu cấu hình
                    </Button>
                </Form.Item>
            </Form>
        </SectionCard>
    )
}

export default PayrollCalculationSettingsCard
