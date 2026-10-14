import { useEffect, useState } from "react";
import { Table, Tag, Space, DatePicker, Button, Typography } from "antd";
import { SearchOutlined, ReloadOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { fetchMySchedule, selectMySchedule, selectShiftAssignmentLoading } from "../../../../../store/shiftAssignmentSlide";
import dayjs from "dayjs";
import { FilterCard, TableCard } from "../../../components/listPage";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const MyScheduleTable = () => {
    const dispatch = useAppDispatch();
    const schedule = useAppSelector(selectMySchedule);
    const loading = useAppSelector(selectShiftAssignmentLoading);

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
        dayjs().startOf('week'),
        dayjs().endOf('month')
    ]);

    const handleFetch = () => {
        const fromDate = dateRange[0]?.format("YYYY-MM-DD");
        const toDate = dateRange[1]?.format("YYYY-MM-DD");
        dispatch(fetchMySchedule({ fromDate, toDate }));
    };

    useEffect(() => {
        handleFetch();
    }, [dispatch]);

    const columns = [
        {
            title: "Ngày",
            dataIndex: "assignmentDate",
            key: "assignmentDate",
            width: 230,
            render: (text: string) => (
                <Space style={{ whiteSpace: "nowrap" }}>
                    <ClockCircleOutlined className="text-gray-400" />
                    <span className="font-medium">{dayjs(text).format("DD/MM/YYYY")}</span>
                    <Text type="secondary">({dayjs(text).format("dddd")})</Text>
                </Space>
            )
        },
        {
            title: "Mã Ca",
            dataIndex: "shiftCode",
            key: "shiftCode",
            render: (code: string) => <Tag color="blue">{code}</Tag>
        },
        {
            title: "Tên Ca",
            dataIndex: "shiftName",
            key: "shiftName",
            render: (name: string) => <Text className="font-medium">{name}</Text>
        },
        {
            title: "Giờ làm việc",
            key: "time",
            render: (_: any, record: any) => (
                <Tag color="orange" className="font-mono border-orange-200">
                    {record.startTime?.substring(0, 5)} - {record.endTime?.substring(0, 5)}
                </Tag>
            )
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "Active" ? "success" : "default"}>
                    {status === "Active" ? "Đang áp dụng" : "Đã hủy"}
                </Tag>
            )
        }
    ];

    return (
        <>
            <FilterCard
                extra={
                    <>
                        <Button type="primary" icon={<SearchOutlined />} onClick={handleFetch} loading={loading}>
                            Xem lịch
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={() => {
                            setDateRange([dayjs().startOf('week'), dayjs().endOf('month')]);
                            dispatch(fetchMySchedule({ 
                                fromDate: dayjs().startOf('week').format("YYYY-MM-DD"), 
                                toDate: dayjs().endOf('month').format("YYYY-MM-DD") 
                            }));
                        }}>
                            Làm mới
                        </Button>
                    </>
                }
            >
                <RangePicker 
                    value={dateRange}
                    onChange={(val) => setDateRange(val as any)}
                    format="DD/MM/YYYY"
                />
            </FilterCard>

            <TableCard title="Lịch làm việc của tôi" count={schedule.length}>
                <Table 
                    columns={columns} 
                    dataSource={schedule} 
                    rowKey="assignmentId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: "Không có lịch làm việc trong khoảng thời gian này" }}
                />
            </TableCard>
        </>
    );
};

export default MyScheduleTable;
