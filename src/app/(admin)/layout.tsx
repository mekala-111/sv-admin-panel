import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[var(--color-bg)]">
      <input id="admin-nav" type="checkbox" className="peer hidden" />
      <label
        htmlFor="admin-nav"
        aria-label="Close menu"
        className="fixed inset-0 z-40 hidden bg-black/40 peer-checked:block lg:peer-checked:hidden"
      />
      <div className="fixed inset-y-0 left-0 z-50 flex w-[264px] shrink-0 -translate-x-full flex-col overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-sidebar)] transition-transform duration-200 peer-checked:translate-x-0 lg:static lg:translate-x-0">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
