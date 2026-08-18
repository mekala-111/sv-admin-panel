export type StatusMeta = { bg: string; fg: string };

const STATUS_MAP: Record<string, StatusMeta> = {
  Active: { bg: "#EAF7EE", fg: "#16A34A" },
  Healthy: { bg: "#EAF7EE", fg: "#16A34A" },
  Available: { bg: "#EAF7EE", fg: "#16A34A" },
  Live: { bg: "#FDEAEA", fg: "#DC2626" },
  Failed: { bg: "#FDEAEA", fg: "#DC2626" },
  Pending: { bg: "#FEF3E2", fg: "#F59E0B" },
  Processing: { bg: "#EAF0FE", fg: "#2563EB" },
  Disabled: { bg: "#F0EEEA", fg: "#707070" },
  Suspended: { bg: "#FDEAEA", fg: "#DC2626" },
  Completed: { bg: "#EAF7EE", fg: "#16A34A" },
  Cancelled: { bg: "#FDEAEA", fg: "#DC2626" },
  Rejected: { bg: "#FDEAEA", fg: "#DC2626" },
  Refunded: { bg: "#F0EEEA", fg: "#707070" },
  Upcoming: { bg: "#EAF0FE", fg: "#2563EB" },
  Successful: { bg: "#EAF7EE", fg: "#16A34A" },
  Open: { bg: "#FDEAEA", fg: "#DC2626" },
  Resolved: { bg: "#EAF7EE", fg: "#16A34A" },
  Critical: { bg: "#FDEAEA", fg: "#DC2626" },
  Success: { bg: "#EAF7EE", fg: "#16A34A" },
};

export function statusMeta(status: string): StatusMeta {
  return STATUS_MAP[status] || { bg: "#F0EEEA", fg: "#707070" };
}
