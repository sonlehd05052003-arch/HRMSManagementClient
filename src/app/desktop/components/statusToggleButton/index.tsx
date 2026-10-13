import { useState } from "react";
import { Button, Popconfirm, Tooltip } from "antd";
import { DeleteOutlined, UndoOutlined } from "@ant-design/icons";

interface StatusToggleButtonProps {
    /** Whether the row is currently in use */
    active: boolean;
    loading?: boolean;
    onToggle: () => void;
    /** Confirmation shown before taking an active row out of use, e.g. "Ngừng sử dụng phòng ban này?" */
    deactivateTitle: string;
    deactivateDescription?: string;
    deactivateTooltip?: string;
    restoreTitle?: string;
    restoreTooltip?: string;
}

/**
 * Row action that replaces the old on/off switches: a trash button takes an active row out of use (after a
 * confirmation), and a restore button brings an inactive one back.
 */
const StatusToggleButton = ({
    active,
    loading,
    onToggle,
    deactivateTitle,
    deactivateDescription,
    deactivateTooltip = "Ngừng sử dụng",
    restoreTitle = "Khôi phục mục này?",
    restoreTooltip = "Khôi phục",
}: StatusToggleButtonProps) => {
    // The hover tooltip sits right where the confirmation opens and covered its buttons; hide it meanwhile
    const [confirming, setConfirming] = useState(false);

    return (
        <Popconfirm
            title={active ? deactivateTitle : restoreTitle}
            description={active ? deactivateDescription : undefined}
            okText={active ? "Ngừng sử dụng" : "Khôi phục"}
            okButtonProps={{ danger: active }}
            cancelText="Hủy"
            onConfirm={onToggle}
            onOpenChange={setConfirming}
        >
            <Tooltip title={active ? deactivateTooltip : restoreTooltip} open={confirming ? false : undefined}>
                <Button
                    danger={active}
                    loading={loading}
                    icon={active ? <DeleteOutlined /> : <UndoOutlined />}
                    aria-label={active ? deactivateTooltip : restoreTooltip}
                />
            </Tooltip>
        </Popconfirm>
    );
};

export default StatusToggleButton;
