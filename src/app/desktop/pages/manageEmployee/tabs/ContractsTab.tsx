import { useCallback, useEffect, useState } from "react";
import { Alert, Button, DatePicker, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Tooltip, Typography, message } from "antd";
import { EditOutlined, FileProtectOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { request } from "../../../../../utils/request";
import { apiErrorMessage, isFormValidationError } from "../../../../../utils/apiError";
import { CONTRACT_TYPES } from "../../../../../constants/contracts";
import { SectionCard } from "../../../components/listPage";

const { Text } = Typography;

export interface IEmployeeContract {
    contractId: number;
    employeeId: number;
    contractNumber: string;
    contractType: string;
    startDate: string;
    endDate: string | null;
    salaryAmount: number;
    terms: string | null;
    status: string;
    daysRemaining: number | null;
}

const STATUSES: Record<string, { label: string; color: string }> = {
    Active: { label: "Đang hiệu lực", color: "green" },
    Expired: { label: "Đã hết hạn", color: "default" },
    Terminated: { label: "Đã chấm dứt", color: "red" },
};

const money = (value: number) => `${value.toLocaleString("vi-VN")} đ`;
const date = (value: string | null) => (value ? dayjs(value).format("DD/MM/YYYY") : "—");

interface IContractForm {
    contractType: string;
    contractNumber?: string;
    startDate: Dayjs;
    endDate?: Dayjs;
    salaryAmount: number;
    terms?: string;
}

interface ContractsTabProps {
    employeeId: number;
    /** HR can add, edit and terminate; an employee viewing their own profile only reads */
    canManage: boolean;
}

const ContractsTab = ({ employeeId, canManage }: ContractsTabProps) => {
    const [contracts, setContracts] = useState<IEmployeeContract[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<IEmployeeContract | "new" | null>(null);
    const [terminating, setTerminating] = useState<IEmployeeContract | null>(null);
    const [terminateDate, setTerminateDate] = useState<Dayjs | null>(dayjs());
    const [form] = Form.useForm<IContractForm>();
    const contractType = Form.useWatch("contractType", form);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await request({ url: `/EmployeeContract/employee/${employeeId}`, method: "GET" });
            setContracts(response.data as IEmployeeContract[]);
        } catch (error) {
            message.error(apiErrorMessage(error, "Không tải được hợp đồng"));
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    useEffect(() => { load(); }, [load]);

    const openEditor = (contract: IEmployeeContract | "new") => {
        setEditing(contract);
        form.resetFields();
        if (contract !== "new") {
            form.setFieldsValue({
                contractType: contract.contractType,
                contractNumber: contract.contractNumber,
                startDate: dayjs(contract.startDate),
                endDate: contract.endDate ? dayjs(contract.endDate) : undefined,
                salaryAmount: contract.salaryAmount,
                terms: contract.terms ?? undefined,
            });
        }
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const body = {
                employeeId,
                contractType: values.contractType,
                contractNumber: values.contractNumber?.trim() || null,
                startDate: values.startDate.format("YYYY-MM-DD"),
                endDate: values.contractType === "Indefinite" ? null : values.endDate?.format("YYYY-MM-DD") ?? null,
                salaryAmount: values.salaryAmount,
                terms: values.terms?.trim() || null,
            };
            if (editing === "new") {
                await request({ url: "/EmployeeContract", method: "POST", data: body });
                message.success("Đã thêm hợp đồng.");
            } else if (editing) {
                await request({ url: `/EmployeeContract/${editing.contractId}`, method: "PUT", data: body });
                message.success("Đã cập nhật hợp đồng.");
            }
            setEditing(null);
            load();
        } catch (error) {
            if (isFormValidationError(error)) return;
            message.error(apiErrorMessage(error, "Lưu hợp đồng thất bại"));
        } finally {
            setSaving(false);
        }
    };

    const terminate = async () => {
        if (!terminating || !terminateDate) return;
        setSaving(true);
        try {
            await request({
                url: `/EmployeeContract/${terminating.contractId}/terminate`,
                method: "PUT",
                data: { endDate: terminateDate.format("YYYY-MM-DD") },
            });
            message.success("Đã chấm dứt hợp đồng.");
            setTerminating(null);
            load();
        } catch (error) {
            message.error(apiErrorMessage(error, "Chấm dứt hợp đồng thất bại"));
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { title: "Số hợp đồng", dataIndex: "contractNumber", width: 140 },
        { title: "Loại", dataIndex: "contractType", width: 170, render: (value: string) => CONTRACT_TYPES[value] ?? value },
        { title: "Từ ngày", dataIndex: "startDate", width: 110, render: date },
        {
            title: "Đến ngày", dataIndex: "endDate", width: 150,
            render: (value: string | null, record: IEmployeeContract) => (
                <Space size={4}>
                    {value ? date(value) : <Text type="secondary">Không thời hạn</Text>}
                    {record.status === "Active" && record.daysRemaining !== null && record.daysRemaining <= 30 && (
                        <Tooltip title="Sắp hết hạn">
                            <Tag color="orange" style={{ margin: 0 }}>còn {record.daysRemaining} ngày</Tag>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
        { title: "Mức lương", dataIndex: "salaryAmount", width: 140, align: "right" as const, render: money },
        {
            title: "Trạng thái", dataIndex: "status", width: 130,
            render: (value: string) => <Tag color={STATUSES[value]?.color}>{STATUSES[value]?.label ?? value}</Tag>,
        },
        ...(canManage ? [{
            title: "Thao tác", key: "actions", width: 100, align: "center" as const,
            render: (_: unknown, record: IEmployeeContract) => record.status === "Terminated" ? null : (
                <Space size="small">
                    <Tooltip title="Sửa"><Button icon={<EditOutlined />} onClick={() => openEditor(record)} /></Tooltip>
                    <Tooltip title="Chấm dứt">
                        <Button danger icon={<StopOutlined />} onClick={() => { setTerminating(record); setTerminateDate(dayjs()); }} />
                    </Tooltip>
                </Space>
            ),
        }] : []),
    ];

    return (
        <SectionCard
            title="Hợp đồng lao động"
            icon={<FileProtectOutlined />}
            extra={canManage && <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor("new")}>Thêm hợp đồng</Button>}
            gap={0}
        >
            <Table
                rowKey="contractId"
                columns={columns}
                dataSource={contracts}
                loading={loading}
                pagination={false}
                scroll={{ x: 900 }}
                expandable={{
                    expandedRowRender: (record: IEmployeeContract) => <Text style={{ whiteSpace: "pre-wrap" }}>{record.terms}</Text>,
                    rowExpandable: (record: IEmployeeContract) => !!record.terms,
                }}
                locale={{ emptyText: "Chưa có hợp đồng nào" }}
                bordered
            />

            <Modal
                title={editing === "new" ? "Thêm hợp đồng" : "Sửa hợp đồng"}
                open={editing !== null}
                onCancel={() => setEditing(null)}
                onOk={save}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={saving}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" initialValues={{ contractType: "FixedTerm", startDate: dayjs() }}>
                    <Form.Item name="contractType" label="Loại hợp đồng" rules={[{ required: true, message: "Chọn loại hợp đồng" }]}>
                        <Select options={Object.entries(CONTRACT_TYPES).map(([value, label]) => ({ value, label }))} />
                    </Form.Item>
                    <Form.Item name="contractNumber" label="Số hợp đồng" extra="Để trống để hệ thống tự đánh số (HD-năm-số thứ tự).">
                        <Input maxLength={50} placeholder="Tự động" />
                    </Form.Item>
                    <Space.Compact block>
                        <Form.Item name="startDate" label="Từ ngày" rules={[{ required: true, message: "Chọn ngày bắt đầu" }]} style={{ width: "50%" }}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            name="endDate"
                            label="Đến ngày"
                            style={{ width: "50%" }}
                            dependencies={["contractType", "startDate"]}
                            rules={[
                                { required: contractType !== "Indefinite", message: "Chọn ngày kết thúc" },
                                ({ getFieldValue }) => ({
                                    validator: (_, value?: Dayjs) => {
                                        const start = getFieldValue("startDate") as Dayjs | undefined;
                                        return !value || !start || !value.isBefore(start, "day")
                                            ? Promise.resolve()
                                            : Promise.reject(new Error("Phải sau ngày bắt đầu"));
                                    },
                                }),
                            ]}
                        >
                            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} disabled={contractType === "Indefinite"} />
                        </Form.Item>
                    </Space.Compact>
                    <Form.Item name="salaryAmount" label="Mức lương theo hợp đồng" rules={[{ required: true, message: "Nhập mức lương" }]}>
                        <InputNumber<number>
                            min={0}
                            step={500_000}
                            style={{ width: "100%" }}
                            formatter={(value) => `${value ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            parser={(value) => Number((value ?? "").replace(/\./g, ""))}
                            addonAfter="đ"
                        />
                    </Form.Item>
                    <Form.Item name="terms" label="Điều khoản / ghi chú">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Chấm dứt hợp đồng"
                open={terminating !== null}
                onCancel={() => setTerminating(null)}
                onOk={terminate}
                okText="Chấm dứt"
                okButtonProps={{ danger: true, disabled: !terminateDate }}
                cancelText="Hủy"
                confirmLoading={saving}
            >
                <Alert
                    type="warning"
                    showIcon
                    className="mb-3"
                    message={`Hợp đồng ${terminating?.contractNumber ?? ""} sẽ chấm dứt và không thể sửa lại.`}
                />
                <Text>Ngày chấm dứt:</Text>
                <DatePicker className="ml-2" format="DD/MM/YYYY" value={terminateDate} onChange={setTerminateDate} />
            </Modal>
        </SectionCard>
    );
};

export default ContractsTab;
