import { useState } from "react";
import { DatePicker, Select, Space, Table, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FilterCard, TableCard } from "../../components/listPage";
import { ChartCard, ExcelButton, StatRow } from "./shared";
import { formatNumber, useReport } from "./reportData";

interface AttendanceRow {
    departmentId: number | null;
    department: string;
    employees: number;
    scheduledDays: number;
    workedDays: number;
    lateDays: number;
    leaveDays: number;
    absentDays: number;
    overtimeHours: number;
    attendanceRate: number;
    lateRate: number;
}

interface AttendanceReport {
    year: number;
    month: number;
    total: AttendanceRow;
    departments: AttendanceRow[];
}

interface Props {
    departments: { label: string; value: number }[];
}

const AttendanceTab = ({ departments }: Props) => {
    const [month, setMonth] = useState<Dayjs>(dayjs().startOf("month"));
    const [departmentId, setDepartmentId] = useState<number>();
    const params = { year: month.year(), month: month.month() + 1, departmentId };
    const { data, loading } = useReport<AttendanceReport>("attendance", params);
    const total = data?.total;

    return (
        <>
            <FilterCard
                onReset={() => { setMonth(dayjs().startOf("month")); setDepartmentId(undefined); }}
                extra={<ExcelButton kind="attendance" params={params} />}
            >
                <Space wrap>
                    <DatePicker picker="month" format="MM/YYYY" allowClear={false} value={month}
                        onChange={(d) => d && setMonth(d.startOf("month"))} disabledDate={(d) => d.isAfter(dayjs(), "month")} />
                    <Select allowClear placeholder="Tất cả phòng ban" style={{ width: 240 }} options={departments}
                        value={departmentId} onChange={setDepartmentId} showSearch optionFilterProp="label" />
                </Space>
            </FilterCard>

            <StatRow loading={loading} items={[
                { title: "Tỷ lệ đi làm", value: total?.attendanceRate ?? 0, suffix: "%", color: "#16a34a" },
                { title: "Tỷ lệ đi muộn", value: total?.lateRate ?? 0, suffix: "%", color: "#f59e0b" },
                { title: "Ngày vắng không phép", value: total?.absentDays ?? 0, color: "#dc2626" },
                { title: "Giờ tăng ca đã duyệt", value: formatNumber(total?.overtimeHours ?? 0) },
            ]} />

            <div style={{ marginBottom: 16 }}>
                <ChartCard title="Tỷ lệ đi làm và đi muộn theo phòng ban (%)" height={340} loading={loading} empty={!data?.departments.length}>
                    <ResponsiveContainer>
                        <BarChart data={data?.departments} margin={{ top: 8, right: 8, left: 40, bottom: 0 }} maxBarSize={48}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="department" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={70} />
                            <YAxis domain={[0, 100]} />
                            <Tooltip formatter={(v) => `${v}%`} />
                            <Legend />
                            <Bar dataKey="attendanceRate" name="Đi làm" fill="#16a34a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="lateRate" name="Đi muộn" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <TableCard title={`Chấm công tháng ${params.month}/${params.year}`} count={data?.departments.length}>
                <Table<AttendanceRow>
                    size="small"
                    rowKey={(r) => r.departmentId ?? 0}
                    loading={loading}
                    dataSource={data?.departments}
                    pagination={false}
                    scroll={{ x: 900 }}
                    columns={[
                        { title: "Phòng ban", dataIndex: "department", fixed: "left" },
                        { title: "Nhân viên", dataIndex: "employees", align: "right" },
                        { title: "Ngày theo ca", dataIndex: "scheduledDays", align: "right" },
                        { title: "Ngày đi làm", dataIndex: "workedDays", align: "right" },
                        { title: "Đi muộn", dataIndex: "lateDays", align: "right" },
                        { title: "Nghỉ phép", dataIndex: "leaveDays", align: "right" },
                        { title: "Vắng", dataIndex: "absentDays", align: "right" },
                        { title: "Giờ tăng ca", dataIndex: "overtimeHours", align: "right", render: formatNumber },
                        { title: "Đi làm", dataIndex: "attendanceRate", align: "right", render: (v: number) => `${v}%` },
                        { title: "Đi muộn", dataIndex: "lateRate", align: "right", render: (v: number) => `${v}%` },
                    ]}
                    summary={() => total && data?.departments.length ? (
                        <Table.Summary.Row style={{ fontWeight: 600 }}>
                            <Table.Summary.Cell index={0}>Tổng</Table.Summary.Cell>
                            {[total.employees, total.scheduledDays, total.workedDays, total.lateDays, total.leaveDays, total.absentDays,
                                formatNumber(total.overtimeHours), `${total.attendanceRate}%`, `${total.lateRate}%`].map((v, i) => (
                                <Table.Summary.Cell key={i} index={i + 1} align="right">{v}</Table.Summary.Cell>
                            ))}
                        </Table.Summary.Row>
                    ) : null}
                />
            </TableCard>
            <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
                Tính trên các ngày có phân ca đã qua, không tính ngày lễ. Ngày không chấm công, không có đơn nghỉ được duyệt là ngày vắng.
            </Typography.Paragraph>
        </>
    );
};

export default AttendanceTab;
