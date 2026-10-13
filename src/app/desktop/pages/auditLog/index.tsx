import { useCallback, useEffect, useState } from "react";
import { Button, Card, DatePicker, Select, Space, Table, Tag, Typography, message } from "antd";
import { HistoryOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { request } from "../../../../utils/request";
import { apiErrorMessage } from "../../../../utils/apiError";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { fetchAllUsers, selectUsers } from "../../../../store/userSlide";
import type { IPagedResult } from "../../../../store/attendanceSlide";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface IAuditLog {
    auditId: number;
    tableName: string;
    action: string;
    recordId: number;
    userId: number | null;
    userName: string | null;
    oldValues: string | null;
    newValues: string | null;
    actionDate: string;
    ipAddress: string | null;
}

interface IFilters {
    tableName?: string;
    action?: string;
    userId?: number;
    fromDate?: string;
    toDate?: string;
}

const TABLE_LABELS: Record<string, string> = {
    PayrollPeriods: "Kỳ lương",
    PayrollRecords: "Bảng lương",
    PayrollAllowances: "Phụ cấp",
    PayrollDeductions: "Khấu trừ",
    PayrollPolicies: "Chính sách lương",
    AttendanceRecords: "Chấm công",
    LeaveBalances: "Số dư phép",
    LeaveRequests: "Đơn nghỉ phép",
    OvertimeRequests: "Đơn tăng ca",
    Employees: "Nhân viên",
    Roles: "Vai trò",
    SystemSettings: "Cấu hình hệ thống",
    Export: "Xuất báo cáo",
};

const ACTIONS: Record<string, { label: string; color: string }> = {
    INSERT: { label: "Thêm", color: "green" },
    UPDATE: { label: "Sửa", color: "blue" },
    DELETE: { label: "Xóa", color: "red" },
    SELECT: { label: "Xuất", color: "default" },
};

const parse = (json: string | null): Record<string, unknown> | null => {
    if (!json) return null;
    try {
        const value = JSON.parse(json);
        return value && typeof value === "object" ? value as Record<string, unknown> : { "Nội dung": json };
    } catch {
        return { "Nội dung": json };
    }
};

const show = (value: unknown) => {
    if (value === undefined) return <Text type="secondary">—</Text>;
    if (value === null) return <Text type="secondary">(trống)</Text>;
    return typeof value === "object" ? JSON.stringify(value) : String(value);
};

/** Field by field, what the change did; fields that changed are highlighted. */
const ChangeDetail = ({ log }: { log: IAuditLog }) => {
    const before = parse(log.oldValues);
    const after = parse(log.newValues);
    const fields = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]));
    if (fields.length === 0) return <Text type="secondary">Không có chi tiết.</Text>;

    const rows = fields.map(field => ({
        field,
        before: before?.[field],
        after: after?.[field],
        changed: !!before && !!after && JSON.stringify(before[field]) !== JSON.stringify(after[field]),
    }));

    return (
        <Table
            size="small"
            pagination={false}
            rowKey="field"
            dataSource={rows}
            rowClassName={(row) => (row.changed ? "bg-amber-50" : "")}
            columns={[
                { title: "Trường", dataIndex: "field", width: 220 },
                ...(before ? [{ title: "Trước", dataIndex: "before", render: show }] : []),
                ...(after ? [{ title: before ? "Sau" : "Giá trị", dataIndex: "after", render: show }] : []),
            ]}
        />
    );
};

const AuditLogPage = () => {
    const dispatch = useAppDispatch();
    const users = useAppSelector(selectUsers);

    const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>([dayjs().subtract(7, "day"), dayjs()]);
    const [tableName, setTableName] = useState<string>();
    const [action, setAction] = useState<string>();
    const [userId, setUserId] = useState<number>();
    const [applied, setApplied] = useState<IFilters>({
        fromDate: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
        toDate: dayjs().format("YYYY-MM-DD"),
    });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [data, setData] = useState<IPagedResult<IAuditLog>>({ items: [], total: 0, page: 1, pageSize: 20 });
    const [tables, setTables] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async (filters: IFilters, nextPage: number, nextPageSize: number) => {
        setLoading(true);
        try {
            const response = await request({ url: "/AuditLog", method: "GET", params: { ...filters, page: nextPage, pageSize: nextPageSize } });
            setData(response.data as IPagedResult<IAuditLog>);
        } catch (error) {
            message.error(apiErrorMessage(error, "Không tải được nhật ký thay đổi"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(applied, page, pageSize);
    }, [load, applied, page, pageSize]);

    useEffect(() => {
        dispatch(fetchAllUsers());
        request({ url: "/AuditLog/tables", method: "GET" })
            .then(response => setTables(response.data as string[]))
            .catch(() => setTables([]));
    }, [dispatch]);

    const handleSearch = () => {
        setPage(1);
        setApplied({
            tableName,
            action,
            userId,
            fromDate: range?.[0]?.format("YYYY-MM-DD"),
            toDate: range?.[1]?.format("YYYY-MM-DD"),
        });
    };

    const columns = [
        {
            title: "Thời gian", dataIndex: "actionDate", width: 160,
            render: (value: string) => dayjs(value).format("HH:mm:ss DD/MM/YYYY"),
        },
        {
            title: "Người thực hiện", dataIndex: "userName", width: 180,
            render: (value: string | null) => value ?? <Text type="secondary">Hệ thống</Text>,
        },
        {
            title: "Hành động", dataIndex: "action", width: 100,
            render: (value: string) => <Tag color={ACTIONS[value]?.color}>{ACTIONS[value]?.label ?? value}</Tag>,
        },
        {
            title: "Dữ liệu", dataIndex: "tableName", width: 170,
            render: (value: string) => TABLE_LABELS[value] ?? value,
        },
        { title: "Mã bản ghi", dataIndex: "recordId", width: 100, align: "center" as const },
        { title: "IP", dataIndex: "ipAddress", width: 130, render: (value: string | null) => value ?? "—" },
    ];

    return (
        <Card
            title={<Space><HistoryOutlined className="text-blue-500" /><span>Nhật ký thay đổi dữ liệu</span></Space>}
            className="shadow-sm rounded-xl"
        >
            <Text type="secondary" className="block mb-4">
                Mọi thay đổi về lương, chấm công, số dư phép, nhân viên, vai trò và cấu hình đều được ghi lại tự động.
                Mở một dòng để xem từng trường đã đổi từ giá trị nào sang giá trị nào.
            </Text>

            <Space wrap className="mb-4" style={{ rowGap: 8 }}>
                <RangePicker value={range} onChange={setRange} format="DD/MM/YYYY" />
                <Select
                    placeholder="Tất cả dữ liệu" allowClear style={{ width: 190 }}
                    value={tableName} onChange={setTableName}
                    options={tables.map(t => ({ value: t, label: TABLE_LABELS[t] ?? t }))}
                />
                <Select
                    placeholder="Mọi hành động" allowClear style={{ width: 150 }}
                    value={action} onChange={setAction}
                    options={Object.entries(ACTIONS).map(([value, { label }]) => ({ value, label }))}
                />
                <Select
                    placeholder="Mọi người dùng" allowClear showSearch style={{ width: 220 }}
                    optionFilterProp="label"
                    value={userId} onChange={setUserId}
                    options={users.map(u => ({ value: u.userId, label: u.username }))}
                />
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>Lọc</Button>
                <Button icon={<ReloadOutlined />} onClick={() => load(applied, page, pageSize)}>Làm mới</Button>
            </Space>

            <Table
                rowKey="auditId"
                columns={columns}
                dataSource={data.items}
                loading={loading}
                scroll={{ x: 840 }}
                expandable={{ expandedRowRender: (log: IAuditLog) => <ChangeDetail log={log} /> }}
                pagination={{
                    current: page,
                    pageSize,
                    total: data.total,
                    showSizeChanger: true,
                    pageSizeOptions: [20, 50, 100],
                    showTotal: (count) => `Tổng ${count} thay đổi`,
                    onChange: (nextPage, nextPageSize) => {
                        setPage(nextPageSize !== pageSize ? 1 : nextPage);
                        setPageSize(nextPageSize);
                    },
                }}
                bordered
            />
        </Card>
    );
};

export default AuditLogPage;
