import { Card } from "@/components/ui/Card";
import { PillTabs } from "@/components/ui/Tabs";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { listNotifications, listNotifTemplates } from "@/lib/db";
import { createNotificationAction } from "@/lib/actions";

const VIEWS = ["Notifications", "Templates"];
const CATEGORIES = ["All", "System", "Payments", "Streaming", "Vendors", "Customers"];

export default async function NotificationsPage({
  searchParams,
}: PageProps<"/notifications">) {
  const sp = await searchParams;
  const viewParam = Array.isArray(sp.view) ? sp.view[0] : sp.view;
  const view = VIEWS.includes(viewParam ?? "") ? (viewParam as string) : "Notifications";
  const catParam = Array.isArray(sp.cat) ? sp.cat[0] : sp.cat;
  const category = CATEGORIES.includes(catParam ?? "") ? (catParam as string) : "All";

  const notifications = listNotifications().filter(
    (n) => category === "All" || n.category === category
  );
  const templates = listNotifTemplates();

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="mb-4 text-[22px] font-extrabold text-[var(--color-text)]">
          Notifications
        </div>
        <PillTabs basePath="/notifications" paramName="view" options={VIEWS} current={view} />

        {view === "Notifications" ? (
          <>
            <PillTabs
              basePath="/notifications"
              paramName="cat"
              options={CATEGORIES}
              current={category}
              extraParams={{ view: "Notifications" }}
            />
            <Card padded={false}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex min-w-0 items-center gap-3 border-b border-[var(--color-border)] p-3.5 last:border-b-0"
                >
                  <NotifDot category={n.category} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-[var(--color-text)]">
                      {n.message}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      {n.category}
                    </div>
                  </div>
                  <div className="shrink-0 text-[11px] text-[var(--color-text-faint)]">
                    {n.time}
                  </div>
                </div>
              ))}
            </Card>
          </>
        ) : (
          <div className="flex flex-col gap-2.5">
            {templates.map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white p-3.5 px-4"
              >
                <div>
                  <div className="text-[13px] font-bold text-[var(--color-text)]">
                    {t.name}
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    {t.preview}
                  </div>
                </div>
                <button className="shrink-0 rounded-[7px] border border-[var(--color-border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-4 pt-0.5 text-[15px] font-bold text-[var(--color-text)]">
          Create Notification
        </div>
        <Card>
          <form action={createNotificationAction} className="flex flex-col gap-3.5">
            <TextField label="Title" name="title" placeholder="Notification title" required />
            <TextAreaField label="Message" name="message" placeholder="Write a message..." required />
            <SelectField
              label="Audience"
              name="audience"
              options={["All Vendors", "Selected Vendors", "All Customers", "Selected Customers"]}
            />
            <SelectField
              label="Type"
              name="type"
              options={["System", "Payments", "Streaming", "Vendors", "Customers"]}
            />
            <button
              type="submit"
              className="rounded-[9px] bg-[var(--color-primary)] py-2.5 text-[13px] font-bold text-white"
            >
              SEND NOTIFICATION
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function NotifDot({ category }: { category: string }) {
  const colorMap: Record<string, string> = {
    System: "#707070",
    Payments: "#16A34A",
    Streaming: "#DC2626",
    Vendors: "#FF7A00",
    Customers: "#2563EB",
  };
  return (
    <span
      className="inline-block h-[9px] w-[9px] shrink-0 rounded-full"
      style={{ background: colorMap[category] ?? "#707070" }}
    />
  );
}
