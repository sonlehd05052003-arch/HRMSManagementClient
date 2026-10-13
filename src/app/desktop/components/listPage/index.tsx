import type { ReactNode } from "react";
import { Button, Card, Space, Tag, Typography } from "antd";
import { ClearOutlined, FilterOutlined, UnorderedListOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/*
 * Layout shared by every list page, so they all look the same:
 *
 *   PageHeader   page title on the left, the page's main actions (e.g. "Thêm mới") on the right
 *   FilterCard   the search / filter conditions, in their own card
 *   TableCard    the result list, with its name and how many rows match
 */

interface PageHeaderProps {
    title: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
    <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="min-w-0">
            <Title level={4} style={{ margin: 0 }}>{title}</Title>
            {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>
        {actions && <Space wrap>{actions}</Space>}
    </div>
);

interface FilterCardProps {
    children: ReactNode;
    /** Shows a "Xóa bộ lọc" button that puts every condition back to its default */
    onReset?: () => void;
    /** Extra buttons next to the reset button, e.g. "Lọc" or "Làm mới" */
    extra?: ReactNode;
}

export const FilterCard = ({ children, onReset, extra }: FilterCardProps) => (
    <Card
        size="small"
        className="mb-4 rounded-xl shadow-sm"
        title={<Space><FilterOutlined className="text-indigo-500" /><span>Bộ lọc</span></Space>}
        extra={(onReset || extra) && (
            <Space>
                {extra}
                {onReset && <Button icon={<ClearOutlined />} onClick={onReset}>Xóa bộ lọc</Button>}
            </Space>
        )}
        styles={{ body: { padding: 16 } }}
    >
        {children}
    </Card>
);

interface TableCardProps {
    title: ReactNode;
    /** Number of rows that match the filters */
    count?: number;
    extra?: ReactNode;
    children: ReactNode;
}

export const TableCard = ({ title, count, extra, children }: TableCardProps) => (
    <Card
        className="rounded-xl shadow-sm"
        title={
            <Space>
                <UnorderedListOutlined className="text-indigo-500" />
                <span>{title}</span>
                {count !== undefined && <Tag color="blue" style={{ marginInlineEnd: 0 }}>{count}</Tag>}
            </Space>
        }
        extra={extra}
    >
        {children}
    </Card>
);
