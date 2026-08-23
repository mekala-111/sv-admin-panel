import Link from "next/link";

export function CreateThemeButton({
  categories: _categories = [],
}: {
  categories?: { id: string; name: string }[];
}) {
  return (
    <Link
      href="/themes/new"
      className="rounded-[8px] bg-[var(--color-primary)] px-4 py-2 text-[13px] font-bold text-white"
    >
      + Create Theme
    </Link>
  );
}
