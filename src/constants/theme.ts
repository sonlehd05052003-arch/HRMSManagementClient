import type { ThemeConfig } from "antd";

/*
 * One look for every page. Sizes that antd lets each component pick (a table's size, a card's size) are set to the
 * same values here, so a page cannot drift by passing size="small" or size="large".
 */
const TABLE_CELL = { block: 12, inline: 12, font: 14 };

const theme: ThemeConfig = {
    token: {
        colorPrimary: '#4f46e5',
        borderRadius: 8,
        fontFamily: 'Noto Sans KR, sans-serif',
        fontSize: 14,
    },
    components: {
        Button: {
            controlHeight: 38,
            paddingInline: 16,
        },
        Card: {
            paddingLG: 20,
            headerFontSize: 16,
            headerFontSizeSM: 16,
        },
        Table: {
            headerBg: '#f8fafc',
            headerColor: '#1e293b',
            cellPaddingBlock: TABLE_CELL.block,
            cellPaddingInline: TABLE_CELL.inline,
            cellPaddingBlockMD: TABLE_CELL.block,
            cellPaddingInlineMD: TABLE_CELL.inline,
            cellPaddingBlockSM: TABLE_CELL.block,
            cellPaddingInlineSM: TABLE_CELL.inline,
            cellFontSize: TABLE_CELL.font,
            cellFontSizeMD: TABLE_CELL.font,
            cellFontSizeSM: TABLE_CELL.font,
        },
        // Tables shrink their pagination to "small"; keep every pager the same size (see index.css)
        Pagination: {
            itemSizeSM: 32,
        },
        Tabs: {
            titleFontSize: 14,
        },
    }
};

export default theme;
