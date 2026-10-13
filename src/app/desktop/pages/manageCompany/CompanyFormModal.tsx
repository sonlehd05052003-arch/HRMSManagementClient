import { useEffect, useState } from "react";
import { Modal, Form, Input, Divider, Row, Col, Typography, message } from "antd";
import { useAppDispatch } from "../../../../store";
import {
  createCompany,
  updateCompany,
  type ICompany,
  type ICreateCompanyResult,
} from "../../../../store/companySlide";
import { errorText } from "../../../../utils/apiError";

const { Text } = Typography;

interface Props {
  open: boolean;
  /** Công ty đang sửa; không truyền nghĩa là tạo mới (kèm tài khoản admin). */
  company?: ICompany | null;
  onClose: () => void;
  onSaved: (created?: ICreateCompanyResult) => void;
}

const CompanyFormModal = ({ open, company, onClose, onSaved }: Props) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const isEdit = !!company;

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (company) {
      form.setFieldsValue({
        companyCode: company.companyCode,
        companyName: company.companyName,
        taxCode: company.taxCode,
        email: company.email,
        phone: company.phone,
        address: company.address,
      });
    }
  }, [open, company, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (isEdit) {
        await dispatch(updateCompany({ companyId: company!.companyId, data: values })).unwrap();
        message.success("Đã cập nhật công ty");
        onSaved();
      } else {
        const result = await dispatch(createCompany(values)).unwrap();
        onSaved(result);
      }
    } catch (error) {
      message.error(errorText(error, "Lưu công ty thất bại"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Sửa thông tin công ty" : "Thêm công ty"}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={isEdit ? "Lưu" : "Tạo công ty"}
      cancelText="Hủy"
      confirmLoading={saving}
      width={640}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="companyCode"
              label="Mã công ty"
              rules={[
                { required: true, message: "Nhập mã công ty" },
                { pattern: /^[A-Za-z0-9_-]+$/, message: "Chỉ gồm chữ, số, '-' và '_'" },
                { max: 20 },
              ]}
            >
              <Input placeholder="VD: ABC" style={{ textTransform: "uppercase" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={16}>
            <Form.Item name="companyName" label="Tên công ty" rules={[{ required: true, message: "Nhập tên công ty" }, { max: 200 }]}>
              <Input placeholder="Công ty TNHH ABC" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="taxCode" label="Mã số thuế" rules={[{ max: 20 }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="email" label="Email công ty" rules={[{ type: "email", message: "Email không hợp lệ" }, { max: 100 }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ max: 20 }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="address" label="Địa chỉ" rules={[{ max: 255 }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {!isEdit && (
          <>
            <Divider titlePlacement="left" plain style={{ marginTop: 0 }}>
              Tài khoản quản trị (ADMIN) đầu tiên
            </Divider>
            <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
              Hệ thống tạo sẵn các vai trò, loại nghỉ phép, ca làm và cấu hình lương mặc định cho công ty mới.
              Mật khẩu tạm của admin được gửi qua email và hiển thị một lần sau khi tạo.
            </Text>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name={["admin", "firstName"]} label="Họ" rules={[{ required: true, message: "Nhập họ" }, { max: 50 }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name={["admin", "lastName"]} label="Tên" rules={[{ required: true, message: "Nhập tên" }, { max: 50 }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name={["admin", "username"]} label="Username" rules={[{ required: true, message: "Nhập username" }, { max: 50 }]}>
                  <Input autoComplete="off" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name={["admin", "email"]}
                  label="Email admin"
                  rules={[{ required: true, message: "Nhập email" }, { type: "email", message: "Email không hợp lệ" }, { max: 100 }]}
                >
                  <Input autoComplete="off" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CompanyFormModal;
