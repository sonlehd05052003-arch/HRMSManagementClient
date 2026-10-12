import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Result } from "antd";

interface PageErrorBoundaryProps {
    children: ReactNode;
}

interface PageErrorBoundaryState {
    error: Error | null;
}

// A page that throws while rendering (or whose lazy chunk fails to load after a deploy) shows this panel
// inside the layout instead of blanking the whole app; the sidebar and header keep working.
// Each route renders its own boundary, so moving to another page starts clean.
class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
    state: PageErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Page crashed:", error, info.componentStack);
    }

    render() {
        if (!this.state.error) {
            return this.props.children;
        }

        return (
            <Result
                status="error"
                title="Trang này gặp lỗi"
                subTitle="Đã xảy ra lỗi khi hiển thị trang. Bạn hãy tải lại trang hoặc quay lại trang trước."
                extra={[
                    <Button type="primary" key="reload" onClick={() => window.location.reload()}>
                        Tải lại trang
                    </Button>,
                    <Button key="back" onClick={() => window.history.back()}>
                        Quay lại
                    </Button>,
                ]}
            />
        );
    }
}

export default PageErrorBoundary;
