import React, { useEffect, useState } from "react";
import { Form, Typography, message, Row, Col, Space, Tabs, Badge } from "antd";
import {
    SafetyCertificateOutlined,
    EnvironmentOutlined,
    AimOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    DollarOutlined,
    BankOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchLocationSettings, selectLocationSettings, selectSystemSettingLoading,
    updateLocationSettings, fetchApprovalSettings, selectApprovalSettings,
    updateApprovalSettings, fetchPayrollSettings, selectPayrollSettings, updatePayrollSettings,
    fetchCompanySettings, selectCompanySettings, updateCompanySettings,
    fetchPayrollCalcSettings, selectPayrollCalcSettings, updatePayrollCalcSettings
} from "../../../../store/systemSettingSlide";
import { fetchAllUsers, selectUsers } from "../../../../store/userSlide";
import { fetchApprovalAnalysis, selectApprovalAnalysis } from "../../../../store/employeeSlide";

// Import modular components (will be redesigned next)
import TopLevelApprovalCard from "./components/TopLevelApprovalCard";
import DefaultFallbackApprovalCard from "./components/DefaultFallbackApprovalCard";
import LocationConfigurationCard from "./components/LocationConfigurationCard";
import ApprovalAnalysisTable from "./components/ApprovalAnalysisTable";
import GuidanceCard from "./components/GuidanceCard";
import PayrollSettingsCard from "./components/PayrollSettingsCard";
import CompanySettingsCard from "./components/CompanySettingsCard";
import PayrollCalculationSettingsCard from "./components/PayrollCalculationSettingsCard";
import { errorText } from "../../../../utils/apiError";

const { Title, Paragraph, Text } = Typography;

const SystemSettingPage: React.FC = () => {
    const [topLevelForm] = Form.useForm();
    const [defaultFallbackForm] = Form.useForm();
    const [locationForm] = Form.useForm();
    const [payrollForm] = Form.useForm();
    const [companyForm] = Form.useForm();
    const [payrollCalcForm] = Form.useForm();
    const dispatch = useAppDispatch();

    const locationSettings = useAppSelector(selectLocationSettings);
    const approvalSettings = useAppSelector(selectApprovalSettings);
    const payrollSettings = useAppSelector(selectPayrollSettings);
    const companySettings = useAppSelector(selectCompanySettings);
    const payrollCalcSettings = useAppSelector(selectPayrollCalcSettings);
    const approvalAnalysis = useAppSelector(selectApprovalAnalysis);
    const users = useAppSelector(selectUsers);
    const loading = useAppSelector(selectSystemSettingLoading);

    const [detecting, setDetecting] = useState(false);
    const [detectingIp, setDetectingIp] = useState(false);

    // Initial data fetch
    useEffect(() => {
        dispatch(fetchLocationSettings());
        dispatch(fetchApprovalSettings());
        dispatch(fetchPayrollSettings());
        dispatch(fetchCompanySettings());
        dispatch(fetchPayrollCalcSettings());
        dispatch(fetchAllUsers());
        dispatch(fetchApprovalAnalysis());
    }, [dispatch]);

    // Update form values
    useEffect(() => {
        if (locationSettings) locationForm.setFieldsValue(locationSettings);
    }, [locationSettings, locationForm]);

    useEffect(() => {
        if (payrollSettings) payrollForm.setFieldsValue(payrollSettings);
    }, [payrollSettings, payrollForm]);

    useEffect(() => {
        if (companySettings) companyForm.setFieldsValue(companySettings);
    }, [companySettings, companyForm]);

    useEffect(() => {
        if (payrollCalcSettings) payrollCalcForm.setFieldsValue(payrollCalcSettings);
    }, [payrollCalcSettings, payrollCalcForm]);

    useEffect(() => {
        if (approvalSettings) {
            topLevelForm.setFieldsValue({
                topLevelFallbackUserId: approvalSettings.topLevelFallbackUserId
            });
            defaultFallbackForm.setFieldsValue({
                defaultFallbackUserId: approvalSettings.defaultFallbackUserId
            });
        }
    }, [approvalSettings, topLevelForm, defaultFallbackForm]);

    // Handlers
    const onLocationFinish = async (values: any) => {
        try {
            await dispatch(updateLocationSettings(values)).unwrap();
            message.success("Cấu hình vị trí đã được lưu");
            dispatch(fetchLocationSettings());
        } catch (error) {
            message.error(errorText(error, "Lỗi lưu cấu hình vị trí"));
        }
    };

    const onCompanyFinish = async (values: any) => {
        try {
            await dispatch(updateCompanySettings(values)).unwrap();
            message.success("Thông tin công ty đã được lưu");
            dispatch(fetchCompanySettings());
        } catch (error) {
            message.error(errorText(error, "Lỗi lưu thông tin công ty"));
        }
    };

    const onPayrollFinish = async (values: any) => {
        try {
            await dispatch(updatePayrollSettings(values)).unwrap();
            message.success("Cấu hình kỳ lương đã được lưu");
            dispatch(fetchPayrollSettings());
        } catch (error) {
            message.error(errorText(error, "Lỗi lưu cấu hình kỳ lương"));
        }
    };

    const onPayrollCalcFinish = async (values: any) => {
        try {
            await dispatch(updatePayrollCalcSettings(values)).unwrap();
            message.success("Cấu hình tính lương đã được lưu");
            dispatch(fetchPayrollCalcSettings());
        } catch (error) {
            message.error(errorText(error, "Lỗi lưu cấu hình tính lương"));
        }
    };

    const onApprovalFinish = async (values: any) => {
        try {
            const payload = {
                ...(approvalSettings || {}),
                ...values
            };
            await dispatch(updateApprovalSettings(payload)).unwrap();
            message.success("Cấu hình phê duyệt đã được lưu");
            dispatch(fetchApprovalSettings());
            dispatch(fetchApprovalAnalysis());
        } catch (error) {
            message.error(errorText(error, "Lỗi lưu cấu hình phê duyệt"));
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            message.error("Trình duyệt không hỗ trợ Geolocation");
            return;
        }
        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                locationForm.setFieldsValue({
                    officeLatitude: position.coords.latitude,
                    officeLongitude: position.coords.longitude
                });
                setDetecting(false);
                message.info("Đã cập nhật toạ độ hiện tại.");
            },
            (error) => {
                setDetecting(false);
                message.error("Lỗi lấy vị trí: " + error.message);
            }
        );
    };

    const handleGetCurrentIp = async () => {
        setDetectingIp(true);
        try {
            const res = await fetch("https://api.ipify.org?format=json");
            const data = await res.json();
            const currentIps = locationForm.getFieldValue("allowedIpAddresses") || "";
            const list = currentIps.split(",").map((s: string) => s.trim()).filter(Boolean);
            if (!list.includes(data.ip)) {
                list.push(data.ip);
                locationForm.setFieldsValue({ allowedIpAddresses: list.join(", ") });
                message.info(`Đã thêm IP hiện tại: ${data.ip}`);
            } else {
                message.info(`IP ${data.ip} đã có trong danh sách.`);
            }
        } catch {
            message.error("Không thể lấy IP hiện tại.");
        } finally {
            setDetectingIp(false);
        }
    };

    // Tab Items Definition
    const tabItems = [
        {
            key: "1",
            label: <Space className="px-4"><SafetyCertificateOutlined />Quy trình Phê duyệt</Space>,
            children: (
                <div className="animate-in fade-in duration-500">
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={16}>
                            <Space orientation="vertical" style={{ width: '100%' }}>
                                <TopLevelApprovalCard
                                    form={topLevelForm}
                                    users={users}
                                    loading={loading}
                                    onFinish={onApprovalFinish}
                                    onRefresh={() => dispatch(fetchApprovalSettings())}
                                />
                                <DefaultFallbackApprovalCard
                                    form={defaultFallbackForm}
                                    users={users}
                                    loading={loading}
                                    onFinish={onApprovalFinish}
                                    onRefresh={() => dispatch(fetchApprovalSettings())}
                                />
                            </Space>
                        </Col>
                        <Col xs={24} lg={8}>
                            <GuidanceCard />
                        </Col>
                    </Row>
                </div>
            )
        },
        {
            key: "2",
            label: <Space className="px-4"><EnvironmentOutlined />Vị trí & Điểm danh</Space>,
            children: (
                <div className="animate-in fade-in duration-500">
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={16}>
                            <LocationConfigurationCard
                                form={locationForm}
                                loading={loading}
                                detecting={detecting}
                                detectingIp={detectingIp}
                                onFinish={onLocationFinish}
                                onRefresh={() => dispatch(fetchLocationSettings())}
                                onDetect={handleGetCurrentLocation}
                                onDetectIp={handleGetCurrentIp}
                            />
                        </Col>
                        <Col xs={24} lg={8}>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full">
                                <Title level={4} className="mb-4">Thông tin bổ trợ</Title>
                                <Paragraph className="text-slate-500">
                                    Hệ thống sử dụng tọa độ vệ tinh để xác minh tính trung thực khi điểm danh.
                                </Paragraph>
                                <Badge status="processing" text="Bán kính ổn định nhất: 50m" />
                                <Paragraph className="text-slate-500 mt-4">
                                    <Text strong>Làm sao để lấy tọa độ?</Text>
                                    <ul className="mt-2 text-gray-600">
                                        <li>Cách 1: Nhấn nút "Lấy toạ độ tại đây" nếu bạn đang ngồi tại văn phòng (yêu cầu bật định vị trình duyệt).</li>
                                        <li>Cách 2: Truy cập Google Maps, chuột phải vào vị trí văn phòng và copy tọa độ.</li>
                                    </ul>
                                </Paragraph>
                            </div>
                        </Col>
                    </Row>
                </div>
            )
        },
        {
            key: "3",
            label: <Space className="px-4"><DollarOutlined />Kỳ lương & Tính lương</Space>,
            children: (
                <div className="animate-in fade-in duration-500">
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" style={{ width: "100%" }} size={24}>
                                <PayrollSettingsCard
                                    form={payrollForm}
                                    loading={loading}
                                    onFinish={onPayrollFinish}
                                    onRefresh={() => dispatch(fetchPayrollSettings())}
                                />
                                <PayrollCalculationSettingsCard
                                    form={payrollCalcForm}
                                    loading={loading}
                                    onFinish={onPayrollCalcFinish}
                                    onRefresh={() => dispatch(fetchPayrollCalcSettings())}
                                />
                            </Space>
                        </Col>
                        <Col xs={24} lg={8}>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                                <Title level={4} className="mb-4">Lưu ý</Title>
                                <Paragraph className="text-slate-500">
                                    Thay đổi ngày chốt lương sẽ ảnh hưởng đến kỳ lương mới. Nên cấu hình trước khi bắt đầu chu kỳ.
                                </Paragraph>
                                <Badge status="warning" text="Giới hạn tối đa ngày 28 để tránh lỗi tháng 2" />
                                <Paragraph className="text-slate-500 mt-4">
                                    Thay đổi tỷ lệ bảo hiểm hoặc giảm trừ thuế chỉ có hiệu lực với lần <strong>Tính lương</strong> tiếp theo.
                                    Các kỳ đã Approved không bị ảnh hưởng.
                                </Paragraph>
                                <Badge status="processing" text="Chế độ Fixed BH: phù hợp khi công ty khai báo mức BH riêng với cơ quan BHXH" />
                            </div>
                        </Col>
                    </Row>
                </div>
            )
        },
        {
            key: "4",
            label: <Space className="px-4"><BankOutlined />Thông tin Công ty</Space>,
            children: (
                <div className="animate-in fade-in duration-500">
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={16}>
                            <CompanySettingsCard
                                form={companyForm}
                                loading={loading}
                                onFinish={onCompanyFinish}
                                onRefresh={() => dispatch(fetchCompanySettings())}
                            />
                        </Col>
                        <Col xs={24} lg={8}>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full">
                                <Title level={4} className="mb-4">Lưu ý</Title>
                                <Paragraph className="text-slate-500">
                                    Thông tin công ty sẽ được hiển thị trên phần đầu của mỗi phiếu lương PDF khi xuất cho nhân viên.
                                </Paragraph>
                            </div>
                        </Col>
                    </Row>
                </div>
            )
        },
        {
            key: "5",
            label: <Space className="px-4"><AimOutlined />Phân tích (Audit)</Space>,
            children: (
                <div className="animate-in fade-in duration-500">
                    <ApprovalAnalysisTable
                        data={approvalAnalysis}
                        loading={loading}
                        onRefresh={() => dispatch(fetchApprovalAnalysis())}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="p-4 bg-[#f8fafc] min-h-screen">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <Title level={2} style={{ marginBottom: 4, fontWeight: 700, color: '#1e293b' }}>
                        <SettingOutlined className="mr-3 text-indigo-600" />Thiết lập Hệ thống
                    </Title>
                    <Paragraph type="secondary" className="text-lg">
                        Cấu hình tham số lõi và quản lý quy tắc phê duyệt tự động.
                    </Paragraph>
                </div>
                <div className="hidden md:block">
                    <Badge count="Admin Control Center" style={{ backgroundColor: '#4f46e5', padding: '0 12px' }} />
                </div>
            </div>

            <Tabs
                defaultActiveKey="1"
                items={tabItems}
                className="custom-minimal-tabs"
                tabBarStyle={{
                    marginBottom: 32,
                    borderBottom: '1px solid #e2e8f0'
                }}
                size="large"
            />

            <div className="mt-16 text-center opacity-40">
                <Text type="secondary" style={{ fontSize: 12 }}>
                    <QuestionCircleOutlined className="mr-1" />
                    Mọi thay đổi sẽ có hiệu lực ngay lập tức. Liên hệ hỗ trợ nếu cần hướng dẫn nâng cao.
                </Text>
            </div>
        </div>
    );
};

export default SystemSettingPage;
