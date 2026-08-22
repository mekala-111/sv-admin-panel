import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldDisplay } from "@/components/ui/Field";
import { SlotImage } from "@/components/ui/SlotImage";
import { Tabs } from "@/components/ui/Tabs";
import { TableCard, Thead, Tr, Td, EmptyState } from "@/components/ui/Table";
import { getSessionUser, listLoginHistory, listSessions } from "@/lib/db";
import { logoutAction } from "@/lib/auth";

const TABS = ["Profile Info", "Login History", "Active Sessions"];

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = TABS.includes(tabParam ?? "") ? (tabParam as string) : "Profile Info";
  const [user, loginHistory, sessions] = await Promise.all([
    getSessionUser(),
    listLoginHistory(),
    listSessions(),
  ]);

  return (
    <div className="max-w-[820px]">
      <div className="mb-5 flex items-center gap-4">
        <SlotImage slotId="profile-photo" label="photo" shape="circle" className="h-16 w-16" />
        <div>
          <div className="text-xl font-extrabold text-[var(--color-text)]">
            {user?.name ?? "Admin"}
          </div>
          <div className="text-[13px] text-[var(--color-text-muted)]">
            {user?.role ?? "ADMIN"} &middot; {user?.email ?? "—"}
          </div>
        </div>
      </div>

      <Tabs basePath="/profile" options={TABS} current={tab} />

      {tab === "Profile Info" && (
        <Card className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FieldDisplay label="Name" value={user?.name ?? "—"} />
          <FieldDisplay label="Email" value={user?.email ?? "—"} />
          <FieldDisplay label="Role" value={user?.role ?? "—"} />
          <FieldDisplay label="User ID" value={user?.id ?? "—"} mono />
        </Card>
      )}

      {tab === "Login History" &&
        (loginHistory.length === 0 ? (
          <EmptyState message="No login history stored yet." />
        ) : (
          <TableCard>
            <Thead columns={["DATE", "IP", "DEVICE", "LOCATION", "STATUS"]} />
            <tbody>
              {loginHistory.map((lh, i) => (
                <Tr key={i}>
                  <Td>{lh.date}</Td>
                  <Td mono muted>
                    {lh.ip}
                  </Td>
                  <Td muted>{lh.device}</Td>
                  <Td muted>{lh.location}</Td>
                  <Td>{lh.status}</Td>
                </Tr>
              ))}
            </tbody>
          </TableCard>
        ))}

      {tab === "Active Sessions" && (
        <>
          {sessions.length === 0 ? (
            <EmptyState message="No active sessions." />
          ) : (
            <div className="mb-4 flex flex-col gap-2.5">
              {sessions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white p-3.5 px-4"
                >
                  <div>
                    <div className="text-[13px] font-bold text-[var(--color-text)]">{s.device}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {s.location} &middot; {s.lastActive}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form action={logoutAction}>
            <Button type="submit" variant="secondary" className="border-[var(--color-border)] text-[var(--color-danger)]">
              Log Out
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
