import React, { useState, useRef, useCallback } from "react";
import { Modal, Button, message, Space, Typography } from "antd";
import Webcam from "react-webcam";
import { CameraOutlined, RetweetOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAppDispatch } from "../../../../../store";
import { registerFace } from "../../../../../store/attendanceSlide";
import { errorText } from "../../../../../utils/apiError";

const { Text } = Typography;

interface FaceRegisterModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const videoConstraints = {
    width: 480,
    height: 480,
    facingMode: "user",
};

const FaceRegisterModal: React.FC<FaceRegisterModalProps> = ({ open, onCancel, onSuccess }) => {
    const dispatch = useAppDispatch();
    const webcamRef = useRef<Webcam>(null);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImage(imageSrc);
        }
    }, [webcamRef]);

    const handleRetake = () => {
        setImage(null);
    };

    const handleRegister = async () => {
        if (!image) return;

        setLoading(true);
        try {
            await dispatch(registerFace({ referenceImageBase64: image })).unwrap();
            message.success("Đăng ký khuôn mặt thành công!");
            onSuccess();
        } catch (error) {
            message.error(errorText(error, "Lỗi đăng ký khuôn mặt"));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsCameraReady(false);
        setImage(null);
        onCancel();
    };

    const handleUserMedia = () => {
        setIsCameraReady(true);
    };

    return (
        <Modal
            title="Đăng ký nhận diện khuôn mặt"
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={520}
            destroyOnHidden
        >
            <div className="flex flex-col items-center p-4">
                <div className="relative w-full max-w-[400px] aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                    {!image ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            onUserMedia={handleUserMedia}
                            onUserMediaError={() => setIsCameraReady(false)}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img src={image} alt="Capture" className="w-full h-full object-cover" />
                    )}
                </div>

                <div className="mt-6 w-full">
                    {!image ? (
                        <Button
                            type="primary"
                            icon={<CameraOutlined />}
                            block
                            onClick={capture}
                            disabled={!isCameraReady}
                        >
                            {isCameraReady ? "Chụp ảnh" : "Đang khởi động Camera..."}
                        </Button>
                    ) : (
                        <Space className="w-full justify-center">
                            <Button
                                icon={<RetweetOutlined />}
                                onClick={handleRetake}
                                disabled={loading}
                            >
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

                <div className="mt-4 text-center">
                    <Text type="secondary">
                        Lưu ý: Chụp ảnh rõ mặt, không đeo khẩu trang và ở nơi đủ ánh sáng.
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default FaceRegisterModal;
