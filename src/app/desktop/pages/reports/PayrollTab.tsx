import { useState } from "react";
import { Col, DatePicker, Row, Select, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FilterCard, TableCard } from "../../components/listPage";
import { ChartCard, ExcelButton, StatRow } from "./shared";
import { formatMillions, formatNumber, useReport } from "./reportData";

interface PayrollRow {
    month: number | null;
    departmentId: number | null;
    label: string;
    status: string | null;
    employees: number;
    baseSalary: number;
    allowances: number;
    overtimePay: number;
    bonus: number;
    gross: number;
    insurance: number;
    tax: number;
    deductions: number;
    net: number;
}

interface PayrollReport {
    year: number;
    month: number | null;
    total: PayrollRow;
    months: PayrollRow[];
    departments: PayrollRow[];
}

const STATUS: Record<string, { label: string; color: string }> = {
    Open: { label: "Đang mở", color: "default" },
    AttendanceReview: { label: "Rà soát công", color: "processing" },
    Calculated: { label: "Đã tính", color: "warning" },
    Approved: { label: "Đã duyệt", color: "success" },
    Closed: { label: "Đã đóng", color: "success" },
};

const money = (v: number) => formatNumber(Math.round(v));

const moneyColumns = [
    { title: "Nhân viên", dataIndex: "employees", align: "right" as const },
    { title: "Tổng thu nhập", dataIndex: "gross", align: "right" as const, render: money },
    { title: "Bảo hiểm", dataIndex: "insurance", align: "right" as const, render: money },
    { title: "Thực lĩnh", dataIndex: "net", align: "right" as const, render: (v: number) => <b>{money(v)}</b> },
];

const PayrollTab = () => {
    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState<number>();
    const params = { year, month };
    const { data, loading } = useReport<PayrollReport>("payroll", params);
    const total = data?.total;

    return (
        <>
            <FilterCard
                onReset={() => { setYear(dayjs().year()); setMonth(undefined); }}
                extra={<ExcelButton kind="payroll" params={params} />}
            >
                <Space wrap>
                    <DatePicker picker="year" allowClear={false} value={dayjs().year(year)}
                        onChange={(d) => { if (d) { setYear(d.year()); setMonth(undefined); } }}
                        disabledDate={(d) => d.year() > dayjs().year()} />
                    <Select allowClear placeholder="Tháng mới nhất" style={{ width: 200 }} value={month} onChange={setMonth}
                        options={(data?.months ?? []).map((m) => ({ label: `Phòng ban – tháng ${m.month}`, value: m.month! }))} />
                </Space>
            </FilterCard>

            <StatRow loading={loading} items={[
                { title: `Tổng thu nhập năm ${year}`, value: money(total?.gross ?? 0), suffix: "đ" },
                { title: "Thực lĩnh", value: money(total?.net ?? 0), suffix: "đ", color: "#16a34a" },
                { title: "Bảo hiểm (NLĐ)", value: money(total?.insurance ?? 0), suffix: "đ" },
                { title: "Thuế TNCN", value: money(total?.tax ?? 0), suffix: "đ" },
            ]} />

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <ChartCard title="Chi phí lương theo tháng" loading={loading} empty={!data?.months.length}>
                        <ResponsiveContainer>
                            <ComposedChart data={data?.months} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} maxBarSize={64}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" />
                                <YAxis tickFormatter={formatMillions} width={70} />
                                <Tooltip formatter={(v) => `${money(Number(v))} đ`} />
                                <Legend />
                                <Bar dataKey="baseSalary" name="Lương cơ bản" stackId="gross" fill="#4f46e5" />
                                <Bar dataKey="allowances" name="Phụ cấp" stackId="gross" fill="#0891b2" />
                                <Bar dataKey="overtimePay" name="Tăng ca" stackId="gross" fill="#f59e0b" />
                                <Bar dataKey="bonus" name="Thưởng" stackId="gross" fill="#9333ea" radius={[4, 4, 0, 0]} />
                                <Line dataKey="net" name="Thực lĩnh" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Col>
                <Col xs={24} xl={12}>
                    <TableCard title="Theo tháng" count={data?.months.length}>
                        <Table<PayrollRow>
                            size="small" rowKey="label" loading={loading} dataSource={data?.months} pagination={false} scroll={{ x: 640 }}
                            columns={[
                                { title: "Kỳ", dataIndex: "label" },
                                { title: "Trạng thái", dataIndex: "status", render: (s: string) => s ? <Tag color={STATUS[s]?.color}>{STATUS[s]?.label ?? s}</Tag> : null },
                                ...moneyColumns,
                            ]}
                        />
                    </TableCard>
                </Col>
                <Col xs={24} xl={12}>
                    <TableCard title={data?.month ? `Theo phòng ban – tháng ${data.month}` : "Theo phòng ban"} count={data?.departments.length}>
                        <Table<PayrollRow>
                            size="small" rowKey="label" loading={loading} dataSource={data?.departments} pagination={false} scroll={{ x: 640 }}
                            columns={[
                                { title: "Phòng ban", dataIndex: "label" },
                                ...moneyColumns,
                            ]}
                        />
                    </TableCard>
                </Col>
            </Row>
        </>
    );
};

export default PayrollTab;
