"use client";

import { useEffect } from "react";
import { toast } from "@/components/toast/ToastProvider";

function labelOf(el: HTMLElement) {
  return (
    el.getAttribute("data-toast") ||
    el.getAttribute("aria-label") ||
    el.textContent?.replace(/\s+/g, " ").trim() ||
    ""
  );
}

function shouldSkip(el: HTMLElement) {
  if (el.hasAttribute("data-toast-skip")) return true;
  if (el.closest("[data-toast-skip]")) return true;
  if (el.getAttribute("aria-hidden") === "true") return true;
  if ((el as HTMLButtonElement).disabled) return true;
  return false;
}

/** Click feedback for actionable controls across the admin panel. */
export function ActionToasts() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest("button, input[type='submit']") as HTMLElement | null;
      if (!el || shouldSkip(el)) return;

      const custom = el.getAttribute("data-toast");
      const successMsg = el.getAttribute("data-toast-success");
      const typeAttr = (el.getAttribute("type") || "").toLowerCase();
      const btnType = ((el as HTMLButtonElement).type || typeAttr || "").toLowerCase();
      const label = labelOf(el);
      if (!label && !custom && !successMsg) return;

      if (el.getAttribute("role") === "switch") {
        const on = el.getAttribute("aria-checked") === "true";
        toast.info(`${custom || label || "Option"} ${on ? "off" : "on"}`);
        return;
      }

      if (btnType === "submit") {
        toast.info(custom || `${label || "Working"}…`);
        return;
      }

      if (custom) {
        toast.info(custom);
        return;
      }

      if (successMsg) {
        toast.success(successMsg);
        return;
      }

      if (/^(×|✕|‹|›|♪|❚❚)$/.test(label)) return;
      if (/open menu|close menu|dismiss|toggle|nav/i.test(label)) return;

      toast.info(label.length > 42 ? `${label.slice(0, 42)}…` : label);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
