import { useCallback, useEffect, useState } from "react";
import { Alert, Button, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table, Tag, Tooltip, Typography, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, ThunderboltOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { request } from "../../../../../utils/request";
import { apiErrorMessage, isFormValidationError } from "../../../../../utils/apiError";
import { fetchHolidays, type IHoliday } from "../../../../../utils/holidays";
import { TableCard } from "../../../components/listPage";

const { Text } = Typography;
const WEEKDAYS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

interface IHolidayForm {
    holidayDate: Dayjs;
    name: string;
    isPaid: boolean;
}

/**
 * The company's holiday calendar. Paid holidays count as paid working days in payroll, overtime on them uses the
 * holiday rate, and nobody is marked absent on them.
 */
const HolidaysCard = () => {
    const [year, setYear] = useState(dayjs().year());
    const [holidays, setHolidays] = useState<IHoliday[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<IHoliday | "new" | null>(null);
    const [form] = Form.useForm<IHolidayForm>();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setHolidays(await fetchHolidays(year));
        } catch (error) {
            message.error(apiErrorMessage(error, "Không tải được lịch nghỉ lễ"));
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => { load(); }, [load]);

    const openEditor = (holiday: IHoliday | "new") => {
        setEditing(holiday);
        form.resetFields();
        form.setFieldsValue(holiday === "new"
            ? { holidayDate: dayjs(`${year}-01-01`), isPaid: true }
            : { holidayDate: dayjs(holiday.holidayDate), name: holiday.name, isPaid: holiday.isPaid });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const body = { holidayDate: values.holidayDate.format("YYYY-MM-DD"), name: values.name.trim(), isPaid: values.isPaid };
            if (editing === "new") await request({ url: "/Holiday", method: "POST", data: body });
            else if (editing) await request({ url: `/Holiday/${editing.holidayId}`, method: "PUT", data: body });
            message.success("Đã lưu ngày nghỉ.");
            setEditing(null);
            load();
        } catch (error) {
            if (isFormValidationError(error)) return;
            message.error(apiErrorMessage(error, "Lưu ngày nghỉ thất bại"));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (holiday: IHoliday) => {
        try {
            await request({ url: `/Holiday/${holiday.holidayId}`, method: "DELETE" });
            message.success("Đã xóa ngày nghỉ.");
            load();
        } catch (error) {
            message.error(apiErrorMessage(error, "Xóa ngày nghỉ thất bại"));
        }
    };

    const addFixed = async () => {
        try {
            const response = await request({ url: `/Holiday/fixed-vietnam/${year}`, method: "POST" });
            const added = (response.data as { added: number }).added;
            message.success(added > 0 ? `Đã thêm ${added} ngày lễ cố định của năm ${year}.` : "Các ngày lễ cố định đã có sẵn.");
            load();
        } catch (error) {
            message.error(apiErrorMessage(error, "Không thêm được ngày lễ"));
        }
    };

    const columns = [
        {
            title: "Ngày", dataIndex: "holidayDate", width: 170,
            render: (value: string) => (
                <Space style={{ whiteSpace: "nowrap" }}>
                    <span>{dayjs(value).format("DD/MM/YYYY")}</span>
                    <Text type="secondary">{WEEKDAYS[dayjs(value).day()]}</Text>
                </Space>
            ),
        },
        { title: "Tên ngày nghỉ", dataIndex: "name" },
        {
            title: "Hưởng lương", dataIndex: "isPaid", width: 120, align: "center" as const,
            render: (value: boolean) => <Tag color={value ? "green" : "default"}>{value ? "Có" : "Không"}</Tag>,
        },
        {
            title: "", key: "actions", width: 90, align: "center" as const,
            render: (_: unknown, record: IHoliday) => (
                <Space size="small">
                    <Tooltip title="Sửa"><Button size="small" icon={<EditOutlined />} onClick={() => openEditor(record)} /></Tooltip>
                    <Popconfirm title="Xóa ngày nghỉ này?" okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => remove(record)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <TableCard
            title="Lịch nghỉ lễ"
            count={holidays.length}
            extra={
                <Space wrap>
                    <InputNumber value={year} min={2000} max={2100} onChange={(v) => v && setYear(v)} style={{ width: 90 }} />
                    <Button icon={<ThunderboltOutlined />} onClick={addFixed}>Thêm ngày lễ cố định</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor("new")}>Thêm ngày nghỉ</Button>
                </Space>
            }
        >
            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Ngày lễ có lương được tính đủ công khi tính lương, tăng ca ngày lễ hưởng hệ số ngày lễ, và không ai bị tính vắng mặt."
                description={'"Thêm ngày lễ cố định" thêm 1/1, 30/4, 1/5 và 2/9. Tết Nguyên đán, Giỗ Tổ Hùng Vương và ngày nghỉ bù Quốc khánh được Chính phủ công bố hằng năm, hãy thêm thủ công theo thông báo.'}
            />
            <Table rowKey="holidayId" columns={columns} dataSource={holidays} loading={loading} pagination={false}
                locale={{ emptyText: `Chưa có ngày nghỉ nào trong năm ${year}` }} />

            <Modal
                title={editing === "new" ? "Thêm ngày nghỉ" : "Sửa ngày nghỉ"}
                open={editing !== null}
                onCancel={() => setEditing(null)}
                onOk={save}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={saving}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="holidayDate" label="Ngày" rules={[{ required: true, message: "Chọn ngày" }]}>
                        <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="name" label="Tên ngày nghỉ" rules={[{ required: true, whitespace: true, message: "Nhập tên" }]}>
                        <Input maxLength={200} placeholder="Ví dụ: Mùng 1 Tết Nguyên đán" />
                    </Form.Item>
                    <Form.Item name="isPaid" label="Hưởng lương" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </TableCard>
    );
};

export default HolidaysCard;
