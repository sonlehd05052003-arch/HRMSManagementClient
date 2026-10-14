import { useState } from "react"
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm } from "antd"
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../../../../store"
import { addAllowance, removeAllowance, selectCurrentRecord } from "../../../../../store/payrollSlide"
import { errorText } from "../../../../../utils/apiError";
import { SectionCard } from "../../../components/listPage"

const AllowanceSection = ({ recordId, isEditable }: { recordId: number; isEditable: boolean }) => {
  const dispatch = useAppDispatch()
  const record = useAppSelector(selectCurrentRecord)
  const [showAdd, setShowAdd] = useState(false)
  const [form] = Form.useForm()

  const handleAdd = async () => {
    const values = await form.validateFields()
    try {
      await dispatch(addAllowance({ 
        recordId, 
        data: { ...values, allowanceType: "Manual" } 
      })).unwrap()
      message.success("Đã thêm phụ cấp thành công!")
      setShowAdd(false)
      form.resetFields()
    } catch (err) {
      message.error(errorText(err, "Lỗi khi thêm phụ cấp"))
    }
  }

  const handleDelete = async (allowanceId: number) => {
    try {
      await dispatch(removeAllowance({ recordId, allowanceId })).unwrap()
      message.success("Đã xóa phụ cấp!")
    } catch (err) {
      message.error(errorText(err, "Lỗi khi xóa"))
    }
  }

  return (
    <SectionCard
      title="Các khoản phụ cấp"
      gap={0}
      extra={
        isEditable && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAdd(true)}>
            Thêm khoản
          </Button>
        )
      }
    >
      <Table
        pagination={false}
        dataSource={record?.allowances || []}
        rowKey="allowanceId"
        columns={[
          { title: "Nội dung", dataIndex: "allowanceName" },
          { title: "Số tiền", dataIndex: "amount", align: "right", width: 150, render: (v) => v.toLocaleString() },
          { 
            title: "", 
            key: "action", 
            width: 50,
            render: (_, r) => isEditable && r.allowanceType === "Manual" && (
              <Popconfirm title="Xóa phụ cấp này?" onConfirm={() => handleDelete(r.allowanceId)}>
                <Button type="text" danger icon={<DeleteOutlined />} size="small" />
              </Popconfirm>
            )
          }
        ]}
      />

      <Modal
        title="Thêm phụ cấp thủ công"
        open={showAdd}
        onOk={handleAdd}
        onCancel={() => setShowAdd(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="allowanceName" label="Tên khoản phụ cấp" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Thưởng dự án, Hỗ trợ đi lại..." />
          </Form.Item>
          <Form.Item name="amount" label="Số tiền" rules={[{ required: true }]}>
            <InputNumber className="w-full" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item name="description" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </SectionCard>
  )
}

export default AllowanceSection
