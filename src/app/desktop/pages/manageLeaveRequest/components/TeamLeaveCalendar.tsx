import { Calendar, Badge, Tooltip } from "antd";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { fetchTeamLeaveCalendar, selectTeamLeaveCalendar } from "../../../../../store/leaveRequestSlide";
import dayjs, { Dayjs } from "dayjs";
import { CalendarOutlined } from "@ant-design/icons";
import { SectionCard } from "../../../components/listPage";

const TeamLeaveCalendar = () => {
    const dispatch = useAppDispatch();
    const leaves = useAppSelector(selectTeamLeaveCalendar);

    useEffect(() => {
        dispatch(fetchTeamLeaveCalendar());
    }, [dispatch]);

    const getListData = (value: Dayjs) => {
        return (leaves || []).filter(item => {
            const start = dayjs(item.startDate);
            const end = dayjs(item.endDate);
            return (value.isSame(start, 'day') || value.isAfter(start, 'day')) && 
                   (value.isSame(end, 'day') || value.isBefore(end, 'day'));
        });
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <ul className="list-none p-0 m-0 overflow-hidden">
                {(listData || []).map(item => (
                    <li key={item.leaveRequestId} className="mb-1">
                        <Tooltip title={`${item.employeeName} (${item.leaveTypeName}${item.isTopLevel ? ' - Management' : ''})`}>
                            <Badge 
                                status={item.isTopLevel ? "processing" : "success"} 
                                text={item.employeeName} 
                                className="whitespace-nowrap overflow-hidden" 
                            />
                        </Tooltip>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <SectionCard title="Lịch nghỉ phép của nhóm" icon={<CalendarOutlined />} gap={0}>
            <div className="overflow-auto max-h-[700px]">
                <Calendar 
                    cellRender={dateCellRender} 
                    className="custom-calendar"
                    fullscreen={true}
                />
            </div>
            <style>{`
                .custom-calendar .ant-picker-calendar-date-content {
                    height: 80px !important;
                    overflow-y: auto;
                }
                .custom-calendar .ant-badge-status-text {
                    font-size: 12px;
                }
            `}</style>
        </SectionCard>
    );
};

export default TeamLeaveCalendar;
