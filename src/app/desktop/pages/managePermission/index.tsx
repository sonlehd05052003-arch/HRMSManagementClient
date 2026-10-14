import { useEffect, useMemo, useRef, useState, type Key } from "react";
import { Select, Tree, Button, Typography, Spin, Space, message } from "antd";
import { KeyOutlined, SaveOutlined } from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  fetchAllRoles,
  fetchPermissionCatalog,
  fetchRolePermissions,
  updateRolePermissions,
  selectRoles,
  selectPermissionCatalog,
  selectRolePermissionKeys,
  selectPermissionsLoading,
} from "../../../../store/roleSlide";
import CompanyScopeSelect, { SuperAdminOnly } from "../../components/companyScopeSelect";
import { useConfigScope } from "../../components/companyScopeSelect/hooks";
import { PageHeader, SectionCard } from "../../components/listPage";

const { Text } = Typography;
const UNGROUPED = "Chung";
const GROUP_PREFIX = "group:";

const ManagePermissionContent = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const roles = useAppSelector(selectRoles);
  const catalog = useAppSelector(selectPermissionCatalog);
  const grantedKeys = useAppSelector(selectRolePermissionKeys);
  const loading = useAppSelector(selectPermissionsLoading);

  const initialRoleId = Number(searchParams.get("roleId")) || null;
  const [roleId, setRoleId] = useState<number | null>(initialRoleId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  // Roles in the store may still belong to the previously configured company until the refetch lands
  const [rolesReady, setRolesReady] = useState(false);
  const { ready, scopeKey } = useConfigScope();
  const loadedScope = useRef(scopeKey);

  useEffect(() => {
    if (!ready) return;
    if (loadedScope.current !== scopeKey) {
      // Switched company: its roles are different, so drop the selection
      loadedScope.current = scopeKey;
      setRoleId(null);
      setSearchParams({});
    }
    setRolesReady(false);
    dispatch(fetchAllRoles()).finally(() => setRolesReady(true));
    dispatch(fetchPermissionCatalog());
  }, [dispatch, ready, scopeKey, setSearchParams]);

  // Default to the first role so the page never opens empty.
  useEffect(() => {
    if (rolesReady && roleId == null && roles.length > 0) setRoleId(roles[0].roleId);
  }, [rolesReady, roles, roleId]);

  useEffect(() => {
    if (rolesReady && roleId != null) dispatch(fetchRolePermissions(roleId));
  }, [rolesReady, roleId, dispatch]);

  useEffect(() => {
    setSelected(new Set(grantedKeys));
  }, [grantedKeys]);

  const treeData = useMemo<DataNode[]>(() => {
    const byGroup = new Map<string, typeof catalog>();
    for (const perm of catalog) {
      const group = perm.category || UNGROUPED;
      if (!byGroup.has(group)) byGroup.set(group, []);
      byGroup.get(group)!.push(perm);
    }
    return Array.from(byGroup.entries()).map(([group, perms]) => ({
      key: GROUP_PREFIX + group,
      title: <strong>{group}</strong>,
      children: perms.map((p) => ({
        key: p.permissionKey,
        title: (
          <Space size={4}>
            {p.displayName}
            <Text type="secondary" style={{ fontSize: 12 }}>{p.permissionKey}</Text>
          </Space>
        ),
      })),
    }));
  }, [catalog]);

  const allKeys = useMemo(() => catalog.map((p) => p.permissionKey), [catalog]);

  const handleRoleChange = (id: number) => {
    setRoleId(id);
    setSearchParams({ roleId: String(id) });
  };

  const handleCheck = (checked: Key[] | { checked: Key[] }) => {
    const keys = Array.isArray(checked) ? checked : checked.checked;
    setSelected(new Set(keys.map(String).filter((k) => !k.startsWith(GROUP_PREFIX))));
  };

  const handleSave = () => {
    if (roleId == null) return;
    setSaving(true);
    dispatch(updateRolePermissions({ roleId, permissionKeys: Array.from(selected) }))
      .unwrap()
      .then(() => message.success("Đã lưu phân quyền"))
      .catch((error: any) => {
        const msg = typeof error === "string" ? error : error?.message || "Lưu phân quyền thất bại";
        message.error(msg);
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="p-2">
      <PageHeader
        title="Phân quyền"
        actions={
          <Button type="primary" icon={<SaveOutlined />} disabled={roleId == null} loading={saving} onClick={handleSave}>
            Lưu
          </Button>
        }
      />
      <div style={{ marginBottom: 16 }}>
        <CompanyScopeSelect />
      </div>
      <SectionCard
        title="Quyền của vai trò"
        icon={<KeyOutlined />}
        gap={0}
        extra={<Text type="secondary">Đã chọn {selected.size}/{allKeys.length} quyền</Text>}
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            style={{ width: 240 }}
            placeholder="Chọn vai trò"
            value={roleId ?? undefined}
            onChange={handleRoleChange}
            options={roles.map((r) => ({ value: r.roleId, label: r.roleName }))}
          />
          <Button disabled={roleId == null} onClick={() => setSelected(new Set(allKeys))}>Chọn tất cả</Button>
          <Button disabled={roleId == null} onClick={() => setSelected(new Set())}>Bỏ chọn tất cả</Button>
        </Space>

        <Spin spinning={loading}>
          <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            Tick chọn những chức năng vai trò này được phép thực hiện; tick nhóm để chọn cả nhóm. Việc hiển thị menu được cấu hình riêng ở trang "Quản lý menu".
          </Text>
          <Tree
            checkable
            defaultExpandAll
            selectable={false}
            key={`${roleId}-${allKeys.length}`}
            treeData={treeData}
            checkedKeys={Array.from(selected)}
            onCheck={handleCheck}
          />
        </Spin>
      </SectionCard>
    </div>
  );
};

const ManagePermission = () => (
  <SuperAdminOnly>
    <ManagePermissionContent />
  </SuperAdminOnly>
);

export default ManagePermission;
