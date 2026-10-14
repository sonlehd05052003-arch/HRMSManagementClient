import { useEffect, useState } from "react";
import { Button, Typography, Tag, Space, message, Row, Col, Statistic, Spin } from "antd";
import { CheckCircleOutlined, LogoutOutlined, ScanOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { checkIn, checkOut, fetchMyToday, selectMyToday, selectAttendanceLoading } from "../../../../../store/attendanceSlide";
import { fetchLocationSettings, selectLocationSettings } from "../../../../../store/systemSettingSlide";
import dayjs from "dayjs";
import CameraCaptureModal from "../modal/CameraCaptureModal";
import { errorText } from "../../../../../utils/apiError";
import { SectionCard } from "../../../components/listPage";

const { Text } = Typography;

const AttendanceTodayCard = () => {
    const dispatch = useAppDispatch();
    const myToday = useAppSelector(selectMyToday);
    const loading = useAppSelector(selectAttendanceLoading);
    const locationSettings = useAppSelector(selectLocationSettings);
    const checkInMethod = locationSettings?.checkInMethod ?? "Location";

    const [checkInOpen, setCheckInOpen] = useState(false);
    const [checkOutOpen, setCheckOutOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchMyToday());
        dispatch(fetchLocationSettings());
    }, [dispatch]);

    const getGpsCoords = (): Promise<{ latitude: number; longitude: number } | null> =>
        new Promise((resolve) => {
            if (!navigator.geolocation) { resolve(null); return; }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                () => resolve(null),
                { timeout: 10000, enableHighAccuracy: true }
            );
        });

    const getCurrentPublicIp = async (): Promise<string | undefined> => {
        try {
            const res = await fetch("https://api.ipify.org?format=json");
            const data = await res.json();
            return data.ip;
        } catch {
            return undefined;
        }
    };

    const buildLocationPayload = async () => {
        let latitude: number | undefined;
        let longitude: number | undefined;
        let ipAddress: string | undefined;
        let location: string | undefined;

        if (checkInMethod === "Location") {
            const coords = await getGpsCoords();
            if (!coords) {
                message.error("Hệ thống yêu cầu quyền truy cập vị trí GPS để thực hiện điểm danh. Vui lòng cấp quyền trình duyệt.");
                return null;
            }
            latitude = coords.latitude;
            longitude = coords.longitude;
            location = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        } else if (checkInMethod === "IP") {
            ipAddress = await getCurrentPublicIp();
            if (!ipAddress) {
                message.error("Không thể xác định địa chỉ IP hiện tại.");
                return null;
            }
            location = `IP: ${ipAddress}`;
        } else {
            // Either: try GPS optionally, always get IP
            const [coords, ip] = await Promise.all([getGpsCoords(), getCurrentPublicIp()]);
            latitude = coords?.latitude;
            longitude = coords?.longitude;
            ipAddress = ip;
            location = coords
                ? `GPS: ${latitude!.toFixed(6)}, ${longitude!.toFixed(6)}`
                : `IP: ${ipAddress ?? "unknown"}`;
        }

        return { latitude, longitude, ipAddress, location };
    };

    const handleCheckInCapture = async (faceImage: string) => {
        try {
            const payload = await buildLocationPayload();
            if (!payload) return;

            await dispatch(checkIn({
                ...payload,
                remarks: "Check-in từ Web Face-ID",
                faceImageBase64: faceImage,
                deviceInfo: navigator.userAgent
            })).unwrap();
            message.success("Check-in thành công");
            setCheckInOpen(false);
            dispatch(fetchMyToday());
        } catch (error) {
            message.error(errorText(error, "Check-in thất bại"));
        }
    };

    const handleCheckOutCapture = async (faceImage: string) => {
        try {
            const payload = await buildLocationPayload();
            if (!payload) return;

            await dispatch(checkOut({
                ...payload,
                remarks: "Check-out từ Web Face-ID",
                faceImageBase64: faceImage,
                deviceInfo: navigator.userAgent
            })).unwrap();
            message.success("Check-out thành công");
            setCheckOutOpen(false);
            dispatch(fetchMyToday());
        } catch (error) {
            message.error(errorText(error, "Lỗi check-out"));
        }
    };

    const attendance = myToday?.attendance;
    const hasCheckedIn = !!attendance?.checkInTime;
    const hasCheckedOut = !!attendance?.checkOutTime;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Present": return "green";
            case "Late": return "orange";
            case "Absent": return "red";
            case "Incomplete": return "blue";
            default: return "default";
        }
    };

    return (
        <>
            <SectionCard title="Chấm công hôm nay" icon={<ScanOutlined />} gap={0}>
                <Text type="secondary" className="block" style={{ marginBottom: 16 }}>Ngày hiện tại: {dayjs().format("DD/MM/YYYY")}</Text>

                {loading && !myToday ? (
                    <div className="text-center p-6"><Spin /></div>
                ) : (
                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} sm={12} md={12}>
                            <Statistic
                                title="Check-in time"
                                value={attendance?.checkInTime ? dayjs(attendance.checkInTime).format("HH:mm:ss") : "--:--:--"}
                                styles={{ content: { color: hasCheckedIn ? '#3f8600' : '#cf1322' } }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={12}>
                            <Statistic
                                title="Check-out time"
                                value={attendance?.checkOutTime ? dayjs(attendance.checkOutTime).format("HH:mm:ss") : "--:--:--"}
                                styles={{ content: { color: hasCheckedOut ? '#3f8600' : '#888' } }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={12}>
                            <Statistic
                                title="Giờ làm việc"
                                value={attendance?.workingHours ?? 0}
                                suffix="h"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={12}>
                            <div className="flex flex-col">
                                <Text type="secondary" style={{ marginBottom: 4 }}>Trạng thái</Text>
                                <div>
                                    <Tag color={getStatusColor(attendance?.status || "")}>
                                        {attendance?.status || "Chưa chấm công"}
                                    </Tag>
                                </div>
                            </div>
                        </Col>
                    </Row>
                )}

                <div className="mt-6 border-t pt-4">
                    <Space size="middle" className="flex flex-wrap">
                        <Button
                            type="primary"
                            size="large"
                            icon={<CheckCircleOutlined />}
                            onClick={() => setCheckInOpen(true)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Face Check In
                        </Button>
                        <Button
                            danger
                            type="primary"
                            size="large"
                            icon={<LogoutOutlined />}
                            onClick={() => setCheckOutOpen(true)}
                            disabled={!hasCheckedIn || loading}
                        >
                            Face Check Out
                        </Button>
                    </Space>
                </div>
            </SectionCard>

            <CameraCaptureModal 
                open={checkInOpen}
                title="Giờ vào"
                onCancel={() => setCheckInOpen(false)}
                onCapture={handleCheckInCapture}
                loading={loading}
            />

            <CameraCaptureModal 
                open={checkOutOpen}
                title="Giờ ra"
                onCancel={() => setCheckOutOpen(false)}
                onCapture={handleCheckOutCapture}
                loading={loading}
            />
        </>
    );
};

export default AttendanceTodayCard;
