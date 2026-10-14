import { useState } from "react";
import { Alert, Button, Modal, Space, Table, Typography, Upload, message } from "antd";
import { DownloadOutlined, InboxOutlined } from "@ant-design/icons";
import { request } from "../../../../utils/request";
import { apiErrorMessage } from "../../../../utils/apiError";

interface ImportRowError {
    row: number;
    employeeCode?: string | null;
    email?: string | null;
    messages: string[];
}

interface ImportResult {
    dryRun: boolean;
    totalRows: number;
    validRows: number;
    imported: number;
    errors: ImportRowError[];
}

interface Props {
    open: boolean;
    onClose: () => void;
    /** Called after employees were added, to reload the list */
    onImported: () => void;
}

/**
 * Bulk import from the Excel template: the file is checked first and every bad row is listed;
 * the employees are added only when the whole file is valid.
 */
const ImportEmployees = ({ open, onClose, onImported }: Props) => {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [busy, setBusy] = useState(false);

    const reset = () => {
        setFile(null);
        setResult(null);
    };

    const close = () => {
        reset();
        onClose();
    };

    const downloadTemplate = async () => {
        try {
            const res = await request({ url: "/Employee/import-template", method: "GET", responseType: "blob" });
            const url = window.URL.createObjectURL(res.data as Blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "mau-nhap-nhan-vien.xlsx";
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            message.error(apiErrorMessage(error, "Không tải được file mẫu"));
        }
    };

    const send = async (selected: File, dryRun: boolean) => {
        const formData = new FormData();
        formData.append("file", selected);
        setBusy(true);
        try {
            const res = await request({
                url: "/Employee/import",
                method: "POST",
                params: { dryRun },
                data: formData,
                headers: { "Content-Type": "multipart/form-data" },
            });
            const data = res.data as ImportResult;
            if (!dryRun && data.imported > 0) {
                message.success(`Đã thêm ${data.imported} nhân viên`);
                onImported();
                close();
                return;
            }
            setResult(data);
        } catch (error) {
            setResult(null);
            message.error(apiErrorMessage(error, "Không kiểm tra được file"));
        } finally {
            setBusy(false);
        }
    };

    const ready = result != null && result.errors.length === 0 && result.validRows > 0;

    return (
        <Modal
            title="Nhập nhân viên từ Excel"
            open={open}
            onCancel={close}
            width={760}
            destroyOnHidden
            footer={
                <Space>
                    <Button onClick={close}>Đóng</Button>
                    <Button type="primary" disabled={!ready || !file} loading={busy && ready}
                        onClick={() => file && send(file, false)}>
                        {ready ? `Nhập ${result.validRows} nhân viên` : "Nhập"}
                    </Button>
                </Space>
            }
        >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    Điền danh sách vào file mẫu (sheet <b>DanhMuc</b> có mã phòng ban và chức vụ), rồi tải lên.
                    Hệ thống kiểm tra từng dòng trước; chỉ khi cả file hợp lệ mới thêm nhân viên.{" "}
                    <Button type="link" icon={<DownloadOutlined />} onClick={downloadTemplate} style={{ padding: 0 }}>
                        Tải file mẫu
                    </Button>
                </Typography.Paragraph>

                <Upload.Dragger
                    accept=".xlsx"
                    maxCount={1}
                    showUploadList={false}
                    disabled={busy}
                    beforeUpload={(selected) => {
                        setFile(selected);
                        setResult(null);
                        void send(selected, true);
                        return false;
                    }}
                >
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">{file ? file.name : "Kéo thả hoặc bấm để chọn file .xlsx"}</p>
                    <p className="ant-upload-hint">Tối đa 2000 nhân viên mỗi lần, file không quá 5 MB</p>
                </Upload.Dragger>

                {result && (ready ? (
                    <Alert type="success" showIcon
                        message={`Cả ${result.totalRows} dòng đều hợp lệ. Bấm "Nhập ${result.validRows} nhân viên" để thêm.`} />
                ) : (
                    <>
                        <Alert type="error" showIcon
                            message={`${result.errors.length}/${result.totalRows} dòng có lỗi. Sửa file rồi tải lên lại; chưa nhân viên nào được thêm.`} />
                        <Table<ImportRowError>
                            rowKey="row"
                            dataSource={result.errors}
                            pagination={result.errors.length > 10 ? { pageSize: 10, size: "small" } : false}
                            columns={[
                                { title: "Dòng", dataIndex: "row", width: 70 },
                                { title: "Email", dataIndex: "email", width: 200, render: (v) => v || "—" },
                                {
                                    title: "Lỗi",
                                    dataIndex: "messages",
                                    render: (messages: string[]) => (
                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                            {messages.map((m) => <li key={m}>{m}</li>)}
                                        </ul>
                                    ),
                                },
                            ]}
                        />
                    </>
                ))}
            </Space>
        </Modal>
    );
};

export default ImportEmployees;
