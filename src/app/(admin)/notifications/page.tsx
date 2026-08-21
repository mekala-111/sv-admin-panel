import { Card } from "@/components/ui/Card";
import { PillTabs } from "@/components/ui/Tabs";
import { fetchNotifications } from "@/lib/hooks/useAdminNotifications";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/notifications";

const VIEWS = ["All", "Unread"];

const TYPE_COLORS: Record<string, string> = {
  PAYMENT_SUCCESSFUL: "#16A34A",
  PAYMENT_FAILED: "#DC2626",
  EVENT_LIVE: "#DC2626",
  EVENT_PUBLISHED: "#2563EB",
  EVENT_CREATED: "#2563EB",
  YOUTUBE_CONNECTED: "#2563EB",
  YOUTUBE_ERROR: "#DC2626",
};

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function NotificationsPage({
  searchParams,
}: PageProps<"/notifications">) {
  const sp = await searchParams;
  const viewParam = toParam(sp.view);
  const view = VIEWS.includes(viewParam) ? viewParam : "All";

  const { items } = await fetchNotifications({ limit: 50, unreadOnly: view === "Unread" }).catch(() => ({
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
  }));

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-[22px] font-extrabold text-[var(--color-text)]">
          Notifications
        </div>
        <form action={markAllNotificationsReadAction}>
          <button type="submit" className="rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text)]">
            Mark All Read
          </button>
        </form>
      </div>
      <PillTabs basePath="/notifications" paramName="view" options={VIEWS} current={view} />

      <Card padded={false}>
        {items.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[var(--color-text-muted)]">
            {view === "Unread" ? "No unread notifications." : "No notifications yet."}
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className="flex min-w-0 items-center gap-3 border-b border-[var(--color-border)] p-3.5 last:border-b-0"
              style={{ background: n.isRead ? "transparent" : "#FFF8F0" }}
            >
              <span
                className="inline-block h-[9px] w-[9px] shrink-0 rounded-full"
                style={{ background: TYPE_COLORS[n.type] ?? "#707070" }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-[var(--color-text)]">{n.title || n.message}</div>
                <div className="text-[11px] text-[var(--color-text-muted)]">{n.message}</div>
              </div>
              <div className="shrink-0 text-[11px] text-[var(--color-text-faint)]">
                {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              {!n.isRead && (
                <form action={markNotificationReadAction.bind(null, n.id)}>
                  <button type="submit" className="shrink-0 rounded-[7px] border border-[var(--color-border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    Mark Read
                  </button>
                </form>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
