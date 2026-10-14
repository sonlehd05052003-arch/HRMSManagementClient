import { useEffect } from "react"
import { Typography, Card, Table, Tag, Collapse, Alert, Divider, Row, Col, Timeline, Tabs, Skeleton } from "antd"
import {
  CalculatorOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../../../store"
import { fetchPayrollCalcSettings, selectPayrollCalcSettings } from "../../../../store/systemSettingSlide"
import type { PayrollCalculationSettings } from "../../../../store/systemSettingSlide"
import { PageHeader, SectionCard } from "../../components/listPage"

const { Text, Paragraph } = Typography
const { Panel } = Collapse

// ── Legal defaults ────────────────────────────────────────────────
const DEFAULTS = {
  bhxhRate: 8,
  bhytRate: 1.5,
  bhtnRate: 1,
  insuranceCap: 46_800_000,
  personalDeduction: 11_000_000,
  dependentDeduction: 4_400_000,
  otWeekdayMultiplier: 1.5,
  otWeekendMultiplier: 2.0,
  otHolidayMultiplier: 3.0,
}

const POLICY_LABEL = "Áp dụng theo chính sách tổ chức"

function cancu(actual: number, defaultVal: number, legalText: string): string {
  return actual === defaultVal ? legalText : POLICY_LABEL
}

function fmtMoney(v: number) {
  return v.toLocaleString("vi-VN") + " đ"
}

// ── Biểu thuế TNCN (cố định theo luật) ───────────────────────────
const tncnBrackets = [
  { bac: 1, range: "Đến 5 triệu đ/tháng",     rate: "5%",  base: "Thu nhập tính thuế × 5%" },
  { bac: 2, range: "5 – 10 triệu đ/tháng",     rate: "10%", base: "0.25tr + (TN − 5tr) × 10%" },
  { bac: 3, range: "10 – 18 triệu đ/tháng",    rate: "15%", base: "0.75tr + (TN − 10tr) × 15%" },
  { bac: 4, range: "18 – 32 triệu đ/tháng",    rate: "20%", base: "1.95tr + (TN − 18tr) × 20%" },
  { bac: 5, range: "32 – 52 triệu đ/tháng",    rate: "25%", base: "4.75tr + (TN − 32tr) × 25%" },
  { bac: 6, range: "52 – 80 triệu đ/tháng",    rate: "30%", base: "9.75tr + (TN − 52tr) × 30%" },
  { bac: 7, range: "Trên 80 triệu đ/tháng",    rate: "35%", base: "18.15tr + (TN − 80tr) × 35%" },
]
const tncnColumns = [
  { title: "Bậc", dataIndex: "bac", width: 70, render: (v: number) => <Tag color="blue">Bậc {v}</Tag> },
  { title: "Thu nhập tính thuế / tháng", dataIndex: "range", width: 240 },
  { title: "Thuế suất", dataIndex: "rate", width: 110, render: (v: string) => <Tag color="orange">{v}</Tag> },
  { title: "Số thuế phải nộp", dataIndex: "base", className: "text-gray-500" },
]

// ── Tabs ──────────────────────────────────────────────────────────

const TabQuyTrinh = ({ cfg }: { cfg: PayrollCalculationSettings }) => {
  const totalBH = cfg.bhxhRate + cfg.bhytRate + cfg.bhtnRate
  const capFmt = fmtMoney(cfg.insuranceCap)
  const personalFmt = (cfg.personalDeduction / 1_000_000).toFixed(0) + "tr"

  return (
    <SectionCard gap={0}>
      <Alert
        type="info" showIcon icon={<InfoCircleOutlined />} style={{ marginBottom: 24 }}
        message="Tỷ lệ BH, mức trần, và giảm trừ thuế có thể thay đổi tại Thiết lập Hệ thống → tab Kỳ lương & Tính lương. Tài liệu dưới đây phản ánh cấu hình đang được áp dụng."
      />
      <Timeline items={[
        {
          color: "blue",
          children: (
            <div>
              <Text strong>Bước 1 — Xác định ngày công chuẩn (mẫu số)</Text>
              <Paragraph className="text-gray-500 mb-0 mt-1">
                Đếm số ngày được <strong>phân ca làm việc</strong> (<code>ShiftAssignment</code>) của nhân viên trong kỳ.
                Fallback về đếm ngày T2–T6 nếu chưa có phân ca.
              </Paragraph>
            </div>
          ),
        },
        {
          color: "blue",
          children: (
            <div>
              <Text strong>Bước 2 — Xác định ngày công thực tế quy đổi (tử số)</Text>
              <Paragraph className="text-gray-500 mb-1 mt-1">Tính <code>Σ (WorkingHours / ShiftStandardHours)</code> cho các bản ghi hợp lệ:</Paragraph>
              <ul className="text-gray-500 list-disc pl-5 space-y-1 mb-1">
                <li><Tag color="green">Present</Tag> <Tag color="orange">Late</Tag> → luôn tính công</li>
                <li>Bất kỳ trạng thái nào có <Tag color="blue">ExplanationStatus = Approved</Tag> → tính công</li>
                <li>Giải trình <strong>chưa duyệt / bị từ chối</strong> → không tính công</li>
                <li><code>LeaveRequest</code> duyệt có lương (<Tag color="blue">IsPaid</Tag>) → cộng thêm ngày nghỉ</li>
              </ul>
            </div>
          ),
        },
        {
          color: "blue",
          children: (
            <div>
              <Text strong>Bước 3 — Tính lương ngày công</Text>
              <div className="bg-gray-100 rounded px-3 py-2 font-mono mt-1">
                Lương ngày công = Lương cơ bản ÷ Số ngày phân ca × Ngày công thực tế quy đổi
              </div>
              <Paragraph className="text-gray-500 mt-1 mb-0">Căn cứ: Điều 101 – Bộ Luật Lao động 2019.</Paragraph>
            </div>
          ),
        },
        {
          color: "blue",
          children: (
            <div>
              <Text strong>Bước 4 — Cộng phụ cấp theo chính sách</Text>
              <Paragraph className="text-gray-500 mb-0 mt-1">
                Tổng hợp <code>PayrollPolicy</code> loại <Tag>Allowance</Tag> còn hiệu lực.
                HR có thể bổ sung phụ cấp thủ công trực tiếp trên phiếu lương.
              </Paragraph>
            </div>
          ),
        },
        {
          color: "blue",
          children: (
            <div>
              <Text strong>Bước 5 — Tính lương tăng ca (OT)</Text>
              <Paragraph className="text-gray-500 mt-1 mb-1">
                Tổng hợp <code>OvertimeRequest</code> trạng thái <Tag color="green">Approved</Tag>.
              </Paragraph>
              <div className="bg-gray-100 rounded px-3 py-1 font-mono">
                Lương OT = (Lương CB ÷ Số ngày phân ca ÷ 8) × Số giờ OT × Hệ số
              </div>
              <div className="mt-1 text-gray-500">
                Hệ số hiện tại — Ngày thường: ×{cfg.otWeekdayMultiplier} &ensp;|&ensp;
                Cuối tuần: ×{cfg.otWeekendMultiplier} &ensp;|&ensp;
                Ngày lễ: ×{cfg.otHolidayMultiplier}
              </div>
            </div>
          ),
        },
        {
          color: "green",
          children: (
            <div>
              <Text strong className="text-green-600">Bước 6 — Thu nhập gộp (GROSS)</Text>
              <div className="bg-green-50 border border-green-200 rounded px-3 py-2 font-mono mt-1">
                Gross = Lương ngày công + Phụ cấp + OT + Thưởng
              </div>
            </div>
          ),
        },
        {
          color: "red",
          children: (
            <div>
              <Text strong>Bước 7 — Khấu trừ BHXH / BHYT / BHTN</Text>
              <div className="bg-red-50 border border-red-100 rounded px-3 py-2 font-mono mt-1">
                Tổng BH = min(Gross, {capFmt}) × {totalBH}%
              </div>
              <Paragraph className="text-gray-500 mt-1 mb-0">
                BHXH {cfg.bhxhRate}% + BHYT {cfg.bhytRate}% + BHTN {cfg.bhtnRate}% = {totalBH}%.
              </Paragraph>
            </div>
          ),
        },
        {
          color: "red",
          children: (
            <div>
              <Text strong>Bước 8 — Tính thuế TNCN (lũy tiến 7 bậc)</Text>
              <div className="bg-red-50 border border-red-100 rounded px-3 py-2 font-mono mt-1">
                Thu nhập tính thuế = Gross − Tổng BH − Giảm trừ bản thân ({personalFmt}) − Giảm trừ gia cảnh
              </div>
            </div>
          ),
        },
        {
          color: "green",
          children: (
            <div>
              <Text strong className="text-green-700">Bước 9 — Thực lĩnh (NET PAY)</Text>
              <div className="bg-green-600 text-white rounded px-3 py-2 font-mono mt-1">
                Net Pay = Gross − Tổng BH − Thuế TNCN − Khấu trừ khác
              </div>
            </div>
          ),
        },
      ]} />
    </SectionCard>
  )
}

const TabThueTNCN = () => (
  <SectionCard gap={0}>
    <Alert type="warning" showIcon style={{ marginBottom: 16 }}
      message="Căn cứ pháp lý: Luật Thuế TNCN số 04/2007/QH12, sửa đổi bởi Luật số 26/2012/QH13 và Nghị quyết 954/2020/UBTVQH14." />
    <Table dataSource={tncnBrackets} columns={tncnColumns} pagination={false} rowKey="bac" />
    <Divider />
    <Collapse ghost>
      <Panel header="Ví dụ tính thuế — Thu nhập tính thuế 25,000,000 đ/tháng" key="1">
        <div className="space-y-1 font-mono bg-gray-50 rounded p-3">
          <div>Bậc 1: 5,000,000 × 5%  = <strong>250,000 đ</strong></div>
          <div>Bậc 2: 5,000,000 × 10% = <strong>500,000 đ</strong></div>
          <div>Bậc 3: 8,000,000 × 15% = <strong>1,200,000 đ</strong></div>
          <div>Bậc 4: 7,000,000 × 20% = <strong>1,400,000 đ</strong></div>
          <Divider style={{ margin: "8px 0" }} />
          <div className="text-green-700 font-bold">Tổng thuế = 3,350,000 đ (thuế suất hiệu dụng ≈ 13.4%)</div>
        </div>
      </Panel>
    </Collapse>
  </SectionCard>
)

const TabBaoHiem = ({ cfg }: { cfg: PayrollCalculationSettings }) => {
  const totalNV = (cfg.bhxhRate + cfg.bhytRate + cfg.bhtnRate).toFixed(1)
  const isDefaultTotal = cfg.bhxhRate === DEFAULTS.bhxhRate && cfg.bhytRate === DEFAULTS.bhytRate && cfg.bhtnRate === DEFAULTS.bhtnRate

  const rows = [
    {
      loai: "BHXH (Hưu trí, tử tuất, ốm đau, thai sản)",
      nv: `${cfg.bhxhRate}%`,
      dn: "17.5%",
      tong: `${(cfg.bhxhRate + 17.5).toFixed(1)}%`,
      cancu: cancu(cfg.bhxhRate, DEFAULTS.bhxhRate, "Luật BHXH 2014 – Điều 85, 86"),
    },
    {
      loai: "BHYT (Khám chữa bệnh)",
      nv: `${cfg.bhytRate}%`,
      dn: "3%",
      tong: `${(cfg.bhytRate + 3).toFixed(1)}%`,
      cancu: cancu(cfg.bhytRate, DEFAULTS.bhytRate, "Luật BHYT 2008 (sửa đổi 2014) – Điều 13"),
    },
    {
      loai: "BHTN (Thất nghiệp)",
      nv: `${cfg.bhtnRate}%`,
      dn: "1%",
      tong: `${(cfg.bhtnRate + 1).toFixed(1)}%`,
      cancu: cancu(cfg.bhtnRate, DEFAULTS.bhtnRate, "Luật Việc làm 2013 – Điều 57"),
    },
    {
      loai: "Tổng NLĐ đóng",
      nv: `${totalNV}%`,
      dn: "—",
      tong: "—",
      cancu: isDefaultTotal ? "" : POLICY_LABEL,
    },
  ]

  const columns = [
    { title: "Loại bảo hiểm",  dataIndex: "loai", render: (v: string) => <Text strong>{v}</Text> },
    { title: "NLĐ đóng",       dataIndex: "nv",   width: 110, render: (v: string) => <Tag color="red">{v}</Tag> },
    { title: "NSDLĐ đóng",     dataIndex: "dn",   width: 120, render: (v: string) => v !== "—" ? <Tag color="volcano">{v}</Tag> : <Text type="secondary">—</Text> },
    { title: "Tổng",            dataIndex: "tong", width: 100, render: (v: string) => v !== "—" ? <Tag color="magenta">{v}</Tag> : <Text type="secondary">—</Text> },
    {
      title: "Căn cứ pháp lý", dataIndex: "cancu",
      render: (v: string) => v === POLICY_LABEL
        ? <Tag color="gold">{POLICY_LABEL}</Tag>
        : <Text type="secondary">{v}</Text>,
    },
  ]

  return (
    <SectionCard gap={0}>
      <Alert type="error" showIcon style={{ marginBottom: 16 }}
        message="Căn cứ pháp lý: Luật BHXH 58/2014/QH13 (Điều 85, 86); Luật BHYT 25/2008/QH12 sửa đổi bởi 46/2014/QH13 (Điều 13); Luật Việc làm 38/2013/QH13 (Điều 57). Quyết định 595/QĐ-BHXH ngày 14/4/2017." />
      <Table dataSource={rows} columns={columns} pagination={false} rowKey="loai" />
      <div className="mt-3 text-gray-400" style={{ fontSize: 12 }}>
        * Mức đóng BH tối đa = mức trần đang áp dụng: <strong>{fmtMoney(cfg.insuranceCap)}/tháng</strong>.
        {cfg.insuranceCap !== DEFAULTS.insuranceCap && (
          <Tag color="gold" className="ml-2">{POLICY_LABEL}</Tag>
        )}
        {cfg.insuranceCap === DEFAULTS.insuranceCap && (
          <span className="ml-1">(Nghị định 38/2022/NĐ-CP, hiệu lực 01/07/2022.)</span>
        )}
      </div>
    </SectionCard>
  )
}

const TabLuongOT = ({ cfg }: { cfg: PayrollCalculationSettings }) => {
  const rows = [
    {
      loai: "Ngày làm việc thường",
      heso: `×${cfg.otWeekdayMultiplier}`,
      cancu: cancu(cfg.otWeekdayMultiplier, DEFAULTS.otWeekdayMultiplier, "Điều 98.1a – Bộ Luật Lao động 2019"),
    },
    {
      loai: "Ngày nghỉ hàng tuần (Thứ 7)",
      heso: `×${cfg.otWeekendMultiplier}`,
      cancu: cancu(cfg.otWeekendMultiplier, DEFAULTS.otWeekendMultiplier, "Điều 98.1b – Bộ Luật Lao động 2019"),
    },
    {
      loai: "Ngày Chủ Nhật",
      heso: `×${cfg.otWeekendMultiplier}`,
      cancu: cancu(cfg.otWeekendMultiplier, DEFAULTS.otWeekendMultiplier, "Điều 98.1b – Bộ Luật Lao động 2019"),
    },
    {
      loai: "Ngày lễ, Tết",
      heso: `×${cfg.otHolidayMultiplier}`,
      cancu: cancu(cfg.otHolidayMultiplier, DEFAULTS.otHolidayMultiplier, "Điều 98.1c – Bộ Luật Lao động 2019"),
    },
  ]

  const columns = [
    { title: "Loại ngày tăng ca", dataIndex: "loai", render: (v: string) => <Text strong>{v}</Text> },
    { title: "Hệ số lương OT",   dataIndex: "heso", width: 150, render: (v: string) => <Tag color="green" className="font-bold">{v}</Tag> },
    {
      title: "Căn cứ pháp lý", dataIndex: "cancu",
      render: (v: string) => v === POLICY_LABEL
        ? <Tag color="gold">{POLICY_LABEL}</Tag>
        : <Text type="secondary">{v}</Text>,
    },
  ]

  return (
    <SectionCard gap={0}>
      <Alert type="success" showIcon style={{ marginBottom: 16 }}
        message="Căn cứ pháp lý: Điều 98 – Bộ Luật Lao động số 45/2019/QH14, có hiệu lực từ 01/01/2021." />
      <Table dataSource={rows} columns={columns} pagination={false} rowKey="loai" />
      <div className="mt-3 text-gray-400" style={{ fontSize: 12 }}>
        * Công thức: Lương giờ OT = (Lương CB ÷ Số ngày phân ca ÷ 8 giờ) × Số giờ × Hệ số.
      </div>
    </SectionCard>
  )
}

const TabGiamTru = ({ cfg }: { cfg: PayrollCalculationSettings }) => {
  const personalChanged = cfg.personalDeduction !== DEFAULTS.personalDeduction
  const dependentChanged = cfg.dependentDeduction !== DEFAULTS.dependentDeduction

  return (
    <SectionCard gap={0}>
      <Alert type="info" showIcon style={{ marginBottom: 16 }}
        message="Căn cứ pháp lý: Nghị quyết số 954/2020/UBTVQH14, có hiệu lực từ 01/07/2020." />
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Card size="small" className="bg-purple-50 border-purple-200 text-center">
            <div className="text-purple-600 font-bold" style={{ fontSize: 24 }}>{fmtMoney(cfg.personalDeduction)}</div>
            <div className="text-gray-500 mt-1">Giảm trừ bản thân / tháng</div>
            <div className="mt-1">
              {personalChanged
                ? <Tag color="gold">{POLICY_LABEL}</Tag>
                : <span className="text-gray-400">Điều 1 Nghị quyết 954/2020</span>
              }
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card size="small" className="bg-blue-50 border-blue-200 text-center">
            <div className="text-blue-600 font-bold" style={{ fontSize: 24 }}>{fmtMoney(cfg.dependentDeduction)}</div>
            <div className="text-gray-500 mt-1">Giảm trừ mỗi người phụ thuộc / tháng</div>
            <div className="mt-1">
              {dependentChanged
                ? <Tag color="gold">{POLICY_LABEL}</Tag>
                : <span className="text-gray-400">Điều 1 Nghị quyết 954/2020</span>
              }
            </div>
          </Card>
        </Col>
      </Row>
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
        <strong>Lưu ý:</strong> Hệ thống đang tính thuế với <strong>0 người phụ thuộc</strong>.
        Để áp dụng giảm trừ gia cảnh, HR cần cập nhật thông tin người phụ thuộc cho từng nhân viên.
      </div>
    </SectionCard>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────

const PayrollMethodology = () => {
  const dispatch = useAppDispatch()
  const cfg = useAppSelector(selectPayrollCalcSettings)

  useEffect(() => {
    dispatch(fetchPayrollCalcSettings())
  }, [dispatch])

  if (!cfg) {
    return (
      <div className="p-2">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    )
  }

  return (
    <div className="p-2">
      <PageHeader
        title="Quy tắc tính lương & cơ sở pháp lý"
        subtitle="Mô tả toàn bộ quy trình tính lương đang áp dụng trong hệ thống, kèm căn cứ pháp lý từ các văn bản hiện hành của Việt Nam."
      />

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: <span><CalculatorOutlined className="mr-1" />Quy trình tính lương</span>,
            children: <TabQuyTrinh cfg={cfg} />,
          },
          {
            key: "2",
            label: <span><SafetyCertificateOutlined className="mr-1 text-orange-500" />Thuế TNCN</span>,
            children: <TabThueTNCN />,
          },
          {
            key: "3",
            label: <span><SafetyCertificateOutlined className="mr-1 text-red-500" />Bảo hiểm</span>,
            children: <TabBaoHiem cfg={cfg} />,
          },
          {
            key: "4",
            label: <span><CalculatorOutlined className="mr-1 text-green-500" />Lương OT</span>,
            children: <TabLuongOT cfg={cfg} />,
          },
          {
            key: "5",
            label: <span><FileTextOutlined className="mr-1 text-purple-500" />Giảm trừ gia cảnh</span>,
            children: <TabGiamTru cfg={cfg} />,
          },
        ]}
      />
    </div>
  )
}

export default PayrollMethodology
