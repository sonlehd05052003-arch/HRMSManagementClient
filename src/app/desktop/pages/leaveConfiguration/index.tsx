import { Layout, Typography, Row, Col, Card, Form, Select, Input, InputNumber, Button, Table, message, DatePicker, Tag, Space, Popconfirm, Tooltip, Modal, Checkbox, Statistic, Tabs, Alert } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    fetchAllLeaveTypes,
    selectLeaveTypes,
    deleteLeaveType,
    selectLeaveTypeLoading
} from "../../../../store/leaveTypeSlide";
import {
    adjustLeaveBalance,
    fetchAllBalances,
    selectAllLeaveBalances,
    selectLeaveBalanceLoading,
    selectLeaveBalanceLastResponse,
    clearLastResponse,
    generateLeaveBalances,
    type GenerateBalanceResultDto
} from "../../../../store/leaveBalanceSlide";
import { fetchAllEmployees, selectEmployees } from "../../../../store/employeeSlide";
import dayjs from "dayjs";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    CalendarOutlined,
    SolutionOutlined,
    UserOutlined,
    HistoryOutlined,
    PlusCircleOutlined,
    EyeOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import LeaveTypeModal from "./LeaveTypeModal";
import CreateBalanceModal from "./CreateBalanceModal";
import EmployeeBalanceDetailsModal from "./EmployeeBalanceDetailsModal";
import { errorText } from "../../../../utils/apiError";

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;

const LeaveConfiguration = () => {
    const dispatch = useAppDispatch();
    const leaveTypes = useAppSelector(selectLeaveTypes);
    const employees = useAppSelector(selectEmployees);
    const allBalances = useAppSelector(selectAllLeaveBalances);
    const leaveBalanceLoading = useAppSelector(selectLeaveBalanceLoading);
    const leaveTypeLoading = useAppSelector(selectLeaveTypeLoading);
    const lastResponse = useAppSelector(selectLeaveBalanceLastResponse);

    const [adjustmentForm] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isBalanceModalVisible, setIsBalanceModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; name: string } | null>(null);
    const [editingLeaveType, setEditingLeaveType] = useState<any | null>(null);
    const [generateYear, setGenerateYear] = useState<number>(new Date().getFullYear());
    const [carryForward, setCarryForward] = useState<boolean>(true);
    const [generateResult, setGenerateResult] = useState<GenerateBalanceResultDto | null>(null);
    const [isGenerateResultVisible, setIsGenerateResultVisible] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        dispatch(fetchAllLeaveTypes());
        dispatch(fetchAllEmployees());
        dispatch(fetchAllBalances());
    }, [dispatch]);

    useEffect(() => {
        if (lastResponse) {
            message.success(lastResponse.message || "Thực hiện thành công.");
            adjustmentForm.resetFields();
            dispatch(fetchAllBalances()); // Refresh balance list
            dispatch(clearLastResponse());
        }
    }, [lastResponse, dispatch, adjustmentForm]);

    const onFinishAdjustment = async (values: any) => {
        const payload = {
            employeeId: values.employeeId,
            leaveTypeId: values.leaveTypeId,
            adjustmentType: values.adjustmentType,
            numberOfDays: values.numberOfDays,
            reason: values.reason,
            effectiveDate: values.effectiveDate.format("YYYY-MM-DD")
        };
        await dispatch(adjustLeaveBalance(payload));
    };

    const handleAddLeaveType = () => {
        setEditingLeaveType(null);
        setIsModalVisible(true);
    };

    const handleGenerateBalances = async () => {
        setIsGenerating(true);
        try {
            const result = await dispatch(generateLeaveBalances({ year: generateYear, carryForward })).unwrap();
            const data: GenerateBalanceResultDto = result.data || result;
            setGenerateResult(data);
            setIsGenerateResultVisible(true);
            dispatch(fetchAllBalances());
        } catch (err) {
            message.error(errorText(err, "Có lỗi xảy ra khi khởi tạo số dư."));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEditLeaveType = (leaveType: any) => {
        setEditingLeaveType(leaveType);
        setIsModalVisible(true);
    };

    const handleDeleteLeaveType = async (id: number) => {
        try {
            await dispatch(deleteLeaveType(id)).unwrap();
            message.success("Đã ngừng hoạt động loại phép này.");
        } catch (err) {
            message.error(errorText(err, "Không thể xóa loại phép này."));
        }
    };

    const leaveTypeColumns = [
        {
            title: "Mã loại",
            dataIndex: "leaveTypeCode",
            key: "leaveTypeCode",
            render: (text: string) => <Tag color="blue" className="font-mono">{text}</Tag>
        },
        {
            title: "Tên loại phép",
            dataIndex: "leaveTypeName",
            key: "leaveTypeName",
            className: "font-semibold text-slate-700"
        },
        {
            title: "Tự hưởng (năm)",
            dataIndex: "annualEntitlement",
            key: "annualEntitlement",
            align: 'center' as const,
            render: (val: number) => val === 0 ? <Tag color="purple">Sự kiện</Tag> : <strong>{val}</strong>
        },
        {
            title: "Có lương",
            dataIndex: "isPaid",
            key: "isPaid",
            align: 'center' as const,
            render: (paid: boolean) => paid ? <Tag color="success">Có</Tag> : <Tag color="default">Không</Tag>
        },
        {
            title: "Phê duyệt",
            dataIndex: "requiresApproval",
            key: "requiresApproval",
            align: 'center' as const,
            render: (req: boolean) => req ? <Tag color="processing">Cần</Tag> : <Tag color="default">Không</Tag>
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            align: 'center' as const,
            render: (active: boolean) => active ? <Tag color="cyan">Hoạt động</Tag> : <Tag color="error">Ngừng</Tag>
        },
        {
            title: "Hành động",
            key: "action",
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditLeaveType(record)}
                            className="text-indigo-600 hover:text-indigo-800"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn ngừng hoạt động loại phép này?"
                        onConfirm={() => handleDeleteLeaveType(record.leaveTypeId)}
                        okText="Có"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Ngừng hoạt động">
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                className="text-red-600 hover:text-red-800"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const balanceColumns = [
        {
            title: "Nhân viên",
            key: "employee",
            render: (_: any, record: any) => (
                <Space>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <UserOutlined />
                    </div>
                    <div>
                        <div className="font-semibold text-slate-700">{record.employeeName}</div>
                        <div className="text-xs text-slate-400">ID: {record.employeeId}</div>
                    </div>
                </Space>
            )
        },
        {
            title: "Loại phép",
            dataIndex: "leaveTypeName",
            key: "leaveTypeName",
            render: (text: string) => <Tag className="border-none bg-slate-100/80 text-slate-600 font-medium">{text}</Tag>
        },
        {
            title: "Tổng hưởng",
            dataIndex: "totalEntitlement",
            key: "totalEntitlement",
            align: 'center' as const,
        },
        {
            title: "Đã dùng",
            dataIndex: "usedDays",
            key: "usedDays",
            align: 'center' as const,
            render: (val: number) => <span className="text-amber-600 font-medium">{val}</span>
        },
        {
            title: "Còn lại",
            dataIndex: "remainingDays",
            key: "remainingDays",
            align: 'center' as const,
            render: (val: number) => <span className="text-emerald-600 font-bold">{val}</span>
        },
        {
            title: "Năm",
            dataIndex: "year",
            key: "year",
            align: 'center' as const,
        },
        {
            title: "Cập nhật lần cuối",
            dataIndex: "lastUpdated",
            key: "lastUpdated",
            render: (date: string) => <span className="text-slate-400 text-xs">{dayjs(date).format("DD/MM/YYYY HH:mm")}</span>
        },
        {
            title: "Hành động",
            key: "action",
            align: "center" as const,
            render: (_: any, record: any) => (
                <Tooltip title="Xem chi tiết các loại phép">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedEmployee({ id: record.employeeId, name: record.employeeName });
                            setDetailsModalVisible(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                    />
                </Tooltip>
            )
        }
    ];

    const tabItems = [
        {
            key: "1",
            label: <Space className="px-4"><CalendarOutlined />Loại Nghỉ Phép</Space>,
            children: (
                <div className="animate-in fade-in duration-500">
                    <Card
                        title={
                            <div className="flex justify-between items-center w-full">
                                <Space>
                                    <SolutionOutlined className="text-indigo-500 text-lg" />
                                    <span className="font-bold text-slate-800">Danh sách Loại Nghỉ phép</span>
                                </Space>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddLeaveType}
                                    className="h-10 px-6 rounded-lg font-semibold shadow-lg shadow-indigo-200"
                                >
                                    Thêm Loại Phép
                                </Button>
                            </div>
                        }
                        className="shadow-sm border-none rounded-2xl bg-white overflow-hidden"
                    >
                        <Table
                            columns={leaveTypeColumns}
                            dataSource={leaveTypes || []}
                            rowKey="leaveTypeId"
                            pagination={{ pageSize: 8 }}
                            loading={leaveTypeLoading}
                            className="custom-table"
                        />
                    </Card>
                </div>
            )
        },
        {
            key: "2",
            label: <Space className="px-4"><HistoryOutlined />Quản lý Theo Dõi Số Dư</Space>,
            children: (
                <div className="animate-in fade-in duration-500">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={8}>
                            <Card
                                className="shadow-sm border-none rounded-2xl overflow-hidden h-full bg-white"
                                styles={{ body: { padding: '24px' } }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <Title level={4} style={{ color: '#1e293b', marginBottom: '8px' }}>Khởi tạo tự động</Title>
                                        <p style={{ color: '#64748b', margin: 0, fontSize: 13 }}>
                                            Tạo số dư cho toàn bộ nhân viên theo năm.
                                        </p>
                                    </div>
                                    <ThunderboltOutlined style={{ fontSize: '32px', color: '#6366f1' }} />
                                </div>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px' }}>
                                    <div className="mb-4">
                                        <p style={{ color: '#475569', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Năm khởi tạo</p>
                                        <DatePicker
                                            picker="year"
                                            value={dayjs().year(generateYear)}
                                            onChange={(d) => d && setGenerateYear(d.year())}
                                            className="w-full h-10 rounded-lg"
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <Checkbox
                                            checked={carryForward}
                                            onChange={(e) => setCarryForward(e.target.checked)}
                                            style={{ color: '#334155' }}
                                        >
                                            Cộng dồn phép dư năm trước
                                        </Checkbox>
                                    </div>
                                    <Popconfirm
                                        title={<span className="font-bold">Khởi tạo năm {generateYear}?</span>}
                                        description="Bản ghi đã tồn tại sẽ được bỏ qua."
                                        onConfirm={handleGenerateBalances}
                                        okText="Thực hiện"
                                        cancelText="Hủy"
                                    >
                                        <Button
                                            type="primary"
                                            icon={<ThunderboltOutlined />}
                                            loading={isGenerating}
                                            style={{ width: '100%', height: '44px', borderRadius: '12px', fontWeight: 'bold' }}
                                        >
                                            Khởi tạo số dư năm {generateYear}
                                        </Button>
                                    </Popconfirm>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} lg={16}>
                            <Card
                                title={
                                    <div className="flex justify-between items-center w-full">
                                        <Space>
                                            <HistoryOutlined className="text-emerald-500 text-lg" />
                                            <span className="font-bold text-slate-800">Danh sách Số dư Nhân viên</span>
                                        </Space>
                                        <Button
                                            size="small"
                                            icon={<PlusCircleOutlined />}
                                            onClick={() => setIsBalanceModalVisible(true)}
                                            className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 border-emerald-100 rounded-md font-medium"
                                        >
                                            Tạo thủ công
                                        </Button>
                                    </div>
                                }
                                className="shadow-sm border-none rounded-2xl bg-white h-full"
                            >
                                <Table
                                    columns={balanceColumns}
                                    dataSource={allBalances || []}
                                    rowKey="balanceId"
                                    pagination={{ pageSize: 8 }}
                                    loading={leaveBalanceLoading}
                                    className="custom-table"
                                />
                            </Card>
                        </Col>
                    </Row>
                </div>
            )
        },
        {
            key: "3",
            label: <Space className="px-4"><EditOutlined />Cộng Trừ Phép Chuyên Sâu</Space>,
            children: (
                <div className="animate-in fade-in duration-500 w-full max-w-2xl mx-auto">
                    <Card
                        title={
                            <Space size="middle">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <PlusOutlined className="text-indigo-600 text-lg" />
                                </div>
                                <span className="font-bold text-slate-800">Phiếu điều chỉnh số dư</span>
                            </Space>
                        }
                        className="shadow-sm border-none rounded-2xl bg-white"
                    >
                        <Alert 
                            message="Lưu ý"
                            description="Thao tác này sẽ trực tiếp thay đổi số phép còn lại của nhân viên. Hành động này sẽ được ghi log toàn hệ thống."
                            type="warning"
                            showIcon
                            className="mb-8 border-none bg-amber-50 rounded-xl text-amber-800"
                        />
                        <Form form={adjustmentForm} layout="vertical" onFinish={onFinishAdjustment} requiredMark={false}>
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Form.Item name="employeeId" label={<span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Nhân viên</span>} rules={[{ required: true, message: "Chọn nhân viên" }]}>
                                        <Select
                                            showSearch
                                            placeholder="Chọn nhân viên"
                                            optionFilterProp="children"
                                            className="h-11 rounded-lg"
                                        >
                                            {(employees || []).map((e: any) => (
                                                <Option key={e.employeeId} value={e.employeeId}>
                                                    {e.fullName} ({e.employeeCode})
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="leaveTypeId" label={<span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Loại phép</span>} rules={[{ required: true, message: "Chọn loại phép" }]}>
                                        <Select placeholder="Chọn loại phép" className="h-11 rounded-lg">
                                            {(leaveTypes || []).filter((lt: any) => lt.isActive).map((lt: any) => (
                                                <Option key={lt.leaveTypeId} value={lt.leaveTypeId}>
                                                    {lt.leaveTypeName}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="adjustmentType" label={<span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Thao tác</span>} rules={[{ required: true }]}>
                                        <Select placeholder="Thao tác" className="h-11 rounded-lg">
                                            <Option value="Add"><span className="text-emerald-600 font-bold">Cộng thêm (+)</span></Option>
                                            <Option value="Deduct"><span className="text-rose-600 font-bold">Trừ đi (-)</span></Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="numberOfDays" label={<span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Số ngày</span>} rules={[{ required: true }]}>
                                        <InputNumber min={0.5} step={0.5} style={{ width: '100%' }} className="h-11 rounded-lg pt-1" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="effectiveDate" label={<span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Ngày hiệu lực</span>} rules={[{ required: true }]} initialValue={dayjs()}>
                                        <DatePicker className="w-full h-11 rounded-lg" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="reason" label={<span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Lý do điều chỉnh (Bắt buộc)</span>} rules={[{ required: true }]}>
                                        <Input.TextArea rows={3} placeholder="Ví dụ: Thưởng phép do làm OT dự án A..." className="rounded-xl" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={leaveBalanceLoading}
                                className="h-12 mt-4 rounded-xl font-bold tracking-wide shadow-indigo-200 shadow-xl"
                            >
                                Xác nhận Điều chỉnh
                            </Button>
                        </Form>
                    </Card>
                </div>
            )
        }
    ];

    return (
        <Layout className="bg-[#f8fafc] p-4 min-h-screen">
            <Content className="w-full">
                <div className="mb-10">
                    <Title level={2} style={{ marginBottom: 4, fontWeight: 700, color: '#1e293b' }}>
                        <SolutionOutlined className="mr-3 text-indigo-600" />Cấu hình Nghỉ Phép
                    </Title>
                    <Paragraph type="secondary" className="text-lg text-slate-500">
                        Phân bổ hạng mục nghỉ phép, thiết lập tự động hóa số dư và điều chỉnh thủ công.
                    </Paragraph>
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
            </Content>

            <LeaveTypeModal
                visible={isModalVisible}
                onClose={() => {
                    setIsModalVisible(false);
                    dispatch(fetchAllLeaveTypes()); // Refresh list
                }}
                editingLeaveType={editingLeaveType}
            />

            <CreateBalanceModal
                visible={isBalanceModalVisible}
                onClose={(refresh) => {
                    setIsBalanceModalVisible(false);
                    if (refresh) dispatch(fetchAllBalances());
                }}
            />

            <EmployeeBalanceDetailsModal
                visible={detailsModalVisible}
                onClose={() => setDetailsModalVisible(false)}
                employee={selectedEmployee}
            />

            {/* Generate Result Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircleOutlined />
                        <span>Kết quả khởi tạo số dư năm {generateResult?.year}</span>
                    </div>
                }
                open={isGenerateResultVisible}
                onOk={() => setIsGenerateResultVisible(false)}
                onCancel={() => setIsGenerateResultVisible(false)}
                okText="Đóng"
                cancelButtonProps={{ style: { display: 'none' } }}
                centered
            >
                {generateResult && (
                    <div className="py-4">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Statistic title="Bản ghi đã tạo" value={generateResult.created} styles={{ content: { color: '#10b981', fontWeight: 700 } }} suffix="bản ghi" />
                            </Col>
                            <Col span={12}>
                                <Statistic title="Đã bỏ qua (tồn tại)" value={generateResult.skipped} styles={{ content: { color: '#f59e0b', fontWeight: 700 } }} suffix="bản ghi" />
                            </Col>
                            <Col span={12}>
                                <Statistic title="Nhân viên được xử lý" value={generateResult.totalEmployees} suffix="người" />
                            </Col>
                            <Col span={12}>
                                <Statistic title="Loại phép được áp dụng" value={generateResult.totalLeaveTypes} suffix="loại" />
                            </Col>
                            {generateResult.carriedForward > 0 && (
                                <Col span={24}>
                                    <div className="bg-blue-50 rounded-lg p-3 text-blue-700 text-sm mt-2">
                                        ✅ <strong>{generateResult.carriedForward}</strong> bản ghi được cộng dồn ngày dư từ năm {generateResult.year - 1}.
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default LeaveConfiguration;


