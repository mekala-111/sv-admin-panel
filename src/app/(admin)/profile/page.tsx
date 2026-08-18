import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldDisplay, Toggle } from "@/components/ui/Field";
import { SlotImage } from "@/components/ui/SlotImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { listLoginHistory, listSessions } from "@/lib/db";

const TABS = ["Profile Info", "Security", "Login History", "Active Sessions"];

export default async function ProfilePage({
  searchParams,
}: PageProps<"/profile">) {
  const sp = await searchParams;
  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = TABS.includes(tabParam ?? "") ? (tabParam as string) : "Profile Info";

  return (
    <div className="max-w-[820px]">
      <div className="mb-5 flex items-center gap-4">
        <SlotImage
          slotId="profile-photo"
          label="photo"
          shape="circle"
          className="h-16 w-16"
        />
        <div>
          <div className="text-xl font-extrabold text-[var(--color-text)]">
            Super Admin
          </div>
          <div className="text-[13px] text-[var(--color-text-muted)]">
            Super Admin &middot; superadmin@svlive.in
          </div>
        </div>
      </div>

      <Tabs basePath="/profile" options={TABS} current={tab} />

      {tab === "Profile Info" && (
        <Card className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FieldDisplay label="Name" value="Super Admin" />
          <FieldDisplay label="Email" value="superadmin@svlive.in" />
          <FieldDisplay label="Phone" value="+91 98765 43210" />
        </Card>
      )}

      {tab === "Security" && (
        <Card className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FieldDisplay label="Current Password" value="••••••••" muted />
          <FieldDisplay label="New Password" value="••••••••" muted />
          <div>
            <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
              Two-Factor Authentication
            </div>
            <Toggle on />
          </div>
        </Card>
      )}

      {tab === "Login History" && (
        <TableCard>
          <Thead columns={["DATE", "IP", "DEVICE", "LOCATION", "STATUS"]} />
          <tbody>
            {listLoginHistory().map((lh, i) => (
              <Tr key={i}>
                <Td>{lh.date}</Td>
                <Td mono muted>
                  {lh.ip}
                </Td>
                <Td muted>{lh.device}</Td>
                <Td muted>{lh.location}</Td>
                <Td>
                  <StatusBadge status={lh.status} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableCard>
      )}

      {tab === "Active Sessions" && (
        <>
          <div className="mb-4 flex flex-col gap-2.5">
            {listSessions().map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white p-3.5 px-4"
              >
                <div>
                  <div className="text-[13px] font-bold text-[var(--color-text)]">
                    {s.device}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {s.location} &middot; {s.lastActive}
                  </div>
                </div>
                <button className="rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--color-danger)]">
                  Revoke
                </button>
              </div>
            ))}
          </div>
          <Button href="/login" variant="secondary" className="border-[var(--color-border)] text-[var(--color-danger)]">
            Log Out
          </Button>
        </>
      )}
    </div>
  );
}
