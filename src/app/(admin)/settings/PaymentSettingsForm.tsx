"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/Field";
import { savePaymentSettingsAction } from "@/lib/payment-actions";

export function PaymentSettingsForm({
  payeeName,
  qrImage,
  instructions,
}: {
  payeeName: string;
  qrImage: string;
  instructions: string;
}) {
  const [preview, setPreview] = useState(qrImage);
  const [error, setError] = useState("");

  return (
    <form action={savePaymentSettingsAction} className="flex max-w-[560px] flex-col gap-4">
      <p className="text-[13px] text-[var(--color-text-muted)]">
        Vendors scan this QR to pay the event creation fee, then submit UTR and a payment screenshot
        for your approval.
      </p>

      <TextField
        label="Payee / account name"
        name="payeeName"
        placeholder="e.g. SV Live Payments"
        defaultValue={payeeName}
        required
      />

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">
          Payment QR code
        </label>
        <input type="hidden" name="qrImage" value={preview} />
        <input
          type="file"
          accept="image/*"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px]"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
              setError("QR image must be under 2MB");
              e.target.value = "";
              return;
            }
            setError("");
            const reader = new FileReader();
            reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : "");
            reader.readAsDataURL(file);
          }}
        />
        {error ? <div className="mt-1 text-[12px] text-[var(--color-danger)]">{error}</div> : null}
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Payment QR"
            className="mt-3 h-48 w-48 rounded-lg border border-[var(--color-border)] object-contain bg-white"
          />
        ) : null}
      </div>

      <div>
        <label
          htmlFor="instructions"
          className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]"
        >
          Instructions (optional)
        </label>
        <textarea
          id="instructions"
          name="instructions"
          rows={3}
          defaultValue={instructions}
          placeholder="Pay via UPI and upload the screenshot with UTR"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <button
        type="submit"
        className="w-fit rounded-[9px] bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-bold text-white"
      >
        Save payment settings
      </button>
    </form>
  );
}
