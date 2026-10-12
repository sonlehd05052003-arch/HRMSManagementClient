import { Modal, Form, DatePicker, Select, Input, message } from "antd";
import { useAppDispatch } from "../../../../../store";
import { manualAdjustAttendance } from "../../../../../store/attendanceSlide";
import { useEffect } from "react";
import dayjs from "dayjs";
import { errorText } from "../../../../../utils/apiError";

interface ManualAdjustModalProps {
    open: boolean;
    onClose: () => void;
    record: any;
}

const ManualAdjustModal = ({ open, onClose, record }: ManualAdjustModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (open && record) {
            form.resetFields();
            form.setFieldsValue({
                checkInTime: record.checkInTime ? dayjs(record.checkInTime) : null,
                checkOutTime: record.checkOutTime ? dayjs(record.checkOutTime) : null,
                status: record.status || "Present",
                source: record.source || "Manual",
                remarks: record.remarks || ""
            });
        }
    }, [open, record, form]);

    const onFinish = async (values: any) => {
        try {
            const dto = {
                checkInTime: values.checkInTime ? values.checkInTime.format("YYYY-MM-DDTHH:mm:ss") : undefined,
                checkOutTime: values.checkOutTime ? values.checkOutTime.format("YYYY-MM-DDTHH:mm:ss") : undefined,
                status: values.status,
                source: values.source,
                remarks: values.remarks
            };

            await dispatch(manualAdjustAttendance({ attendanceId: record.attendanceId, dto })).unwrap();
            message.success("Điều chỉnh chấm công thành công");
            onClose();
        } catch (error) {
            message.error(errorText(error, "Điều chỉnh thất bại"));
        }
    };

    return (
        <Modal
            title={`Điều chỉnh chấm công - ${record?.employeeName}`}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="Lưu điều chỉnh"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <div className="flex gap-4">
                    <Form.Item name="checkInTime" label="Giờ check-in mới" className="flex-1">
                        <DatePicker picker="time" format="HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="checkOutTime" label="Giờ check-out mới" className="flex-1">
                        <DatePicker picker="time" format="HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[{ required: true }]}
                >
                    <Select options={[
                        { label: "Present", value: "Present" },
                        { label: "Late", value: "Late" },
                        { label: "Absent", value: "Absent" },
                        { label: "Incomplete", value: "Incomplete" },
                    ]} />
                </Form.Item>

                <Form.Item
                    name="source"
                    label="Nguồn gốc lý do"
                    rules={[{ required: true, message: "Chọn nguồn gốc" }]}
                >
                    <Select options={[
                        { label: "Lỗi thiết bị (Device Failure)", value: "Device Failure" },
                        { label: "Ngoại lệ Overtime (OT Exception)", value: "OT Exception" },
                        { label: "Công tác / Đi ngoài", value: "Business Trip" },
                        { label: "Khác", value: "Other" },
                    ]} />
                </Form.Item>

                <Form.Item
                    name="remarks"
                    label="Ghi chú chi tiết"
                    rules={[{ required: true, message: "Nhập lý do điều chỉnh" }]}
                >
                    <Input.TextArea rows={3} placeholder="VD: Sửa ca do nhân viên quên chấm công..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ManualAdjustModal;
