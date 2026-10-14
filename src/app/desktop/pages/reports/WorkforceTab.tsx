import { useState } from "react";
import { Col, DatePicker, Row, Select, Space, Typography } from "antd";
import dayjs from "dayjs";
import {
    Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { FilterCard } from "../../components/listPage";
import { ChartCard, ExcelButton, StatRow } from "./shared";
import { COLORS, type ReportCount, useReport } from "./reportData";

interface WorkforceReport {
    year: number;
    asOf: string;
    headcount: number;
    hires: number;
    leavers: number;
    turnoverRate: number;
    months: { month: number; headcount: number; hires: number; leavers: number }[];
    byDepartment: ReportCount[];
    byGender: ReportCount[];
    byAge: ReportCount[];
    byTenure: ReportCount[];
    byEmploymentType: ReportCount[];
}

interface Props {
    departments: { label: string; value: number }[];
}

const CountBars = ({ data, color }: { data: ReportCount[]; color: string }) => (
    <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(v) => [v, "Số người"]} />
            <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
);

const WorkforceTab = ({ departments }: Props) => {
    const [year, setYear] = useState(dayjs().year());
    const [departmentId, setDepartmentId] = useState<number>();
    const params = { year, departmentId };
    const { data, loading } = useReport<WorkforceReport>("workforce", params);

    const months = (data?.months ?? []).map((m) => ({ ...m, label: `T${m.month}` }));

    return (
        <>
            <FilterCard
                onReset={() => { setYear(dayjs().year()); setDepartmentId(undefined); }}
                extra={<ExcelButton kind="workforce" params={params} />}
            >
                <Space wrap>
                    <DatePicker picker="year" allowClear={false} value={dayjs().year(year)}
                        onChange={(d) => d && setYear(d.year())} disabledDate={(d) => d.year() > dayjs().year()} />
                    <Select allowClear placeholder="Tất cả phòng ban" style={{ width: 240 }} options={departments}
                        value={departmentId} onChange={setDepartmentId} showSearch optionFilterProp="label" />
                </Space>
            </FilterCard>

            <StatRow loading={loading} items={[
                { title: `Nhân sự ngày ${data ? dayjs(data.asOf).format("DD/MM/YYYY") : ""}`, value: data?.headcount ?? 0 },
                { title: "Vào làm trong năm", value: data?.hires ?? 0, color: "#16a34a" },
                { title: "Nghỉ việc trong năm", value: data?.leavers ?? 0, color: "#dc2626" },
                { title: "Tỷ lệ nghỉ việc", value: data?.turnoverRate ?? 0, suffix: "%" },
            ]} />

            <Row gutter={[16, 16]}>
                <Col xs={24} xl={14}>
                    <ChartCard title="Nhân sự cuối tháng, vào làm và nghỉ việc" loading={loading} empty={months.length === 0}>
                        <ResponsiveContainer>
                            <ComposedChart data={months} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" />
                                <YAxis yAxisId="people" allowDecimals={false} />
                                <YAxis yAxisId="moves" orientation="right" allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="moves" dataKey="hires" name="Vào làm" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="moves" dataKey="leavers" name="Nghỉ việc" fill="#dc2626" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="people" dataKey="headcount" name="Nhân sự" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Col>
                <Col xs={24} xl={10}>
                    <ChartCard title="Theo phòng ban" loading={loading} empty={!data?.byDepartment.length}>
                        <ResponsiveContainer>
                            <BarChart data={data?.byDepartment} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(v) => [v, "Số người"]} />
                                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Col>
                <Col xs={24} md={12} xl={6}>
                    <ChartCard title="Giới tính" height={240} loading={loading} empty={!data?.byGender.length}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={data?.byGender} dataKey="count" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={2}>
                                    {data?.byGender.map((g, i) => <Cell key={g.label} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Col>
                <Col xs={24} md={12} xl={6}>
                    <ChartCard title="Độ tuổi" height={240} loading={loading} empty={!data?.headcount}>
                        <CountBars data={data?.byAge ?? []} color="#0891b2" />
                    </ChartCard>
                </Col>
                <Col xs={24} md={12} xl={6}>
                    <ChartCard title="Thâm niên" height={240} loading={loading} empty={!data?.headcount}>
                        <CountBars data={data?.byTenure ?? []} color="#9333ea" />
                    </ChartCard>
                </Col>
                <Col xs={24} md={12} xl={6}>
                    <ChartCard title="Loại hình" height={240} loading={loading} empty={!data?.byEmploymentType.length}>
                        <CountBars data={data?.byEmploymentType ?? []} color="#f59e0b" />
                    </ChartCard>
                </Col>
            </Row>
            <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
                Tỷ lệ nghỉ việc = số người nghỉ trong năm / số nhân sự trung bình các tháng. Cơ cấu tính tại ngày ở thẻ đầu tiên.
            </Typography.Paragraph>
        </>
    );
};

export default WorkforceTab;
