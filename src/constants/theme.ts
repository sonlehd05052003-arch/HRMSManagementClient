import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
    token: {
        colorPrimary: '#4f46e5',
        borderRadius: 8,
        fontFamily: 'Noto Sans KR, sans-serif',
    },
    components: {
        Button: {
            controlHeight: 38,
            paddingInline: 16,
        },
        Card: {
            paddingLG: 20,
        },
        Table: {
            headerBg: '#f8fafc',
            headerColor: '#1e293b',
        },
        // Tables shrink their pagination to "small"; keep every pager the same size (see index.css)
        Pagination: {
            itemSizeSM: 32,
        },
    }
};

export default theme;
