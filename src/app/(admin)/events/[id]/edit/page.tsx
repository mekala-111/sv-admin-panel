import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { TextField, TextAreaField, SelectOptionsField, FileField, CheckboxField } from "@/components/ui/Field";
import { updateEventAction } from "@/lib/events";
import { fetchEventDetail } from "@/lib/hooks/useAdminEvents";
import { fetchVendorNameMap, fetchCustomerNameMap } from "@/lib/hooks/useNameMaps";
import { fetchThemes, fetchThemeCategories } from "@/lib/hooks/useAdminThemes";
import { EVENT_TYPES, FONT_OPTIONS } from "@/lib/eventOptions";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "LIVE", label: "Live" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
];

function toParam(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function ImagePreview({ src, label }: { src: string | null; label: string }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      className="mb-1.5 h-16 w-16 rounded-lg border border-[var(--color-border)] object-cover"
    />
  );
}

export default async function EditEventPage(props: PageProps<"/events/[id]/edit">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const error = toParam(sp.error);

  const event = await fetchEventDetail(id);
  if (!event) notFound();

  const [vendorNames, customerNames, themes, categories] = await Promise.all([
    fetchVendorNameMap().catch(() => new Map<string, string>()),
    fetchCustomerNameMap().catch(() => new Map<string, string>()),
    fetchThemes().catch(() => []),
    fetchThemeCategories().catch(() => []),
  ]);

  const activeThemes = themes.filter((t) => t.status === "ACTIVE" || t.id === event.themeId);
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const themesByCategory = new Map<string, typeof activeThemes>();
  for (const theme of activeThemes) {
    const label = (theme.categoryId && categoryName.get(theme.categoryId)) || "Other";
    if (!themesByCategory.has(label)) themesByCategory.set(label, []);
    themesByCategory.get(label)!.push(theme);
  }

  return (
    <div className="max-w-[880px]">
      <BackLink href={`/events/${id}`} label="Back to Event" />
      <div className="mb-5 text-[22px] font-extrabold text-[var(--color-text)]">Edit Event</div>

      <form action={updateEventAction.bind(null, id)} className="flex flex-col gap-4">
        <input type="hidden" name="existingGalleryImages" value={JSON.stringify(event.galleryImages)} />
        <Card>
          <CardTitle>Event Basics</CardTitle>
          <div className="mb-3.5 grid grid-cols-1 gap-3.5 text-[13px] sm:grid-cols-2">
            <div>
              <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">Vendor</div>
              <div className="font-semibold text-[var(--color-text)]">{vendorNames.get(event.vendorId) ?? "–"}</div>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">Customer</div>
              <div className="font-semibold text-[var(--color-text)]">
                {event.customerId ? customerNames.get(event.customerId) ?? "–" : "–"}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="Event Name" name="eventName" defaultValue={event.eventName} required />
            <SelectOptionsField
              label="Event Type"
              name="eventType"
              placeholder="Select a type…"
              defaultValue={event.eventType ?? ""}
              options={EVENT_TYPES}
            />
            <SelectOptionsField label="Status" name="status" defaultValue={event.status} options={STATUS_OPTIONS} />
            <TextField label="Page Title" name="pageTitle" defaultValue={event.pageTitle ?? ""} />
            <TextField label="Event Date" name="eventDate" type="date" defaultValue={event.eventDate?.slice(0, 10) ?? ""} />
            <TextField label="Location" name="location" defaultValue={event.location ?? ""} />
            <TextField label="Google Maps URL" name="googleMapsUrl" defaultValue={event.googleMapsUrl ?? ""} />
          </div>
          <div className="mt-3.5">
            <TextAreaField label="Description" name="description" defaultValue={event.description ?? ""} />
          </div>
          <div className="mt-3.5">
            <TextField label="Live Event Timings (display text)" name="liveTiming" defaultValue={event.liveTiming ?? ""} />
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
              defaultValue={event.themeId ?? ""}
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
            <p className="mt-1.5 text-[11px] text-[var(--color-text-faint)]">
              To wire up a YouTube live stream, use the Live Stream tab on the event page.
            </p>
          </div>
        </Card>

        <Card>
          <CardTitle>Media &amp; Branding</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <ImagePreview src={event.coverImage} label="Cover" />
              <FileField label="Cover Image (replace)" name="coverImage" accept="image/*" hint="Max 4MB" />
            </div>
            <div>
              <ImagePreview src={event.logoImage} label="Logo" />
              <FileField label="Logo (replace)" name="logoImage" accept="image/*" hint="Max 500KB" />
            </div>
            <div>
              <ImagePreview src={event.customImage} label="Custom" />
              <FileField label="Custom Image (replace)" name="customImage" accept="image/*" hint="Max 500KB" />
            </div>
            <div>
              <ImagePreview src={event.whatsappImage} label="WhatsApp" />
              <FileField label="WhatsApp Image (replace)" name="whatsappImage" accept="image/*" hint="Max 500KB" />
            </div>
          </div>
          <div className="mt-3.5">
            {event.galleryImages.length > 0 ? (
              <div className="mb-2 flex flex-wrap gap-2">
                {event.galleryImages.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt={`Gallery ${i + 1}`} className="h-14 w-14 rounded-lg border border-[var(--color-border)] object-cover" />
                ))}
              </div>
            ) : null}
            <FileField
              label="Add Gallery Images"
              name="galleryImages"
              accept="image/*"
              multiple
              hint="Uploading here adds to (does not replace) the existing gallery — max 10 total, 4MB each"
            />
          </div>
          <div className="mt-3.5">
            <TextField label="Teaser URL" name="teaserUrl" defaultValue={event.teaserUrl ?? ""} />
          </div>
          <div className="mt-3.5">
            <TextField label="Scroll Message" name="scrollMessage" defaultValue={event.scrollMessage ?? ""} />
          </div>
        </Card>

        <Card>
          <CardTitle>Visitor Controls</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <CheckboxField label="Public Event" name="isPublic" defaultChecked={event.isPublic} />
            <CheckboxField label="Show Watch Live Button" name="showWatchLive" defaultChecked={event.showWatchLive} />
            <CheckboxField label="Show Social Share Button" name="showSocialShare" defaultChecked={event.showSocialShare} />
          </div>
          <div className="mt-3.5">
            <TextField label="Access PIN (optional)" name="accessPin" defaultValue={event.accessPin ?? ""} />
          </div>
        </Card>

        <Card>
          <CardTitle>WhatsApp Support</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="WhatsApp Support Number" name="whatsappNumber" defaultValue={event.whatsappNumber ?? ""} />
            <div className="flex items-end">
              <CheckboxField label="Enable WhatsApp Support" name="whatsappEnabled" defaultChecked={event.whatsappEnabled} />
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
              defaultValue={event.fontFamily ?? ""}
              options={FONT_OPTIONS.map((f) => ({ value: f, label: f }))}
            />
            <TextField label="Font Color" name="fontColor" type="color" defaultValue={event.fontColor ?? "#252525"} />
          </div>
        </Card>

        <Card>
          <CardTitle>Remarks</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextAreaField label="Remarks 1" name="remarks1" defaultValue={event.remarks1 ?? ""} />
            <TextAreaField label="Remarks 2" name="remarks2" defaultValue={event.remarks2 ?? ""} />
          </div>
        </Card>

        <Card>
          <CardTitle>SEO</CardTitle>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="Meta Title" name="metaTitle" defaultValue={event.metaTitle ?? ""} />
            <TextField label="Meta Description" name="metaDescription" defaultValue={event.metaDescription ?? ""} />
          </div>
        </Card>

        {error ? (
          <p className="text-xs font-semibold text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="w-fit rounded-[9px] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
