import { useEffect, useState } from "react";
import { message } from "antd";
import { request } from "../../../../utils/request";
import { apiErrorMessage } from "../../../../utils/apiError";

export type ReportKind = "workforce" | "attendance" | "payroll";
export type ReportParams = Record<string, number | undefined>;

export interface ReportCount {
    label: string;
    count: number;
}

/** Chart colours, in the order series are drawn */
export const COLORS = ["#4f46e5", "#16a34a", "#f59e0b", "#dc2626", "#0891b2", "#9333ea", "#64748b", "#db2777"];

export const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

/** 12 500 000 → "12,5 tr" for chart axes */
export const formatMillions = (value: number) =>
    Math.abs(value) >= 1_000_000_000
        ? `${formatNumber(Math.round(value / 100_000_000) / 10)} tỷ`
        : `${formatNumber(Math.round(value / 100_000) / 10)} tr`;

/**
 * Loads a report whenever its parameters change; the latest request wins. It is loading while the data
 * held is for other parameters (the previous figures stay on screen meanwhile).
 */
export function useReport<T>(kind: ReportKind, params: ReportParams) {
    const key = JSON.stringify([kind, params]);
    const [result, setResult] = useState<{ key: string; data: T | null }>({ key: "", data: null });

    useEffect(() => {
        let current = true;
        request({ url: `/reports/${kind}`, method: "GET", params: JSON.parse(key)[1] })
            .then((res) => { if (current) setResult({ key, data: res.data as T }); })
            .catch((error) => {
                if (!current) return;
                message.error(apiErrorMessage(error, "Không tải được báo cáo"));
                setResult((previous) => ({ key, data: previous.data }));
            });
        return () => { current = false; };
    }, [kind, key]);

    return { data: result.data, loading: result.key !== key };
}
