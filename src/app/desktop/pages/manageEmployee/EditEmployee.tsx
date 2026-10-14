import { Form, Input, Select, DatePicker, InputNumber, message, Row, Col, Button, Space, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, IdcardOutlined, SaveOutlined, SolutionOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateEmployee, fetchEmployeeById, fetchAllEmployees, selectEmployeeLoading, selectEmployees } from "../../../../store/employeeSlide";
import type { IEmployeeDetail } from "../../../../store/employeeSlide";
import { selectInfoLogin } from "../../../../store/authSlide";
import { fetchActiveDepartments, selectActiveDepartments } from "../../../../store/departmentSlide";
import { fetchActivePositions, selectActivePositions } from "../../../../store/positionSlide";
import { fetchAllUsers, selectUsers } from "../../../../store/userSlide";
import { EUserRole } from "../../../../interface/app";
import URL from "../../../../constants/url";
import dayjs from "dayjs";

import { PageHeader, SectionCard } from "../../components/listPage";

const STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Resigned", "Terminated", "Suspended"].map(v => ({ label: v, value: v }));
const TYPE_OPTIONS = ["Full-Time", "Part-Time", "Contract", "Intern"].map(v => ({ label: v, value: v }));
const GENDER_OPTIONS = ["Male", "Female", "Other"].map(v => ({ label: v, value: v }));

const EditEmployee = () => {
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const loading = useAppSelector(selectEmployeeLoading);
    const infoLogin = useAppSelector(selectInfoLogin);
    const activeDepartments = useAppSelector(selectActiveDepartments);
    const activePositions = useAppSelector(selectActivePositions);
    const employees = useAppSelector(selectEmployees);
    const users = useAppSelector(selectUsers);

    const [editingEmployee, setEditingEmployee] = useState<IEmployeeDetail | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setFetching(true);
            try {
                if (id) {
                    const result = await dispatch(fetchEmployeeById(Number(id))).unwrap();
                    setEditingEmployee(result as IEmployeeDetail);
                }
                await Promise.all([
                    dispatch(fetchActiveDepartments()),
                    dispatch(fetchActivePositions()),
                    dispatch(fetchAllEmployees()),
                    dispatch(fetchAllUsers())
                ]);
            } catch {
                message.error("Không thể tải dữ liệu nhân viên!");
                navigate(URL.ManageEmployee);
            } finally {
                setFetching(false);
            }
        };
        loadData();
    }, [id, dispatch, navigate]);

    useEffect(() => {
        if (editingEmployee) {
            form.setFieldsValue({
                employeeCode: editingEmployee.employeeCode,
                firstName: editingEmployee.firstName,
                lastName: editingEmployee.lastName,
                email: editingEmployee.email,
                phone: editingEmployee.phone,
                gender: editingEmployee.gender,
                address: editingEmployee.address,
                city: editingEmployee.city,
                country: editingEmployee.country,
                departmentId: editingEmployee.departmentId,
                positionId: editingEmployee.positionId,
                managerId: editingEmployee.managerId,
                employmentStatus: editingEmployee.employmentStatus,
                employmentType: editingEmployee.employmentType,
                baseSalary: editingEmployee.baseSalary,
                insuranceSalary: editingEmployee.insuranceSalary,
                numberOfDependents: editingEmployee.numberOfDependents ?? 0,
                dateOfBirth: editingEmployee.dateOfBirth ? dayjs(editingEmployee.dateOfBirth) : null,
                joinDate: editingEmployee.joinDate ? dayjs(editingEmployee.joinDate) : null,
                resignationDate: editingEmployee.resignationDate ? dayjs(editingEmployee.resignationDate) : null,
            });
        }
    }, [editingEmployee, form]);

    const departmentOptions = activeDepartments.map(d => ({
        label: d.departmentName,
        value: d.departmentId,
    }));

    const positionOptions = [
        { label: "Không chọn", value: null },
        ...activePositions.map(p => ({
            label: p.positionName,
            value: p.positionId,
        }))
    ];

    const managerUserIds = users
        .filter(u => u.roles.includes(EUserRole.MANAGE) || u.roles.includes(EUserRole.ADMIN))
        .map(u => u.employeeId);

    const managerOptions = [
        { label: "Không chọn", value: null },
        ...employees
            .filter(e => managerUserIds.includes(e.employeeId))
            .map(e => ({
                label: `${e.fullName} (${e.employeeCode})`,
                value: e.employeeId,
            }))
    ];

    const onFinish = (values: any) => {
        if (!editingEmployee || !id) return;
        const payload: any = {
            employeeCode: editingEmployee.employeeCode,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone || null,
            dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
            gender: values.gender || null,
            address: values.address || null,
            city: values.city || null,
            country: values.country || null,
            modifiedBy: infoLogin?.userId ? Number(infoLogin.userId) : null,
            departmentId: values.departmentId || null,
            positionId: values.positionId || null,
            managerId: values.managerId || null,
            joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
            resignationDate: values.resignationDate ? values.resignationDate.format("YYYY-MM-DD") : null,
            employmentStatus: values.employmentStatus,
            employmentType: values.employmentType,
            baseSalary: values.baseSalary ?? null,
            insuranceSalary: values.insuranceSalary ?? null,
            numberOfDependents: values.numberOfDependents ?? 0,
        };

        dispatch(updateEmployee({ id: Number(id), data: payload }))
            .unwrap()
            .then(() => {
                message.success("Cập nhật nhân viên thành công!");
                navigate(URL.ManageEmployee);
            })
            .catch((err: any) => {
                const errMsg = typeof err === "string" ? err : err?.message || "Cập nhật thất bại!";
                message.error(errMsg);
            });
    };

    if (fetching) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
                <Spin size="large" tip="Đang tải dữ liệu nhân viên..." />
            </div>
        );
    }

    return (
        <div className="p-2">
            <PageHeader
                title={<>Chỉnh sửa nhân viên: {editingEmployee?.fullName}</>}
                actions={
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                }
            />

            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish}
            >
                <SectionCard title="Thông tin cá nhân" icon={<IdcardOutlined />}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="employeeCode" label="Mã nhân viên">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="firstName" label="Họ" rules={[{ required: true, message: "Vui lòng nhập họ" }, { max: 50 }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="lastName" label="Tên" rules={[{ required: true, message: "Vui lòng nhập tên" }, { max: 50 }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }, { max: 100 }]}>
                                <Input placeholder="example@company.com" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item 
                                name="phone" 
                                label="Số điện thoại" 
                                rules={[
                                    { required: true, message: "Vui lòng nhập số điện thoại" },
                                    { pattern: /^0\d{9}$/, message: "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0" }
                                ]}
                            >
                                <Input placeholder="09xxxxxxxx" maxLength={10} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="gender" label="Giới tính">
                                <Select options={GENDER_OPTIONS} allowClear placeholder="Chọn giới tính" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dateOfBirth" label="Ngày sinh">
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    disabledDate={d => d && d > dayjs().subtract(18, "year")}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="address" label="Địa chỉ cụ thể" rules={[{ max: 200 }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="city" label="Thành phố" rules={[{ max: 50 }]}><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="country" label="Quốc gia" rules={[{ max: 50 }]}><Input /></Form.Item>
                        </Col>
                    </Row>
                </SectionCard>

                <SectionCard title="Thông tin công việc" icon={<SolutionOutlined />}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item 
                                name="joinDate" 
                                label="Ngày vào làm" 
                                dependencies={['dateOfBirth']}
                                rules={[
                                    { required: true, message: "Vui lòng chọn ngày vào làm" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const dob = getFieldValue('dateOfBirth');
                                            if (!value || !dob) {
                                                return Promise.resolve();
                                            }
                                            if (value.isBefore(dob.add(18, 'year'), 'day')) {
                                                return Promise.reject(new Error('Nhân viên phải đủ ít nhất 18 tuổi tại thời điểm vào làm'));
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="resignationDate" label="Ngày nghỉ việc">
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item 
                                name="baseSalary" 
                                label="Lương cơ bản" 
                                rules={[
                                    { required: true, message: "Vui lòng nhập lương cơ bản" },
                                    () => ({
                                        validator(_, value) {
                                            if (value === undefined || value === null || value === '') {
                                                return Promise.resolve();
                                            }
                                            if (value < 1000000) {
                                                return Promise.reject(new Error('Lương cơ bản phải ít nhất 1.000.000 VND'));
                                            }
                                            if (value > 100000000) {
                                                return Promise.reject(new Error('Lương cơ bản không được vượt quá 100.000.000 VND'));
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    min={1000000}
                                    max={100000000}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="employmentStatus" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
                                <Select options={STATUS_OPTIONS} placeholder="Chọn trạng thái" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="employmentType" label="Loại hình" rules={[{ required: true, message: "Vui lòng chọn loại hình" }]}>
                                <Select options={TYPE_OPTIONS} placeholder="Chọn loại hình" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="numberOfDependents"
                                label="Số người phụ thuộc (NPT)"
                                rules={[{ type: "number", min: 0, max: 20, message: "NPT từ 0 đến 20" }]}
                            >
                                <InputNumber style={{ width: "100%" }} min={0} max={20} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="insuranceSalary"
                                label="Mức lương đóng bảo hiểm"
                                rules={[
                                    { type: "number", min: 1000000, message: "Mức lương BH phải ít nhất 1.000.000 VND" },
                                    { type: "number", max: 100000000, message: "Mức lương BH không được vượt quá 100.000.000 VND" }
                                ]}
                                tooltip="Mức lương đóng BHXH/BHYT/BHTN đã đăng ký, cố định không thay đổi theo lương thực nhận hàng tháng. Nếu để trống sẽ dùng lương cơ bản."
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    min={1000000}
                                    max={100000000}
                                    placeholder="VND (để trống = dùng lương cơ bản)"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="departmentId" label="Phòng ban">
                                <Select
                                    options={departmentOptions}
                                    placeholder="Chọn phòng ban"
                                    allowClear
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="positionId" label="Chức vụ">
                                <Select
                                    options={positionOptions}
                                    placeholder="Chọn chức vụ"
                                    allowClear
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="managerId" label="Quản lý">
                                <Select
                                    options={managerOptions}
                                    placeholder="Chọn quản lý"
                                    allowClear
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </SectionCard>

                <div style={{ textAlign: "right" }}>
                    <Space>
                        <Button onClick={() => navigate(-1)}>Hủy bỏ</Button>
                        <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={() => form.submit()}>
                            Lưu thay đổi
                        </Button>
                    </Space>
                </div>
            </Form>
        </div>
    );
};

export default EditEmployee;
