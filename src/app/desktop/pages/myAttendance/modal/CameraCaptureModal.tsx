import React, { useState, useRef, useCallback, useEffect } from "react";
import { Modal, Button, Space, Typography, Spin } from "antd";
import Webcam from "react-webcam";
import { CameraOutlined, RetweetOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface CameraCaptureModalProps {
    open: boolean;
    title: string;
    onCancel: () => void;
    onCapture: (base64Image: string) => void;
    loading?: boolean;
}

const videoConstraints = {
    width: 480,
    height: 480,
    facingMode: "user",
};

const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ open, title, onCancel, onCapture, loading = false }) => {
    const webcamRef = useRef<Webcam>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setImage(null);
            setIsCameraReady(false);
            setCameraError(null);
        } else {
            // Stop all camera tracks so iOS Safari releases the camera indicator
            const stream = webcamRef.current?.stream;
            stream?.getTracks().forEach((track) => track.stop());
        }
    }, [open]);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImage(imageSrc);
        }
    }, [webcamRef]);

    const handleRetake = () => {
        setImage(null);
    };

    const handleConfirm = () => {
        if (image) {
            onCapture(image);
        }
    };

    const handleCancel = () => {
        setImage(null);
        setIsCameraReady(false);
        onCancel();
    };

    const handleUserMedia = () => {
        setIsCameraReady(true);
        setCameraError(null);
    };

    // Browsers only expose the camera on HTTPS/localhost and otherwise fail without prompting.
    const handleUserMediaError = (error: string | DOMException) => {
        setIsCameraReady(false);
        const name = typeof error === "string" ? "" : error.name;
        if (!window.isSecureContext) {
            setCameraError("Trình duyệt chỉ cho phép dùng camera khi truy cập bằng HTTPS.");
        } else if (name === "NotAllowedError") {
            setCameraError("Bạn đã chặn quyền camera. Hãy cho phép truy cập camera trong cài đặt trình duyệt rồi thử lại.");
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
            setCameraError("Không tìm thấy camera phù hợp trên thiết bị.");
        } else {
            setCameraError("Không thể khởi động camera. Hãy đóng các ứng dụng khác đang dùng camera rồi thử lại.");
        }
    };

    return (
        <Modal
            title={title}
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
                            onUserMediaError={handleUserMediaError}
                            className="w-full h-full object-cover"
                            playsInline
                        />
                    ) : (
                        <img src={image} alt="Capture" className="w-full h-full object-cover" />
                    )}
                    {cameraError && !image && (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center p-6 text-center">
                            <Text type="danger">{cameraError}</Text>
                        </div>
                    )}
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 flex flex-col items-center justify-center">
                            <Spin size="large" />
                            <Text className="mt-2 font-medium">Đang xác minh...</Text>
                        </div>
                    )}
                </div>

                <div className="mt-6 w-full flex justify-center">
                    {!image ? (
                        <Button
                            type="primary"
                            icon={<CameraOutlined />}
                            onClick={capture}
                            disabled={loading || !isCameraReady}
                        >
                            {isCameraReady ? "Chụp ảnh xác minh" : cameraError ? "Camera không khả dụng" : "Đang khởi động Camera..."}
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
                                onClick={handleConfirm}
                                loading={loading}
                            >
                                Xác nhận {title}
                            </Button>
                        </Space>
                    )}
                </div>

                <div className="mt-4 text-center">
                    <Text type="secondary">
                        Đảm bảo khuôn mặt của bạn nằm trong khung hình và đủ ánh sáng.
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default CameraCaptureModal;
