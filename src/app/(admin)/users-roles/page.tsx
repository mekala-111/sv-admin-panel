import { Card, CardTitle } from "@/components/ui/Card";
import { listRoles } from "@/lib/db";

const PERMISSION_ROWS: {
  module: string;
  view: boolean | null;
  create: boolean | null;
  edit: boolean | null;
  suspend: boolean | null;
  delete: boolean | null;
}[] = [
  { module: "Vendors", view: true, create: true, edit: true, suspend: true, delete: false },
  { module: "Payments", view: true, create: null, edit: true, suspend: null, delete: false },
];

export default function UsersRolesPage() {
  const roles = listRoles();

  return (
    <div>
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Users &amp; Roles
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {roles.map((r) => (
          <Card key={r.name}>
            <div className="mb-1 text-[14px] font-bold text-[var(--color-text)]">
              {r.name}
            </div>
            <div className="mb-2.5 text-xs text-[var(--color-text-muted)]">
              {r.desc}
            </div>
            <div className="text-xs font-semibold text-[var(--color-primary)]">
              {r.users} users
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>Permission Matrix &mdash; Finance Admin</CardTitle>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr className="text-left text-[11px] text-[var(--color-text-muted)]">
              <th className="p-2">MODULE</th>
              <th className="p-2">VIEW</th>
              <th className="p-2">CREATE</th>
              <th className="p-2">EDIT / REFUND</th>
              <th className="p-2">SUSPEND</th>
              <th className="p-2">DELETE / MODIFY</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSION_ROWS.map((row) => (
              <tr key={row.module} className="border-t border-[var(--color-border)]">
                <td className="p-2.5 font-semibold text-[var(--color-text)]">
                  {row.module}
                </td>
                <PermCell v={row.view} />
                <PermCell v={row.create} />
                <PermCell v={row.edit} />
                <PermCell v={row.suspend} />
                <PermCell v={row.delete} />
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

function PermCell({ v }: { v: boolean | null }) {
  if (v === null) {
    return <td className="p-2.5 text-[var(--color-text-faint)]">&mdash;</td>;
  }
  return (
    <td
      className="p-2.5"
      style={{ color: v ? "var(--color-success)" : "var(--color-danger)" }}
    >
      {v ? "✓" : "✗"}
    </td>
  );
}
