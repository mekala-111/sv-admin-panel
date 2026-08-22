import { apiFetch, formatINR, mapVendorStatus, mapEventStatus, mapPaymentStatus, fmtDate, USER_COOKIE } from "./api";
import { resolveThemeFields } from "@/themes/theme-templates";
import type {
  AuditLog,
  Channel,
  Customer,
  Event,
  EventStream,
  LiveNowItem,
  Notification,
  Plan,
  Recording,
  Role,
  Server,
  Theme,
  Ticket,
  Transaction,
  Vendor,
  WalletTx,
} from "./types";

type BackendVendor = {
  id: string;
  companyName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: string;
  createdAt?: string;
  logo?: string | null;
  eventCreationFee?: number;
  liveEventCreationFee?: number;
  invitationCreationFee?: number;
};

type BackendCustomer = {
  id: string;
  name: string;
  email?: string | null;
  status: string;
  createdAt?: string;
  vendorId: string;
};

type BackendEvent = {
  id: string;
  eventName: string;
  status: string;
  eventDate?: string | null;
  vendorId: string;
  customerId?: string | null;
  coverImage?: string | null;
};

type BackendPayment = {
  id: string;
  amount: number;
  gateway: string;
  status: string;
  createdAt?: string;
  paidAt?: string | null;
  vendorId?: string | null;
  customerId?: string | null;
  eventId?: string | null;
  purpose?: string | null;
  utrNumber?: string | null;
  paymentImage?: string | null;
  rejectionReason?: string | null;
  gatewayTransactionId?: string | null;
};

async function safeList<T>(fn: () => Promise<T[]>, fallback: T[] = []): Promise<T[]> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

// ---- Vendors ----
export async function listVendors(): Promise<Vendor[]> {
  return safeList(async () => {
    const [{ data: vendors }, { data: events }, { data: customers }] = await Promise.all([
      apiFetch<BackendVendor[]>("/vendors?limit=100"),
      apiFetch<{ vendorId: string }[]>("/events?limit=100"),
      apiFetch<{ vendorId: string }[]>("/customers?limit=100"),
    ]);
    const eventCounts = new Map<string, number>();
    for (const e of events ?? []) {
      eventCounts.set(e.vendorId, (eventCounts.get(e.vendorId) ?? 0) + 1);
    }
    const customerCounts = new Map<string, number>();
    for (const c of customers ?? []) {
      customerCounts.set(c.vendorId, (customerCounts.get(c.vendorId) ?? 0) + 1);
    }
    return (vendors ?? []).map((v, i) => ({
      id: v.id,
      _id: v.id,
      name: v.companyName,
      company: v.companyName,
      email: v.email ?? "",
      events: eventCounts.get(v.id) ?? 0,
      customers: customerCounts.get(v.id) ?? 0,
      revenue: "—",
      wallet: "—",
      eventCreationFee: Number(v.eventCreationFee ?? 0),
      liveEventCreationFee: Number(v.liveEventCreationFee ?? v.eventCreationFee ?? 0),
      invitationCreationFee: Number(v.invitationCreationFee ?? v.eventCreationFee ?? 0),
      status: mapVendorStatus(v.status),
      created: fmtDate(v.createdAt),
      logoId: v.logo || `v-logo-${i + 1}`,
    }));
  });
}

export async function getVendor(id: string | number): Promise<(Vendor & { _id?: string }) | null> {
  try {
    const vendorId = String(id);
    const [{ data }, { data: wallet }, { data: events }, { data: customers }, { data: payments }] =
      await Promise.all([
        apiFetch<BackendVendor>(`/vendors/${vendorId}`),
        apiFetch<{ balance?: number }>(`/wallet/${vendorId}`).catch(() => ({ data: { balance: 0 } })),
        apiFetch<{ vendorId: string }[]>("/events?limit=100"),
        apiFetch<{ vendorId: string }[]>("/customers?limit=100"),
        apiFetch<BackendPayment[]>("/payments?limit=100").catch(() => ({ data: [] as BackendPayment[] })),
      ]);
    const eventCount = (events ?? []).filter((e) => e.vendorId === vendorId).length;
    const customerCount = (customers ?? []).filter((c) => c.vendorId === vendorId).length;
    const revenue = (payments ?? [])
      .filter((p) => p.vendorId === vendorId && p.status === "SUCCESS")
      .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
    return {
      id: data.id,
      name: data.companyName,
      company: data.companyName,
      email: data.email ?? "",
      phone: data.phone ?? "",
      address: data.address ?? "",
      events: eventCount,
      customers: customerCount,
      revenue: formatINR(revenue),
      wallet: formatINR(wallet?.balance ?? 0),
      eventCreationFee: Number(data.eventCreationFee ?? 0),
      liveEventCreationFee: Number(data.liveEventCreationFee ?? data.eventCreationFee ?? 0),
      invitationCreationFee: Number(data.invitationCreationFee ?? data.eventCreationFee ?? 0),
      status: mapVendorStatus(data.status),
      created: fmtDate(data.createdAt),
      logoId: data.logo || "v-logo-1",
      _id: data.id,
    };
  } catch {
    return null;
  }
}

export async function createVendor(input: {
  name: string;
  company: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  eventCreationFee?: number;
  liveEventCreationFee?: number;
  invitationCreationFee?: number;
  initialWalletCredit?: number;
}): Promise<Vendor> {
  const { data } = await apiFetch<BackendVendor>("/vendors", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      companyName: input.company,
      email: input.email,
      password: input.password || `Temp${Date.now()}!`,
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.address ? { address: input.address } : {}),
      liveEventCreationFee: Number(input.liveEventCreationFee ?? input.eventCreationFee ?? 0),
      invitationCreationFee: Number(input.invitationCreationFee ?? input.eventCreationFee ?? 0),
      eventCreationFee: Number(input.eventCreationFee ?? 0),
      initialWalletCredit: Number(input.initialWalletCredit ?? 0),
    }),
  });
  return {
    id: data.id,
    name: data.companyName,
    company: data.companyName,
    email: data.email ?? input.email,
    events: 0,
    customers: 0,
    revenue: "—",
    wallet: "—",
    eventCreationFee: Number(data.eventCreationFee ?? input.eventCreationFee ?? 0),
    liveEventCreationFee: Number(
      data.liveEventCreationFee ?? input.liveEventCreationFee ?? input.eventCreationFee ?? 0
    ),
    invitationCreationFee: Number(
      data.invitationCreationFee ?? input.invitationCreationFee ?? input.eventCreationFee ?? 0
    ),
    status: mapVendorStatus(data.status),
    created: fmtDate(data.createdAt),
    logoId: "v-logo-new",
  };
}

export async function updateVendor(
  id: string,
  input: {
    companyName?: string;
    email?: string;
    phone?: string;
    address?: string;
    eventCreationFee?: number;
    liveEventCreationFee?: number;
    invitationCreationFee?: number;
  }
) {
  const { data } = await apiFetch<BackendVendor>(`/vendors/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data;
}

/** Admin platform wallet: receives event-creation fees from vendors. */
export async function getPlatformRevenue() {
  try {
    const { data } = await apiFetch<{
      balance: number;
      currency?: string;
      recentFees?: BackendPayment[];
    }>("/payments/platform-revenue");
    return {
      balance: formatINR(data.balance ?? 0),
      balanceRaw: Number(data.balance ?? 0),
      recentFees: (data.recentFees ?? []).map((p) => ({
        id: p.id,
        amount: formatINR(p.amount),
        vendorId: p.vendorId ?? "—",
        date: fmtDate(p.paidAt || p.createdAt),
        gateway: p.gateway,
      })),
    };
  } catch {
    return { balance: formatINR(0), balanceRaw: 0, recentFees: [] as { id: string; amount: string; vendorId: string; date: string; gateway: string }[] };
  }
}

export async function setVendorStatus(id: string, status: "ACTIVE" | "SUSPENDED" | "INACTIVE") {
  const { data } = await apiFetch<BackendVendor>(`/vendors/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return data;
}

// ---- Customers ----
export async function listCustomers(): Promise<Customer[]> {
  return safeList(async () => {
    const [{ data }, { data: vendors }, { data: payments }] = await Promise.all([
      apiFetch<(BackendCustomer & { eventsCount?: number })[]>("/customers?limit=100"),
      apiFetch<BackendVendor[]>("/vendors?limit=100"),
      apiFetch<BackendPayment[]>("/payments?limit=100").catch(() => ({ data: [] as BackendPayment[] })),
    ]);
    const vendorName = new Map((vendors ?? []).map((v) => [v.id, v.companyName]));
    const spendByCustomer = new Map<string, number>();
    for (const p of payments ?? []) {
      if (p.status !== "SUCCESS" || !p.customerId) continue;
      spendByCustomer.set(p.customerId, (spendByCustomer.get(p.customerId) ?? 0) + Number(p.amount ?? 0));
    }
    return (data ?? []).map((c, i) => ({
      id: c.id,
      name: c.name,
      vendor: vendorName.get(c.vendorId) ?? c.vendorId,
      events: c.eventsCount ?? 0,
      spending: formatINR(spendByCustomer.get(c.id) ?? 0),
      lastEvent: "—",
      status: c.status === "ACTIVE" ? "Active" : "Disabled",
      joined: fmtDate(c.createdAt),
      avatarId: `c-av-${i + 1}`,
      _id: c.id,
    })) as Customer[];
  });
}

export async function getCustomer(id: string | number): Promise<Customer | null> {
  try {
    const customerId = String(id);
    const [{ data }, { data: vendors }, { data: payments }, { data: events }] = await Promise.all([
      apiFetch<BackendCustomer & { eventsCount?: number }>(`/customers/${customerId}`),
      apiFetch<BackendVendor[]>("/vendors?limit=100"),
      apiFetch<BackendPayment[]>("/payments?limit=100").catch(() => ({ data: [] as BackendPayment[] })),
      apiFetch<{ customerId?: string | null }[]>("/events?limit=100"),
    ]);
    const vendor = (vendors ?? []).find((v) => v.id === data.vendorId);
    const spend = (payments ?? [])
      .filter((p) => p.customerId === customerId && p.status === "SUCCESS")
      .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
    const eventCount =
      data.eventsCount ?? (events ?? []).filter((e) => e.customerId === customerId).length;
    return {
      id: data.id,
      name: data.name,
      vendor: vendor?.companyName ?? data.vendorId,
      events: eventCount,
      spending: formatINR(spend),
      lastEvent: "—",
      status: data.status === "ACTIVE" ? "Active" : "Disabled",
      joined: fmtDate(data.createdAt),
      avatarId: "c-av-1",
    };
  } catch {
    return null;
  }
}

export async function listCustomersByVendor(vendorName: string) {
  const all = await listCustomers();
  return all.filter((c) => c.vendor === vendorName);
}

// ---- Events ----
export async function listEvents(): Promise<Event[]> {
  return safeList(async () => {
    const [{ data }, { data: vendors }, { data: customers }, { data: payments }] = await Promise.all([
      apiFetch<BackendEvent[]>("/events?limit=100"),
      apiFetch<BackendVendor[]>("/vendors?limit=100"),
      apiFetch<BackendCustomer[]>("/customers?limit=100"),
      apiFetch<BackendPayment[]>("/payments?limit=100").catch(() => ({ data: [] as BackendPayment[] })),
    ]);
    const vendorName = new Map((vendors ?? []).map((v) => [v.id, v.companyName]));
    const customerName = new Map((customers ?? []).map((c) => [c.id, c.name]));
    const revenueByEvent = new Map<string, number>();
    for (const p of payments ?? []) {
      if (p.status !== "SUCCESS" || !p.eventId) continue;
      revenueByEvent.set(p.eventId, (revenueByEvent.get(p.eventId) ?? 0) + Number(p.amount ?? 0));
    }
    return (data ?? []).map((e, i) => ({
      id: e.id,
      name: e.eventName,
      customer: (e.customerId && customerName.get(e.customerId)) || e.customerId || "—",
      vendor: vendorName.get(e.vendorId) ?? e.vendorId,
      date: fmtDate(e.eventDate),
      duration: "—",
      viewers: 0,
      peak: 0,
      revenue: formatINR(revenueByEvent.get(e.id) ?? 0),
      status: mapEventStatus(e.status),
      heroId: e.coverImage || `e-hero-${(i % 6) + 1}`,
      _id: e.id,
    })) as Event[];
  });
}

export async function getEvent(id: string | number): Promise<Event | null> {
  try {
    const eventId = String(id);
    const [{ data }, { data: vendors }, { data: customers }, { data: payments }] = await Promise.all([
      apiFetch<BackendEvent & { themeConfig?: unknown; media?: unknown }>(`/events/${eventId}`),
      apiFetch<BackendVendor[]>("/vendors?limit=100"),
      apiFetch<BackendCustomer[]>("/customers?limit=100"),
      apiFetch<BackendPayment[]>("/payments?limit=100").catch(() => ({ data: [] as BackendPayment[] })),
    ]);
    const vendor = (vendors ?? []).find((v) => v.id === data.vendorId);
    const customer = data.customerId
      ? (customers ?? []).find((c) => c.id === data.customerId)
      : undefined;
    const revenue = (payments ?? [])
      .filter((p) => p.eventId === eventId && p.status === "SUCCESS")
      .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
    return {
      id: data.id,
      name: data.eventName,
      customer: customer?.name ?? data.customerId ?? "—",
      vendor: vendor?.companyName ?? data.vendorId,
      date: fmtDate(data.eventDate),
      duration: "—",
      viewers: 0,
      peak: 0,
      revenue: formatINR(revenue),
      status: mapEventStatus(data.status),
      heroId: data.coverImage || "e-hero-1",
    };
  } catch {
    return null;
  }
}

export async function listEventsByVendor(vendorName: string) {
  const all = await listEvents();
  return all.filter((e) => e.vendor === vendorName);
}

export async function listEventsByCustomer(customerName: string) {
  const all = await listEvents();
  return all.filter((e) => e.customer === customerName);
}

export async function listServers(): Promise<Server[]> {
  return [];
}

export async function listTransactions(): Promise<Transaction[]> {
  return safeList(async () => {
    const [{ data }, { data: vendors }, { data: customers }, { data: events }] = await Promise.all([
      apiFetch<BackendPayment[]>("/payments?limit=100"),
      apiFetch<BackendVendor[]>("/vendors?limit=100"),
      apiFetch<BackendCustomer[]>("/customers?limit=100"),
      apiFetch<BackendEvent[]>("/events?limit=100"),
    ]);
    const vendorName = new Map((vendors ?? []).map((v) => [v.id, v.companyName]));
    const customerName = new Map((customers ?? []).map((c) => [c.id, c.name]));
    const eventName = new Map((events ?? []).map((e) => [e.id, e.eventName]));
    return (data ?? []).map((p) => ({
      id: p.id,
      customer: (p.customerId && customerName.get(p.customerId)) || p.customerId || "—",
      vendor: (p.vendorId && vendorName.get(p.vendorId)) || p.vendorId || "—",
      event: (p.eventId && eventName.get(p.eventId)) || p.eventId || "—",
      amount: formatINR(p.amount),
      gateway: p.gateway,
      date: fmtDate(p.paidAt || p.createdAt),
      status: mapPaymentStatus(p.status),
      purpose: p.purpose ?? undefined,
      utrNumber: p.utrNumber || p.gatewayTransactionId || undefined,
      paymentImage: p.paymentImage || undefined,
      rejectionReason: p.rejectionReason || undefined,
    }));
  });
}

export async function listPendingEventCreationPayments() {
  try {
    const { data } = await apiFetch<BackendPayment[]>(
      "/payments?purpose=EVENT_CREATION&status=PENDING"
    );
    const [{ data: vendors }, { data: events }] = await Promise.all([
      apiFetch<BackendVendor[]>("/vendors?limit=100"),
      apiFetch<BackendEvent[]>("/events?limit=100"),
    ]);
    const vendorName = new Map((vendors ?? []).map((v) => [v.id, v.companyName]));
    const eventName = new Map((events ?? []).map((e) => [e.id, e.eventName]));
    return (data ?? []).map((p) => ({
      id: p.id,
      vendor: (p.vendorId && vendorName.get(p.vendorId)) || p.vendorId || "—",
      event: (p.eventId && eventName.get(p.eventId)) || p.eventId || "—",
      amount: formatINR(p.amount),
      utrNumber: p.utrNumber || p.gatewayTransactionId || "—",
      paymentImage: p.paymentImage || "",
      date: fmtDate(p.createdAt),
    }));
  } catch {
    return [];
  }
}

export async function approveEventCreationPayment(id: string) {
  const { data } = await apiFetch(`/payments/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return data;
}

export async function rejectEventCreationPayment(id: string, reason?: string) {
  const { data } = await apiFetch(`/payments/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason: reason || "Payment rejected by admin" }),
  });
  return data;
}

export async function upsertSetting(key: string, value: unknown) {
  const { data } = await apiFetch(`/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
  return data;
}

export async function getPaymentSettings() {
  const map = await listSettingsMap();
  return {
    payeeName: String(map["payment.payeeName"] ?? ""),
    qrImage: String(map["payment.qrImage"] ?? ""),
    instructions: String(map["payment.instructions"] ?? ""),
  };
}

export async function listWalletTx(): Promise<WalletTx[]> {
  return safeList(async () => {
    const vendors = await listVendors();
    const rows: WalletTx[] = [];
    await Promise.all(
      vendors.slice(0, 50).map(async (v) => {
        try {
          const { data: txs } = await apiFetch<
            { type: string; amount: number; description?: string | null; createdAt?: string }[]
          >(`/wallet/${v.id}/transactions`);
          for (const t of txs ?? []) {
            rows.push({
              type:
                t.type === "CREDIT"
                  ? "Credit"
                  : t.type === "REFUND"
                    ? "Refund"
                    : t.type === "ADJUSTMENT"
                      ? "Adjustment"
                      : "Debit",
              vendor: v.company || v.name,
              amount: `${t.type === "DEBIT" ? "-" : "+"} ${formatINR(t.amount)}`,
              date: fmtDate(t.createdAt),
            });
          }
        } catch {
          /* skip */
        }
      })
    );
    return rows;
  });
}

export async function getWalletPlatformStats() {
  const vendors = await listVendors();
  let total = 0;
  await Promise.all(
    vendors.map(async (v) => {
      try {
        const { data } = await apiFetch<{ balance: number }>(`/wallet/${v.id}`);
        total += Number(data?.balance ?? 0);
      } catch {
        /* skip */
      }
    })
  );
  return {
    totalPlatform: formatINR(total),
    vendorWallets: formatINR(total),
    pending: formatINR(0),
    vendorCount: vendors.length,
  };
}

export async function getPaymentStats() {
  try {
    const { data } = await apiFetch<BackendPayment[]>("/payments");
    const list = data ?? [];
    const success = list.filter((p) => p.status === "SUCCESS");
    const pending = list.filter((p) => p.status === "PENDING");
    const refunded = list.filter((p) => p.status === "REFUNDED");
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todaySum = success
      .filter((p) => new Date(p.paidAt || p.createdAt || 0) >= startOfDay)
      .reduce((s, p) => s + Number(p.amount), 0);
    return {
      todayRevenue: formatINR(todaySum),
      monthlyRevenue: formatINR(success.reduce((s, p) => s + Number(p.amount), 0)),
      pending: formatINR(pending.reduce((s, p) => s + Number(p.amount), 0)),
      refunds: formatINR(refunded.reduce((s, p) => s + Number(p.amount), 0)),
      count: list.length,
    };
  } catch {
    return {
      todayRevenue: formatINR(0),
      monthlyRevenue: formatINR(0),
      pending: formatINR(0),
      refunds: formatINR(0),
      count: 0,
    };
  }
}

export async function getRevenueSummary() {
  try {
    const { data } = await apiFetch<{ totalRevenue: number; successfulPayments: number }>(
      "/reports/revenue-summary"
    );
    return {
      totalRevenue: formatINR(data.totalRevenue ?? 0),
      totalRevenueRaw: Number(data.totalRevenue ?? 0),
      successfulPayments: data.successfulPayments ?? 0,
    };
  } catch {
    return { totalRevenue: formatINR(0), totalRevenueRaw: 0, successfulPayments: 0 };
  }
}

export async function listTickets(): Promise<Ticket[]> {
  return safeList(async () => {
    const { data } = await apiFetch<
      {
        id: string;
        ticketCode: string;
        subject: string;
        category: string;
        priority: string;
        status: string;
        assignedTo?: string | null;
        vendorId?: string | null;
        customerId?: string | null;
      }[]
    >("/support/tickets");
    return (data ?? []).map((t) => ({
      id: t.ticketCode || t.id,
      customer: t.customerId ?? "—",
      vendor: t.vendorId ?? "—",
      category: t.category,
      priority: (t.priority?.[0] + t.priority?.slice(1).toLowerCase()) as Ticket["priority"],
      assigned: t.assignedTo ?? "Unassigned",
      status: t.status === "OPEN" ? "Open" : t.status === "RESOLVED" ? "Resolved" : t.status === "CRITICAL" ? "Critical" : "Pending",
    }));
  });
}

export async function listAuditLogs(): Promise<AuditLog[]> {
  return safeList(async () => {
    const { data } = await apiFetch<
      {
        userId?: string | null;
        action: string;
        module: string;
        ipAddress?: string | null;
        createdAt?: string;
        newData?: unknown;
      }[]
    >("/admin/audit-logs");
    return (data ?? []).map((a) => ({
      user: a.userId ?? "System",
      action: a.action,
      module: a.module,
      ip: a.ipAddress ?? "—",
      date: fmtDate(a.createdAt),
      details: typeof a.newData === "string" ? a.newData : JSON.stringify(a.newData ?? {}),
    }));
  });
}

export async function listNotifications(): Promise<Notification[]> {
  return safeList(async () => {
    const { data } = await apiFetch<{ id: string; title: string; type: string; createdAt?: string; isRead: boolean }[]>(
      "/notifications"
    );
    return (data ?? []).map((n, i) => ({
      id: n.id || i,
      message: n.title,
      category: "System" as const,
      time: fmtDate(n.createdAt),
      status: n.isRead ? "Active" : "Pending",
    }));
  });
}

export async function createNotification(input: {
  title: string;
  message: string;
  audience: string;
  type: Notification["category"];
}): Promise<Notification> {
  return {
    id: Date.now(),
    message: input.title,
    category: input.type,
    time: "just now",
    status: "Pending",
  };
}

export async function listNotifTemplates() {
  return [] as { name: string; preview: string }[];
}

export async function listRoles(): Promise<Role[]> {
  try {
    const { data: users } = await apiFetch<{ role: string }[]>("/admin/users");
    const counts: Record<string, number> = {};
    for (const u of users ?? []) {
      counts[u.role] = (counts[u.role] ?? 0) + 1;
    }
    return [
      { name: "Super Admin", desc: "Full platform access", users: counts.SUPER_ADMIN ?? 0 },
      { name: "Admin", desc: "Manage vendors & events", users: counts.ADMIN ?? 0 },
      { name: "Vendor", desc: "Own customers & events", users: counts.VENDOR ?? 0 },
      { name: "Customer", desc: "Own events", users: counts.CUSTOMER ?? 0 },
    ];
  } catch {
    return [];
  }
}

export async function listPermissionsMatrix() {
  try {
    const { data } = await apiFetch<{ code: string; module: string }[]>("/admin/permissions");
    const byModule = new Map<string, string[]>();
    for (const p of data ?? []) {
      const list = byModule.get(p.module) ?? [];
      list.push(p.code);
      byModule.set(p.module, list);
    }
    return Array.from(byModule.entries()).map(([module, codes]) => ({ module, codes }));
  } catch {
    return [];
  }
}

export async function listSettingsMap() {
  try {
    const { data } = await apiFetch<{ key: string; value: unknown }[]>("/settings");
    const map: Record<string, unknown> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    return map;
  } catch {
    return {} as Record<string, unknown>;
  }
}

export async function getSessionUser() {
  try {
    const { cookies } = await import("next/headers");
    const raw = (await cookies()).get(USER_COOKIE)?.value;
    if (!raw) return null;
    return JSON.parse(raw) as { id: string; name: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function listThemes(): Promise<Theme[]> {
  return safeList(async () => {
    const { data } = await apiFetch<
      {
        id: string;
        name: string;
        slug?: string;
        status: string;
        previewImage?: string | null;
        config?: { colors?: { primary?: string; secondary?: string }; layout?: string; fields?: unknown[] };
        category?: { name?: string } | null;
        categoryId?: string | null;
      }[]
    >("/themes");
    return (data ?? []).map((t, i) => ({
      id: t.id,
      name: t.name,
      category: t.category?.name ?? t.categoryId ?? "General",
      vendors: 0,
      status: t.status === "ACTIVE" ? "Available" : t.status === "DRAFT" ? "Draft" : "Disabled",
      imgId: t.previewImage || `th-${(i % 8) + 1}`,
      primary: t.config?.colors?.primary ?? "#FF7A00",
      secondary: t.config?.colors?.secondary ?? "#F52222",
      _id: t.id,
      slug: t.slug,
      layout: t.config?.layout,
      fieldCount: resolveThemeFields(
        t.config as { layout?: string; fields?: import("@/themes/theme-templates").ThemeFieldDef[] } | null
      ).length,
    })) as Theme[];
  });
}

export type ThemeCategoryRow = { id: string; name: string; slug?: string };

export async function listThemeCategories(): Promise<ThemeCategoryRow[]> {
  return safeList(async () => {
    const { data } = await apiFetch<{ id: string; name: string; slug?: string }[]>("/themes/categories");
    return (data ?? []).map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  });
}

export type ThemeAssignmentRow = {
  id: string;
  vendorId: string;
  themeId: string;
  isEnabled: boolean;
  vendor?: { id: string; companyName?: string; vendorCode?: string } | null;
  theme?: { id: string; name?: string; slug?: string; status?: string } | null;
};

export async function listThemeAssignments(): Promise<ThemeAssignmentRow[]> {
  return safeList(async () => {
    const { data } = await apiFetch<
      {
        id: string;
        vendorId: string;
        themeId: string;
        isEnabled?: boolean;
        vendor?: { id: string; companyName?: string; vendorCode?: string } | null;
        theme?: { id: string; name?: string; slug?: string; status?: string } | null;
      }[]
    >("/themes/assignments");
    return (data ?? []).map((row) => ({
      id: row.id,
      vendorId: row.vendorId,
      themeId: row.themeId,
      isEnabled: row.isEnabled !== false,
      vendor: row.vendor ?? null,
      theme: row.theme ?? null,
    }));
  });
}

export async function getTheme(id: string | number): Promise<
  (Theme & {
    slug?: string;
    layout?: string;
    fontFamily?: string;
    colors?: Record<string, string>;
    previewImage?: string | null;
    config?: import("@/themes/theme-templates").ThemeConfig | null;
  }) | null
> {
  if (String(id) === "0" || String(id) === "new") return null;
  try {
    const { data } = await apiFetch<{
      id: string;
      name: string;
      slug?: string;
      status: string;
      previewImage?: string | null;
      config?: import("@/themes/theme-templates").ThemeConfig | null;
      category?: { name?: string } | null;
      categoryId?: string | null;
    }>(`/themes/${id}`);
    return {
      id: data.id,
      name: data.name,
      category: data.category?.name ?? data.categoryId ?? "General",
      vendors: 0,
      status: data.status === "ACTIVE" ? "Available" : data.status === "DRAFT" ? "Draft" : "Disabled",
      imgId: data.previewImage || "th-1",
      primary: data.config?.colors?.primary ?? "#FF7A00",
      secondary: data.config?.colors?.secondary ?? "#F52222",
      slug: data.slug,
      layout: data.config?.layout,
      previewImage: data.previewImage ?? null,
      fontFamily: data.config?.fontFamily,
      colors: data.config?.colors as Record<string, string> | undefined,
      config: data.config ?? null,
      categoryId: data.categoryId ?? null,
    };
  } catch {
    return null;
  }
}

export async function listPlans(): Promise<Plan[]> {
  return safeList(async () => {
    const { data } = await apiFetch<
      {
        name: string;
        price: number;
        eventLimit: number;
        hoursLimit: number;
        storageGb: number;
        viewerLimit: number;
        features?: { recording?: string; branding?: boolean; support?: string };
      }[]
    >("/plans");
    return (data ?? []).map((p) => ({
      name: p.name,
      price: p.price ? formatINR(p.price) + "/mo" : "Custom",
      eventLimit: p.eventLimit < 0 ? "Unlimited" : `${p.eventLimit} / month`,
      hours: p.hoursLimit < 0 ? "Unlimited" : `${p.hoursLimit} hrs`,
      storage: p.storageGb >= 1000 ? `${p.storageGb / 1000} TB` : `${p.storageGb} GB`,
      viewerLimit: p.viewerLimit < 0 ? "Unlimited" : String(p.viewerLimit),
      recording: p.features?.recording ?? "Basic",
      branding: p.features?.branding ? "Custom Logo" : "—",
      support: p.features?.support ?? "Email",
    }));
  });
}

export async function getPlan(name: string) {
  const plans = await listPlans();
  return plans.find((p) => p.name === name) ?? null;
}

export async function listChannels(): Promise<Channel[]> {
  return safeList(async () => {
    const { data } = await apiFetch<
      {
        id: string;
        channelName?: string | null;
        channelId: string;
        vendorId: string;
        vendorName?: string | null;
        status: string;
        createdAt?: string;
        updatedAt?: string;
        tokenExpiry?: string | null;
        streamsCount?: number;
        liveStreamsCount?: number;
      }[]
    >("/youtube/channels");
    return (data ?? []).map((c) => ({
      id: c.id,
      name: c.channelName || c.channelId,
      vendor: c.vendorName || c.vendorId || "—",
      channelId: c.channelId,
      connectedDate: fmtDate(c.createdAt),
      status: c.status === "CONNECTED" ? "Active" : "Pending",
      totalStreams: c.streamsCount ?? 0,
      liveStreams: c.liveStreamsCount ?? 0,
      lastSync: fmtDate(c.updatedAt || c.tokenExpiry || c.createdAt),
      _id: c.id,
    })) as Channel[];
  });
}

export async function getChannel(id: string | number) {
  try {
    const { data } = await apiFetch<{
      id: string;
      channelName?: string | null;
      channelId: string;
      vendorId: string;
      vendorName?: string | null;
      status: string;
      createdAt?: string;
      updatedAt?: string;
      tokenExpiry?: string | null;
      streamsCount?: number;
      liveStreamsCount?: number;
    }>(`/youtube/channels/${id}`);
    return {
      id: data.id,
      name: data.channelName || data.channelId,
      vendor: data.vendorName || data.vendorId || "—",
      channelId: data.channelId,
      connectedDate: fmtDate(data.createdAt),
      status: data.status === "CONNECTED" ? ("Active" as const) : ("Pending" as const),
      totalStreams: data.streamsCount ?? 0,
      liveStreams: data.liveStreamsCount ?? 0,
      lastSync: fmtDate(data.updatedAt || data.tokenExpiry || data.createdAt),
      _id: data.id,
    };
  } catch {
    const channels = await listChannels();
    return channels.find((c) => String(c.id) === String(id)) ?? null;
  }
}

function mapStreamStatus(status?: string): EventStream["status"] {
  if (status === "LIVE") return "Live";
  if (status === "SCHEDULED" || status === "CONNECTED") return "Upcoming";
  if (status === "ERROR") return "Error";
  return "Completed";
}

export async function listEventStreams(): Promise<EventStream[]> {
  return safeList(async () => {
    const { data } = await apiFetch<
      {
        id: string;
        eventId: string;
        youtubeVideoId?: string | null;
        youtubeLiveUrl?: string | null;
        status: string;
        startedAt?: string | null;
        scheduledAt?: string | null;
        createdAt?: string;
        viewCount?: number;
        event?: { eventName?: string } | null;
        vendorName?: string | null;
        customerName?: string | null;
        channelName?: string | null;
      }[]
    >("/youtube/streams");
    return (data ?? []).map((s) => ({
      id: s.id,
      event: s.event?.eventName ?? s.eventId,
      vendor: s.vendorName ?? "—",
      customer: s.customerName ?? "—",
      channel: s.channelName ?? "—",
      videoId: s.youtubeVideoId ?? "—",
      liveUrl: s.youtubeLiveUrl ?? null,
      status: mapStreamStatus(s.status),
      date: fmtDate(s.startedAt || s.scheduledAt || s.createdAt),
      views: s.viewCount ?? 0,
      _id: s.id,
    })) as EventStream[];
  });
}

export async function getEventStream(id: string | number) {
  try {
    const { data } = await apiFetch<{
      id: string;
      eventId: string;
      youtubeVideoId?: string | null;
      youtubeLiveUrl?: string | null;
      status: string;
      startedAt?: string | null;
      scheduledAt?: string | null;
      createdAt?: string;
      viewCount?: number;
      event?: { eventName?: string; id?: string } | null;
      vendorName?: string | null;
      customerName?: string | null;
      channelName?: string | null;
    }>(`/youtube/streams/${id}`);
    return {
      id: data.id,
      event: data.event?.eventName ?? data.eventId,
      vendor: data.vendorName ?? "—",
      customer: data.customerName ?? "—",
      channel: data.channelName ?? "—",
      videoId: data.youtubeVideoId ?? "—",
      liveUrl: data.youtubeLiveUrl ?? null,
      status: mapStreamStatus(data.status),
      date: fmtDate(data.startedAt || data.scheduledAt || data.createdAt),
      views: data.viewCount ?? 0,
      _id: data.id,
    };
  } catch {
    const streams = await listEventStreams();
    return streams.find((s) => String(s.id) === String(id)) ?? null;
  }
}

export async function getYoutubeOverview() {
  const [channels, streams] = await Promise.all([listChannels(), listEventStreams()]);
  return {
    connectedChannels: channels.filter((c) => c.status === "Active").length,
    liveStreams: streams.filter((s) => s.status === "Live").length,
    upcomingStreams: streams.filter((s) => s.status === "Upcoming").length,
    completedStreams: streams.filter((s) => s.status === "Completed").length,
  };
}

export async function listRecordings(): Promise<Recording[]> {
  return safeList(async () => {
    const [{ data }, { data: events }, { data: vendors }] = await Promise.all([
      apiFetch<{ eventId: string; vendorId: string; sizeBytes?: number }[]>("/recordings"),
      apiFetch<BackendEvent[]>("/events?limit=100"),
      apiFetch<BackendVendor[]>("/vendors?limit=100"),
    ]);
    const eventName = new Map((events ?? []).map((e) => [e.id, e.eventName]));
    const vendorName = new Map((vendors ?? []).map((v) => [v.id, v.companyName]));
    return (data ?? []).map((r) => ({
      event: eventName.get(r.eventId) ?? r.eventId,
      vendor: vendorName.get(r.vendorId) ?? r.vendorId,
      size: r.sizeBytes ? `${(r.sizeBytes / 1e9).toFixed(1)} GB` : "—",
      storage: "Cloud",
    }));
  });
}

export async function listLiveNow(): Promise<LiveNowItem[]> {
  const events = await listEvents();
  return events
    .filter((e) => e.status === "Live")
    .map((e) => ({
      name: e.name,
      vendor: e.vendor,
      viewers: String(e.viewers),
      imgId: e.heroId,
    }));
}

export async function listSessions() {
  const user = await getSessionUser();
  if (!user) return [];
  return [{ device: "Current browser session", location: "—", lastActive: "Active now" }];
}

export async function listLoginHistory(): Promise<
  { date: string; ip: string; device: string; location: string; status: string }[]
> {
  return [];
}

export async function getAnalyticsStats(_tab: string) {
  try {
    const { data } = await apiFetch<{
      vendors: number;
      customers: number;
      events: number;
      liveEvents: number;
      revenue?: number;
    }>("/admin/analytics");
    return [
      { label: "Vendors", value: String(data.vendors ?? 0) },
      { label: "Customers", value: String(data.customers ?? 0) },
      { label: "Events", value: String(data.events ?? 0) },
      { label: "Live", value: String(data.liveEvents ?? 0) },
    ];
  } catch {
    return [];
  }
}

export async function getAnalyticsBreakdown(_tab: string) {
  try {
    const { data } = await apiFetch<{ status: string; count: number }[] | Record<string, number>>(
      "/reports/events-summary"
    );
    if (Array.isArray(data)) {
      return data.map((row) => ({ label: row.status, value: row.count }));
    }
    return Object.entries(data ?? {}).map(([label, value]) => ({ label, value: Number(value) }));
  } catch {
    return [];
  }
}

export async function getAdminOverview() {
  try {
    const { data } = await apiFetch<{
      vendors: number;
      customers: number;
      events: number;
      liveEvents: number;
      pendingVendors: number;
    }>("/admin/overview");
    return data;
  } catch {
    return { vendors: 0, customers: 0, events: 0, liveEvents: 0, pendingVendors: 0 };
  }
}
