import React from "react";
import { Divider, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { SectionCard } from "../../../components/listPage";

const { Text, Paragraph } = Typography;

const GuidanceCard: React.FC = () => {
    return (
        <SectionCard title="Hướng dẫn" icon={<InfoCircleOutlined />} gap={0}>
            <Text strong>Cấu hình Phê duyệt là gì?</Text>
            <Paragraph className="mt-2 text-gray-600">
                Hệ thống tự động xác định cấp quản lý. Đối với những nhân sự có chức vụ cao nhất (CEO, Director), hệ thống sẽ lấy "Người duyệt dự phòng" này để làm cấp phê duyệt cuối cùng.
            </Paragraph>
            <Divider />
            <Text strong>Loại dự phòng (Fallback):</Text>
            <ul className="mt-2 text-gray-600">
                <li><Text style={{ color: '#faad14' }}  >Top-level:</Text> Dành cho người không có sếp.</li>
                <li><Text style={{ color: '#1890ff' }}>Global Default:</Text> Dành cho người chưa được gán sếp.</li>
                <li><Text style={{ color: '#52c41a' }}>System Admin:</Text> Cứu cánh cuối cùng nếu không cấu hình gì.</li>
            </ul>
        </SectionCard>
    );
};

export default GuidanceCard;
