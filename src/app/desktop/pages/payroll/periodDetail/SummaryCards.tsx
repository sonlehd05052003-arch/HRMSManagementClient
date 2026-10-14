import type { ReactNode } from "react"
import { Row, Col, Card, Statistic, Typography } from "antd"
import { useAppSelector } from "../../../../../store"
import { selectCurrentPeriod, selectPayrollRecords } from "../../../../../store/payrollSlide"
import { selectInfoLogin } from "../../../../../store/authSlide"
import { EUserRole } from "../../../../../interface/app"
import {
  UsergroupAddOutlined,
  WalletOutlined,
  SafetyCertificateOutlined,
  BankOutlined
} from "@ant-design/icons"

const { Text } = Typography

/** Same look as the shared StatRow, plus an optional caption under the value (needed for the manager's view) */
const SummaryCard = ({ title, value, suffix, prefix, color, caption }: {
  title: string
  value: number
  suffix?: string
  prefix: ReactNode
  color?: string
  caption?: ReactNode
}) => (
  <Card size="small" className="rounded-xl shadow-sm" style={{ height: "100%" }}>
    <Statistic
      title={title}
      value={value}
      suffix={suffix}
      prefix={prefix}
      valueStyle={{ color, fontSize: 24 }}
    />
    {caption && <Text type="secondary" style={{ fontSize: 12 }}>{caption}</Text>}
  </Card>
)

const SummaryCards = () => {
  const period = useAppSelector(selectCurrentPeriod)
  const records = useAppSelector(selectPayrollRecords)
  const infoLogin = useAppSelector(selectInfoLogin)
  const isManager = infoLogin?.role === EUserRole.MANAGE

  if (!period) return null

  // Tính từ records cục bộ (tránh stale data từ period.totalGrossPay / totalNetPay)
  const totalEmployees = records.length
  const employeeCountTitle = isManager ? "Tổng NV (Quản lý)" : "Tổng Nhân Viên"
  const uniqueDepartments = [...new Set(records.map(r => r.departmentName).filter(Boolean))]
  const totalGross = records.reduce((sum, r) => {
    return sum + r.salariedAmount + r.totalAllowances + r.overtimePay + r.bonusAmount
  }, 0)

  const totalNet = records.reduce((sum, r) => {
    const gross = r.salariedAmount + r.totalAllowances + r.overtimePay + r.bonusAmount
    const insurance = Math.round(Math.min(gross, 46_800_000) * 0.105)
    const manualDeductions = r.deductions
      .filter(d => d.deductionType === "Manual")
      .reduce((s, d) => s + d.amount, 0)
    return sum + gross - insurance - r.taxAmount - manualDeductions
  }, 0)

  const totalDeductions = totalGross - totalNet
  const ofEmployees = isManager ? `Của ${totalEmployees} nhân viên` : undefined

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} lg={6}>
        <SummaryCard
          title={employeeCountTitle}
          value={totalEmployees}
          prefix={<UsergroupAddOutlined className="text-blue-500 mr-2" />}
          caption={isManager && uniqueDepartments.length > 0 ? `Phòng ban: ${uniqueDepartments.join(", ")}` : undefined}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <SummaryCard
          title={isManager ? "Tổng Thu Nhập (Quản lý)" : "Tổng Thu Nhập (Gross)"}
          value={totalGross}
          prefix={<WalletOutlined className="text-orange-500 mr-2" />}
          suffix="đ"
          color="#fa8c16"
          caption={ofEmployees}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <SummaryCard
          title={isManager ? "Thuế & BH (Quản lý)" : "Ước tính Thuế & BH"}
          value={totalDeductions}
          prefix={<SafetyCertificateOutlined className="text-red-500 mr-2" />}
          suffix="đ"
          color="#f5222d"
          caption={ofEmployees}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <SummaryCard
          title={isManager ? "Thực Lĩnh (Quản lý)" : "Thực Lĩnh (Net Pay)"}
          value={totalNet}
          prefix={<BankOutlined className="text-green-500 mr-2" />}
          suffix="đ"
          color="#52c41a"
          caption={ofEmployees}
        />
      </Col>
    </Row>
  )
}

export default SummaryCards
