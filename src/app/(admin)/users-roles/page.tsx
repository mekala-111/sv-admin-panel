import { Card, CardTitle } from "@/components/ui/Card";
import { PillTabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { fetchAdminUsers, fetchPermissions, fetchRolePermissions } from "@/lib/hooks/useAdminUsers";
import { getAdminUser } from "@/lib/auth";
import { grantPermissionAction, revokePermissionAction } from "@/lib/permissions";

const ROLES = ["ADMIN", "SUPER_ADMIN"];

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function UsersRolesPage(props: PageProps<"/users-roles">) {
  const sp = await props.searchParams;
  const error = toParam(sp.error);
  const roleParam = toParam(sp.role);
  const role = ROLES.includes(roleParam) ? roleParam : "ADMIN";

  const [me, usersResult, permissions, rolePermissions] = await Promise.all([
    getAdminUser(),
    fetchAdminUsers().catch(() => ({ items: [], page: 1, totalPages: 1, total: 0 })),
    fetchPermissions().catch(() => []),
    fetchRolePermissions(role).catch(() => []),
  ]);

  const isSuperAdmin = me?.role === "SUPER_ADMIN";
  const grantedCodes = new Set(rolePermissions.map((rp) => rp.permission?.code).filter(Boolean));
  const byModule = new Map<string, typeof permissions>();
  permissions.forEach((p) => {
    byModule.set(p.module, [...(byModule.get(p.module) ?? []), p]);
  });

  const users = usersResult.items;
  const counts = {
    SUPER_ADMIN: users.filter((u) => u.role === "SUPER_ADMIN").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
  };

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Users &amp; Roles
      </div>

      {error ? (
        <p className="mb-4 text-xs font-semibold text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <Card>
          <div className="mb-1 text-[14px] font-bold text-[var(--color-text)]">Super Admins</div>
          <div className="text-xs font-semibold text-[var(--color-primary)]">{counts.SUPER_ADMIN} users</div>
        </Card>
        <Card>
          <div className="mb-1 text-[14px] font-bold text-[var(--color-text)]">Admins</div>
          <div className="text-xs font-semibold text-[var(--color-primary)]">{counts.ADMIN} users</div>
        </Card>
      </div>

      <Card className="mb-6" padded={false}>
        <div className="p-5 pb-3.5 text-[15px] font-bold text-[var(--color-text)]">Platform Staff</div>
        <TableCard>
          <Thead columns={["NAME", "EMAIL", "ROLE", "STATUS", "LAST LOGIN"]} />
          <tbody>
            {users.length === 0 ? (
              <tr>
                <Td muted>No staff users yet.</Td>
              </tr>
            ) : (
              users.map((u) => (
                <Tr key={u.id}>
                  <Td strong>{u.name}</Td>
                  <Td muted>{u.email}</Td>
                  <Td muted>{u.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</Td>
                  <Td>
                    <StatusBadge status={statusLabel(u.status)} />
                  </Td>
                  <Td muted>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Never"}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </TableCard>
      </Card>

      <Card>
        <CardTitle>Permission Matrix</CardTitle>
        <PillTabs basePath="/users-roles" paramName="role" options={ROLES} current={role} />
        {!isSuperAdmin ? (
          <p className="mb-3 text-xs text-[var(--color-text-muted)]">
            Read-only — only Super Admins can grant or revoke permissions.
          </p>
        ) : null}
        {permissions.length === 0 ? (
          <div className="py-6 text-center text-[13px] text-[var(--color-text-muted)]">No permissions defined yet.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {[...byModule.entries()].map(([module, perms]) => (
              <div key={module}>
                <div className="mb-2 text-[13px] font-bold text-[var(--color-text)]">{module}</div>
                <div className="flex flex-col gap-1.5">
                  {perms.map((p) => {
                    const granted = grantedCodes.has(p.code);
                    return (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2">
                        <div className="text-[13px] text-[var(--color-text)]">{p.description || p.code}</div>
                        {isSuperAdmin ? (
                          <form
                            action={(granted ? revokePermissionAction : grantPermissionAction).bind(null, role, p.code)}
                          >
                            <button
                              type="submit"
                              className="rounded-[7px] border px-2.5 py-1 text-xs font-semibold"
                              style={{
                                borderColor: "var(--color-border)",
                                color: granted ? "var(--color-danger)" : "var(--color-success)",
                              }}
                            >
                              {granted ? "Revoke" : "Grant"}
                            </button>
                          </form>
                        ) : (
                          <span style={{ color: granted ? "var(--color-success)" : "var(--color-text-faint)" }}>
                            {granted ? "✓ Granted" : "—"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
