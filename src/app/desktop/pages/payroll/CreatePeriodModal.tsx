import { useEffect, useState } from "react"
import { Modal, Form, Select, Alert, message } from "antd"
import dayjs from "dayjs"
import { useAppDispatch, useAppSelector } from "../../../../store"
import { createPayrollPeriod } from "../../../../store/payrollSlide"
import { fetchPayrollSettings, selectPayrollSettings } from "../../../../store/systemSettingSlide"
import { errorText } from "../../../../utils/apiError";

interface Props {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
}

const CreatePeriodModal = ({ visible, onCancel, onSuccess }: Props) => {
  const [form] = Form.useForm()
  const dispatch = useAppDispatch()
  const payrollSettings = useAppSelector(selectPayrollSettings)

  const [month, setMonth] = useState<number | null>(null)
  const [year, setYear] = useState<number | null>(null)

  useEffect(() => {
    if (visible) {
      dispatch(fetchPayrollSettings())
    }
  }, [visible, dispatch])

  useEffect(() => {
    if (!visible) {
      form.resetFields()
      setMonth(null)
      setYear(null)
    }
  }, [visible, form])

  const cutOffDay = payrollSettings?.payrollCutOffDay ?? 1

  // startDate / endDate của kỳ lương
  const computeDates = (m: number, y: number) => {
    const start = dayjs(`${y}-${String(m).padStart(2, "0")}-${String(cutOffDay).padStart(2, "0")}`)
    const end = start.add(1, "month").subtract(1, "day")
    // AttendanceCutoffDate = ngày đầu tiên của tháng kế tiếp (= EndDate + 1)
    const cutoff = end.add(1, "day")
    return {
      startDate: start.format("YYYY-MM-DD"),
      endDate: end.format("YYYY-MM-DD"),
      attendanceCutoffDate: cutoff.format("YYYY-MM-DD"),
    }
  }

  const dates = month && year ? computeDates(month, year) : null

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (!dates) {
        message.error("Vui lòng chọn đầy đủ tháng và năm")
        return
      }

      await dispatch(createPayrollPeriod({
        month: values.month,
        year: values.year,
        startDate: dates.startDate,
        endDate: dates.endDate,
        attendanceCutoffDate: dates.attendanceCutoffDate,
        reviewWindowDays: payrollSettings?.defaultReviewWindowDays ?? 5,
      })).unwrap()

      message.success("Tạo kỳ lương thành công!")
      onSuccess()
    } catch (err) {
      message.error(errorText(err, "Không thể tạo kỳ lương"))
    }
  }

  return (
    <Modal
      title="Tạo Kỳ Lương Mới"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Hủy bỏ"
      width={480}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <div className="flex gap-3">
          <Form.Item name="month" label="Tháng" rules={[{ required: true, message: "Chọn tháng" }]} className="flex-1">
            <Select placeholder="Chọn tháng" onChange={(v) => setMonth(v)}>
              {Array.from({ length: 12 }, (_, i) => (
                <Select.Option key={i + 1} value={i + 1}>Tháng {i + 1}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="year" label="Năm" rules={[{ required: true, message: "Chọn năm" }]} className="flex-1">
            <Select placeholder="Chọn năm" onChange={(v) => setYear(v)}>
              {[2024, 2025, 2026, 2027].map(y => (
                <Select.Option key={y} value={y}>{y}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {dates ? (
          <Alert
            type="info"
            showIcon
            message={
              <span>
                Thời gian chốt công: <strong>{dates.startDate}</strong> → <strong>{dates.endDate}</strong>
              </span>
            }
            description={
              <span>
                Ngày chốt công: <strong>{dates.attendanceCutoffDate}</strong> — hệ thống tự động gửi thông báo review chấm công cho nhân viên vào ngày này.
              </span>
            }
            className="mt-1"
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            message="Chọn tháng và năm để xem thời gian chốt công tự động"
            className="mt-1"
          />
        )}
      </Form>
    </Modal>
  )
}

export default CreatePeriodModal
