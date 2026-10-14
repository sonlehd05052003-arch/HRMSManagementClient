import type { ReactNode } from "react";
import { Button, Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";
import { ClearOutlined, FilterOutlined, UnorderedListOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/** Space between the blocks of a list page. Set inline: Tailwind's margin utilities live in a CSS layer that antd's
 * own Card styles (margin: 0) override, so a className like "mb-4" has no effect on an antd component. */
const BLOCK_GAP = 16;

/*
 * Layout shared by every list page, so they all look the same:
 *
 *   PageHeader   page title on the left, the page's main actions (e.g. "Thêm mới") on the right
 *   FilterCard   the search / filter conditions, in their own card
 *   TableCard    the result list, with its name and how many rows match
 *   SectionCard  any other block of a page: a form, details, a chart
 *   StatRow      a row of key figures above the content
 *
 * Text sizes come from the theme (constants/theme.ts): 14px for content, 16px for block titles, 20px for the page
 * title. Use Typography.Text type="secondary" for notes rather than setting a font size.
 */

interface PageHeaderProps {
    title: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
    <div className="flex items-start justify-between gap-3 flex-wrap" style={{ marginBottom: BLOCK_GAP }}>
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
        className="rounded-xl shadow-sm"
        style={{ marginBottom: BLOCK_GAP }}
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

interface SectionCardProps {
    title?: ReactNode;
    icon?: ReactNode;
    extra?: ReactNode;
    children: ReactNode;
    /** Space below the card; set to 0 for the last block or inside a grid */
    gap?: number;
    bodyPadding?: number;
}

export const SectionCard = ({ title, icon, extra, children, gap = BLOCK_GAP, bodyPadding }: SectionCardProps) => (
    <Card
        className="rounded-xl shadow-sm"
        style={{ marginBottom: gap }}
        title={title && (icon ? <Space><span className="text-indigo-500">{icon}</span><span>{title}</span></Space> : title)}
        extra={extra}
        styles={bodyPadding !== undefined ? { body: { padding: bodyPadding } } : undefined}
    >
        {children}
    </Card>
);

export interface StatItem {
    title: ReactNode;
    value?: number | string;
    suffix?: ReactNode;
    prefix?: ReactNode;
    color?: string;
    /** Shown at the top right of the card */
    icon?: ReactNode;
    /** One short line under the value, e.g. "Đã dùng: 3" */
    description?: ReactNode;
}

/** Key figures in equal cards on one row (two per row on a narrow screen) */
export const StatRow = ({ items, loading }: { items: StatItem[]; loading?: boolean }) => (
    <Row gutter={[16, 16]} style={{ marginBottom: BLOCK_GAP }}>
        {items.map((item, i) => (
            <Col key={i} xs={24} sm={12} lg={Math.max(6, Math.floor(24 / items.length))}>
                <Card size="small" className="rounded-xl shadow-sm" loading={loading} style={{ height: "100%" }}>
                    <div className="flex items-start justify-between gap-2">
                        <Statistic title={item.title} value={item.value} suffix={item.suffix} prefix={item.prefix}
                            styles={{ content: { color: item.color, fontSize: 24 } }} />
                        {item.icon && <span style={{ fontSize: 22, color: item.color ?? "#4f46e5" }}>{item.icon}</span>}
                    </div>
                    {item.description && (
                        <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>{item.description}</Text>
                    )}
                </Card>
            </Col>
        ))}
    </Row>
);
