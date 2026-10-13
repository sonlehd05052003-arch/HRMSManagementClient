import React from 'react';
import { Input, Select, DatePicker, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface TaskConditionProps {
    searchText: string;
    setSearchText: (val: string) => void;
    priorityFilter: string | null;
    setPriorityFilter: (val: string | null) => void;
    statusFilter: string | null;
    setStatusFilter: (val: string | null) => void;
}

const TaskCondition: React.FC<TaskConditionProps> = ({
    searchText, setSearchText,
    priorityFilter, setPriorityFilter,
    statusFilter, setStatusFilter
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
                <RangePicker style={{ width: '100%' }} />
            </Col>
        </Row>
    );
};

export default TaskCondition;
