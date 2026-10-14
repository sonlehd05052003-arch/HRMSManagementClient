import { useEffect } from "react";
import { Modal, Form, Select, DatePicker, InputNumber, Input, message, Row, Col } from "antd";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { submitProcedure, updateProcedure, selectHRProcedureLoading } from "../../../../../store/hrProcedureSlide";
import { fetchActiveEmployees, selectEmployees } from "../../../../../store/employeeSlide";
import { fetchActiveDepartments, selectActiveDepartments } from "../../../../../store/departmentSlide";
import { fetchActivePositions, selectActivePositions } from "../../../../../store/positionSlide";

const { TextArea } = Input;

interface AddHRProcedureModalProps {
    open: boolean;
    initialValues?: any;
    onCancel: () => void;
    onSuccess: () => void;
}

const PROCEDURE_TYPES = [
    { label: "Bổ nhiệm", value: "Appointment" },
    { label: "Điều chuyển", value: "Transfer" },
    { label: "Giáng chức", value: "Demotion" },
    { label: "Sa thải", value: "Termination" }
];

const AddHRProcedureModal = ({ open, initialValues, onCancel, onSuccess }: AddHRProcedureModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectHRProcedureLoading);
    const employees = useAppSelector(selectEmployees);
    const departments = useAppSelector(selectActiveDepartments);
    const positions = useAppSelector(selectActivePositions);

    const isEdit = !!initialValues;

    // Watch for procedureType changes to conditionally show fields
    const procedureType = Form.useWatch("procedureType", form);
    const selectedEmployeeId = Form.useWatch("employeeId", form);
    const newDepartmentId = Form.useWatch("newDepartmentId", form);

    const selectedEmployee = employees.find(e => e.employeeId === selectedEmployeeId);

    useEffect(() => {
        if (open) {
            dispatch(fetchActiveEmployees());
            if (departments.length === 0) dispatch(fetchActiveDepartments());
            if (positions.length === 0) dispatch(fetchActivePositions());
        }
    }, [open, dispatch, departments.length, positions.length]);

    useEffect(() => {
        if (open && initialValues) {
            form.setFieldsValue({
                ...initialValues,
                effectiveDate: initialValues.effectiveDate ? dayjs(initialValues.effectiveDate) : null,
            });
        } else if (open) {
            form.resetFields();
        }
    }, [open, initialValues, form]);

    const onFinish = (values: any) => {
        const payload = {
            employeeId: values.employeeId,
            procedureType: values.procedureType,
            effectiveDate: values.effectiveDate.format("YYYY-MM-DD"),
            newDepartmentId: values.newDepartmentId || null,
            newPositionId: values.newPositionId || null,
            newManagerId: values.newManagerId || null,
            newSalary: values.newSalary || null,
            reason: values.reason || "",
        };

        const action = isEdit 
            ? dispatch(updateProcedure({ id: initialValues.procedureId, data: payload }))
            : dispatch(submitProcedure(payload));

        action
            .unwrap()
            .then(() => {
                message.success(`${isEdit ? "Cập nhật" : "Tạo"} yêu cầu thủ tục thành công!`);
                form.resetFields();
                onSuccess();
            })
            .catch((err: any) => {
                const errMsg = typeof err === "string" ? err : err?.message || `Lỗi khi ${isEdit ? "cập nhật" : "tạo"} thủ tục!`;
                message.error(errMsg);
            });
    };

    const renderDynamicFields = () => {
        if (!procedureType) return null;

        const isAppointment = procedureType === "Appointment";
        const isTransfer = procedureType === "Transfer";
        const isDemotion = procedureType === "Demotion";
        const needsDepartment = isAppointment || isTransfer;
        const needsPosition = isAppointment || isDemotion || isTransfer;
        const needsSalary = isAppointment || isDemotion || isTransfer;
        const needsManager = isAppointment || isDemotion || isTransfer;

        return (
            <>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="effectiveDate" 
                            label="Ngày hiệu lực" 
                            rules={[{ required: true, message: "Vui lòng chọn ngày hiệu lực" }]}
                        >
                            <DatePicker 
                                style={{ width: "100%" }} 
                                format="DD/MM/YYYY" 
                                disabledDate={(current) => {
                                    return current && current < dayjs().startOf('day');
                                }}
                            />
                        </Form.Item>
                    </Col>
                    {needsSalary && (
                        <Col span={12}>
                            <Form.Item 
                                name="newSalary" 
                                label="Mức lương mới (VND)"
                            >
                                <InputNumber 
                                    style={{ width: "100%" }} 
                                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 
                                    min={0} 
                                    placeholder="Nếu có thay đổi lương" 
                                />
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                <Row gutter={16}>
                    {needsDepartment && (
                        <Col span={needsPosition ? 12 : 24}>
                            <Form.Item 
                                name="newDepartmentId" 
                                label="Phòng ban mới"
                                rules={[
                                    { required: isTransfer, message: 'Bắt buộc chọn Phòng ban mới cho thủ tục điều chuyển' }
                                ]}
                            >
                                <Select 
                                    showSearch
                                    placeholder="Chọn phòng ban mới"
                                    optionFilterProp="children"
                                    options={departments.map(d => ({ label: d.departmentName, value: d.departmentId }))}
                                />
                            </Form.Item>
                        </Col>
                    )}
                    {needsPosition && (
                        <Col span={12}>
                            <Form.Item 
                                name="newPositionId" 
                                label="Vị trí mới"
                                rules={[
                                    { required: isDemotion, message: 'Bắt buộc chọn Vị trí mới cho thủ tục giáng chức' }
                                ]}
                            >
                                <Select 
                                    showSearch
                                    placeholder="Chọn vị trí mới"
                                    optionFilterProp="children"
                                    options={positions.map(p => ({ label: p.positionName, value: p.positionId }))}
                                />
                            </Form.Item>
                        </Col>
                    )}
                    {needsManager && (
                        <Col span={12}>
                            <Form.Item 
                                name="newManagerId" 
                                label="Quản lý trực tiếp mới"
                                tooltip="Chỉ hiển thị Quản lý thuộc phòng ban mới đã chọn"
                            >
                                <Select 
                                    showSearch
                                    placeholder={newDepartmentId ? "Chọn quản lý mới" : "Vui lòng chọn phòng ban mới trước"}
                                    optionFilterProp="children"
                                    disabled={!newDepartmentId && !selectedEmployee?.departmentId}
                                    options={employees
                                        .filter(e => 
                                            e.employmentStatus === "Active" && 
                                            // Lọc theo phòng ban mới hoặc phòng ban hiện tại (nếu mới chưa chọn)
                                            e.departmentId === (newDepartmentId || selectedEmployee?.departmentId) &&
                                            // Kiểm tra role là Manager (case-insensitive)
                                            (e.roleName?.toLowerCase().includes("manager") || e.roleName === "ADMIN")
                                        )
                                        .map(emp => ({
                                            label: `${emp.fullName} - ${emp.positionName}`,
                                            value: emp.employeeId
                                        }))}
                                />
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                <Form.Item name="reason" label="Lý do thay đổi" rules={[{ required: true, message: "Vui lòng nhập lý do" }]}>
                    <TextArea rows={4} placeholder={`Nhập lý do ${procedureType.toLowerCase()}...`} />
                </Form.Item>
            </>
        );
    };

    return (
        <Modal 
            title={isEdit ? `Cập nhật thủ tục: ${initialValues.procedureNumber}` : `Tạo yêu cầu ${procedureType || 'thủ tục HR'}`} 
            open={open} 
            onCancel={() => { form.resetFields(); onCancel(); }}
            onOk={() => form.submit()} 
            confirmLoading={loading} 
            width={700} 
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="employeeId" 
                            label="Nhân viên" 
                            rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
                        >
                            <Select 
                                showSearch
                                placeholder="Chọn nhân viên"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                }
                                options={employees.map(emp => ({
                                    label: `${emp.employeeCode} - ${emp.fullName}`,
                                    value: emp.employeeId
                                }))}
                                disabled={isEdit}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            name="procedureType" 
                            label="Loại thủ tục" 
                            rules={[{ required: true, message: "Vui lòng chọn loại thủ tục" }]}
                        >
                            <Select options={PROCEDURE_TYPES} placeholder="Chọn loại thủ tục" />
                        </Form.Item>
                    </Col>
                </Row>
                
                {selectedEmployee && (
                    <Row gutter={16} style={{ marginBottom: 16, padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <Col span={8}>
                            <div style={{ color: '#64748b' }}>Phòng ban hiện tại:</div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedEmployee.departmentName}</div>
                        </Col>
                        <Col span={8}>
                            <div style={{ color: '#64748b' }}>Vị trí hiện tại:</div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedEmployee.positionName}</div>
                        </Col>
                        <Col span={8}>
                            <div style={{ color: '#64748b' }}>Quản lý hiện tại:</div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedEmployee.managerName || "Chưa có"}</div>
                        </Col>
                    </Row>
                )}
                
                {renderDynamicFields()}
            </Form>
        </Modal>
    );
};

export default AddHRProcedureModal;
