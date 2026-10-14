import { useState } from "react";
import { Button, Card, Empty, message } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import { request } from "../../../../utils/request";
import { apiErrorMessage } from "../../../../utils/apiError";
import type { ReportKind, ReportParams } from "./reportData";

export const ExcelButton = ({ kind, params }: { kind: ReportKind; params: ReportParams }) => {
    const [busy, setBusy] = useState(false);

    const download = async () => {
        setBusy(true);
        try {
            const res = await request({ url: `/reports/${kind}/excel`, method: "GET", params, responseType: "blob" });
            const disposition = String(res.headers?.["content-disposition"] ?? "");
            const name = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? `bao-cao-${kind}.xlsx`;
            const url = window.URL.createObjectURL(res.data as Blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = name;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            message.error(apiErrorMessage(error, "Xuất Excel thất bại"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Button icon={<FileExcelOutlined />} loading={busy} onClick={download}>
            Xuất Excel
        </Button>
    );
};

export const ChartCard = ({ title, height = 300, empty, loading, children }: {
    title: string;
    height?: number;
    empty?: boolean;
    loading?: boolean;
    children: React.ReactNode;
}) => (
    <Card className="rounded-xl shadow-sm" title={title} style={{ height: "100%" }} loading={loading}>
        <div style={{ height }}>
            {empty ? (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" />
                </div>
            ) : children}
        </div>
    </Card>
);
