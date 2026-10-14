import { useEffect } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { updateUser, selectUserLoading, fetchEmployeeOptions, selectEmployeeOptions } from "../../../../../store/userSlide";
import { selectRoles } from "../../../../../store/roleSlide";

interface EditAccountModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    editingUser: any;
}

const EditAccountModal = ({ open, onCancel, onSuccess, editingUser }: EditAccountModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const roles = useAppSelector(selectRoles);
    const employees = useAppSelector(selectEmployeeOptions);
    const loading = useAppSelector(selectUserLoading);
    const isActive = Form.useWatch("isActive", form);
    const isProtectedAdmin = editingUser?.username?.toLowerCase() === "admin";
    const currentIsActive = typeof isActive === "boolean" ? isActive : !!editingUser?.isActive;

    // Refetch on every open: the SuperAdmin may have switched company since the last one
    useEffect(() => {
        if (open) {
            dispatch(fetchEmployeeOptions());
        }
    }, [open, dispatch]);

    useEffect(() => {
        if (open && editingUser) {
            const roleIds = roles
                .filter((r) => editingUser.roles.includes(r.roleName))
                .map((r) => r.roleId);

            form.setFieldsValue({
                ...editingUser,
                roleId: roleIds.length > 0 ? roleIds[0] : undefined,
            });
        }
    }, [open, editingUser, roles, form]);

    const onFinish = (values: any) => {
        if (isProtectedAdmin && values.isActive === false) {
            message.warning("Không được vô hiệu hoá tài khoản admin");
            return;
        }

        dispatch(updateUser({ id: editingUser.userId, data: values })).then((res: any) => {
            if (!res.error) {
                message.success("Đã cập nhật tài khoản");
                onSuccess();
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Cập nhật tài khoản thất bại";
                message.error(msg);
            }
        });
    };

    return (
        <Modal
            title="Sửa tài khoản"
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
                    name="username"
                    label="Tên đăng nhập"
                >
                    <Input disabled />
                </Form.Item>

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
                            const emp = employees.find(e => e.employeeId === value);
                            if (emp) {
                                form.setFieldsValue({ email: emp.email });
                            }
                        }}
                    >
                        {employees.map((emp) => (
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
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    name="roleIds"
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

                <Form.Item name="isActive" hidden>
                    <Input />
                </Form.Item>

                <Form.Item label="Trạng thái hoạt động">
                    <Button
                        type={currentIsActive ? "primary" : "default"}
                        danger={currentIsActive}
                        disabled={isProtectedAdmin && currentIsActive}
                        onClick={() => {
                            form.setFieldValue("isActive", !currentIsActive);
                        }}
                    >
                        {currentIsActive ? "Ngừng hoạt động" : "Hoạt động"}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditAccountModal;
