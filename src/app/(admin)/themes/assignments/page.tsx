import { BackLink } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableCard, Thead, Tr, Td } from "@/components/ui/Table";
import { listThemes } from "@/lib/db";

export default function ThemeAssignmentsPage() {
  const themes = listThemes();

  return (
    <div>
      <BackLink href="/themes" label="Back to Themes" />
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Theme Assignments
      </div>
      <TableCard>
        <Thead
          columns={["THEME", "CATEGORY", "VENDORS USING", "STATUS", ""]}
        />
        <tbody>
          {themes.map((t) => (
            <Tr key={t.id}>
              <Td strong>{t.name}</Td>
              <Td muted>{t.category}</Td>
              <Td>{t.vendors}</Td>
              <Td>
                <StatusBadge status={t.status} />
              </Td>
              <Td>
                <button className="rounded-[7px] border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
                  Assign
                </button>
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}
