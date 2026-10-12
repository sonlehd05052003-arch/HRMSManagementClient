import { useState } from "react";
import { Modal, Form, Input, Button, Steps, message } from "antd";
import { MailOutlined, LockOutlined, KeyOutlined, ArrowRightOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAppDispatch } from "../../../../store";
import { forgotPassword, resetPassword } from "../../../../store/authSlide";

interface ForgotPasswordModalProps {
    open: boolean;
    onCancel: () => void;
}

const ForgotPasswordModal = ({ open, onCancel }: ForgotPasswordModalProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();

    const handleSendOtp = async (values: { emailOrUsername: string }) => {
        setLoading(true);
        try {
            await dispatch(forgotPassword(values)).unwrap();
            message.success("Nếu tài khoản tồn tại, mã OTP đã được gửi đến email đăng ký.");
            setEmailOrUsername(values.emailOrUsername);
            setCurrentStep(1);
        } catch (error: any) {
            message.error(error.message || "Không thể gửi OTP. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                emailOrUsername: emailOrUsername,
                otp: values.otp,
                newPassword: values.newPassword,
                confirmNewPassword: values.confirmNewPassword
            };
            await dispatch(resetPassword(payload)).unwrap();
            message.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
            form.resetFields();
            setCurrentStep(0);
            onCancel();
        } catch (error: any) {
            message.error(error.message || "Đặt lại mật khẩu thất bại.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setCurrentStep(0);
        onCancel();
    };

    return (
        <Modal
            title={<span className="text-xl font-bold text-gray-800">Khôi phục mật khẩu</span>}
            open={open}
            onCancel={handleCancel}
            footer={null}
            centered
            width={450}
            destroyOnHidden
            className="forgot-password-modal"
        >
            <div className="py-4">
                <Steps
                    current={currentStep}
                    size="small"
                    className="mb-8"
                    items={[
                        { title: 'Gửi OTP' },
                        { title: 'Đặt lại mật khẩu' },
                    ]}
                />

                {currentStep === 0 ? (
                    <Form form={form} layout="vertical" onFinish={handleSendOtp} requiredMark={false}>
                        <div className="mb-6 text-gray-500 text-sm">
                            Nhập Email hoặc Tên tài khoản của bạn để nhận mã xác thực OTP.
                        </div>
                        <Form.Item
                            name="emailOrUsername"
                            rules={[
                                { required: true, message: "Vui lòng nhập Email hoặc Username" },
                                {
                                    validator: (_, value) => {
                                        if (value && value.includes('@')) {
                                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                            if (!emailRegex.test(value)) {
                                                return Promise.reject(new Error('Định dạng Email không hợp lệ!'));
                                            }
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Input 
                                size="large"
                                prefix={<MailOutlined className="text-gray-400" />} 
                                placeholder="Email hoặc Username" 
                                className="rounded-xl h-12"
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={loading}
                            icon={<ArrowRightOutlined />}
                            className="h-12 rounded-xl bg-indigo-600 font-bold shadow-lg shadow-indigo-100"
                        >
                            GỬI MÃ OTP
                        </Button>
                    </Form>
                ) : (
                    <Form form={form} layout="vertical" onFinish={handleResetPassword} requiredMark={false}>
                        <div className="mb-6 text-gray-500 text-sm">
                            Nếu tài khoản tồn tại, mã OTP đã được gửi. Vui lòng kiểm tra email và nhập mật khẩu mới.
                        </div>
                        <Form.Item
                            name="otp"
                            rules={[{ required: true, message: "Vui lòng nhập mã OTP" }]}
                        >
                            <Input 
                                size="large"
                                prefix={<KeyOutlined className="text-gray-400" />} 
                                placeholder="Nhập mã OTP (6 chữ số)" 
                                className="rounded-xl h-12"
                                maxLength={6}
                            />
                        </Form.Item>
                        <Form.Item
                            name="newPassword"
                            rules={[
                                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                            ]}
                        >
                            <Input.Password 
                                size="large"
                                prefix={<LockOutlined className="text-gray-400" />} 
                                placeholder="Mật khẩu mới" 
                                className="rounded-xl h-12"
                            />
                        </Form.Item>
                        <Form.Item
                            name="confirmNewPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password 
                                size="large"
                                prefix={<LockOutlined className="text-gray-400" />} 
                                placeholder="Xác nhận mật khẩu mới" 
                                className="rounded-xl h-12"
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={loading}
                            icon={<CheckCircleOutlined />}
                            className="h-12 rounded-xl bg-indigo-600 font-bold shadow-lg shadow-indigo-100"
                        >
                            HOÀN TẤT ĐẶT LẠI
                        </Button>
                        <Button 
                            type="link" 
                            block 
                            onClick={() => setCurrentStep(0)}
                            className="mt-4 text-gray-400 text-xs font-bold"
                        >
                            GỬI LẠI MÃ OTP?
                        </Button>
                    </Form>
                )}
            </div>
        </Modal>
    );
};

export default ForgotPasswordModal;
