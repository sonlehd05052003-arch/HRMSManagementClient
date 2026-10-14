import { Form, Select, DatePicker, Input, Button, InputNumber, Modal, message, AutoComplete, Row, Col, Statistic, Typography } from "antd";
import { FormOutlined } from "@ant-design/icons";
import { SectionCard } from "../../../components/listPage";
import { useEffect, useState, useMemo } from "react";
import { SUGGESTIONS_LEAVE_REASON } from "../../../../../constants/explanationTemplates";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { 
    createLeaveRequest, 
    fetchMyLeaveRequests,
    selectMyLeaveRequests,
    selectLeaveRequestLoading, 
    selectLeaveRequestLastResponse,
    selectLeaveRequestError,
    clearLastResponse,
    clearError
} from "../../../../../store/leaveRequestSlide";
import { fetchMyBalance } from "../../../../../store/leaveBalanceSlide";
import { fetchActiveLeaveTypes, selectActiveLeaveTypes } from "../../../../../store/leaveTypeSlide";
import dayjs, { type Dayjs } from "dayjs";
import { countLeaveDays, holidayDatesBetween } from "../../../../../utils/holidays";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const LeaveRequestForm = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectLeaveRequestLoading);
    const lastResponse = useAppSelector(selectLeaveRequestLastResponse);
    const error = useAppSelector(selectLeaveRequestError);
    const leaveTypes = useAppSelector(selectActiveLeaveTypes);
    const myRequests = useAppSelector(selectMyLeaveRequests);
    const [submitAnywayModal, setSubmitAnywayModal] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    const reasonValue: string = Form.useWatch("reason", form) ?? "";
    const reasonOptions = useMemo(() =>
        SUGGESTIONS_LEAVE_REASON
            .filter(s => !reasonValue.trim() || s.toLowerCase().includes(reasonValue.toLowerCase()))
            .map(s => ({ value: s, label: s })),
        [reasonValue]
    );

    useEffect(() => {
        dispatch(fetchActiveLeaveTypes());
        dispatch(fetchMyLeaveRequests());
    }, [dispatch]);

    useEffect(() => {
        if (lastResponse) {
            if (lastResponse.messageCode === "MSG-22") {
                message.success(lastResponse.message);
                form.resetFields();
                dispatch(fetchMyLeaveRequests());
                dispatch(fetchMyBalance());
                dispatch(clearLastResponse());
            } else if (lastResponse.messageCode === "MSG-27") {
                // Insufficient balance, show warning modal
                setFormData(lastResponse.data);
                setSubmitAnywayModal(true);
            } else {
                message.error(lastResponse.message || "Something went wrong.");
                dispatch(clearLastResponse());
            }
        }
    }, [lastResponse, form, dispatch]);
    
    useEffect(() => {
        if (error) {
            message.error(error.message || "Đã có lỗi xảy ra khi gửi yêu cầu.");
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const onFinish = (values: any) => {
        const payload = {
            leaveTypeID: values.leaveTypeID,
            startDate: values.range[0].format("YYYY-MM-DD"),
            endDate: values.range[1].format("YYYY-MM-DD"),
            numberOfDays: values.numberOfDays,
            reason: values.reason,
            submitAnyway: false
        };
        dispatch(createLeaveRequest(payload));
    };

    const handleSubmitAnyway = () => {
        if (formData) {
            const payload = {
                leaveTypeID: formData.leaveTypeID,
                startDate: formData.startDate,
                endDate: formData.endDate,
                numberOfDays: formData.numberOfDays,
                reason: formData.reason,
                submitAnyway: true
            };
            dispatch(createLeaveRequest(payload));
            setSubmitAnywayModal(false);
        }
    };

    // Leave days are working days only: weekends and public holidays are not taken from the balance
    // (the field stays editable, e.g. for half days)
    const handleDateChange = async (dates: [Dayjs | null, Dayjs | null] | null) => {
        const [start, end] = dates ?? [];
        if (!start || !end) return;
        let holidays = new Set<string>();
        try {
            holidays = await holidayDatesBetween(start, end);
        } catch {
            // Without the calendar, count weekdays only
        }
        form.setFieldsValue({ numberOfDays: countLeaveDays(start, end, holidays) });
    };

    // Hàm kiểm tra ngày đã được đăng ký chưa
    const isDateRequested = (current: dayjs.Dayjs) => {
        return myRequests.some(req => {
            if (req.status === "Cancelled" || req.status === "Rejected") return false;
            const start = dayjs(req.startDate).startOf('day');
            const end = dayjs(req.endDate).startOf('day');
            return current.isSameOrAfter(start) && current.isSameOrBefore(end);
        });
    };

    const disabledDate = (current: dayjs.Dayjs) => {
        // Disable ngày trong quá khứ
        if (current && current < dayjs().startOf('day')) return true;
        // Disable ngày đã có đơn gửi đi (Approved hoặc Pending)
        return isDateRequested(current);
    };

    // Render custom ô ngày để đổi màu những ngày đã đăng ký
    const cellRender = (current: any, info: any) => {
        if (info.type !== 'date') return info.originNode;
        
        const dateDayjs = dayjs(current);
        const isRequested = isDateRequested(dateDayjs);
        const isToday = dateDayjs.isSame(dayjs(), 'day');

        if (isRequested) {
            return (
                <div className="ant-picker-cell-inner relative" style={{ backgroundColor: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffa39e', borderRadius: '4px' }}>
                    {dateDayjs.date()}
                    {isToday && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />}
                </div>
            );
        }

        if (isToday) {
            return (
                <div className="ant-picker-cell-inner relative">
                    {dateDayjs.date()}
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                </div>
            );
        }

        return info.originNode;
    };

    return (
        <SectionCard title="Đăng ký nghỉ phép" icon={<FormOutlined />} gap={0}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item name="leaveTypeID" label="Loại nghỉ phép" rules={[{ required: true, message: 'Vui lòng chọn loại nghỉ phép' }]}>
                    <Select placeholder="Chọn loại nghỉ phép">
                        {(leaveTypes || []).map(item => (
                            <Option key={item.leaveTypeId} value={item.leaveTypeId}>
                                {item.leaveTypeName} {item.annualEntitlement === 0 ? <span className="text-purple-500 ml-2">(Sự kiện/Không giới hạn)</span> : ""}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="range" label="Thời gian" rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
                    <RangePicker 
                        className="w-full" 
                        classNames={{ popup: "custom-range-picker" }}
                        onChange={handleDateChange}
                        disabledDate={disabledDate}
                        cellRender={cellRender}
                    />
                </Form.Item>

                <Form.Item name="numberOfDays" label="Số ngày nghỉ" rules={[{ required: true, message: 'Vui lòng nhập số ngày' }]}>
                    <InputNumber min={0.5} step={0.5} className="w-full" disabled />
                </Form.Item>

                <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
                    <AutoComplete options={reasonOptions} style={{ width: "100%" }} popupMatchSelectWidth>
                        <TextArea rows={4} placeholder="Nhập lý do hoặc chọn gợi ý từ danh sách..." showCount maxLength={500} />
                    </AutoComplete>
                </Form.Item>

                <Button type="primary" htmlType="submit" block loading={loading}>
                    Gửi yêu cầu
                </Button>
            </Form>

            <Modal
                title="Cảnh báo số dư"
                open={submitAnywayModal}
                onOk={handleSubmitAnyway}
                onCancel={() => {
                    setSubmitAnywayModal(false);
                    dispatch(clearLastResponse());
                }}
                okText="Vẫn gửi"
                cancelText="Hủy"
                centered
            >
                <div className="py-4 text-center">
                    <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="font-medium mb-4">Số dư ngày nghỉ của bạn không đủ.</p>
                    <Row gutter={16} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <Col span={12}>
                            <Statistic title="Số dư hiện tại" value={formData?.currentBalance} suffix="ngày" styles={{ content: { fontSize: 24 } }} />
                        </Col>
                        <Col span={12}>
                            <Statistic title="Yêu cầu" value={formData?.numberOfDays} suffix="ngày" styles={{ content: { fontSize: 24 } }} />
                        </Col>
                    </Row>
                    <Typography.Text type="secondary" italic className="block mt-6">Bạn có chắc chắn muốn gửi yêu cầu này không?</Typography.Text>
                </div>
            </Modal>
        </SectionCard>
    );
};

export default LeaveRequestForm;
