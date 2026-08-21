import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { TextField, TextAreaField, SelectOptionsField, FileField, CheckboxField } from "@/components/ui/Field";
import { createEventAction } from "@/lib/events";
import { fetchVendors } from "@/lib/hooks/useAdminVendors";
import { fetchCustomers } from "@/lib/hooks/useAdminCustomers";
import { fetchThemes, fetchThemeCategories } from "@/lib/hooks/useAdminThemes";
import { fetchYoutubeChannels } from "@/lib/hooks/useAdminYoutube";
import { EVENT_TYPES, FONT_OPTIONS } from "@/lib/eventOptions";

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function CreateEventPage(props: PageProps<"/events/create">) {
  const sp = await props.searchParams;
  const error = toParam(sp.error);

  const [vendors, customers, themes, categories, channels] = await Promise.all([
    fetchVendors({ limit: 100 }).then((r) => r.items).catch(() => []),
    fetchCustomers({ limit: 100 }).then((r) => r.items).catch(() => []),
    fetchThemes().catch(() => []),
    fetchThemeCategories().catch(() => []),
    fetchYoutubeChannels().catch(() => []),
  ]);

  const activeThemes = themes.filter((t) => t.status === "ACTIVE");
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const themesByCategory = new Map<string, typeof activeThemes>();
  for (const theme of activeThemes) {
    const label = (theme.categoryId && categoryName.get(theme.categoryId)) || "Other";
    if (!themesByCategory.has(label)) themesByCategory.set(label, []);
    themesByCategory.get(label)!.push(theme);
  }

  return (
    <div className="max-w-[880px]">
      <BackLink href="/events" label="Back to Events" />
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">Create Event</div>

      <form action={createEventAction} className="flex flex-col gap-4">
        <Card>
          <CardTitle>Event Basics</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <SelectOptionsField
              label="Vendor"
              name="vendorId"
              placeholder="Select a vendor…"
              required
              options={vendors.map((v) => ({ value: v.id, label: v.companyName }))}
            />
            <SelectOptionsField
              label="Customer (optional)"
              name="customerId"
              placeholder="No customer"
              options={customers.map((c) => ({ value: c.id, label: `${c.name} (${c.customerCode})` }))}
            />
            <TextField label="Event Name" name="eventName" placeholder="e.g. Ravi weds Rani" required />
            <SelectOptionsField
              label="Event Type"
              name="eventType"
              placeholder="Select a type…"
              options={EVENT_TYPES}
            />
            <TextField label="Page Title" name="pageTitle" placeholder="e.g. Ravi weds Rani" />
            <TextField label="Event Date" name="eventDate" type="date" />
            <TextField label="Location" name="location" placeholder="Venue, city" />
            <TextField label="Google Maps URL" name="googleMapsUrl" placeholder="https://maps.google.com/…" />
          </div>
          <div className="mt-3.5">
            <TextAreaField label="Description" name="description" placeholder="Short description of the event" />
          </div>
          <div className="mt-3.5">
            <TextField
              label="Live Event Timings (display text)"
              name="liveTiming"
              placeholder="e.g. Live starts 6:00 PM IST onwards"
            />
          </div>
        </Card>

        <Card>
          <CardTitle>Theme</CardTitle>
          <div>
            <label htmlFor="themeId" className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
              Design
            </label>
            <select
              id="themeId"
              name="themeId"
              defaultValue=""
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">No theme selected</option>
              {[...themesByCategory.entries()].map(([label, group]) => (
                <optgroup key={label} label={label}>
                  {group.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </Card>

        <Card>
          <CardTitle>YouTube Live</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <SelectOptionsField
              label="YouTube Channel"
              name="youtubeChannelId"
              placeholder="No channel — link later"
              options={channels.map((c) => ({
                value: c.id,
                label: `${c.channelName ?? c.channelId}${c.vendorName ? ` (${c.vendorName})` : ""}`,
              }))}
            />
            <TextField label="Live Video ID" name="youtubeVideoId" placeholder="e.g. _eZppUQh9kU" />
            <TextField label="Live URL" name="youtubeLiveUrl" placeholder="https://youtube.com/live/…" />
            <TextField label="Live Key" name="youtubeLiveKey" placeholder="e.g. rt56-t6dt-1kga-kc8a-bkf7" />
            <TextField label="Teaser URL" name="teaserUrl" placeholder="https://youtu.be/…" />
          </div>
        </Card>

        <Card>
          <CardTitle>Media &amp; Branding</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <FileField label="Cover Image" name="coverImage" accept="image/*" hint="Max 4MB" />
            <FileField label="Logo" name="logoImage" accept="image/*" hint="Max 500KB" />
            <FileField label="Custom Image" name="customImage" accept="image/*" hint="Height 800px recommended · Max 500KB" />
            <FileField label="WhatsApp Image (500×500)" name="whatsappImage" accept="image/*" hint="Max 500KB" />
          </div>
          <div className="mt-3.5">
            <FileField
              label="Gallery Images"
              name="galleryImages"
              accept="image/*"
              multiple
              hint="Max 10 files, 4MB each"
            />
          </div>
          <div className="mt-3.5">
            <TextField label="Scroll Message" name="scrollMessage" placeholder="Text to scroll on the event page" />
          </div>
        </Card>

        <Card>
          <CardTitle>Visitor Controls</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <CheckboxField label="Public Event" name="isPublic" defaultChecked hint="Listed without a direct link" />
            <CheckboxField label="Show Watch Live Button" name="showWatchLive" defaultChecked />
            <CheckboxField label="Show Social Share Button" name="showSocialShare" defaultChecked />
          </div>
          <div className="mt-3.5">
            <TextField label="Access PIN (optional)" name="accessPin" placeholder="Leave blank for no PIN" />
          </div>
        </Card>

        <Card>
          <CardTitle>WhatsApp Support</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="WhatsApp Support Number" name="whatsappNumber" placeholder="+91 00000 00000" />
            <div className="flex items-end">
              <CheckboxField label="Enable WhatsApp Support" name="whatsappEnabled" />
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Font &amp; Style</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <SelectOptionsField
              label="Font Family"
              name="fontFamily"
              placeholder="Default"
              options={FONT_OPTIONS.map((f) => ({ value: f, label: f }))}
            />
            <TextField label="Font Color" name="fontColor" type="color" defaultValue="#252525" />
          </div>
        </Card>

        <Card>
          <CardTitle>Remarks</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextAreaField label="Remarks 1" name="remarks1" />
            <TextAreaField label="Remarks 2" name="remarks2" />
          </div>
        </Card>

        <Card>
          <CardTitle>SEO</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="Meta Title" name="metaTitle" placeholder="Shown in search results / link previews" />
            <TextField label="Meta Description" name="metaDescription" placeholder="Short summary for search engines" />
          </div>
        </Card>

        {error ? (
          <p className="text-xs font-semibold text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="w-fit rounded-[9px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-6 py-3 text-sm font-bold text-white"
        >
          CREATE EVENT
        </button>
      </form>
    </div>
  );
}
