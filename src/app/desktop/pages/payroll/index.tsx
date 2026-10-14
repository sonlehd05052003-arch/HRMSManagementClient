import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Table, Button, Tag, Space, Typography,
  Tooltip, Select, Row, Col,
} from "antd"
import { PlusOutlined, PlayCircleOutlined } from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import { useAppDispatch, useAppSelector } from "../../../../store"
import {
  fetchPayrollPeriods,
  selectPayrollPeriods,
  selectPayrollLoading,
} from "../../../../store/payrollSlide"
import { selectInfoLogin } from "../../../../store/authSlide"
import { EUserRole } from "../../../../interface/app"
import type { IPayrollPeriod } from "../../../../types/payroll"
import URL from "../../../../constants/url"
import CreatePeriodModal from "./CreatePeriodModal"
import { FilterCard, PageHeader, TableCard } from "../../components/listPage"

const { Text } = Typography

const STATUS_COLORS: Record<string, string> = {
  Open:             "blue",
  AttendanceReview: "orange",
  Calculated:       "gold",
  Approved:         "green",
  Rejected:         "red",
}

const STATUS_LABELS_VI: Record<string, string> = {
  Open:             "Chưa xử lý",
  AttendanceReview: "Review chấm công",
  Calculated:       "Đã tính lương",
  Approved:         "Đã duyệt",
  Rejected:         "Đã từ chối",
}

const ALL_STATUSES = Object.keys(STATUS_LABELS_VI)

/** Keeps a column header on one line, so the column is as wide as its title */
const noWrapHeader = () => ({ style: { whiteSpace: "nowrap" as const } })

const PayrollPeriodList = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const periods = useAppSelector(selectPayrollPeriods)
  const loading = useAppSelector(selectPayrollLoading)
  const infoLogin = useAppSelector(selectInfoLogin)

  const isHR = infoLogin?.role === EUserRole.HR

  const [showCreate, setShowCreate] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [periodFilter, setPeriodFilter] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchPayrollPeriods())
  }, [dispatch])

  const periodOptions = useMemo(() => {
    return [...periods]
      .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)
      .map(p => ({ label: `Tháng ${p.month}/${p.year}`, value: `${p.month}-${p.year}` }))
  }, [periods])

  const filteredPeriods = useMemo(() => {
    return periods.filter(p => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter
      const matchPeriod = !periodFilter || `${p.month}-${p.year}` === periodFilter
      return matchStatus && matchPeriod
    })
  }, [periods, statusFilter, periodFilter])

  const hasActiveFilter = statusFilter !== "all" || !!periodFilter

  const columns: ColumnsType<IPayrollPeriod> = [
    {
      title: "Kỳ lương",
      key: "period",
      width: 140,
      onHeaderCell: noWrapHeader,
      sorter: (a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      },
      defaultSortOrder: "ascend",
      render: (_, r) => (
        <span className="font-semibold text-blue-600" style={{ whiteSpace: "nowrap" }}>Tháng {r.month}/{r.year}</span>
      ),
    },
    {
      title: "Thời gian đối soát",
      key: "range",
      width: 180,
      onHeaderCell: noWrapHeader,
      render: (_, r) => (
        <Space direction="vertical" size={0} style={{ whiteSpace: "nowrap" }}>
          <Text type="secondary">Từ: {r.startDate}</Text>
          <Text type="secondary">Đến: {r.endDate}</Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 170,
      onHeaderCell: noWrapHeader,
      filters: ALL_STATUSES.map(s => ({ text: STATUS_LABELS_VI[s], value: s })),
      onFilter: (value, record) => record.status === value,
      render: (s: string) => (
        <Tag color={STATUS_COLORS[s] || "default"} className="px-3 rounded-full">
          {STATUS_LABELS_VI[s] || s}
        </Tag>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "totalEmployees",
      align: "center",
      width: 110,
      onHeaderCell: noWrapHeader,
      render: (v: number) => <Tag color="geekblue">{v ?? 0} người</Tag>,
    },
    {
      title: "Tổng Gross",
      dataIndex: "totalGrossPay",
      align: "right",
      width: 160,
      onHeaderCell: noWrapHeader,
      sorter: (a, b) => (a.totalGrossPay ?? 0) - (b.totalGrossPay ?? 0),
      render: (v: number) => (
        <span className="text-gray-700" style={{ whiteSpace: "nowrap" }}>{(v ?? 0).toLocaleString("vi-VN")} đ</span>
      ),
    },
    {
      title: "Tổng Thực lĩnh",
      dataIndex: "totalNetPay",
      align: "right",
      width: 170,
      onHeaderCell: noWrapHeader,
      sorter: (a, b) => (a.totalNetPay ?? 0) - (b.totalNetPay ?? 0),
      render: (v: number) => (
        <span className="font-bold text-green-600" style={{ whiteSpace: "nowrap" }}>{(v ?? 0).toLocaleString("vi-VN")} đ</span>
      ),
    },
    {
      title: "Ngày tính lương",
      dataIndex: "calculatedDate",
      width: 150,
      onHeaderCell: noWrapHeader,
      render: (v?: string) => v
        ? <span style={{ whiteSpace: "nowrap" }}>{new Date(v).toLocaleDateString("vi-VN")}</span>
        : <span className="text-gray-400">—</span>,
    },
    {
      title: "Ngày duyệt",
      dataIndex: "approvedDate",
      width: 130,
      onHeaderCell: noWrapHeader,
      render: (v?: string) => v
        ? <span style={{ whiteSpace: "nowrap" }}>{new Date(v).toLocaleDateString("vi-VN")}</span>
        : <span className="text-gray-400">—</span>,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      fixed: "right",
      width: 130,
      onHeaderCell: noWrapHeader,
      render: (_, r) => (
        <Tooltip title="Xem chi tiết và tính lương">
          <Button
            type="primary"
            ghost
            icon={<PlayCircleOutlined />}
            onClick={() => navigate(URL.PayrollPeriodDetail.replace(":id", String(r.periodId)))}
          >
            Chi tiết
          </Button>
        </Tooltip>
      ),
    },
  ]

  return (
    <div className="p-2">
      <PageHeader
        title="Quản lý kỳ lương"
        subtitle="Quản lý và tính toán tiền lương định kỳ cho toàn hệ thống."
        actions={isHR && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreate(true)}>
            Tạo kỳ lương mới
          </Button>
        )}
      />

      <FilterCard
        onReset={hasActiveFilter ? () => { setPeriodFilter(null); setStatusFilter("all") } : undefined}
      >
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Chọn kỳ lương"
              options={periodOptions}
              value={periodFilter}
              onChange={setPeriodFilter}
              allowClear
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              options={[
                { label: "Tất cả trạng thái", value: "all" },
                ...ALL_STATUSES.map(s => ({
                  value: s,
                  label: <Tag color={STATUS_COLORS[s]} style={{ marginInlineEnd: 0 }}>{STATUS_LABELS_VI[s]}</Tag>,
                })),
              ]}
            />
          </Col>
        </Row>
      </FilterCard>

      <TableCard title="Danh sách kỳ lương" count={filteredPeriods.length}>
        <Table
          columns={columns}
          dataSource={filteredPeriods}
          rowKey="periodId"
          loading={loading}
          pagination={{ pageSize: 12, showTotal: (total) => `${total} kỳ lương` }}
          scroll={{ x: 1240 }}
          onRow={(r) => ({
            style: { cursor: "pointer" },
            onClick: () => navigate(URL.PayrollPeriodDetail.replace(":id", String(r.periodId))),
          })}
        />
      </TableCard>

      <CreatePeriodModal
        visible={showCreate}
        onCancel={() => setShowCreate(false)}
        onSuccess={() => {
          setShowCreate(false)
          dispatch(fetchPayrollPeriods())
        }}
      />
    </div>
  )
}

export default PayrollPeriodList
