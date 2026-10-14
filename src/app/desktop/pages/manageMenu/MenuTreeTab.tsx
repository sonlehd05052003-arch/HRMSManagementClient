import { useMemo, useState } from "react";
import { Table, Button, Space, Tag, Tooltip, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  deleteMenu,
  fetchMenuTree,
  fetchMyMenu,
  selectMenuTree,
  selectMenuTreeLoading,
  type IMenuAdminNode,
} from "../../../../store/menuSlide";
import { isKnownMenuIcon, renderMenuIcon } from "../../../../constants/menuIcons";
import { MAX_MENU_DEPTH, flattenTree, type FlatRow } from "./menuTreeUtils";
import MenuItemModal from "./MenuItemModal";
import { TableCard } from "../../components/listPage";

const MenuTreeTab = () => {
  const dispatch = useAppDispatch();
  const tree = useAppSelector(selectMenuTree);
  const loading = useAppSelector(selectMenuTreeLoading);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IMenuAdminNode | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<number | null>(null);

  const rows = useMemo(() => flattenTree(tree), [tree]);

  const openCreate = (parentId: number | null) => {
    setEditing(null);
    setDefaultParentId(parentId);
    setModalOpen(true);
  };

  const openEdit = (node: IMenuAdminNode) => {
    setEditing(node);
    setDefaultParentId(node.parentId);
    setModalOpen(true);
  };

  const handleDelete = (node: IMenuAdminNode) => {
    dispatch(deleteMenu(node.menuId))
      .unwrap()
      .then((res) => {
        message.success(`Đã xóa ${res.deletedCount} mục menu`);
        dispatch(fetchMenuTree());
        dispatch(fetchMyMenu());
      })
      .catch((error: any) => message.error(typeof error === "string" ? error : "Xóa thất bại"));
  };

  const columns = [
    {
      title: "Mục menu",
      key: "title",
      render: (_: unknown, { node, depth }: FlatRow) => (
        <div style={{ paddingLeft: depth * 24 }}>
          <Space>
            {renderMenuIcon(node.iconName)}
            <span style={{ fontWeight: depth === 0 ? 600 : 400 }}>{node.title}</span>
            {!node.isActive && <Tag>Đang ẩn</Tag>}
            {node.iconName && !isKnownMenuIcon(node.iconName) && (
              <Tooltip title={`Icon "${node.iconName}" không có trong danh sách`}>
                <WarningOutlined style={{ color: "#faad14" }} />
              </Tooltip>
            )}
          </Space>
        </div>
      ),
    },
    { title: "Mã", key: "code", width: 180, ellipsis: true, render: (_: unknown, { node }: FlatRow) => <code>{node.code}</code> },
    { title: "Đường dẫn", key: "route", render: (_: unknown, { node }: FlatRow) => node.route || <i style={{ color: "#999" }}>(nhóm)</i> },
    { title: "Thứ tự", key: "order", width: 80, render: (_: unknown, { node }: FlatRow) => node.displayOrder },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      render: (_: unknown, { node, depth }: FlatRow) => (
        <Space>
          <Tooltip title={depth >= MAX_MENU_DEPTH - 1 ? `Tối đa ${MAX_MENU_DEPTH} cấp` : "Thêm mục con"}>
            <Button size="small" icon={<PlusOutlined />} disabled={depth >= MAX_MENU_DEPTH - 1} onClick={() => openCreate(node.menuId)} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(node)} />
          </Tooltip>
          <Popconfirm
            title="Xóa mục menu"
            description={node.children.length ? "Tất cả mục con cũng sẽ bị xóa. Tiếp tục?" : "Bạn chắc chắn muốn xóa?"}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(node)}
          >
            <Tooltip title="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <TableCard
        title="Cây menu"
        count={rows.length}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate(null)}>
            Thêm mục gốc
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={rows}
          rowKey={(row) => row.node.menuId}
          loading={loading}
          pagination={false}
        />
      </TableCard>
      <MenuItemModal
        open={modalOpen}
        editing={editing}
        defaultParentId={defaultParentId}
        tree={tree}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default MenuTreeTab;
