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
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
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
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
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
}: {
  label: string;
  name: string;
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
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        rows={3}
        className="w-full resize-none rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
      />
    </div>
  );
}

export function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
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
