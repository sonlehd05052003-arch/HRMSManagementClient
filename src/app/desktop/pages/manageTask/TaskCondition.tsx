import React from 'react';
import type { Dayjs } from 'dayjs';
import { Input, Select, DatePicker, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

/** Due-date range of the filter; null or a missing end means no date filter */
export type DueRange = [Dayjs | null, Dayjs | null] | null;

interface TaskConditionProps {
    searchText: string;
    setSearchText: (val: string) => void;
    priorityFilter: string | null;
    setPriorityFilter: (val: string | null) => void;
    statusFilter: string | null;
    setStatusFilter: (val: string | null) => void;
    dueRange: DueRange;
    setDueRange: (val: DueRange) => void;
}

const TaskCondition: React.FC<TaskConditionProps> = ({
    searchText, setSearchText,
    priorityFilter, setPriorityFilter,
    statusFilter, setStatusFilter,
    dueRange, setDueRange
}) => {
    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
                <Input
                    placeholder="Tìm theo mã, loại, mô tả..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                />
            </Col>
            <Col xs={24} sm={12} md={4}>
                <Select
                    style={{ width: '100%' }}
                    placeholder="Lọc độ ưu tiên"
                    allowClear
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                >
                    <Select.Option value="High">Cao</Select.Option>
                    <Select.Option value="Medium">Trung bình</Select.Option>
                    <Select.Option value="Low">Thấp</Select.Option>
                </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
                <Select
                    style={{ width: '100%' }}
                    placeholder="Lọc trạng thái"
                    allowClear
                    value={statusFilter}
                    onChange={setStatusFilter}
                >
                    <Select.Option value="Pending">Chờ xử lý</Select.Option>
                    <Select.Option value="InProgress">Đang thực hiện</Select.Option>
                    <Select.Option value="Approved">Đã duyệt</Select.Option>
                    <Select.Option value="Rejected">Từ chối</Select.Option>
                    <Select.Option value="Cancelled">Đã hủy</Select.Option>
                </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <RangePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder={['Hạn từ ngày', 'đến ngày']}
                    value={dueRange}
                    onChange={setDueRange}
                />
            </Col>
        </Row>
    );
};

export default TaskCondition;
