import { useState } from "react";
import { Modal, Form, Input, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useAppDispatch } from "../../../../../store";
import { resetUserPassword, type IResetUserPassword } from "../../../../../store/userSlide";

const { Text } = Typography;

interface ResetPasswordModalProps {
    /** The account whose password is being reset; the modal is open while it is set. */
    user: { userId: number; username: string } | null;
    onClose: () => void;
}

const ResetPasswordModal = ({ user, onClose }: ResetPasswordModalProps) => {
    const [form] = Form.useForm<IResetUserPassword>();
    const dispatch = useAppDispatch();
    const [saving, setSaving] = useState(false);

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const onFinish = (values: IResetUserPassword) => {
        if (!user) return;
        setSaving(true);
        dispatch(resetUserPassword({ id: user.userId, data: values }))
            .unwrap()
            .then(() => {
                message.success(`Đã đặt lại mật khẩu cho ${user.username}`);
                handleClose();
            })
            .catch((error: any) => {
                const msg = typeof error === "string" ? error : error?.message || "Đặt lại mật khẩu thất bại";
                message.error(msg);
            })
            .finally(() => setSaving(false));
    };

    return (
        <Modal
            title="Đặt lại mật khẩu"
            open={user != null}
            onCancel={handleClose}
            onOk={() => form.submit()}
            okText="Đặt lại"
            cancelText="Hủy"
            confirmLoading={saving}
            destroyOnHidden
        >
            <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                Đặt mật khẩu mới cho tài khoản <Text strong>{user?.username}</Text>. Các phiên đăng nhập đang mở của tài khoản
                này sẽ bị đăng xuất; hãy gửi mật khẩu mới cho người dùng và nhắc họ đổi lại sau khi đăng nhập.
            </Text>
            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
                <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới" },
                        { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" autoComplete="new-password" />
                </Form.Item>
                <Form.Item
                    name="confirmNewPassword"
                    label="Xác nhận mật khẩu mới"
                    dependencies={["newPassword"]}
                    rules={[
                        { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                                return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ResetPasswordModal;
