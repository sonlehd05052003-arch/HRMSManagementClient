import { useState } from "react"
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm } from "antd"
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../../../../store"
import { addDeduction, removeDeduction, selectCurrentRecord } from "../../../../../store/payrollSlide"
import { errorText } from "../../../../../utils/apiError";
import { SectionCard } from "../../../components/listPage"

const DeductionSection = ({ recordId, isEditable }: { recordId: number; isEditable: boolean }) => {
  const dispatch = useAppDispatch()
  const record = useAppSelector(selectCurrentRecord)
  const [showAdd, setShowAdd] = useState(false)
  const [form] = Form.useForm()

  const handleAdd = async () => {
    const values = await form.validateFields()
    try {
      await dispatch(addDeduction({ 
        recordId, 
        data: { ...values, deductionType: "Manual" } 
      })).unwrap()
      message.success("Đã thêm khoản khấu trừ!")
      setShowAdd(false)
      form.resetFields()
    } catch (err) {
      message.error(errorText(err, "Lỗi khi thêm"))
    }
  }

  const handleDelete = async (deductionId: number) => {
    try {
      await dispatch(removeDeduction({ recordId, deductionId })).unwrap()
      message.success("Đã xóa khoản khấu trừ!")
    } catch (err) {
      message.error(errorText(err, "Lỗi khi xóa"))
    }
  }

  return (
    <SectionCard
      title="Các khoản khấu trừ"
      gap={0}
      extra={
        isEditable && (
          <Button type="primary" danger icon={<PlusOutlined />} onClick={() => setShowAdd(true)}>
            Thêm khấu trừ
          </Button>
        )
      }
    >
      <Table
        pagination={false}
        dataSource={record?.deductions || []}
        rowKey="deductionId"
        columns={[
          { title: "Nội dung", dataIndex: "deductionName" },
          { title: "Số tiền", dataIndex: "amount", align: "right", width: 150, render: (v) => <span className="text-red-500">-{v.toLocaleString()}</span> },
          { 
            title: "", 
            key: "action", 
            width: 50,
            render: (_, r) => isEditable && r.deductionType === "Manual" && (
              <Popconfirm title="Xóa khoản khấu trừ này?" onConfirm={() => handleDelete(r.deductionId)}>
                <Button type="text" danger icon={<DeleteOutlined />} size="small" />
              </Popconfirm>
            )
          }
        ]}
      />

      <Modal
        title="Thêm khoản khấu trừ thủ công"
        open={showAdd}
        onOk={handleAdd}
        onCancel={() => setShowAdd(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="deductionName" label="Tên khoản khấu trừ" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Phạt đi muộn, Tạm ứng lương..." />
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

export default DeductionSection
