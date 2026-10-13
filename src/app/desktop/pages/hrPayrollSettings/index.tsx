import React, { useEffect } from "react";
import { Form, Typography, message } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchPayrollSettings, selectPayrollSettings,
    selectSystemSettingLoading, updatePayrollSettings
} from "../../../../store/systemSettingSlide";
import PayrollSettingsCard from "../manageSystemSettings/components/PayrollSettingsCard";
import HolidaysCard from "../manageSystemSettings/components/HolidaysCard";
import { errorText } from "../../../../utils/apiError";

const { Title, Paragraph } = Typography;

const HRPayrollSettingsPage: React.FC = () => {
    const [payrollForm] = Form.useForm();
    const dispatch = useAppDispatch();

    const payrollSettings = useAppSelector(selectPayrollSettings);
    const loading = useAppSelector(selectSystemSettingLoading);

    useEffect(() => {
        dispatch(fetchPayrollSettings());
    }, [dispatch]);

    useEffect(() => {
        if (payrollSettings) payrollForm.setFieldsValue(payrollSettings);
    }, [payrollSettings, payrollForm]);

    const onPayrollFinish = async (values: any) => {
        try {
            await dispatch(updatePayrollSettings(values)).unwrap();
            message.success("Cấu hình kỳ lương đã được lưu");
            dispatch(fetchPayrollSettings());
        } catch (error) {
            message.error(errorText(error, "Lỗi lưu cấu hình kỳ lương"));
        }
    };

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Title level={2} style={{ marginBottom: 4, fontWeight: 700, color: '#1e293b' }}>
                        <DollarOutlined className="mr-3 text-indigo-600" />Cấu hình Kỳ lương
                    </Title>
                    <Paragraph type="secondary">
                        Cấu hình ngày chốt lương để hệ thống tính đúng kỳ chấm công.
                    </Paragraph>
                </div>

                <PayrollSettingsCard
                    form={payrollForm}
                    loading={loading}
                    onFinish={onPayrollFinish}
                    onRefresh={() => dispatch(fetchPayrollSettings())}
                />

                <div className="mt-8">
                    <HolidaysCard />
                </div>
            </div>
        </div>
    );
};

export default HRPayrollSettingsPage;
