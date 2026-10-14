import { useEffect, useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Table, Button, Space, Typography, Tag, message,
  Breadcrumb, Input, Select, Row, Col, Tooltip, Modal, Alert,
} from "antd"
import {
  CalculatorOutlined,
  ArrowLeftOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  SendOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  StopOutlined,
  WarningOutlined,
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import { useAppDispatch, useAppSelector } from "../../../../../store"
import {
  fetchPayrollPeriodById,
  fetchRecordsByPeriod,
  calculateAllEmployees,
  approvePayrollPeriod,
  rejectPayrollPeriod,
  triggerAttendanceReview,
  generatePayslipsForPeriod,
  exportPayrollExcel,
  selectCurrentPeriod,
  selectPayrollRecords,
  selectPayrollLoading,
  selectPayrollCalculating,
} from "../../../../../store/payrollSlide"
import { selectInfoLogin } from "../../../../../store/authSlide"
import { EUserRole } from "../../../../../interface/app"
import type { IPayrollRecord } from "../../../../../types/payroll"
import URL from "../../../../../constants/url"
import SummaryCards from "./SummaryCards"
import { errorText } from "../../../../../utils/apiError";
import { FilterCard, PageHeader, TableCard } from "../../../components/listPage"

const { Text } = Typography

const PayrollPeriodDetail = () => {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const dispatch  = useAppDispatch()

  const period      = useAppSelector(selectCurrentPeriod)
  const records     = useAppSelector(selectPayrollRecords)
  const loading     = useAppSelector(selectPayrollLoading)
  const calculating = useAppSelector(selectPayrollCalculating)
  const infoLogin   = useAppSelector(selectInfoLogin)

  const periodId   = Number(id)
  const isHR       = infoLogin?.role === EUserRole.HR
  const isAdmin    = infoLogin?.role === EUserRole.ADMIN
  const isApproved         = period?.status === "Approved"
  const isCalculated       = period?.status === "Calculated"
  const isAttendanceReview = period?.status === "AttendanceReview"
  const isRejected         = period?.status === "Rejected"
  const isOpen             = period?.status === "Open"

  // ── Bộ lọc ──────────────────────────────────────────
  const [search, setSearch]               = useState("")
  const [deptFilter, setDeptFilter]       = useState<string | null>(null)
  const [positionFilter, setPositionFilter] = useState<string | null>(null)
  const [rejectModal, setRejectModal]     = useState(false)
  const [rejectReason, setRejectReason]   = useState("")

  useEffect(() => {
    if (periodId) {
      dispatch(fetchPayrollPeriodById(periodId))
      dispatch(fetchRecordsByPeriod(periodId))
    }
  }, [dispatch, periodId])

  // Reset position filter khi đổi phòng ban
  useEffect(() => {
    setPositionFilter(null)
  }, [deptFilter])

  // ── Danh sách phòng ban / chức vụ ────────────────────
  const deptOptions = useMemo(() => {
    const names = [...new Set(records.map(r => r.departmentName))].filter(Boolean).sort()
    return names.map(d => ({ label: d, value: d }))
  }, [records])

  const positionOptions = useMemo(() => {
    const source = deptFilter ? records.filter(r => r.departmentName === deptFilter) : records
    const names  = [...new Set(source.map(r => r.positionName))].filter(Boolean).sort()
    return names.map(p => ({ label: p, value: p }))
  }, [records, deptFilter])

  // ── Lọc + sắp xếp theo phòng ban → chức vụ ──────────
  const filteredRecords = useMemo(() => {
    return [...records]
      .filter(r => {
        const q           = search.toLowerCase()
        const matchSearch = !search ||
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeCode.toLowerCase().includes(q)
        const matchDept   = !deptFilter || r.departmentName === deptFilter
        const matchPos    = !positionFilter || r.positionName === positionFilter
        return matchSearch && matchDept && matchPos
      })
      .sort((a, b) => {
        const byDept = (a.departmentName || "").localeCompare(b.departmentName || "", "vi")
        if (byDept !== 0) return byDept
        const byPos = (a.positionName || "").localeCompare(b.positionName || "", "vi")
        if (byPos !== 0) return byPos
        return a.employeeName.localeCompare(b.employeeName, "vi")
      })
  }, [records, search, deptFilter, positionFilter])

  const hasActiveFilter = !!(search || deptFilter || positionFilter)

  const clearFilters = () => {
    setSearch("")
    setDeptFilter(null)
    setPositionFilter(null)
  }

  // ── Handlers ─────────────────────────────────────────
  const handleCalculateAll = async () => {
    try {
      await dispatch(calculateAllEmployees(periodId)).unwrap()
      await dispatch(fetchPayrollPeriodById(periodId))
      message.success("Đã hoàn tất tính lương cho toàn bộ nhân viên!")
    } catch (err) {
      message.error(errorText(err, "Lỗi khi tính lương"))
    }
  }

  const handleGeneratePayslips = async () => {
    try {
      const res = await dispatch(generatePayslipsForPeriod(periodId)).unwrap()
      message.success(res.message || "Đã tạo phiếu lương!")
    } catch (err) {
      message.error(errorText(err, "Lỗi tạo phiếu lương"))
    }
  }

  const handleApprove = async () => {
    try {
      await dispatch(approvePayrollPeriod(periodId)).unwrap()
      message.success("Kỳ lương đã được duyệt và khóa dữ liệu.")
    } catch (err) {
      message.error(errorText(err, "Lỗi khi duyệt kỳ lương"))
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối.")
      return
    }
    try {
      await dispatch(rejectPayrollPeriod({ periodId, data: { reason: rejectReason.trim() } })).unwrap()
      message.success("Đã từ chối kỳ lương. HR cần tính toán lại.")
      setRejectModal(false)
      setRejectReason("")
    } catch (err) {
      message.error(errorText(err, "Lỗi khi từ chối kỳ lương"))
    }
  }

  const handleTriggerReview = async () => {
    try {
      await dispatch(triggerAttendanceReview(periodId)).unwrap()
      message.success("Đã kích hoạt giai đoạn review chấm công. Email đã được gửi cho nhân viên.")
      await dispatch(fetchPayrollPeriodById(periodId))
    } catch (err) {
      message.error(errorText(err, "Lỗi khi kích hoạt review"))
    }
  }

  const handleExport = async () => {
    try {
      const blob = await dispatch(exportPayrollExcel(periodId)).unwrap()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href     = url
      a.download = `Payroll_Thang${period?.month}_${period?.year}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      message.error(errorText(err, "Lỗi xuất Excel"))
    }
  }

  // ── Cột bảng ─────────────────────────────────────────
  const columns: ColumnsType<IPayrollRecord> = [
    {
      title: "Nhân viên",
      key: "employee",
      fixed: "left",
      width: 180,
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName, "vi"),
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.employeeName}</Text>
          <Text type="secondary">{r.employeeCode}</Text>
        </Space>
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: "departmentName",
      width: 180,
      ellipsis: true,
      sorter: (a, b) => (a.departmentName || "").localeCompare(b.departmentName || "", "vi"),
      render: (v: string) => v
        ? <Tag color="cyan" title={v} style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", verticalAlign: "middle" }}>{v}</Tag>
        : <span className="text-gray-300">—</span>,
    },
    {
      title: "Chức vụ",
      dataIndex: "positionName",
      width: 140,
      sorter: (a, b) => (a.positionName || "").localeCompare(b.positionName || "", "vi"),
      render: (v: string) => v
        ? <span className="text-gray-600">{v}</span>
        : <span className="text-gray-300">—</span>,
    },
    {
      title: "Công TT",
      key: "workdays",
      align: "center",
      width: 100,
      sorter: (a, b) => a.actualWorkingDays - b.actualWorkingDays,
      render: (_, r) => {
        if (!r.workingDays || r.workingDays === 0)
          return <Tag color="default">Chưa phân ca</Tag>
        return (
          <Tag color={r.actualWorkingDays < r.workingDays ? "orange" : "blue"}>
            {Number(r.actualWorkingDays).toFixed(1)} / {r.workingDays}
          </Tag>
        )
      },
    },
    {
      title: "Lương ngày công",
      dataIndex: "salariedAmount",
      align: "right",
      width: 170,
      sorter: (a, b) => (a.salariedAmount ?? 0) - (b.salariedAmount ?? 0),
      render: (v: number) => (v > 0 ? v.toLocaleString("vi-VN") : "—"),
    },
    {
      title: "Phụ cấp",
      dataIndex: "totalAllowances",
      align: "right",
      width: 110,
      sorter: (a, b) => (a.totalAllowances ?? 0) - (b.totalAllowances ?? 0),
      render: (v: number) => (v > 0 ? v.toLocaleString("vi-VN") : "—"),
    },
    {
      title: "OT",
      dataIndex: "overtimePay",
      align: "right",
      width: 100,
      sorter: (a, b) => (a.overtimePay ?? 0) - (b.overtimePay ?? 0),
      render: (v: number) => (
        <Text type={v > 0 ? "success" : undefined}>
          {v > 0 ? v.toLocaleString("vi-VN") : "—"}
        </Text>
      ),
    },
    {
      title: "Bảo hiểm",
      dataIndex: "insuranceAmount",
      align: "right",
      width: 120,
      sorter: (a, b) => (a.insuranceAmount ?? 0) - (b.insuranceAmount ?? 0),
      render: (v: number) => (
        <Text type="danger">-{(v ?? 0).toLocaleString("vi-VN")}</Text>
      ),
    },
    {
      title: "Thuế",
      dataIndex: "taxAmount",
      align: "right",
      width: 110,
      sorter: (a, b) => (a.taxAmount ?? 0) - (b.taxAmount ?? 0),
      render: (v: number) => (
        <Text type="danger">-{(v ?? 0).toLocaleString("vi-VN")}</Text>
      ),
    },
    {
      title: "THỰC LĨNH",
      key: "netPay",
      align: "right",
      fixed: "right",
      width: 150,
      sorter: (a, b) => {
        const netA = a.salariedAmount + a.totalAllowances + a.overtimePay + a.bonusAmount - a.insuranceAmount - a.taxAmount - a.deductions.filter(d => d.deductionType === "Manual").reduce((s, d) => s + d.amount, 0)
        const netB = b.salariedAmount + b.totalAllowances + b.overtimePay + b.bonusAmount - b.insuranceAmount - b.taxAmount - b.deductions.filter(d => d.deductionType === "Manual").reduce((s, d) => s + d.amount, 0)
        return netA - netB
      },
      render: (_, r) => {
        const gross = r.salariedAmount + r.totalAllowances + r.overtimePay + r.bonusAmount
        const manualDeductions = r.deductions.filter(d => d.deductionType === "Manual").reduce((s, d) => s + d.amount, 0)
        const computedNet = gross - r.insuranceAmount - r.taxAmount - manualDeductions
        return <span className="font-bold text-green-600" style={{ whiteSpace: "nowrap" }}>{computedNet.toLocaleString("vi-VN")} đ</span>
      },
    },
    {
      title: "",
      key: "action",
      fixed: "right",
      align: "center",
      width: 130,
      render: (_, r) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            navigate(URL.PayrollRecordDetail.replace(":id", String(r.payrollRecordId)))
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ]

  return (
    <div className="p-2">
      <Breadcrumb
        style={{ marginBottom: 12 }}
        items={[
          { title: "Dashboard", href: "/" },
          { title: "Kỳ lương", href: URL.PayrollPeriods },
          { title: `Tháng ${period?.month}/${period?.year}` },
        ]}
      />

      <PageHeader
        title={`Chi tiết kỳ lương tháng ${period?.month}/${period?.year}`}
        subtitle={
          <Space wrap size={[0, 4]} style={{ marginTop: 4 }}>
            <Tag color="cyan">Từ: {period?.startDate}</Tag>
            <Tag color="cyan">Đến: {period?.endDate}</Tag>
            {isApproved         && <Tag color="green"  icon={<CheckCircleOutlined />}>ĐÃ DUYỆT</Tag>}
            {isAttendanceReview && <Tag color="orange">REVIEW CHẤM CÔNG</Tag>}
            {isCalculated       && <Tag color="blue">ĐÃ TÍNH LƯƠNG</Tag>}
            {isRejected         && <Tag color="red" icon={<StopOutlined />}>ĐÃ TỪ CHỐI</Tag>}
            {isOpen             && <Tag color="default">CHƯA XỬ LÝ</Tag>}
          </Space>
        }
        actions={<>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>

          {/* HR: kích hoạt review thủ công nếu background service chưa chạy */}
          {isHR && isOpen && (
            <Tooltip title="Gửi thông báo review chấm công cho nhân viên và bắt đầu giai đoạn review">
              <Button
                icon={<SendOutlined />}
                onClick={handleTriggerReview}
                className="border-orange-500 text-orange-600"
              >
                Kích hoạt Review chấm công
              </Button>
            </Tooltip>
          )}

          {/* HR: tính lương sau khi review deadline đã qua */}
          {isHR && !isApproved && !isOpen && (
            <Tooltip title={isAttendanceReview && !period?.reviewDeadlineExpired
              ? "Chờ hết hạn review chấm công mới có thể tính lương"
              : "Tính lại lương cho toàn bộ nhân viên trong kỳ"}>
              <Button
                icon={calculating ? <LoadingOutlined /> : <CalculatorOutlined />}
                onClick={handleCalculateAll}
                loading={calculating}
                disabled={isAttendanceReview && !period?.reviewDeadlineExpired}
              >
                Tính lương toàn bộ
              </Button>
            </Tooltip>
          )}

          {isHR && isApproved && (
            <>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleGeneratePayslips}
                className="border-blue-500 text-blue-600"
              >
                Tạo phiếu lương
              </Button>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExport}
                className="border-green-500 text-green-600"
              >
                Xuất Excel
              </Button>
            </>
          )}

          {isAdmin && isCalculated && (
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleApprove}>
              Duyệt & Khóa
            </Button>
          )}
          {isAdmin && isCalculated && (
            <Button danger icon={<StopOutlined />} onClick={() => setRejectModal(true)}>
              Từ chối
            </Button>
          )}
        </>}
      />

      {/* AttendanceReview: hiển thị thông tin hạn review chấm công */}
      {isAttendanceReview && (
        <Alert
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
          style={{ marginBottom: 16 }}
          message={
            <Space wrap>
              <span className="font-semibold">Hạn nhân viên review chấm công:</span>
              {period?.reviewDeadline
                ? <span className={period.reviewDeadlineExpired ? "text-red-600 font-bold" : undefined}>
                    {new Date(period.reviewDeadline).toLocaleString("vi-VN")}
                    {period.reviewDeadlineExpired && " — ĐÃ HẾT HẠN — HR có thể tính lương"}
                  </span>
                : <Text type="secondary">Chưa đặt</Text>
              }
            </Space>
          }
          description={
            <Space>
              <TeamOutlined />
              <span>Nhân viên đang xem xét và gửi yêu cầu giải trình chấm công nếu có sai sót.</span>
            </Space>
          }
        />
      )}

      {/* Banner Rejected */}
      {isRejected && (
        <Alert
          type="error"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
          message={
            <span>
              <span className="font-semibold">Kỳ lương đã bị từ chối</span>
              {period?.rejectedByName && (
                <span className="text-gray-600 ml-2">bởi <strong>{period.rejectedByName}</strong></span>
              )}
              {period?.rejectedDate && (
                <span className="text-gray-500 ml-2">— {new Date(period.rejectedDate).toLocaleString("vi-VN")}</span>
              )}
            </span>
          }
          description={(period?.rejectionReason || isHR) && (
            <>
              {period?.rejectionReason && <div>Lý do: {period.rejectionReason}</div>}
              {isHR && <Text type="secondary">HR cần tính toán lại để Admin duyệt lại.</Text>}
            </>
          )}
        />
      )}

      {/* Summary */}
      <SummaryCards />

      {/* Bảng nhân viên */}
      <FilterCard onReset={hasActiveFilter ? clearFilters : undefined}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={10} md={8}>
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Tìm theo tên hoặc mã nhân viên..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={6}>
            <Select
              placeholder={<><FilterOutlined /> Phòng ban</>}
              options={deptOptions}
              value={deptFilter}
              onChange={setDeptFilter}
              allowClear
              style={{ width: "100%" }}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
          <Col xs={12} sm={7} md={6}>
            <Select
              placeholder={<><FilterOutlined /> Chức vụ</>}
              options={positionOptions}
              value={positionFilter}
              onChange={setPositionFilter}
              allowClear
              disabled={positionOptions.length === 0}
              style={{ width: "100%" }}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
          <Col xs={24} md={4} className="flex items-center">
            <Text type="secondary">
              {hasActiveFilter
                ? `${filteredRecords.length} / ${records.length} nhân viên`
                : `${records.length} nhân viên`}
            </Text>
          </Col>
        </Row>
      </FilterCard>

      {/* Bảng nhân viên */}
      <TableCard title="Danh sách nhân viên" count={filteredRecords.length}>
        <Table
          columns={columns.map(c => ({ ...c, onHeaderCell: () => ({ style: { whiteSpace: "nowrap" as const } }) }))}
          dataSource={filteredRecords}
          rowKey="payrollRecordId"
          loading={loading || calculating}
          scroll={{ x: 1460 }}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `${total} nhân viên`,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
          onRow={r => ({
            style: { cursor: "pointer" },
            onClick: () => navigate(URL.PayrollRecordDetail.replace(":id", String(r.payrollRecordId))),
          })}
          rowClassName={(_, index) => index % 2 === 0 ? "" : "bg-gray-50"}
        />
      </TableCard>
      {/* Modal gửi NV xem */}
      {/* Modal từ chối kỳ lương */}
      <Modal
        title={<Space><StopOutlined className="text-red-500" /><span>Từ chối kỳ lương</span></Space>}
        open={rejectModal}
        onCancel={() => { setRejectModal(false); setRejectReason("") }}
        onOk={handleReject}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, disabled: !rejectReason.trim() }}
      >
        <p className="text-gray-600 mb-3">
          Kỳ lương sẽ chuyển sang trạng thái <strong>Từ chối</strong>. HR sẽ cần tính toán lại trước khi Admin duyệt lại.
        </p>
        <div>
          <span className="font-medium block mb-1">Lý do từ chối <span className="text-red-500">*</span></span>
          <Input.TextArea
            rows={3}
            placeholder="Nhập lý do từ chối..."
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>

    </div>
  )
}

export default PayrollPeriodDetail
