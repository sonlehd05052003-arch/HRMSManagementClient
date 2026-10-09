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
                message.success("User created successfully");
                form.resetFields();
                onSuccess();
            } else {
                const error = res.payload;
                const msg = typeof error === 'string' ? error : error?.message || "Failed to create user";
                message.error(msg);
            }
        });
    };

    return (
        <Modal
            title="Add New User"
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
                    label="Employee"
                    rules={[{ required: true, message: "Please select an employee!" }]}
                >
                    <Select
                        showSearch
                        placeholder="Select an employee"
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
                        { required: true, message: "Please input the email!" },
                        { type: "email", message: "Please enter a valid email!" },
                    ]}
                >
                    <Input placeholder="Email for account information" />
                </Form.Item>

                <Form.Item
                    name="roleId"
                    label="Role"
                    rules={[{ required: true, message: "Please select a role!" }]}
                >
                    <Select placeholder="Select a role">
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
