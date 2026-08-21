import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { fetchVendorDetail } from "@/lib/hooks/useAdminVendors";
import { updateVendorAction } from "@/lib/vendors";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function EditVendorPage(props: PageProps<"/vendors/[id]/edit">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const error = toParam(sp.error);

  const vendor = await fetchVendorDetail(id);
  if (!vendor) notFound();

  return (
    <div className="max-w-[600px]">
      <BackLink href={`/vendors/${id}`} label="Back to Vendor" />
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Edit Vendor
      </div>

      <Card>
        <CardTitle>Vendor Details</CardTitle>
        <form action={updateVendorAction.bind(null, id)} className="flex flex-col gap-3.5">
          <TextField label="Company Name" name="companyName" defaultValue={vendor.companyName} required />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="Email" name="email" type="email" defaultValue={vendor.email ?? ""} />
            <TextField label="Phone" name="phone" defaultValue={vendor.phone ?? ""} />
          </div>
          <TextField label="Address" name="address" defaultValue={vendor.address ?? ""} />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="WhatsApp Number" name="whatsappNumber" defaultValue={vendor.whatsappNumber ?? ""} />
            <TextField
              label="Event Creation Fee (₹)"
              name="eventCreationFee"
              type="number"
              defaultValue={vendor.eventCreationFee}
            />
          </div>

          {error ? (
            <p className="text-xs font-semibold text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-fit rounded-[9px] bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-bold text-white"
          >
            Save Changes
          </button>
        </form>
      </Card>
    </div>
  );
}
