import { Button, Form, Input, DatePicker, TimePicker, message, Typography, Radio, Row, Col, Alert, AutoComplete } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { createOvertimeRequest, selectOvertimeLoading, fetchMyOvertimeRequests } from "../../../../../store/overtimeSlide";
import { fetchMySchedule, selectMySchedule } from "../../../../../store/shiftAssignmentSlide";
import { SUGGESTIONS_OVERTIME_REASON } from "../../../../../constants/explanationTemplates";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { ClockCircleOutlined } from "@ant-design/icons";
import { SectionCard } from "../../../components/listPage";

const { Text } = Typography;
const { TextArea } = Input;

const OvertimeRequestForm = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectOvertimeLoading);
    const mySchedule = useAppSelector(selectMySchedule);
    
    // Watch values in form
    const overtimeDate = Form.useWatch("overtimeDate", form);
    const otMode = Form.useWatch("otMode", form);

    const reasonValue: string = Form.useWatch("reason", form) ?? "";
    const reasonOptions = useMemo(() =>
        SUGGESTIONS_OVERTIME_REASON
            .filter(s => !reasonValue.trim() || s.toLowerCase().includes(reasonValue.toLowerCase()))
            .map(s => ({ value: s, label: s })),
        [reasonValue]
    );

    // Check if the selected date has an active shift assignment
    const selectedDateShift = useMemo(() => {
        if (!overtimeDate) return null;
        const dateStr = overtimeDate.format("YYYY-MM-DD");
        return mySchedule.find(s => 
            dayjs(s.assignmentDate).format("YYYY-MM-DD") === dateStr && 
            s.status === "Active"
        );
    }, [overtimeDate, mySchedule]);

    // Cleanup and reset mode when date changes
    useEffect(() => {
        if (overtimeDate) {
            if (selectedDateShift) {
                form.setFieldValue("otMode", "AfterShift");
            } else {
                form.setFieldValue("otMode", "FullRange");
            }
        }
    }, [overtimeDate, selectedDateShift, form]);

    // Initial load for schedule
    useEffect(() => {
        if (mySchedule.length === 0) {
            dispatch(fetchMySchedule({ 
                fromDate: dayjs().startOf('month').format("YYYY-MM-DD"),
                toDate: dayjs().endOf('month').format("YYYY-MM-DD")
            }));
        }
    }, [dispatch, mySchedule.length]);

    // Sync anchor times when mode or shift changes
    useEffect(() => {
        if (selectedDateShift) {
            const shiftStart = dayjs(selectedDateShift.startTime, "HH:mm:ss");
            const shiftEnd = dayjs(selectedDateShift.endTime, "HH:mm:ss");

            if (otMode === "BeforeShift") {
                form.setFieldValue("endTime", shiftStart);
                // Clear startTime if it's invalid
                const currentStart = form.getFieldValue("startTime");
                if (currentStart && currentStart.isAfter(shiftStart)) {
                    form.setFieldValue("startTime", null);
                }
            } else if (otMode === "AfterShift") {
                form.setFieldValue("startTime", shiftEnd);
                // Clear endTime if it's invalid
                const currentEnd = form.getFieldValue("endTime");
                if (currentEnd && currentEnd.isBefore(shiftEnd)) {
                    form.setFieldValue("endTime", null);
                }
            }
        }
    }, [otMode, selectedDateShift, form]);

    // Validation Logic for TimePickers
    const getDisabledStartTime = () => {
        if (!selectedDateShift || otMode !== "BeforeShift") return {};
        const shiftStart = dayjs(selectedDateShift.startTime, "HH:mm:ss");
        const startHour = shiftStart.hour();
        
        // Allowed range: (startHour - 4) to startHour
        // We need to handle wrap-around for shifts starting at 00:00, 01:00, etc.
        const allowedHours: number[] = [];
        for (let i = 1; i <= 4; i++) {
            allowedHours.push((startHour - i + 24) % 24);
        }

        return {
            disabledHours: () => {
                const hours = [];
                for (let i = 0; i < 24; i++) {
                    if (!allowedHours.includes(i)) hours.push(i);
                }
                return hours;
            },
            disabledMinutes: (selectedHour: number) => {
                // For the anchor hour (startHour), we don't allow any minutes 
                // because OT must be BEFORE the shift.
                if (selectedHour === startHour) {
                    const minutes = [];
                    for (let i = 0; i < 60; i++) minutes.push(i);
                    return minutes;
                }
                return [];
            }
        };
    };

    const getDisabledEndTime = () => {
        if (!selectedDateShift || otMode !== "AfterShift") return {};
        const shiftEnd = dayjs(selectedDateShift.endTime, "HH:mm:ss");
        const endHour = shiftEnd.hour();

        // Allowed range: endHour to (endHour + 4)
        const allowedHours: number[] = [];
        for (let i = 0; i <= 4; i++) {
            allowedHours.push((endHour + i) % 24);
        }

        return {
            disabledHours: () => {
                const hours = [];
                for (let i = 0; i < 24; i++) {
                    if (!allowedHours.includes(i)) hours.push(i);
                }
                return hours;
            },
            disabledMinutes: (selectedHour: number) => {
                // In the shift end hour, can only pick minutes AFTER the shift ends
                if (selectedHour === endHour) {
                    const minutes = [];
                    for (let i = 0; i <= shiftEnd.minute(); i++) minutes.push(i);
                    return minutes;
                }
                // In the limit hour (end+4), can only pick minutes BEFORE the limit
                const limitHour = (endHour + 4) % 24;
                if (selectedHour === limitHour) {
                    const minutes = [];
                    for (let i = shiftEnd.minute() + 1; i < 60; i++) minutes.push(i);
                    return minutes;
                }
                return [];
            }
        };
    };

    const onFinish = (values: any) => {
        const overtimeDate = values.overtimeDate.format("YYYY-MM-DD");
        
        let startTime = null;
        let endTime = null;

        if (values.otMode === "AfterShift") {
            // Note: In AfterShift, startTime is fixed to ShiftEnd
            startTime = dayjs(selectedDateShift?.endTime, "HH:mm:ss").format("HH:mm:ss");
            endTime = values.endTime?.format("HH:mm:ss");
        } else if (values.otMode === "BeforeShift") {
            // In BeforeShift, endTime is fixed to ShiftStart
            startTime = values.startTime?.format("HH:mm:ss");
            endTime = dayjs(selectedDateShift?.startTime, "HH:mm:ss").format("HH:mm:ss");
        } else {
            startTime = values.startTime?.format("HH:mm:ss");
            endTime = values.endTime?.format("HH:mm:ss");
        }

        const payload = {
            overtimeDate,
            startTime,
            endTime,
            otMode: values.otMode,
            reason: values.reason,
            taskDescription: values.taskDescription,
        };

        dispatch(createOvertimeRequest(payload))
            .unwrap()
            .then(() => {
                message.success("Gửi yêu cầu tăng ca thành công!");
                form.resetFields();
                dispatch(fetchMyOvertimeRequests());
            })
            .catch((err: any) => {
                const errMsg = typeof err === "string" ? err : err?.message || "Gửi yêu cầu thất bại!";
                message.error(errMsg);
            });
    };

    const disabledDate = (current: any) => {
        return current && (current < dayjs().subtract(3, 'day').startOf('day') || current > dayjs().add(30, 'day').endOf('day'));
    };

    return (
        <SectionCard title="Đăng ký tăng ca (OT)" icon={<ClockCircleOutlined />} gap={0}>
            
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish}
                initialValues={{ otMode: "AfterShift" }}
            >
                <Form.Item 
                    name="overtimeDate" 
                    label={<Text strong>1. Chọn ngày tăng ca</Text>} 
                    rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
                >
                    <DatePicker 
                        style={{ width: "100%" }} 
                        format="DD/MM/YYYY" 
                        disabledDate={disabledDate} 
                        placeholder="Chọn ngày đăng ký OT"
                    />
                </Form.Item>

                {overtimeDate && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                        <div className="mb-4">
                            {selectedDateShift ? (
                                <Alert
                                    message={`Bạn có lịch làm việc: ${selectedDateShift.shiftName}`}
                                    description={`Thời gian: ${selectedDateShift.startTime?.substring(0, 5)} - ${selectedDateShift.endTime?.substring(0, 5)}`}
                                    type="info"
                                    showIcon
                                    className="rounded-lg"
                                />
                            ) : (
                                <Alert
                                    message="Ngày nghỉ / Không có ca làm chính"
                                    description="Bạn đang đăng ký tăng ca cho ngày không có lịch làm việc chính thức."
                                    type="warning"
                                    showIcon
                                    className="rounded-lg"
                                />
                            )}
                        </div>

                        <Form.Item 
                            name="otMode" 
                            label={<Text strong>2. Chế độ tăng ca phù hợp</Text>} 
                            rules={[{ required: true }]}
                        >
                            <Radio.Group buttonStyle="solid" className="w-full">
                                <Row gutter={[8, 8]}>
                                    {selectedDateShift ? (
                                        <>
                                            <Col span={12}>
                                                <Radio.Button value="BeforeShift" className="w-full text-center">Trước ca</Radio.Button>
                                            </Col>
                                            <Col span={12}>
                                                <Radio.Button value="AfterShift" className="w-full text-center">Sau ca</Radio.Button>
                                            </Col>
                                        </>
                                    ) : (
                                        <Col span={24}>
                                            <Radio.Button value="FullRange" className="w-full text-center">Tăng ca ngày nghỉ/lễ</Radio.Button>
                                        </Col>
                                    )}
                                </Row>
                            </Radio.Group>
                        </Form.Item>

                        <div className="flex gap-4 mt-4">
                            {(otMode === "BeforeShift" || otMode === "FullRange") && (
                                <Form.Item 
                                    name="startTime" 
                                    label={<Text strong>{otMode === "BeforeShift" ? "Giờ bắt đầu OT" : "Giờ bắt đầu"}</Text>} 
                                    className="flex-1"
                                    rules={[{ required: true, message: "Chọn giờ bắt đầu!" }]}
                                    tooltip={otMode === "BeforeShift" ? "Phải bắt đầu trước giờ vào ca làm việc" : ""}
                                >
                                    <TimePicker 
                                        style={{ width: "100%" }} 
                                        format="HH:mm" 
                                        disabled={otMode === "AfterShift"}
                                        disabledTime={() => getDisabledStartTime()}
                                        hideDisabledOptions
                                    />
                                </Form.Item>
                            )}
                            {(otMode === "AfterShift" || otMode === "FullRange") && (
                                <Form.Item 
                                    name="endTime" 
                                    label={<Text strong>{otMode === "AfterShift" ? "Giờ kết thúc OT" : "Giờ kết thúc"}</Text>} 
                                    className="flex-1"
                                    rules={[{ required: true, message: "Chọn giờ kết thúc!" }]}
                                    tooltip={otMode === "AfterShift" ? "Phải kết thúc sau giờ ra ca làm việc" : ""}
                                >
                                    <TimePicker 
                                        style={{ width: "100%" }} 
                                        format="HH:mm" 
                                        disabled={otMode === "BeforeShift"}
                                        disabledTime={() => getDisabledEndTime()}
                                        hideDisabledOptions
                                    />
                                </Form.Item>
                            )}
                        </div>
                        
                        {selectedDateShift && (
                            <Text type="secondary" italic className="block mt-2" style={{ fontSize: 12 }}>
                                * Lưu ý: Giờ tăng ca tối đa là 4 tiếng/ngày và không được trùng với giờ làm việc chính.
                            </Text>
                        )}
                    </div>
                )}

                <Form.Item name="reason" label={<Text strong>Lý do tăng ca</Text>} rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}>
                    <AutoComplete options={reasonOptions} style={{ width: "100%" }} popupMatchSelectWidth>
                        <TextArea rows={3} placeholder="Nhập lý do hoặc chọn gợi ý từ danh sách..." showCount maxLength={500} />
                    </AutoComplete>
                </Form.Item>

                <Form.Item name="taskDescription" label={<Text strong>Nội dung công việc</Text>}>
                    <TextArea rows={3} placeholder="Mô tả chi tiết các đầu việc sẽ thực hiện..." />
                </Form.Item>

                <Button 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    loading={loading}
                >
                    Gửi yêu cầu đăng ký
                </Button>
            </Form>
        </SectionCard>
    );
};

export default OvertimeRequestForm;
