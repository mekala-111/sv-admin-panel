import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { FieldDisplay, SelectField, TextField } from "@/components/ui/Field";
import { SlotImage } from "@/components/ui/SlotImage";
import { createVendorAction } from "@/lib/actions";

export default function CreateVendorPage() {
  return (
    <div className="max-w-[760px]">
      <BackLink href="/vendors" label="Back to Vendors" />
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">
        Add Vendor
      </div>

      <form action={createVendorAction} className="flex flex-col gap-4">
        <Card>
          <CardTitle>Basic Information</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField
              label="Vendor Name"
              name="name"
              placeholder="e.g. SV Events"
              required
            />
            <TextField
              label="Company Name"
              name="company"
              placeholder="e.g. SV Events Pvt Ltd"
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              placeholder="vendor@email.com"
              required
            />
            <TextField
              label="Phone"
              name="phone"
              placeholder="+91 00000 00000"
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
            />
          </div>
        </Card>

        <Card>
          <CardTitle>Business</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField
              label="GST Number"
              name="gst"
              placeholder="22AAAAA0000A1Z5"
            />
            <TextField
              label="Address"
              name="address"
              placeholder="Street address"
            />
            <TextField label="City" name="city" placeholder="City" />
            <TextField label="State" name="state" placeholder="State" />
            <TextField label="Country" name="country" placeholder="India" />
          </div>
        </Card>

        <Card>
          <CardTitle>Platform</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <SelectField
              label="Pricing Plan"
              name="plan"
              options={["Starter", "Professional", "Enterprise"]}
            />
            <TextField
              label="Wallet Limit"
              name="walletLimit"
              placeholder="₹0.00"
            />
            <TextField
              label="Event Limit"
              name="eventLimit"
              placeholder="Unlimited"
            />
            <TextField
              label="Storage Limit"
              name="storageLimit"
              placeholder="500 GB"
            />
          </div>
        </Card>

        <Card>
          <CardTitle>Branding</CardTitle>
          <div className="mb-3.5 flex gap-4">
            <SlotImage
              slotId="new-vendor-logo"
              label="Logo"
              shape="rounded"
              radius={12}
              className="h-[72px] w-[72px]"
            />
            <SlotImage
              slotId="new-vendor-favicon"
              label="Favicon"
              shape="rounded"
              radius={12}
              className="h-[72px] w-[72px]"
            />
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <FieldDisplay
              label="Primary Color"
              value={
                <span className="flex items-center gap-2">
                  <span className="h-[18px] w-[18px] rounded-[5px] bg-[#FF7A00]" />
                  #FF7A00
                </span>
              }
            />
            <FieldDisplay
              label="Secondary Color"
              value={
                <span className="flex items-center gap-2">
                  <span className="h-[18px] w-[18px] rounded-[5px] bg-[#F52222]" />
                  #F52222
                </span>
              }
            />
            <TextField
              label="Subdomain"
              name="subdomain"
              placeholder="vendor.svlive.in"
            />
            <TextField
              label="Custom Domain"
              name="customDomain"
              placeholder="optional"
            />
          </div>
        </Card>

        <button
          type="submit"
          className="w-fit rounded-[9px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-6 py-3 text-sm font-bold text-white"
        >
          CREATE VENDOR
        </button>
      </form>
    </div>
  );
}
