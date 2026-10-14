import { useState } from "react"
import { Table, Typography, Divider, InputNumber, Button, Space, Tooltip, message, Tag } from "antd"
import { EditOutlined, SaveOutlined, CloseOutlined, InfoCircleOutlined, CalculatorOutlined } from "@ant-design/icons"
import { useAppDispatch } from "../../../../../store"
import { updateBonus } from "../../../../../store/payrollSlide"
import type { IPayrollRecord } from "../../../../../types/payroll"
import { errorText } from "../../../../../utils/apiError";
import { SectionCard } from "../../../components/listPage"

const { Text } = Typography

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
            <Text type="secondary">Chỉnh sửa thủ công</Text>
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
      width: 64,
      render: (v: string, row: any) => (
        <Tag color={row.type === "income" ? "blue" : "red"} className="font-mono">{v}</Tag>
      ),
    },
    {
      title: "Khoản mục",
      dataIndex: "label",
      width: 220,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: "Công thức / Ghi chú",
      dataIndex: "formula",
      render: (v: any) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Số tiền (đ)",
      dataIndex: "amount",
      align: "right" as const,
      width: 150,
      render: (v: number, row: any) => (
        <span className={`font-semibold ${row.type === "income" ? "text-gray-800" : "text-red-500"}`} style={{ whiteSpace: "nowrap" }}>
          {row.type === "deduction" ? "−" : "+"}{fmt(v)}
        </span>
      ),
    },
  ]

  /** Small label above each group of rows */
  const groupLabel = (text: string) => (
    <Text type="secondary" strong className="uppercase tracking-wide">{text}</Text>
  )

  return (
    <SectionCard
      gap={0}
      icon={<CalculatorOutlined />}
      title={
        <Space>
          <span>Chi tiết tính lương</span>
          <Tooltip title="Dựa trên Luật BHXH 2014, Luật Thuế TNCN 2007 (sửa đổi 2012) và Bộ Luật Lao động 2019">
            <InfoCircleOutlined className="text-blue-400 cursor-pointer" />
          </Tooltip>
        </Space>
      }
    >
      {/* ── PHẦN THU NHẬP ─────────────────────────── */}
      {groupLabel("Thu nhập")}
      <Table
        dataSource={incomeRows}
        columns={columns}
        pagination={false}
        rowKey="key"
        style={{ marginTop: 8 }}
        showHeader={false}
        scroll={{ x: 640 }}
      />

      {/* ── GROSS TỔNG HỢP ───────────────────────── */}
      <div className="flex justify-between items-center flex-wrap gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 my-3">
        <div>
          <Text strong className="text-blue-700">TỔNG THU NHẬP GỘP (GROSS)</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>Lương ngày công + Phụ cấp + OT + Thưởng</Text></div>
        </div>
        <Text strong className="text-blue-700" style={{ fontSize: 20 }}>{fmt(displayGross)} đ</Text>
      </div>

      {/* ── PHẦN KHẤU TRỪ BẮT BUỘC ──────────────── */}
      {groupLabel("Khấu trừ bắt buộc")}
      <div className="mb-1">
        <Text type="secondary">
          Mức lương đóng BH đã đăng ký: <strong>{fmt(insuranceBase)} đ</strong>
          <span className="ml-1 text-blue-500">(cố định theo đăng ký, không đổi theo OT/thưởng)</span>
        </Text>
      </div>
      <Table
        dataSource={deductionRows}
        columns={columns}
        pagination={false}
        rowKey="key"
        showHeader={false}
        scroll={{ x: 640 }}
      />

      {/* ── KHẤU TRỪ THỦ CÔNG ────────────────────── */}
      {manualDeductions.length > 0 && (
        <>
          <Divider style={{ margin: "8px 0" }} />
          {groupLabel("Khấu trừ khác")}
          <Table
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
            style={{ marginTop: 4 }}
            scroll={{ x: 640 }}
          />
        </>
      )}

      <Divider style={{ margin: "12px 0" }} />

      {/* ── TỔNG KHẤU TRỪ ────────────────────────── */}
      <div className="flex justify-between items-center flex-wrap gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-3">
        <Text strong className="text-red-600">TỔNG KHẤU TRỪ (BH + Thuế + Khác)</Text>
        <Text strong className="text-red-600">−{fmt(computedTotalDeductions)} đ</Text>
      </div>

      {/* ── NET PAY ───────────────────────────────── */}
      <div className="flex justify-between items-center flex-wrap gap-2 bg-green-600 rounded-xl px-6 py-4">
        <div>
          <Text strong className="text-white">THỰC LĨNH (NET PAY)</Text>
          <div className="text-green-100" style={{ fontSize: 12 }}>Gross − Tổng khấu trừ</div>
        </div>
        <Text strong className="text-white" style={{ fontSize: 24 }}>{fmt(computedNetPay)} đ</Text>
      </div>
    </SectionCard>
  )
}

export default SalaryBreakdown
