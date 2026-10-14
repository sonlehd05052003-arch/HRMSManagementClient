import { useEffect } from "react"
import { Table, Button, Tag } from "antd"
import { FilePdfOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../../../../store"
import { fetchMyPayslips, downloadPayslipPdf, selectMyPayslips, selectPayrollLoading } from "../../../../../store/payrollSlide"
import type { IPayslip } from "../../../../../types/payroll"
import { errorText } from "../../../../../utils/apiError";
import { PageHeader, TableCard } from "../../../components/listPage"


const MyPayslips = () => {
  const dispatch = useAppDispatch()
  const myPayslips = useAppSelector(selectMyPayslips)
  const loading = useAppSelector(selectPayrollLoading)
  const currentUser = useAppSelector((state: any) => state.auth.infoLogin)

  useEffect(() => {
    if (currentUser?.employeeId) {
      dispatch(fetchMyPayslips(currentUser.employeeId))
    }
  }, [dispatch, currentUser])

  const handleDownload = async (payslipId: number, month: number, year: number) => {
    try {
      const blob = await dispatch(downloadPayslipPdf(payslipId)).unwrap()
      if (blob.size === 0) throw new Error("File PDF rỗng")
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `PhieuLuong_Thang${month}_${year}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert(errorText(err, "Tải PDF thất bại"))
    }
  }

  const columns = [
    {
      title: "Số phiếu",
      dataIndex: "payslipNumber",
      key: "payslipNumber",
      width: 170,
      render: (v: string) => <span className="font-mono text-blue-600">{v}</span>
    },
    {
      title: "Kỳ lương",
      key: "period",
      width: 130,
      render: (_: any, r: IPayslip) => <strong style={{ whiteSpace: "nowrap" }}>Tháng {r.month}/{r.year}</strong>
    },
    {
      title: "Tổng thu nhập",
      dataIndex: "grossPay",
      align: "right",
      width: 160,
      render: (v: number) => <span style={{ whiteSpace: "nowrap" }}>{v.toLocaleString() + " đ"}</span>
    },
    {
      title: "Khấu trừ",
      dataIndex: "totalDeductions",
      align: "right",
      width: 150,
      render: (v: number) => <span className="text-red-500" style={{ whiteSpace: "nowrap" }}>-{v.toLocaleString()} đ</span>
    },
    {
      title: "Thực lĩnh",
      dataIndex: "netPay",
      align: "right",
      width: 160,
      render: (v: number) => <span className="font-bold text-green-600" style={{ whiteSpace: "nowrap" }}>{v.toLocaleString()} đ</span>
    },
    {
      title: "Ngày nhận",
      dataIndex: "generatedDate",
      width: 120,
      render: (v: string) => <span style={{ whiteSpace: "nowrap" }}>{new Date(v).toLocaleDateString("vi-VN")}</span>
    },
    {
      title: "Trình trạng",
      dataIndex: "isViewed",
      width: 120,
      render: (v: boolean) => v ? <Tag color="default">Đã xem</Tag> : <Tag color="blue">Mới</Tag>
    },
    {
      title: "",
      key: "action",
      width: 130,
      render: (_: any, r: IPayslip) => (
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={() => handleDownload(r.payslipId, r.month, r.year)}
        >
          Tải PDF
        </Button>
      )
    }
  ]

  return (
    <div className="p-2">
      <PageHeader title="Phiếu lương của tôi" />
      <TableCard title="Danh sách phiếu lương" count={myPayslips.length}>
        <Table
          columns={columns as any}
          dataSource={myPayslips}
          rowKey="payslipId"
          loading={loading}
          pagination={{ pageSize: 12 }}
          scroll={{ x: 1140 }}
        />
      </TableCard>
    </div>
  )
}

export default MyPayslips
