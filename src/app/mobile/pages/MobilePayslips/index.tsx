import { useEffect, useState } from "react";
import { Tag, Drawer, Button, Skeleton } from "antd";
import { useAndroidBack } from "../../../../hooks/useAndroidBack";
import { FilePdfOutlined, WalletOutlined, InboxOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchMyPayslips, downloadPayslipPdf, selectMyPayslips, selectPayrollLoading } from "../../../../store/payrollSlide";
import { selectInfoLogin } from "../../../../store/authSlide";
import type { IPayslip } from "../../../../types/payroll";
import MobilePageWrapper from "../../components/MobilePageWrapper";
import MobileCard from "../../components/MobileCard";
import { errorText } from "../../../../utils/apiError";

const fmt = (v: number) => v.toLocaleString("vi-VN") + "₫";

const MobilePayslips = () => {
    const dispatch = useAppDispatch();
    const payslips = useAppSelector(selectMyPayslips);
    const loading = useAppSelector(selectPayrollLoading);
    const infoLogin = useAppSelector(selectInfoLogin);
    const [selectedPayslip, setSelectedPayslip] = useState<IPayslip | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [downloading, setDownloading] = useState(false);
    useAndroidBack(detailOpen, () => setDetailOpen(false));

    useEffect(() => {
        if (infoLogin?.employeeId) {
            dispatch(fetchMyPayslips(infoLogin.employeeId));
        }
    }, [dispatch, infoLogin]);

    const handleDownload = async (p: IPayslip) => {
        setDownloading(true);
        try {
            const blob = await dispatch(downloadPayslipPdf(p.payslipId)).unwrap();
            if (blob.size === 0) throw new Error("File PDF rỗng");
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `PhieuLuong_Thang${p.month}_${p.year}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert(errorText(err, "Tải PDF thất bại"));
        } finally {
            setDownloading(false);
        }
    };

    const openDetail = (p: IPayslip) => {
        setSelectedPayslip(p);
        setDetailOpen(true);
    };

    const latest = payslips[0] ?? null;

    return (
        <MobilePageWrapper title="Phiếu lương của tôi">
            {/* ── Latest payslip highlight ── */}
            {loading && !payslips.length ? (
                <Skeleton active paragraph={{ rows: 3 }} className="mb-4" />
            ) : latest ? (
                <MobileCard className="mb-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white" onClick={() => openDetail(latest)}>
                    <p className="text-blue-200 text-xs font-medium mb-1">Phiếu lương gần nhất</p>
                    <p className="text-white font-bold text-lg mb-3">
                        Tháng {latest.month}/{latest.year}
                        {!latest.isViewed && (
                            <span className="ml-2 bg-blue-400 text-white text-xs px-2 py-0.5 rounded-full font-normal">Mới</span>
                        )}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <p className="text-blue-200 text-xs">Tổng thu nhập</p>
                            <p className="text-white font-semibold text-sm">{fmt(latest.grossPay)}</p>
                        </div>
                        <div>
                            <p className="text-blue-200 text-xs">Khấu trừ</p>
                            <p className="text-red-200 font-semibold text-sm">-{fmt(latest.totalDeductions)}</p>
                        </div>
                        <div>
                            <p className="text-blue-200 text-xs">Thực lĩnh</p>
                            <p className="text-green-200 font-bold text-sm">{fmt(latest.netPay)}</p>
                        </div>
                    </div>
                </MobileCard>
            ) : null}

            {/* ── All payslips list ── */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">Tất cả phiếu lương</h2>
                <span className="text-xs text-gray-400">{payslips.length} phiếu</span>
            </div>

            {loading && !payslips.length ? (
                [1, 2, 3].map(i => <Skeleton key={i} active paragraph={{ rows: 1 }} className="mb-2" />)
            ) : payslips.length === 0 ? (
                <MobileCard>
                    <div className="flex flex-col items-center py-8 text-gray-400">
                        <InboxOutlined style={{ fontSize: 40 }} />
                        <p className="mt-2 text-sm">Chưa có phiếu lương nào</p>
                    </div>
                </MobileCard>
            ) : (
                <MobileCard className="overflow-hidden p-0">
                    {payslips.map((p) => (
                        <div
                            key={p.payslipId}
                            className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-b-0 cursor-pointer active:bg-gray-50"
                            onClick={() => openDetail(p)}
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-800">
                                        Tháng {p.month}/{p.year}
                                    </p>
                                    {!p.isViewed && <Tag color="blue" className="text-xs m-0">Mới</Tag>}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Thực lĩnh: <span className="text-green-600 font-medium">{fmt(p.netPay)}</span>
                                </p>
                            </div>
                            <WalletOutlined className="text-gray-300 text-lg" />
                        </div>
                    ))}
                </MobileCard>
            )}

            {/* ── Payslip detail drawer ── */}
            <Drawer
                title={selectedPayslip ? `Phiếu lương Tháng ${selectedPayslip.month}/${selectedPayslip.year}` : ""}
                placement="bottom"
                height="auto"
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                styles={{ body: { padding: "16px 20px 8px" } }}
                footer={
                    selectedPayslip ? (
                        <Button
                            type="primary"
                            icon={<FilePdfOutlined />}
                            block
                            size="large"
                            loading={downloading}
                            className="rounded-xl h-12"
                            onClick={() => handleDownload(selectedPayslip)}
                        >
                            Tải PDF
                        </Button>
                    ) : null
                }
            >
                {selectedPayslip && (
                    <div className="space-y-2 pb-2">
                        {[
                            { label: "Số phiếu",     value: selectedPayslip.payslipNumber },
                            { label: "Tổng thu nhập", value: fmt(selectedPayslip.grossPay), className: "text-gray-800 font-medium" },
                            { label: "Khấu trừ",     value: `-${fmt(selectedPayslip.totalDeductions)}`, className: "text-red-500" },
                            { label: "Thực lĩnh",    value: fmt(selectedPayslip.netPay), className: "text-green-600 font-bold text-base" },
                            { label: "Ngày nhận",    value: new Date(selectedPayslip.generatedDate).toLocaleDateString("vi-VN") },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
                                <span className="text-xs text-gray-400">{item.label}</span>
                                <span className={`text-sm ${item.className ?? "text-gray-800"}`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Drawer>
        </MobilePageWrapper>
    );
};

export default MobilePayslips;
