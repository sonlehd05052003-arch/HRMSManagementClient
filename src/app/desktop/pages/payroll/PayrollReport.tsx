import { useEffect, useState } from "react"
import { Table, Typography, Tag, Empty, Select, Space } from "antd"
import { DollarOutlined, TeamOutlined, RiseOutlined, CalendarOutlined } from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import { useAppDispatch, useAppSelector } from "../../../../store"
import { fetchPayrollPeriods, selectPayrollPeriods, selectPayrollLoading } from "../../../../store/payrollSlide"
import type { IPayrollPeriod } from "../../../../types/payroll"
import { FilterCard, PageHeader, StatRow, TableCard } from "../../components/listPage"

const { Text } = Typography
const fmt = (v: number) => (v || 0).toLocaleString("vi-VN")

const PayrollReport = () => {
  const dispatch = useAppDispatch()
  const periods = useAppSelector(selectPayrollPeriods)
  const loading = useAppSelector(selectPayrollLoading)

  useEffect(() => {
    dispatch(fetchPayrollPeriods())
  }, [dispatch])

  // Chỉ lấy kỳ đã được duyệt
  const approvedPeriods = periods.filter(p => p.status === "Approved")

  // Danh sách năm có dữ liệu (từ kỳ đã duyệt)
  const availableYears = [...new Set(approvedPeriods.map(p => p.year))].sort((a, b) => b - a)

  // Năm được chọn — mặc định là năm mới nhất có dữ liệu
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const currentYear = selectedYear ?? (availableYears[0] ?? new Date().getFullYear())

  // Lọc theo năm được chọn
  const filteredPeriods = approvedPeriods.filter(p => p.year === currentYear)

  // Tổng quan tính từ các kỳ của năm được chọn
  const totalNetPaid  = filteredPeriods.reduce((s, p) => s + (p.totalNetPay  || 0), 0)
  const totalGross    = filteredPeriods.reduce((s, p) => s + (p.totalGrossPay || 0), 0)
  const avgNetPerPeriod = filteredPeriods.length > 0 ? Math.round(totalNetPaid / filteredPeriods.length) : 0
  const lastPeriod = filteredPeriods[0] ?? null

  const columns: ColumnsType<IPayrollPeriod> = [
    {
      title: "Kỳ lương",
      key: "period",
      width: 240,
      render: (_, r) => (
        <div>
          <Text strong>Tháng {r.month}/{r.year}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Duyệt: {r.approvedDate ? new Date(r.approvedDate).toLocaleDateString("vi-VN") : "—"}
              {r.approvedByName && ` · ${r.approvedByName}`}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "totalEmployees",
      align: "center",
      width: 130,
      render: (v) => <Tag color="blue">{v} người</Tag>,
    },
    {
      title: "Tổng Gross",
      dataIndex: "totalGrossPay",
      align: "right",
      width: 170,
      render: (v) => <span style={{ whiteSpace: "nowrap" }}>{fmt(v)} đ</span>,
    },
    {
      title: "Tổng BH (10.5%)",
      dataIndex: "totalInsurance",
      align: "right",
      width: 170,
      render: (v) => <Text type="danger" style={{ whiteSpace: "nowrap" }}>−{fmt(v)} đ</Text>,
    },
    {
      title: "Tổng thuế TNCN",
      dataIndex: "totalTax",
      align: "right",
      width: 170,
      render: (v) => <Text type="danger" style={{ whiteSpace: "nowrap" }}>−{fmt(v)} đ</Text>,
    },
    {
      title: "Tổng thực lĩnh (Net)",
      dataIndex: "totalNetPay",
      align: "right",
      width: 190,
      render: (v) => (
        <Text strong className="text-green-600" style={{ whiteSpace: "nowrap" }}>{fmt(v)} đ</Text>
      ),
    },
  ]

  return (
    <div className="p-2">
      <PageHeader
        title="Báo cáo quỹ lương"
        subtitle="Phân tích và tổng hợp quỹ lương theo các kỳ đã được duyệt"
      />

      <FilterCard>
        <Space wrap>
          <CalendarOutlined className="text-gray-500" />
          <Select
            value={currentYear}
            onChange={(v) => setSelectedYear(v)}
            style={{ width: 140 }}
            options={availableYears.map(y => ({ label: `Năm ${y}`, value: y }))}
            placeholder="Chọn năm"
          />
        </Space>
      </FilterCard>

      <StatRow items={[
        { title: `Tổng thực lĩnh năm ${currentYear}`, value: Math.round(totalNetPaid), color: "#3f8600", prefix: <DollarOutlined />, suffix: "đ" },
        { title: `Tổng Gross năm ${currentYear}`, value: Math.round(totalGross), color: "#fa8c16", prefix: <DollarOutlined />, suffix: "đ" },
        { title: "Thực lĩnh trung bình / kỳ", value: avgNetPerPeriod, color: "#1890ff", prefix: <RiseOutlined />, suffix: "đ" },
        { title: `Số kỳ đã duyệt năm ${currentYear}`, value: filteredPeriods.length, prefix: <TeamOutlined />, suffix: "/ 12 kỳ" },
      ]} />

      {/* Bảng lịch sử */}
      <TableCard
        title={`Lịch sử quỹ lương năm ${currentYear} (đã duyệt)`}
        count={filteredPeriods.length}
        extra={lastPeriod && (
          <Text type="secondary">Gần nhất: Tháng {lastPeriod.month}/{lastPeriod.year}</Text>
        )}
      >
        {filteredPeriods.length === 0 && !loading ? (
          <Empty
            description={`Chưa có kỳ lương nào được duyệt trong năm ${currentYear}`}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns.map(c => ({ ...c, onHeaderCell: () => ({ style: { whiteSpace: "nowrap" as const } }) }))}
            dataSource={filteredPeriods}
            loading={loading}
            rowKey="periodId"
            pagination={false}
            scroll={{ x: 1070 }}
            summary={() => filteredPeriods.length > 1 ? (
              <Table.Summary.Row className="bg-gray-50 font-semibold">
                <Table.Summary.Cell index={0}><Text strong>Tổng năm {currentYear}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="center">
                  <Tag color="blue">{filteredPeriods.reduce((s, p) => s + p.totalEmployees, 0) / filteredPeriods.length | 0} người TB</Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right"><Text strong>{fmt(totalGross)} đ</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Text type="danger">−{fmt(filteredPeriods.reduce((s, p) => s + (p.totalInsurance || 0), 0))} đ</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <Text type="danger">−{fmt(filteredPeriods.reduce((s, p) => s + (p.totalTax || 0), 0))} đ</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <Text strong className="text-green-600">{fmt(totalNetPaid)} đ</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            ) : undefined}
          />
        )}
      </TableCard>
    </div>
  )
}

export default PayrollReport
