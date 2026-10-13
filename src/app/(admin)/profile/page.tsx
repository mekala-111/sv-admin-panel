import { Card } from "@/components/ui/Card";
import { FieldDisplay } from "@/components/ui/Field";
import { SlotImage } from "@/components/ui/SlotImage";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/Table";
import { getAdminUser, logout } from "@/lib/auth";

const TABS = ["Profile Info", "Security"];

export default async function ProfilePage({
  searchParams,
}: PageProps<"/profile">) {
  const sp = await searchParams;
  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = TABS.includes(tabParam ?? "") ? (tabParam as string) : "Profile Info";

  const user = await getAdminUser();

  return (
    <div className="max-w-[820px]">
      <div className="mb-5 flex items-center gap-4">
        <SlotImage slotId="profile-photo" label="photo" shape="circle" className="h-16 w-16" />
        <div>
          <div className="text-xl font-extrabold text-[var(--color-text)]">{user?.name ?? "Admin"}</div>
          <div className="text-[13px] text-[var(--color-text-muted)]">
            {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"} &middot; {user?.email ?? "–"}
          </div>
        </div>
      </div>

      <Tabs basePath="/profile" options={TABS} current={tab} />

      {tab === "Profile Info" && (
        <Card className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FieldDisplay label="Name" value={user?.name ?? "–"} />
          <FieldDisplay label="Email" value={user?.email ?? "–"} />
          <FieldDisplay label="Role" value={user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"} />
        </Card>
      )}

      {tab === "Security" && (
        <>
          <EmptyState message="Password changes and session management aren't exposed by the API yet." />
          <form action={logout} className="mt-4">
            <button
              type="submit"
              className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-danger)]"
            >
              Log Out
            </button>
          </form>
        </>
      )}
    </div>
  );
}
