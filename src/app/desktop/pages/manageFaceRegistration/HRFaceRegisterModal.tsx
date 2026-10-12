import React, { useState, useRef, useCallback } from "react";
import { Modal, Button, Space, Typography, Alert } from "antd";
import Webcam from "react-webcam";
import { CameraOutlined, RetweetOutlined, CheckCircleOutlined, UserOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { adminRegisterFace, selectFaceLoading } from "../../../../store/faceSlide";
import { message } from "antd";
import { errorText } from "../../../../utils/apiError";

const { Text } = Typography;

interface Props {
    open: boolean;
    employeeId: number;
    employeeName: string;
    onCancel: () => void;
    onSuccess: () => void;
}

const videoConstraints = { width: 480, height: 480, facingMode: "user" };

const HRFaceRegisterModal: React.FC<Props> = ({ open, employeeId, employeeName, onCancel, onSuccess }) => {
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectFaceLoading);
    const webcamRef = useRef<Webcam>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) setImage(imageSrc);
    }, [webcamRef]);

    const handleRegister = async () => {
        if (!image) return;
        try {
            await dispatch(adminRegisterFace({ employeeId, referenceImageBase64: image })).unwrap();
            message.success(`Đã đăng ký khuôn mặt cho ${employeeName}!`);
            onSuccess();
        } catch (error) {
            message.error(errorText(error, "Lỗi đăng ký khuôn mặt"));
        }
    };

    const handleCancel = () => {
        setImage(null);
        setIsCameraReady(false);
        onCancel();
    };

    return (
        <Modal
            title={
                <Space>
                    <UserOutlined className="text-indigo-600" />
                    <span>Đăng ký khuôn mặt — <strong>{employeeName}</strong></span>
                </Space>
            }
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={520}
            destroyOnHidden
        >
            <div className="flex flex-col items-center p-4 gap-4">
                <Alert
                    type="info"
                    showIcon
                    message="Hướng dẫn"
                    description="Nhân viên nhìn thẳng vào camera, không đeo khẩu trang, đủ ánh sáng. HR chụp và xác nhận."
                    className="w-full"
                />

                <div className="relative w-full max-w-[400px] aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                    {!image ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            onUserMedia={() => setIsCameraReady(true)}
                            onUserMediaError={() => setIsCameraReady(false)}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img src={image} alt="Captured" className="w-full h-full object-cover" />
                    )}
                </div>

                <div className="w-full">
                    {!image ? (
                        <Button
                            type="primary"
                            icon={<CameraOutlined />}
                            block
                            size="large"
                            onClick={capture}
                            disabled={!isCameraReady}
                        >
                            {isCameraReady ? "Chụp ảnh" : "Đang khởi động Camera..."}
                        </Button>
                    ) : (
                        <Space className="w-full justify-center">
                            <Button icon={<RetweetOutlined />} onClick={() => setImage(null)} disabled={loading}>
                                Chụp lại
                            </Button>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={handleRegister}
                                loading={loading}
                            >
                                Xác nhận đăng ký
                            </Button>
                        </Space>
                    )}
                </div>

                <Text type="secondary" className="text-xs text-center">
                    Ảnh khuôn mặt sẽ được lưu trữ bảo mật và chỉ dùng để xác thực chấm công.
                </Text>
            </div>
        </Modal>
    );
};

export default HRFaceRegisterModal;
