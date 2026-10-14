import { useEffect } from "react";
import { Modal, Form, Input, Select, Switch, message, Row, Col } from "antd";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { updateEmployeeDocument, fetchDocumentsByEmployee, selectDocumentLoading } from "../../../../../store/employeeDocumentSlide";
import type { IEmployeeDocumentList } from "../../../../../store/employeeDocumentSlide";

const CATEGORY_OPTIONS = [
    { label: "Hợp đồng lao động", value: "Contract" },
    { label: "CCCD / Hộ chiếu", value: "ID" },
    { label: "Bằng cấp / Chứng chỉ", value: "Certificate" },
    { label: "Bảo hiểm", value: "Insurance" },
    { label: "Đánh giá năng lực", value: "Performance" },
    { label: "Khác", value: "Other" },
];

interface EditDocumentModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    document: IEmployeeDocumentList | null;
}

const EditDocumentModal = ({ open, onCancel, onSuccess, document }: EditDocumentModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectDocumentLoading);

    useEffect(() => {
        if (document && open) {
            form.setFieldsValue({
                documentTitle: document.documentTitle,
                documentCategory: document.documentCategory,
                isConfidential: document.isConfidential,
            });
        }
    }, [document, open, form]);

    const onFinish = (values: any) => {
        if (!document) return;
        dispatch(updateEmployeeDocument({
            id: document.employeeDocumentId,
            data: {
                documentTitle: values.documentTitle,
                documentCategory: values.documentCategory,
                isConfidential: values.isConfidential ?? false,
            },
        }))
            .unwrap()
            .then(() => {
                message.success("Cập nhật tài liệu thành công!");
                dispatch(fetchDocumentsByEmployee(document.employeeId));
                onSuccess();
            })
            .catch((err: any) => {
                message.error(typeof err === "string" ? err : err?.message || "Cập nhật thất bại!");
            });
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={`Chỉnh sửa tài liệu: ${document?.documentTitle ?? ""}`}
            open={open}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            okText="Cập nhật"
            cancelText="Hủy"
            confirmLoading={loading}
            width={520}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="documentTitle"
                    label="Tiêu đề tài liệu"
                    rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }, { max: 200 }]}
                >
                    <Input />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item
                            name="documentCategory"
                            label="Danh mục"
                            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
                        >
                            <Select options={CATEGORY_OPTIONS} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="isConfidential" label="Bảo mật" valuePropName="checked">
                            <Switch checkedChildren="Có" unCheckedChildren="Không" />
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ background: "#f5f5f5", borderRadius: 6, padding: "10px 14px" }}>
                    <div style={{ color: "#8c8c8c", marginBottom: 4 }}>File hiện tại</div>
                    <div style={{ fontWeight: 500 }}>{document?.fileName}</div>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                        {document?.fileType?.toUpperCase()} · {document?.fileSizeFormatted}
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default EditDocumentModal;
