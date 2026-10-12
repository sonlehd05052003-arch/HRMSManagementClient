import { Modal, Form, Select, InputNumber, message, Alert } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { 
    createLeaveBalance, 
    selectLeaveBalanceLoading, 
} from "../../../../store/leaveBalanceSlide";
import { selectLeaveTypes } from "../../../../store/leaveTypeSlide";
import { selectEmployees } from "../../../../store/employeeSlide";
import { errorText } from "../../../../utils/apiError";

const { Option } = Select;

interface CreateBalanceModalProps {
    visible: boolean;
    onClose: (refresh?: boolean) => void;
}

const CreateBalanceModal = ({ visible, onClose }: CreateBalanceModalProps) => {
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectLeaveBalanceLoading);
    const leaveTypes = useAppSelector(selectLeaveTypes);
    const employees = useAppSelector(selectEmployees);
    const [form] = Form.useForm();

    const activeLeaveTypes = (leaveTypes || []).filter(lt => lt.isActive && lt.annualEntitlement > 0);

    const handleLeaveTypeChange = (value: number) => {
        const lt = activeLeaveTypes.find(t => t.leaveTypeId === value);
        if (lt) {
            form.setFieldsValue({ totalEntitlement: lt.annualEntitlement });
        }
    };

    const handleFinish = async (values: any) => {
        try {
            const result = await dispatch(createLeaveBalance(values)).unwrap();
            message.success(result.message || "Khởi tạo số dư thành công.");
            onClose(true);
        } catch (err) {
            message.error(errorText(err, "Không thể khởi tạo số dư. Có thể bản ghi đã tồn tại."));
        }
    };

    return (
        <Modal
            title={<span className="text-xl font-bold text-slate-800">Khởi tạo Số dư Nghỉ phép</span>}
            open={visible}
            onCancel={() => onClose()}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={500}
            className="rounded-2xl overflow-hidden"
            okText="Khởi tạo"
            cancelText="Hủy"
            destroyOnHidden
        >
            <Alert 
                title="Lưu ý: Bạn nên khởi tạo số dư trước khi thực hiện điều chỉnh hoặc đăng ký nghỉ phép nếu hệ thống báo không tìm thấy số dư."
                type="info"
                showIcon
                className="mb-6 rounded-xl"
            />

            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleFinish}
                initialValues={{ 
                    year: new Date().getFullYear(),
                    usedDays: 0,
                    carriedForward: 0
                }}
            >
                <Form.Item 
                    name="employeeId" 
                    label="Nhân viên" 
                    rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
                >
                    <Select 
                        showSearch 
                        placeholder="Tìm nhân viên..." 
                        optionFilterProp="children"
                        className="h-10 rounded-lg"
                    >
                        {(employees || []).map((e: any) => (
                            <Option key={e.employeeId} value={e.employeeId}>
                                {e.fullName} ({e.employeeCode})
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item 
                    name="leaveTypeId" 
                    label="Loại nghỉ phép" 
                    rules={[{ required: true, message: "Vui lòng chọn loại phép" }]}
                >
                    <Select 
                        placeholder="Chọn loại phép" 
                        className="h-10 rounded-lg"
                        onChange={handleLeaveTypeChange}
                    >
                        {activeLeaveTypes.map((lt: any) => (
                            <Option key={lt.leaveTypeId} value={lt.leaveTypeId}>
                                {lt.leaveTypeName} (Mặc định: {lt.annualEntitlement} ngày)
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item 
                        name="year" 
                        label="Năm áp dụng" 
                        rules={[{ required: true, message: "Nhập năm" }]}
                    >
                        <InputNumber min={2000} max={2100} className="w-full h-10 flex items-center rounded-lg" />
                    </Form.Item>

                    <Form.Item 
                        name="totalEntitlement" 
                        label="Tổng ngày được hưởng" 
                        rules={[{ required: true, message: "Nhập số ngày" }]}
                    >
                        <InputNumber min={0} max={365} className="w-full h-10 flex items-center rounded-lg font-bold text-blue-600" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item 
                        name="carriedForward" 
                        label="Ngày phép cộng dồn"
                    >
                        <InputNumber min={0} max={365} className="w-full h-10 flex items-center rounded-lg" />
                    </Form.Item>

                    <Form.Item 
                        name="usedDays" 
                        label="Số ngày đã sử dụng"
                    >
                        <InputNumber min={0} max={365} className="w-full h-10 flex items-center rounded-lg" />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateBalanceModal;
