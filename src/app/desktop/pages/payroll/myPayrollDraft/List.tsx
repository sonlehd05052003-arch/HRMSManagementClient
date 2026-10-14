import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { List, Tag, Button, Typography, Space, Empty, Spin } from "antd"
import { EyeOutlined, ClockCircleOutlined, HistoryOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../../../../store"
import {
  fetchMyPeriods,
  selectMyPeriods,
  selectPayrollLoading,
} from "../../../../../store/payrollSlide"
import URL from "../../../../../constants/url"
import { PageHeader, SectionCard } from "../../../components/listPage"

const { Text } = Typography

const STATUS_COLORS: Record<string, string> = {
  Open:             "default",
  AttendanceReview: "orange",
  Calculated:       "gold",
  Approved:         "green",
  Rejected:         "red",
}

const STATUS_LABELS: Record<string, string> = {
  Open:             "Chưa xử lý",
  AttendanceReview: "Đang review chấm công",
  Calculated:       "Đã tính lương",
  Approved:         "Đã duyệt",
  Rejected:         "Đã từ chối",
}

const MyAttendanceReviewList = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const periods  = useAppSelector(selectMyPeriods)
  const loading  = useAppSelector(selectPayrollLoading)

  useEffect(() => {
    dispatch(fetchMyPeriods())
  }, [dispatch])

  const reviewPeriods = periods.filter(p => p.status === "AttendanceReview")
  const otherPeriods  = periods.filter(p => p.status !== "AttendanceReview")

  if (loading && periods.length === 0) {
    return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>
  }

  return (
    <div className="p-2">
      <PageHeader
        title="Rà soát chấm công"
        subtitle="Kiểm tra dữ liệu chấm công trong các kỳ lương đang mở review."
      />

      {reviewPeriods.length > 0 && (
        <SectionCard
          title={
            <Space>
              <Tag color="orange">ĐANG REVIEW CHẤM CÔNG</Tag>
              <Text type="secondary" className="font-normal">
                Kiểm tra và báo cáo sai sót trước khi hết hạn review
              </Text>
            </Space>
          }
        >
          <List
            dataSource={reviewPeriods}
            renderItem={period => (
              <List.Item
                key={period.periodId}
                actions={[
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      navigate(URL.MyPayrollDraft.replace(":periodId", String(period.periodId)))
                    }
                  >
                    Xem chấm công
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>Tháng {period.month}/{period.year}</Text>
                      <Tag color="orange" icon={<ClockCircleOutlined />}>Đang review</Tag>
                    </Space>
                  }
                  description={
                    <Text type="secondary">
                      Từ {period.startDate} đến {period.endDate}
                      {period.reviewDeadline && (
                        <span className={`ml-3 font-semibold ${period.reviewDeadlineExpired ? "text-red-500" : "text-orange-600"}`}>
                          Hạn review: {new Date(period.reviewDeadline).toLocaleDateString("vi-VN")}
                          {period.reviewDeadlineExpired && " (Đã hết hạn)"}
                        </span>
                      )}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </SectionCard>
      )}

      {otherPeriods.length > 0 && (
        <SectionCard title="Lịch sử kỳ lương" icon={<HistoryOutlined />}>
          <List
            dataSource={otherPeriods}
            renderItem={period => (
              <List.Item
                key={period.periodId}
                actions={[
                  <Button
                    ghost
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      navigate(URL.MyPayrollDraft.replace(":periodId", String(period.periodId)))
                    }
                  >
                    Xem
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text>Tháng {period.month}/{period.year}</Text>
                      <Tag color={STATUS_COLORS[period.status] || "default"}>
                        {STATUS_LABELS[period.status] || period.status}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Text type="secondary">
                      {period.startDate} — {period.endDate}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </SectionCard>
      )}

      {periods.length === 0 && !loading && (
        <Empty description="Chưa có kỳ lương nào liên quan đến bạn." />
      )}
    </div>
  )
}

export default MyAttendanceReviewList
