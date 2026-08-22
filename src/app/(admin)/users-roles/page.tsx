import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Table";
import { listPermissionsMatrix, listRoles } from "@/lib/db";

export default async function UsersRolesPage() {
  const [roles, permissions] = await Promise.all([listRoles(), listPermissionsMatrix()]);

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Users &amp; Roles
      </div>

      {roles.length === 0 ? (
        <EmptyState message="Could not load roles from API." />
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {roles.map((r) => (
            <Card key={r.name}>
              <div className="mb-1 text-[14px] font-bold text-[var(--color-text)]">{r.name}</div>
              <div className="mb-2.5 text-xs text-[var(--color-text-muted)]">{r.desc}</div>
              <div className="text-xs font-semibold text-[var(--color-primary)]">
                {r.users} users
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardTitle>Permission Catalogue</CardTitle>
        {permissions.length === 0 ? (
          <div className="text-[13px] text-[var(--color-text-muted)]">No permissions seeded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-[var(--color-text-muted)]">
                  <th className="p-2">MODULE</th>
                  <th className="p-2">PERMISSION CODES</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((row) => (
                  <tr key={row.module} className="border-t border-[var(--color-border)]">
                    <td className="p-2.5 font-semibold text-[var(--color-text)]">{row.module}</td>
                    <td className="p-2.5 text-[var(--color-text-muted)]">{row.codes.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
