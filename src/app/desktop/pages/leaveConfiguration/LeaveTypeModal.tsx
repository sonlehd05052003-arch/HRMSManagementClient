import { Modal, Form, Input, InputNumber, Switch, message, Row, Col } from "antd";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { 
    createLeaveType, 
    updateLeaveType, 
    selectLeaveTypeLoading, 
    clearError, 
    selectLeaveTypeError 
} from "../../../../store/leaveTypeSlide";

interface LeaveTypeModalProps {
    visible: boolean;
    onClose: () => void;
    editingLeaveType: any | null;
}

const LeaveTypeModal = ({ visible, onClose, editingLeaveType }: LeaveTypeModalProps) => {
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectLeaveTypeLoading);
    const error = useAppSelector(selectLeaveTypeError);
    const [form] = Form.useForm();
    const isUnlimited = Form.useWatch('isUnlimited', form);

    useEffect(() => {
        if (visible && editingLeaveType) {
            form.setFieldsValue({
                ...editingLeaveType,
                isUnlimited: editingLeaveType.annualEntitlement === 0
            });
        }
    }, [visible, editingLeaveType, form]);

    useEffect(() => {
        if (error) {
            message.error(error.message || "Something went wrong.");
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleFinish = async (values: any) => {
        try {
            // Map isUnlimited back into the payload
            const payload = {
                ...values,
                annualEntitlement: values.isUnlimited ? 0 : values.annualEntitlement,
                isCarryForward: values.isUnlimited ? false : values.isCarryForward,
                maxCarryForwardDays: values.isUnlimited ? null : values.maxCarryForwardDays
            };
            
            if (editingLeaveType) {
                const result = await dispatch(updateLeaveType({ id: editingLeaveType.leaveTypeId, dto: payload })).unwrap();
                if (result) {
                    message.success("Cập nhật loại phép thành công.");
                    onClose();
                }
            } else {
                const result = await dispatch(createLeaveType(payload)).unwrap();
                if (result) {
                    message.success("Thêm mới loại phép thành công.");
                    onClose();
                }
            }
        } catch {
            // Error is handled by useEffect above
        }
    };

    return (
        <Modal
            title={editingLeaveType ? "Chỉnh sửa loại phép" : "Thêm mới loại phép"}
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={600}
            className="rounded-2xl overflow-hidden"
            okText={editingLeaveType ? "Cập nhật" : "Thêm mới"}
            cancelText="Hủy"
            destroyOnHidden
        >
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleFinish}
                initialValues={{ 
                    annualEntitlement: 12, 
                    isPaid: true, 
                    requiresApproval: true, 
                    isCarryForward: false,
                    isUnlimited: false,
                    isActive: true
                }}
            >
                <Row gutter={16}>
                    {editingLeaveType && (
                        <Col span={24}>
                            <Form.Item name="leaveTypeCode" label="Mã loại phép (Hệ thống tự sinh)">
                                <Input disabled className="h-10 rounded-lg bg-slate-50 font-mono" />
                            </Form.Item>
                        </Col>
                    )}
                    <Col span={24}>
                        <Form.Item 
                            name="leaveTypeName" 
                            label="Tên loại phép" 
                            rules={[{ required: true, message: "Vui lòng nhập tên loại phép" }, { max: 100 }]}
                        >
                            <Input placeholder="ví dụ: Nghỉ phép năm, Nghỉ kết hôn..." className="h-10 rounded-lg" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="isUnlimited" label="Loại phép Sự kiện / Không giới hạn (Vd: Thai sản, Tai nạn, ...)" valuePropName="checked">
                    <Switch checkedChildren="Có" unCheckedChildren="Không (Phép theo năm)" />
                </Form.Item>

                {!isUnlimited && (
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item 
                                name="annualEntitlement" 
                                label="Số ngày được hưởng/năm" 
                                rules={[{ required: true, message: "Nhập số ngày" }]}
                            >
                                <InputNumber min={1} max={365} className="w-full h-10 flex items-center rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item 
                                name="maxCarryForwardDays" 
                                label="Số ngày tối đa cộng dồn"
                                dependencies={['isCarryForward']}
                            >
                                <InputNumber min={0} max={365} className="w-full h-10 flex items-center rounded-lg" />
                            </Form.Item>
                        </Col>
                    </Row>
                )}

                <Row gutter={24} className="mt-4">
                    <Col span={8}>
                        <Form.Item name="isPaid" label="Có lương" valuePropName="checked">
                            <Switch checkedChildren="Có" unCheckedChildren="Không" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="requiresApproval" label="Cần phê duyệt" valuePropName="checked">
                            <Switch checkedChildren="Có" unCheckedChildren="Không" />
                        </Form.Item>
                    </Col>
                    {!isUnlimited && (
                        <Col span={8}>
                            <Form.Item name="isCarryForward" label="Cộng dồn" valuePropName="checked">
                                <Switch checkedChildren="Có" unCheckedChildren="Không" />
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked">
                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng hoạt động" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default LeaveTypeModal;
