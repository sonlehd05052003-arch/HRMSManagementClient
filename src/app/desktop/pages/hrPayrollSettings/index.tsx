import React, { useEffect } from "react";
import { Form, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchPayrollSettings, selectPayrollSettings,
    selectSystemSettingLoading, updatePayrollSettings
} from "../../../../store/systemSettingSlide";
import PayrollSettingsCard from "../manageSystemSettings/components/PayrollSettingsCard";
import HolidaysCard from "../manageSystemSettings/components/HolidaysCard";
import { errorText } from "../../../../utils/apiError";
import { PageHeader } from "../../components/listPage";

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
        <div className="p-2">
            <PageHeader
                title="Cấu hình kỳ lương"
                subtitle="Cấu hình ngày chốt lương để hệ thống tính đúng kỳ chấm công."
            />

            <PayrollSettingsCard
                form={payrollForm}
                loading={loading}
                onFinish={onPayrollFinish}
                onRefresh={() => dispatch(fetchPayrollSettings())}
            />

            {/* PayrollSettingsCard and HolidaysCard are shared with manageSystemSettings and set no margin themselves */}
            <div style={{ marginTop: 16 }}>
                <HolidaysCard />
            </div>
        </div>
    );
};

export default HRPayrollSettingsPage;
