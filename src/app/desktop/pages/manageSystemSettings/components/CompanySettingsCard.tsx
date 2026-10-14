import { Form, Input, Button, Typography } from "antd"
import { BankOutlined, ReloadOutlined, SaveOutlined } from "@ant-design/icons"
import { SectionCard } from "../../../components/listPage";

interface Props {
  form: any
  loading: boolean
  onFinish: (values: any) => void
  onRefresh: () => void
  gap?: number
}

const CompanySettingsCard = ({ form, loading, onFinish, onRefresh, gap }: Props) => {
  return (
    <SectionCard
      title="Thông tin Công ty"
      icon={<BankOutlined />}
      gap={gap}
      extra={
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>
          Làm mới
        </Button>
      }
    >
      <Typography.Paragraph type="secondary">
        Thông tin này sẽ được in trên phiếu lương PDF xuất ra cho nhân viên.
      </Typography.Paragraph>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="companyName"
          label="Tên công ty"
          rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
        >
          <Input placeholder="VD: CÔNG TY CỔ PHẦN HR SYSTEM" />
        </Form.Item>

        <Form.Item name="address" label="Địa chỉ">
          <Input placeholder="VD: Toà nhà Innovation, Quận 12, TP. Hồ Chí Minh" />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item name="phone" label="Số điện thoại" className="flex-1">
            <Input placeholder="VD: (028) 1234 5678" />
          </Form.Item>
          <Form.Item name="email" label="Email" className="flex-1">
            <Input placeholder="VD: hr@company.com" />
          </Form.Item>
        </div>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
          >
            Lưu thông tin
          </Button>
        </Form.Item>
      </Form>
    </SectionCard>
  )
}

export default CompanySettingsCard
