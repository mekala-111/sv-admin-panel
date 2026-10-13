/** Static, read-only field display matching the design mockup's form look. */
export function FieldDisplay({
  label,
  value,
  muted = false,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
        {label}
      </div>
      <div
        className={`rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] ${
          mono ? "font-mono" : ""
        }`}
        style={{ color: muted ? "#B3AFA8" : "var(--color-text)" }}
      >
        {value}
      </div>
    </div>
  );
}

/** Real text input for the two functional forms (Add Vendor, Create Notification). */
export function TextField({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
  defaultValue,
  autoComplete,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        // Admin password fields set someone else's password — never autofill the admin's own.
        autoComplete={autoComplete ?? (type === "password" ? "new-password" : undefined)}
        className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
      />
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  placeholder,
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]"
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        rows={3}
        defaultValue={defaultValue}
        className="w-full resize-none rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
      />
    </div>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Like SelectField, but for options whose value and display label differ. */
export function SelectOptionsField({
  label,
  name,
  options,
  defaultValue,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Styled file input with an optional size/format hint, matching the legacy upload constraints. */
export function FileField({
  label,
  name,
  accept,
  hint,
  multiple = false,
}: {
  label: string;
  name: string;
  accept?: string;
  hint?: string;
  multiple?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-[13px] text-[var(--color-text)] outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-bg)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--color-text)]"
      />
      {hint ? (
        <div className="mt-1 text-[11px] text-[var(--color-text-faint)]">{hint}</div>
      ) : null}
    </div>
  );
}

/** Checkbox + label, for the Watch Live / Social Share / Public / WhatsApp Enabled toggles. */
export function CheckboxField({
  label,
  name,
  defaultChecked = false,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label htmlFor={name} className="flex cursor-pointer items-start gap-2.5">
      <input
        id={name}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
      />
      <span>
        <span className="block text-[13px] font-semibold text-[var(--color-text)]">{label}</span>
        {hint ? (
          <span className="block text-[11px] text-[var(--color-text-faint)]">{hint}</span>
        ) : null}
      </span>
    </label>
  );
}

export function Toggle({ on = false }: { on?: boolean }) {
  return (
    <div
      className="flex h-[22px] w-10 items-center rounded-full p-0.5"
      style={{
        background: on ? "var(--color-primary)" : "var(--color-border)",
        justifyContent: on ? "flex-end" : "flex-start",
      }}
    >
      <span className="h-[18px] w-[18px] rounded-full bg-white" />
    </div>
  );
}
