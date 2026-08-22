import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { getVendor } from "@/lib/db";
import { updateVendorAction } from "@/lib/actions";

export default async function EditVendorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const vendor = await getVendor(id);
  if (!vendor) notFound();

  const errorParam = Array.isArray(sp.error) ? sp.error[0] : sp.error;
  const hasError = Boolean(errorParam);

  return (
    <div className="max-w-[760px]">
      <BackLink href={`/vendors/${id}`} label="Back to Vendor" />
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Edit Vendor
      </div>

      {hasError && (
        <div className="mb-4 rounded-[10px] border border-[var(--color-danger)] bg-[#FDEAEA] px-4 py-3 text-[13px] font-semibold text-[var(--color-danger)]">
          Could not save vendor. Check the fields and try again.
        </div>
      )}

      <form action={updateVendorAction} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={String(vendor.id)} />
        <Card>
          <CardTitle>Vendor Details</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField
              label="Company Name"
              name="company"
              required
              defaultValue={vendor.company}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              required
              defaultValue={vendor.email}
            />
            <TextField
              label="Phone"
              name="phone"
              defaultValue={vendor.phone ?? ""}
              placeholder="+91 00000 00000"
            />
            <TextField
              label="Address"
              name="address"
              defaultValue={vendor.address ?? ""}
              placeholder="Street address"
            />
            <TextField
              label="Live event creation fee (₹)"
              name="liveEventCreationFee"
              type="number"
              defaultValue={String(vendor.liveEventCreationFee ?? vendor.eventCreationFee ?? 0)}
              placeholder="0"
            />
            <TextField
              label="Invitation creation fee (₹)"
              name="invitationCreationFee"
              type="number"
              defaultValue={String(vendor.invitationCreationFee ?? vendor.eventCreationFee ?? 0)}
              placeholder="0"
            />
          </div>
          <p className="mt-3 text-[12px] text-[var(--color-text-muted)]">
            Live event fee applies when the vendor creates a live stream event. Invitation fee
            applies when they create a digital invitation.
          </p>
        </Card>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="submit"
            className="rounded-[9px] bg-[var(--color-primary)] px-4 py-2.5 text-[13px] font-bold text-white"
          >
            Save Changes
          </button>
          <a
            href={`/vendors/${id}`}
            className="inline-flex items-center justify-center rounded-[9px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--color-text)]"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
