import { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import {
    createUser,
    selectUserLoading,
    fetchAllUsers,
    selectUsers,
    fetchEmployeeOptions,
    selectEmployeeOptions,
} from "../../../../../store/userSlide";
import { selectRoles } from "../../../../../store/roleSlide";

interface AddAccountModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const AddAccountModal = ({ open, onCancel, onSuccess }: AddAccountModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const roles = useAppSelector(selectRoles);
    const employees = useAppSelector(selectEmployeeOptions);
    const users = useAppSelector(selectUsers);
    const loading = useAppSelector(selectUserLoading);

    useEffect(() => {
        if (open) {
            dispatch(fetchEmployeeOptions());
            dispatch(fetchAllUsers());
        }
    }, [open, dispatch]);

    const availableEmployees = employees.filter(
        emp => !users.some(user => user.employeeId === emp.employeeId)
    );
    const onFinish = (values: any) => {
        dispatch(createUser(values)).then((res: any) => {
            if (!res.error) {
                message.success("Đã tạo tài khoản");
                form.resetFields();
                onSuccess();
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Tạo tài khoản thất bại";
                message.error(msg);
            }
        });
    };

    return (
        <Modal
            title="Thêm tài khoản"
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={() => form.submit()}
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    name="employeeId"
                    label="Nhân viên"
                    rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn nhân viên"
                        optionFilterProp="children"
                        onChange={(value) => {
                            const emp = availableEmployees.find(e => e.employeeId === value);
                            if (emp) {
                                form.setFieldsValue({ email: emp.email });
                            }
                        }}
                    >
                        {availableEmployees.map((emp) => (
                            <Select.Option key={emp.employeeId} value={emp.employeeId}>
                                {emp.fullName} ({emp.employeeCode})
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                    ]}
                >
                    <Input placeholder="Email nhận thông tin tài khoản" />
                </Form.Item>

                <Form.Item
                    name="roleId"
                    label="Vai trò"
                    rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                >
                    <Select placeholder="Chọn vai trò">
                        {roles.map((role) => (
                            <Select.Option key={role.roleId} value={role.roleId}>
                                {role.roleName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddAccountModal;
