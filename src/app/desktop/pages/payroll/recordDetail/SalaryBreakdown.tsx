import { useState } from "react"
import { Card, Table, Typography, Divider, InputNumber, Button, Space, Tooltip, message, Tag } from "antd"
import { EditOutlined, SaveOutlined, CloseOutlined, InfoCircleOutlined } from "@ant-design/icons"
import { useAppDispatch } from "../../../../../store"
import { updateBonus } from "../../../../../store/payrollSlide"
import type { IPayrollRecord } from "../../../../../types/payroll"
import { errorText } from "../../../../../utils/apiError";

const { Text, Title } = Typography

interface Props {
  record: IPayrollRecord
  isEditable: boolean
}

const fmt = (v: number) => v.toLocaleString("vi-VN")

const SalaryBreakdown = ({ record, isEditable }: Props) => {
  const dispatch = useAppDispatch()
  const [editingBonus, setEditingBonus] = useState(false)
  const [bonusValue, setBonusValue] = useState<number>(record.bonusAmount)
  const [savingBonus, setSavingBonus] = useState(false)

  // ── Tính toán nội bộ để hiển thị ──────────────────────────────
  const attendancePay = record.salariedAmount
  const displayGross = attendancePay + record.totalAllowances + record.overtimePay + record.bonusAmount

  // BH: dùng giá trị backend đã tính (cố định theo mức lương đóng BH đã đăng ký của NV)
  // KHÔNG tính lại từ displayGross — insurance base là cố định, không phụ thuộc bonus/OT
  const computedInsuranceTotal = record.insuranceAmount
  const bhxh = Math.round(computedInsuranceTotal * 8 / 10.5)
  const bhyt = Math.round(computedInsuranceTotal * 1.5 / 10.5)
  const bhtn = computedInsuranceTotal - bhxh - bhyt
  // Base BH reverse-engineer để hiển thị (chỉ informational)
  const insuranceBase = Math.round(computedInsuranceTotal / 0.105)

  const personalDeduction = 11_000_000
  const taxableIncome = Math.max(0, displayGross - record.insuranceAmount - personalDeduction)

  // ── Xử lý lưu thưởng ────────────────────────────────────────
  const handleSaveBonus = async () => {
    setSavingBonus(true)
    try {
      await dispatch(updateBonus({ recordId: record.payrollRecordId, bonusAmount: bonusValue })).unwrap()
      message.success("Đã cập nhật thưởng!")
      setEditingBonus(false)
    } catch (err) {
      message.error(errorText(err, "Lỗi cập nhật thưởng"))
    } finally {
      setSavingBonus(false)
    }
  }

  // ── Rows cho bảng tổng hợp ───────────────────────────────────
  const incomeRows = [
    {
      key: "attendance",
      step: "1",
      label: "Lương ngày công",
      formula: `${fmt(record.baseSalary)} ÷ ${record.workingDays} ca phân công × ${Number(record.actualWorkingDays).toFixed(2)} ngày công quy đổi`,
      amount: attendancePay,
      type: "income",
    },
    {
      key: "allowance",
      step: "2",
      label: "Phụ cấp (theo chính sách)",
      formula: "Tổng phụ cấp từ PayrollPolicy",
      amount: record.totalAllowances,
      type: "income",
    },
    {
      key: "ot",
      step: "3",
      label: "Lương tăng ca (OT)",
      formula: "OT duyệt × hệ số (T7/CN: ×2.0 | Ngày thường: ×1.5)",
      amount: record.overtimePay,
      type: "income",
    },
    {
      key: "bonus",
      step: "4",
      label: "Thưởng",
      formula: isEditable ? (
        editingBonus ? (
          <Space size="small">
            <InputNumber
              value={bonusValue}
              onChange={(v) => setBonusValue(v ?? 0)}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => Number(v?.replace(/,/g, "") || 0)}
              style={{ width: 140 }}
              min={0}
            />
            <Button
              size="small"
              type="primary"
              icon={<SaveOutlined />}
              loading={savingBonus}
              onClick={handleSaveBonus}
            />
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={() => { setEditingBonus(false); setBonusValue(record.bonusAmount) }}
            />
          </Space>
        ) : (
          <Space size="small">
            <Text className="text-xs text-gray-400">Chỉnh sửa thủ công</Text>
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => setEditingBonus(true)}
            />
          </Space>
        )
      ) : "Chỉnh sửa thủ công (HR)",
      amount: record.bonusAmount,
      type: "income",
    },
  ]

  const deductionRows = [
    {
      key: "bhxh",
      step: "5a",
      label: "BHXH (8%)",
      formula: `Lương đóng BH đã đăng ký ${fmt(insuranceBase)} × 8%`,
      amount: bhxh,
      type: "deduction",
    },
    {
      key: "bhyt",
      step: "5b",
      label: "BHYT (1.5%)",
      formula: `Lương đóng BH đã đăng ký ${fmt(insuranceBase)} × 1.5%`,
      amount: bhyt,
      type: "deduction",
    },
    {
      key: "bhtn",
      step: "5c",
      label: "BHTN (1%)",
      formula: `Lương đóng BH đã đăng ký ${fmt(insuranceBase)} × 1%`,
      amount: bhtn,
      type: "deduction",
    },
    {
      key: "tax",
      step: "6",
      label: "Thuế TNCN (lũy tiến)",
      formula: `Thu nhập tính thuế: ${fmt(taxableIncome)} đ (Gross − BH − Giảm trừ bản thân 11tr)`,
      amount: record.taxAmount,
      type: "deduction",
    },
  ]

  const manualDeductions = record.deductions.filter(d => d.deductionType === "Manual")
  const manualDeductionTotal = manualDeductions.reduce((s, d) => s + d.amount, 0)

  const computedInsurance = bhxh + bhyt + bhtn  // = record.insuranceAmount
  const computedTotalDeductions = computedInsurance + record.taxAmount + manualDeductionTotal
  const computedNetPay = displayGross - computedTotalDeductions

  const columns = [
    {
      title: "Bước",
      dataIndex: "step",
      width: 55,
      render: (v: string, row: any) => (
        <Tag color={row.type === "income" ? "blue" : "red"} className="text-xs font-mono">{v}</Tag>
      ),
    },
    {
      title: "Khoản mục",
      dataIndex: "label",
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: "Công thức / Ghi chú",
      dataIndex: "formula",
      className: "text-gray-500 text-xs",
      render: (v: any) => <span className="text-xs text-gray-500">{v}</span>,
    },
    {
      title: "Số tiền (đ)",
      dataIndex: "amount",
      align: "right" as const,
      width: 140,
      render: (v: number, row: any) => (
        <span className={`font-semibold ${row.type === "income" ? "text-gray-800" : "text-red-500"}`}>
          {row.type === "deduction" ? "−" : "+"}{fmt(v)}
        </span>
      ),
    },
  ]

  return (
    <Card
      title={
        <Space>
          <span>Chi tiết tính lương</span>
          <Tooltip title="Dựa trên Luật BHXH 2014, Luật Thuế TNCN 2007 (sửa đổi 2012) và Bộ Luật Lao động 2019">
            <InfoCircleOutlined className="text-blue-400 cursor-pointer" />
          </Tooltip>
        </Space>
      }
      className="shadow-md rounded-xl"
    >
      {/* ── PHẦN THU NHẬP ─────────────────────────── */}
      <Text type="secondary" className="text-xs uppercase font-semibold tracking-wide">Thu nhập</Text>
      <Table
        size="small"
        dataSource={incomeRows}
        columns={columns}
        pagination={false}
        rowKey="key"
        className="mt-2"
        showHeader={false}
      />

      {/* ── GROSS TỔNG HỢP ───────────────────────── */}
      <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 my-3">
        <div>
          <Text strong className="text-blue-700 text-base">TỔNG THU NHẬP GỘP (GROSS)</Text>
          <div className="text-xs text-gray-400 mt-1">
            Lương ngày công + Phụ cấp + OT + Thưởng
          </div>
        </div>
        <Title level={4} className="m-0 text-blue-700">{fmt(displayGross)} đ</Title>
      </div>

      {/* ── PHẦN KHẤU TRỪ BẮT BUỘC ──────────────── */}
      <Text type="secondary" className="text-xs uppercase font-semibold tracking-wide">Khấu trừ bắt buộc</Text>
      <div className="text-xs text-gray-400 mb-1">
        Mức lương đóng BH đã đăng ký: <strong>{fmt(insuranceBase)} đ</strong>
        <span className="ml-1 text-blue-500">(cố định theo đăng ký, không đổi theo OT/thưởng)</span>
      </div>
      <Table
        size="small"
        dataSource={deductionRows}
        columns={columns}
        pagination={false}
        rowKey="key"
        showHeader={false}
      />

      {/* ── KHẤU TRỪ THỦ CÔNG ────────────────────── */}
      {manualDeductions.length > 0 && (
        <>
          <Divider className="my-2" />
          <Text type="secondary" className="text-xs uppercase font-semibold tracking-wide">Khấu trừ khác</Text>
          <Table
            size="small"
            dataSource={manualDeductions.map(d => ({
              key: d.deductionId,
              step: "7",
              label: d.deductionName,
              formula: d.description || "Khấu trừ thủ công",
              amount: d.amount,
              type: "deduction",
            }))}
            columns={columns}
            pagination={false}
            rowKey="key"
            showHeader={false}
            className="mt-1"
          />
        </>
      )}

      <Divider className="my-3" />

      {/* ── TỔNG KHẤU TRỪ ────────────────────────── */}
      <div className="flex justify-between items-center bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-3">
        <Text strong className="text-red-600">TỔNG KHẤU TRỪ (BH + Thuế + Khác)</Text>
        <Text strong className="text-red-600 text-base">−{fmt(computedTotalDeductions)} đ</Text>
      </div>

      {/* ── NET PAY ───────────────────────────────── */}
      <div className="flex justify-between items-center bg-green-600 rounded-xl px-6 py-4">
        <div>
          <Text className="text-white font-semibold text-lg">THỰC LĨNH (NET PAY)</Text>
          <div className="text-green-100 text-xs mt-1">Gross − Tổng khấu trừ</div>
        </div>
        <Title level={2} className="m-0 text-white">{fmt(computedNetPay)} đ</Title>
      </div>
    </Card>
  )
}

export default SalaryBreakdown
