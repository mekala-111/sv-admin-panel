import { realImageFor } from "@/lib/images";

type Shape = "circle" | "rounded" | "rect";

export function SlotImage({
  slotId,
  label,
  shape = "rounded",
  radius = 8,
  className = "",
  style,
}: {
  slotId: string;
  label: string;
  shape?: Shape;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const src = realImageFor(slotId);
  const borderRadius =
    shape === "circle" ? "50%" : shape === "rounded" ? radius : 0;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={label}
        className={`object-cover ${className}`}
        style={{ borderRadius, ...style }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{
        borderRadius,
        backgroundColor: "#F0EEEA",
        backgroundImage:
          "repeating-linear-gradient(45deg, #E5E1DA 0, #E5E1DA 6px, transparent 6px, transparent 16px)",
        ...style,
      }}
    >
      <span
        className="px-1 text-center font-mono uppercase leading-tight text-[9px] tracking-wide"
        style={{ color: "#9C9890" }}
      >
        {label}
      </span>
    </div>
  );
}
