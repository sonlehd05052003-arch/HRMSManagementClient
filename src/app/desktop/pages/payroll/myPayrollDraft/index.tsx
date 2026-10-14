import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Button, Typography, Spin, Alert, Tooltip, Row, Col, Statistic } from "antd"
import { ArrowLeftOutlined, CalendarOutlined, InfoCircleOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../../../../store"
import {
  fetchMyAttendanceSummary,
  selectMyAttendanceSummary,
  selectPayrollLoading,
} from "../../../../../store/payrollSlide"
import { PageHeader, SectionCard } from "../../../components/listPage"

const { Text } = Typography

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  Present: { color: "blue",   label: "Có mặt"   },
  Late:    { color: "orange", label: "Đi trễ"   },
  Absent:  { color: "red",    label: "Vắng mặt" },
}

const CELL_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700"    },
  orange:  { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700"   },
  red:     { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-600"     },
  green:   { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  purple:  { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700"  },
  cyan:    { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700"    },
  default: { bg: "bg-gray-50",    border: "border-gray-100",    text: "text-gray-400"    },
}

const getMonthYear = (att: any): { year: number; month: number } => {
  if (att?.records?.length) {
    const d = new Date(att.records[0].date)
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  }
  if (att?.approvedLeaves?.length) {
    const d = new Date(att.approvedLeaves[0].startDate)
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  }
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

const generateMonthDays = (year: number, month: number): Date[] => {
  const days: Date[] = []
  const d = new Date(year, month - 1, 1)
  while (d.getMonth() === month - 1) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

const MyAttendanceReview = () => {
  const { periodId } = useParams<{ periodId: string }>()
  const navigate     = useNavigate()
  const dispatch     = useAppDispatch()

  const attendance = useAppSelector(selectMyAttendanceSummary)
  const loading    = useAppSelector(selectPayrollLoading)

  const numericPeriodId = Number(periodId)

  useEffect(() => {
    if (numericPeriodId) {
      dispatch(fetchMyAttendanceSummary(numericPeriodId))
    }
  }, [dispatch, numericPeriodId])

  if (loading && !attendance) {
    return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>
  }

  if (!attendance) {
    return (
      <div className="p-2">
        <Alert type="info" message="Không có dữ liệu chấm công"
          description="Chưa có dữ liệu chấm công cho kỳ này."
          showIcon />
        <Button icon={<ArrowLeftOutlined />} style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    )
  }

  const monthYear      = getMonthYear(attendance)
  const monthlyRows    = buildMonthlyRows(attendance)
  const totalWorkHours = monthlyRows.reduce((s, r) => s + r.workingHours, 0)
  const totalOTHours   = monthlyRows.reduce((s, r) => s + r.otHours, 0)

  return (
    <div className="p-2">
      <PageHeader
        title="Rà soát chấm công"
        subtitle="Kiểm tra dữ liệu chấm công của bạn trong kỳ lương này."
        actions={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>}
      />

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 16 }}
        message="Hệ thống đang trong giai đoạn review chấm công"
        description="Hãy kiểm tra lịch chấm công bên dưới. Nếu phát hiện sai sót, vui lòng gửi yêu cầu giải trình qua module Chấm công trước khi hết hạn review."
      />

      {renderStats(attendance)}

      <SectionCard
        title={`Bảng Chấm Công Tháng ${monthYear.month}/${monthYear.year}`}
        icon={<CalendarOutlined />}
        gap={0}
      >
        {renderCalendar(attendance, monthlyRows, totalWorkHours, totalOTHours)}
      </SectionCard>
    </div>
  )
}

function buildMonthlyRows(attendance: any) {
  const { year, month } = getMonthYear(attendance)
  const days = generateMonthDays(year, month)

  const recMap = new Map<string, any>()
  ;(attendance.records ?? []).forEach((r: any) => recMap.set(r.date.split("T")[0], r))

  const otMap = new Map<string, number>()
  ;(attendance.approvedOvertime ?? []).forEach((o: any) => otMap.set(o.date.split("T")[0], o.hours))

  return days.map(date => {
    const y         = date.getFullYear()
    const m         = String(date.getMonth() + 1).padStart(2, "0")
    const d         = String(date.getDate()).padStart(2, "0")
    const dateStr   = `${y}-${m}-${d}`
    const dayIdx    = date.getDay()
    const isWeekend = dayIdx === 0 || dayIdx === 6
    const rec       = recMap.get(dateStr)
    const otHours   = otMap.get(dateStr) ?? 0

    const leaveItem = (attendance.approvedLeaves ?? []).find((l: any) => {
      const s = new Date(l.startDate); s.setHours(0, 0, 0, 0)
      const e = new Date(l.endDate);   e.setHours(23, 59, 59, 999)
      return date >= s && date <= e
    })

    let statusTag   = "default"
    let statusLabel = "—"
    let workingHours = 0

    if (isWeekend) {
      statusTag = "default"; statusLabel = "Nghỉ"
    } else if (leaveItem) {
      statusTag   = leaveItem.isPaid ? "green" : "purple"
      statusLabel = leaveItem.leaveTypeName || (leaveItem.isPaid ? "Nghỉ phép" : "Nghỉ NL")
    } else if (rec) {
      workingHours = rec.workingHours
      if (rec.isExplanationApproved) {
        statusTag = "cyan"; statusLabel = "GT OK"
      } else {
        const s = STATUS_TAG[rec.status] || { color: "default", label: rec.status }
        statusTag = s.color; statusLabel = s.label
      }
    }

    return { key: dateStr, day: date.getDate(), dayIdx, isWeekend,
             statusTag, statusLabel, workingHours, otHours }
  })
}

function renderStats(attendance: any) {
  const stats = [
    { label: "Có mặt",    val: attendance.totals.presentDays,                       unit: "ngày", color: "#1d4ed8" },
    { label: "Đi trễ",    val: attendance.totals.lateDays,                          unit: "ngày", color: "#b45309" },
    { label: "Vắng mặt",  val: attendance.totals.absentDays,                        unit: "ngày", color: "#dc2626" },
    { label: "Nghỉ phép", val: Number(attendance.totals.paidLeaveDays).toFixed(1),  unit: "ngày", color: "#047857" },
    { label: "Tăng ca",   val: Number(attendance.totals.overtimeHours).toFixed(1),  unit: "giờ",  color: "#7e22ce" },
  ]
  // Same cards as the shared StatRow, but five on one row on a wide screen
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      {stats.map(s => (
        <Col key={s.label} flex="1 1 160px">
          <Card size="small" className="rounded-xl shadow-sm" style={{ height: "100%" }}>
            <Statistic title={s.label} value={s.val} suffix={s.unit} valueStyle={{ color: s.color, fontSize: 24 }} />
          </Card>
        </Col>
      ))}
    </Row>
  )
}

function renderCalendar(attendance: any, monthlyRows: any[], totalWorkHours: number, totalOTHours: number) {
  if (monthlyRows.length === 0) return null
  const { year, month } = getMonthYear(attendance)

  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1

  const cells: (typeof monthlyRows[0] | null)[] = [
    ...Array(offset).fill(null),
    ...monthlyRows,
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[320px]">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((h, i) => (
            <div key={h} className={`text-center text-xs font-semibold py-1.5 rounded-md select-none
              ${i >= 5 ? "bg-red-50 text-red-400" : "bg-gray-100 text-gray-500"}`}>
              {h}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (!cell) return <div key={`e${idx}`} className="h-16 rounded-lg" />

            const cfg = cell.isWeekend
              ? CELL_STYLE.default
              : (CELL_STYLE[cell.statusTag] ?? CELL_STYLE.default)

            return (
              <Tooltip key={cell.key}
                title={cell.isWeekend ? `Ngày ${cell.day} – Nghỉ cuối tuần`
                  : `Ngày ${cell.day} – ${cell.statusLabel}${cell.workingHours > 0 ? ` · ${cell.workingHours.toFixed(1)}h` : ""}${cell.otHours > 0 ? ` · OT ${cell.otHours.toFixed(1)}h` : ""}`}
              >
                <div className={`rounded-lg border h-16 p-1.5 flex flex-col justify-between
                  select-none cursor-default transition-opacity
                  ${cfg.bg} ${cfg.border} ${cell.isWeekend ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between">
                    <span className={`text-sm font-bold leading-none ${cfg.text}`}>{cell.day}</span>
                    {cell.otHours > 0 && (
                      <span className="text-[9px] font-bold leading-none px-1 py-0.5 rounded bg-purple-100 text-purple-600">OT</span>
                    )}
                  </div>
                  <div>
                    <div className={`text-[10px] font-medium leading-tight truncate ${cfg.text}`}>
                      {cell.statusLabel !== "—" ? cell.statusLabel : ""}
                    </div>
                    {cell.workingHours > 0 && (
                      <div className={`text-[9px] leading-none ${cfg.text} opacity-70`}>
                        {cell.workingHours.toFixed(1)}h
                      </div>
                    )}
                  </div>
                </div>
              </Tooltip>
            )
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
          <div className="flex items-center gap-4">
            <div>
              <Text type="secondary">Tổng giờ làm: </Text>
              <span className="font-semibold text-gray-800">{totalWorkHours.toFixed(1)}h</span>
            </div>
            {totalOTHours > 0 && (
              <div>
                <Text type="secondary">Tăng ca: </Text>
                <span className="font-semibold text-purple-600">{totalOTHours.toFixed(1)}h</span>
              </div>
            )}
          </div>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
            {[
              { dot: "bg-blue-500",    label: "Có mặt"   },
              { dot: "bg-amber-500",   label: "Đi trễ"   },
              { dot: "bg-red-500",     label: "Vắng"     },
              { dot: "bg-emerald-500", label: "Nghỉ phép"},
              { dot: "bg-violet-500",  label: "Nghỉ NL"  },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1">
                <span className={`inline-block w-2 h-2 rounded-full ${l.dot}`} />
                <Text type="secondary" style={{ fontSize: 12 }}>{l.label}</Text>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAttendanceReview
