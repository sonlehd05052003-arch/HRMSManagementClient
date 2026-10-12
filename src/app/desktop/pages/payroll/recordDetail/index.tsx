import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Row, Col, Typography, Space, Button, Descriptions, Badge, message, Tag } from "antd"
import { ArrowLeftOutlined, FilePdfOutlined, CalculatorOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../../../../store"
import {
  fetchRecordById,
  calculateOneEmployee,
  generatePayslip,
  downloadPayslipPdf,
  selectCurrentRecord,
} from "../../../../../store/payrollSlide"
import { selectInfoLogin } from "../../../../../store/authSlide"
import { EUserRole } from "../../../../../interface/app"
import AllowanceSection from "./AllowanceSection"
import DeductionSection from "./DeductionSection"
import SalaryBreakdown from "./SalaryBreakdown"
import { errorText } from "../../../../../utils/apiError";

const { Title, Text } = Typography

const PayrollRecordDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const record = useAppSelector(selectCurrentRecord)
  const infoLogin = useAppSelector(selectInfoLogin)

  const isHR = infoLogin?.role === EUserRole.HR
  const isApproved = record?.status === "Approved"
  const isEditable = isHR && !isApproved

  useEffect(() => {
    if (id) {
      dispatch(fetchRecordById(Number(id)))
    }
  }, [dispatch, id])

  const handleRecalculate = async () => {
    if (!record) return
    try {
      await dispatch(calculateOneEmployee({ periodId: record.periodId, employeeId: record.employeeId })).unwrap()
      message.success("Đã tính lại lương thành công!")
    } catch (err) {
      message.error(errorText(err, "Lỗi khi tính lại lương"))
    }
  }

  const handleGeneratePayslip = async () => {
    if (!record) return
    try {
      await dispatch(generatePayslip(record.payrollRecordId)).unwrap()
      message.success("Đã tạo phiếu lương thành công!")
      const blob = await dispatch(downloadPayslipPdf(record.payrollRecordId)).unwrap()
      const url = window.URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch (err) {
      message.error(errorText(err, "Lỗi khi tạo phiếu lương"))
    }
  }

  if (!record) return <div className="p-10 text-center text-gray-400">Đang tải dữ liệu...</div>

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <div>
            <Title level={3} className="m-0">Chi Tiết Lương Nhân Viên</Title>
            <Text type="secondary">{record.employeeName} — {record.employeeCode}</Text>
          </div>
        </Space>
        <Space>
          {isEditable && (
            <Button icon={<CalculatorOutlined />} onClick={handleRecalculate}>Tính lại</Button>
          )}
          {isHR && isApproved && (
            <Button type="primary" icon={<FilePdfOutlined />} onClick={handleGeneratePayslip}>Tạo & Xem Phiếu Lương</Button>
          )}
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Thông tin chung" className="shadow-sm rounded-xl">
            <Descriptions bordered size="small" column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Họ tên">{record.employeeName}</Descriptions.Item>
              <Descriptions.Item label="Phòng ban">{record.departmentName}</Descriptions.Item>
              <Descriptions.Item label="Chức vụ">{record.positionName}</Descriptions.Item>
              <Descriptions.Item label="Lương cơ bản">{record.baseSalary.toLocaleString()} đ</Descriptions.Item>
              <Descriptions.Item label="Ngày công chuẩn">
                {record.workingDays > 0 ? `${record.workingDays} ngày` : <Tag color="default">Chưa phân ca</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày công thực tế">
                {record.workingDays > 0
                  ? <><Badge count={record.actualWorkingDays} color="blue" showZero /> / {record.workingDays} ngày</>
                  : "—"
                }
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={record.status === "Approved" ? "green" : "orange"}>{record.status.toUpperCase()}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={12}>
          <AllowanceSection recordId={record.payrollRecordId} isEditable={isEditable} />
        </Col>

        <Col span={12}>
          <DeductionSection recordId={record.payrollRecordId} isEditable={isEditable} />
        </Col>

        <Col span={24}>
          <SalaryBreakdown record={record} isEditable={isEditable} />
        </Col>
      </Row>
    </div>
  )
}

export default PayrollRecordDetail
