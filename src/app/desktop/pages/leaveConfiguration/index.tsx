import { Typography, Row, Col, Form, Select, Input, InputNumber, Button, Table, message, DatePicker, Tag, Space, Popconfirm, Tooltip, Modal, Checkbox, Statistic, Tabs, Alert } from "antd";
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
import { PageHeader, SectionCard, TableCard } from "../../components/listPage";

const { Text } = Typography;
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
            className: "font-semibold"
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
                        <div className="font-semibold" style={{ whiteSpace: "nowrap" }}>{record.employeeName}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>ID: {record.employeeId}</Text>
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
            render: (date: string) => <Text type="secondary" style={{ whiteSpace: "nowrap" }}>{dayjs(date).format("DD/MM/YYYY HH:mm")}</Text>
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
            label: <Space><CalendarOutlined />Loại Nghỉ Phép</Space>,
            children: (
                <TableCard
                    title="Danh sách Loại Nghỉ phép"
                    count={(leaveTypes || []).length}
                    extra={
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddLeaveType}>
                            Thêm Loại Phép
                        </Button>
                    }
                >
                    <Table
                        columns={leaveTypeColumns}
                        dataSource={leaveTypes || []}
                        rowKey="leaveTypeId"
                        pagination={{ pageSize: 8 }}
                        loading={leaveTypeLoading}
                        scroll={{ x: "max-content" }}
                    />
                </TableCard>
            )
        },
        {
            key: "2",
            label: <Space><HistoryOutlined />Quản lý Theo Dõi Số Dư</Space>,
            children: (
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={8}>
                        <SectionCard title="Khởi tạo tự động" icon={<ThunderboltOutlined />} gap={0}>
                            <Text type="secondary" className="block mb-4">
                                Tạo số dư cho toàn bộ nhân viên theo năm.
                            </Text>
                            <div className="mb-4">
                                <div className="mb-2 font-medium">Năm khởi tạo</div>
                                <DatePicker
                                    picker="year"
                                    value={dayjs().year(generateYear)}
                                    onChange={(d) => d && setGenerateYear(d.year())}
                                    className="w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <Checkbox
                                    checked={carryForward}
                                    onChange={(e) => setCarryForward(e.target.checked)}
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
                                    block
                                >
                                    Khởi tạo số dư năm {generateYear}
                                </Button>
                            </Popconfirm>
                        </SectionCard>
                    </Col>
                    <Col xs={24} lg={16}>
                        <TableCard
                            title="Danh sách Số dư Nhân viên"
                            count={(allBalances || []).length}
                            extra={
                                <Button icon={<PlusCircleOutlined />} onClick={() => setIsBalanceModalVisible(true)}>
                                    Tạo thủ công
                                </Button>
                            }
                        >
                            <Table
                                columns={balanceColumns}
                                dataSource={allBalances || []}
                                rowKey="balanceId"
                                pagination={{ pageSize: 8 }}
                                loading={leaveBalanceLoading}
                                scroll={{ x: "max-content" }}
                            />
                        </TableCard>
                    </Col>
                </Row>
            )
        },
        {
            key: "3",
            label: <Space><EditOutlined />Cộng Trừ Phép Chuyên Sâu</Space>,
            children: (
                <div className="w-full max-w-2xl mx-auto">
                    <SectionCard title="Phiếu điều chỉnh số dư" icon={<PlusOutlined />} gap={0}>
                        <Alert
                            message="Lưu ý"
                            description="Thao tác này sẽ trực tiếp thay đổi số phép còn lại của nhân viên. Hành động này sẽ được ghi log toàn hệ thống."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                        <Form form={adjustmentForm} layout="vertical" onFinish={onFinishAdjustment} requiredMark={false}>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item name="employeeId" label="Nhân viên" rules={[{ required: true, message: "Chọn nhân viên" }]}>
                                        <Select
                                            showSearch
                                            placeholder="Chọn nhân viên"
                                            optionFilterProp="children"
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
                                    <Form.Item name="leaveTypeId" label="Loại phép" rules={[{ required: true, message: "Chọn loại phép" }]}>
                                        <Select placeholder="Chọn loại phép">
                                            {(leaveTypes || []).filter((lt: any) => lt.isActive).map((lt: any) => (
                                                <Option key={lt.leaveTypeId} value={lt.leaveTypeId}>
                                                    {lt.leaveTypeName}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="adjustmentType" label="Thao tác" rules={[{ required: true }]}>
                                        <Select placeholder="Thao tác">
                                            <Option value="Add"><span className="text-emerald-600 font-bold">Cộng thêm (+)</span></Option>
                                            <Option value="Deduct"><span className="text-rose-600 font-bold">Trừ đi (-)</span></Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="numberOfDays" label="Số ngày" rules={[{ required: true }]}>
                                        <InputNumber min={0.5} step={0.5} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="effectiveDate" label="Ngày hiệu lực" rules={[{ required: true }]} initialValue={dayjs()}>
                                        <DatePicker className="w-full" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="reason" label="Lý do điều chỉnh (Bắt buộc)" rules={[{ required: true }]}>
                                        <Input.TextArea rows={3} placeholder="Ví dụ: Thưởng phép do làm OT dự án A..." />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={leaveBalanceLoading}
                            >
                                Xác nhận Điều chỉnh
                            </Button>
                        </Form>
                    </SectionCard>
                </div>
            )
        }
    ];

    return (
        <div className="p-2">
            <PageHeader
                title="Cấu hình nghỉ phép"
                subtitle="Phân bổ hạng mục nghỉ phép, thiết lập tự động hóa số dư và điều chỉnh thủ công."
            />

            <Tabs defaultActiveKey="1" items={tabItems} />

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
                                    <div className="bg-blue-50 rounded-lg p-3 text-blue-700 mt-2">
                                        ✅ <strong>{generateResult.carriedForward}</strong> bản ghi được cộng dồn ngày dư từ năm {generateResult.year - 1}.
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LeaveConfiguration;


