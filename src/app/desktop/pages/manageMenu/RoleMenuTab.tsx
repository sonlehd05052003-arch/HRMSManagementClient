import { useEffect, useMemo, useRef, useState } from "react";
import { Select, Tree, Button, Space, Spin, Empty, Tag, Typography, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchRoleMenus,
  updateRoleMenus,
  fetchMyMenu,
  fetchSuperAdminMenus,
  updateSuperAdminMenus,
  selectRoleMenuTree,
  selectRoleMenuTreeLoading,
  type IMenuAdminNode,
} from "../../../../store/menuSlide";
import { fetchAllRoles, selectRoles } from "../../../../store/roleSlide";
import CompanyScopeSelect from "../../components/companyScopeSelect";
import { useConfigScope } from "../../components/companyScopeSelect/hooks";
import { renderMenuIcon } from "../../../../constants/menuIcons";
import { flattenTree } from "./menuTreeUtils";

const { Text } = Typography;

// The SuperAdmin has no company role, so it gets a pseudo entry in the role picker
const SUPERADMIN_ROLE_ID = -1;
// Always kept in the SuperAdmin's sidebar (the server enforces it too), so it cannot hide this page
const SUPERADMIN_REQUIRED_MENU_CODE = "system.menus";

const toTreeData = (nodes: IMenuAdminNode[], locked: Set<number>): DataNode[] =>
  nodes.map((n) => ({
    key: n.menuId,
    title: (
      <Space size={4}>
        {n.title}
        {n.route && <Text type="secondary" style={{ fontSize: 12 }}>{n.route}</Text>}
        {!n.isActive && <Tag>Đang ẩn</Tag>}
        {locked.has(n.menuId) && <Tag color="blue">Bắt buộc</Tag>}
      </Space>
    ),
    icon: renderMenuIcon(n.iconName),
    disableCheckbox: locked.has(n.menuId),
    children: toTreeData(n.children, locked),
  }));

const RoleMenuTab = () => {
  const dispatch = useAppDispatch();
  const roles = useAppSelector(selectRoles);
  const roleTree = useAppSelector(selectRoleMenuTree);
  const loading = useAppSelector(selectRoleMenuTreeLoading);

  const [roleId, setRoleId] = useState<number | null>(null);
  const [granted, setGranted] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  // Roles in the store may still belong to the previously configured company until the refetch lands
  const [rolesReady, setRolesReady] = useState(false);
  const { ready, scopeKey } = useConfigScope();
  const loadedScope = useRef(scopeKey);

  useEffect(() => {
    if (!ready) return;
    if (loadedScope.current !== scopeKey) {
      // Switched company: its roles are different, so drop the selection (the SuperAdmin entry is company-independent)
      loadedScope.current = scopeKey;
      setRoleId((id) => (id === SUPERADMIN_ROLE_ID ? id : null));
    }
    setRolesReady(false);
    dispatch(fetchAllRoles()).finally(() => setRolesReady(true));
  }, [dispatch, ready, scopeKey]);

  // Default to the first role so the tab never opens empty.
  useEffect(() => {
    if (rolesReady && roleId == null && roles.length > 0) setRoleId(roles[0].roleId);
  }, [rolesReady, roles, roleId]);

  const isSuperAdminRole = roleId === SUPERADMIN_ROLE_ID;

  useEffect(() => {
    if (isSuperAdminRole) dispatch(fetchSuperAdminMenus());
    else if (rolesReady && roleId != null) dispatch(fetchRoleMenus(roleId));
  }, [rolesReady, roleId, isSuperAdminRole, dispatch]);

  const rows = useMemo(() => flattenTree(roleTree), [roleTree]);

  useEffect(() => {
    setGranted(new Set(rows.filter((r) => r.node.isGranted).map((r) => r.node.menuId)));
  }, [rows]);

  const byId = useMemo(() => new Map(rows.map((r) => [r.node.menuId, r.node])), [rows]);

  // The required menu and its ancestors, which stay ticked for the SuperAdmin
  const locked = useMemo(() => {
    const ids = new Set<number>();
    if (!isSuperAdminRole) return ids;
    const required = rows.find((r) => r.node.code === SUPERADMIN_REQUIRED_MENU_CODE)?.node;
    for (let id: number | null = required?.menuId ?? null; id != null; id = byId.get(id)?.parentId ?? null) ids.add(id);
    return ids;
  }, [isSuperAdminRole, rows, byId]);

  const treeData = useMemo(() => toTreeData(roleTree, locked), [roleTree, locked]);
  const allKeys = useMemo(() => rows.map((r) => r.node.menuId), [rows]);

  // A node is only visible when its whole ancestor chain is granted, so keep the set consistent.
  const toggle = (menuId: number, checked: boolean) => {
    setGranted((prev) => {
      const next = new Set(prev);
      if (checked) {
        for (let id: number | null = menuId; id != null; id = byId.get(id)?.parentId ?? null) next.add(id);
      } else {
        const clear = (node: IMenuAdminNode) => {
          if (!locked.has(node.menuId)) next.delete(node.menuId);
          node.children.forEach(clear);
        };
        const node = byId.get(menuId);
        if (node) clear(node);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (roleId == null) return;
    setSaving(true);
    const menuIds = Array.from(granted);
    const saved = isSuperAdminRole
      ? dispatch(updateSuperAdminMenus(menuIds)).unwrap()
      : dispatch(updateRoleMenus({ roleId, menuIds })).unwrap();
    saved
      .then(() => {
        message.success(isSuperAdminRole ? "Đã lưu menu của SuperAdmin" : "Đã lưu phân menu cho vai trò");
        dispatch(fetchMyMenu());
      })
      .catch((error: any) => message.error(typeof error === "string" ? error : "Lưu thất bại"))
      .finally(() => setSaving(false));
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <CompanyScopeSelect />
        <Select
          style={{ width: 240 }}
          placeholder="Chọn vai trò"
          value={roleId ?? undefined}
          onChange={setRoleId}
          options={[
            { value: SUPERADMIN_ROLE_ID, label: "SUPERADMIN (hệ thống)" },
            ...roles.map((r) => ({ value: r.roleId, label: r.roleName })),
          ]}
        />
        <Button type="primary" icon={<SaveOutlined />} disabled={roleId == null} loading={saving} onClick={handleSave}>
          Lưu
        </Button>
        {roleId != null && (
          <>
            <Button onClick={() => setGranted(new Set(allKeys))}>Chọn tất cả</Button>
            <Button onClick={() => setGranted(new Set(locked))}>Bỏ chọn tất cả</Button>
            <Text type="secondary">Đã chọn {granted.size}/{allKeys.length} mục</Text>
          </>
        )}
      </Space>

      {roleId == null ? (
        <Empty description="Chọn một vai trò để phân menu" />
      ) : (
        <Spin spinning={loading}>
          <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            Tick mục con sẽ tự tick các mục cha; bỏ tick mục cha sẽ bỏ luôn các mục con.
          </Text>
          <Tree
            checkable
            checkStrictly
            showIcon
            defaultExpandAll
            key={`${roleId}-${allKeys.length}`}
            treeData={treeData}
            checkedKeys={{ checked: Array.from(granted), halfChecked: [] }}
            onCheck={(_, info) => toggle(Number(info.node.key), info.checked)}
            selectable={false}
          />
        </Spin>
      )}
    </>
  );
};

export default RoleMenuTab;
