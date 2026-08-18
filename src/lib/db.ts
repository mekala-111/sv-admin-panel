import * as seed from "./data";
import type {
  Notification,
  Vendor,
} from "./types";

// In-memory data store standing in for a real database/backend.
// Every function here is the boundary a future Prisma/Postgres (or any other)
// implementation would slot behind — callers (route handlers, server
// components, server actions) never touch the seed arrays directly.

const vendors: Vendor[] = [...seed.vendorsSeed];
const customers = [...seed.customersSeed];
const events = [...seed.eventsSeed];
const notifications: Notification[] = [...seed.notificationsSeed];

// ---- Vendors ----
export function listVendors() {
  return vendors;
}
export function getVendor(id: number) {
  return vendors.find((v) => v.id === id) ?? null;
}
export function createVendor(input: {
  name: string;
  company: string;
  email: string;
}) {
  const id = vendors.length ? Math.max(...vendors.map((v) => v.id)) + 1 : 0;
  const vendor: Vendor = {
    id,
    name: input.name,
    company: input.company,
    email: input.email,
    events: 0,
    customers: 0,
    revenue: "₹0",
    wallet: "₹0",
    status: "Pending",
    created: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    logoId: `v-logo-${id + 1}`,
  };
  vendors.push(vendor);
  return vendor;
}

// ---- Customers ----
export function listCustomers() {
  return customers;
}
export function getCustomer(id: number) {
  return customers.find((c) => c.id === id) ?? null;
}
export function listCustomersByVendor(vendorName: string) {
  return customers.filter((c) => c.vendor === vendorName);
}

// ---- Events ----
export function listEvents() {
  return events;
}
export function getEvent(id: number) {
  return events.find((e) => e.id === id) ?? null;
}
export function listEventsByVendor(vendorName: string) {
  return events.filter((e) => e.vendor === vendorName);
}
export function listEventsByCustomer(customerName: string) {
  return events.filter((e) => e.customer === customerName);
}

// ---- Servers ----
export function listServers() {
  return seed.serversSeed;
}

// ---- Payments / Wallet ----
export function listTransactions() {
  return seed.transactionsSeed;
}
export function listWalletTx() {
  return seed.walletTxSeed;
}

// ---- Support ----
export function listTickets() {
  return seed.ticketsSeed;
}

// ---- Audit ----
export function listAuditLogs() {
  return seed.auditLogsSeed;
}

// ---- Notifications ----
export function listNotifications() {
  return notifications;
}
export function createNotification(input: {
  title: string;
  message: string;
  audience: string;
  type: Notification["category"];
}) {
  const notif: Notification = {
    id: notifications.length
      ? Math.max(...notifications.map((n) => n.id)) + 1
      : 0,
    message: input.title,
    category: input.type,
    time: "just now",
    status: "Pending",
  };
  notifications.unshift(notif);
  return notif;
}
export function listNotifTemplates() {
  return seed.notifTemplatesSeed;
}

// ---- Roles ----
export function listRoles() {
  return seed.rolesSeed;
}

// ---- Themes ----
export function listThemes() {
  return seed.themesSeed;
}
export function getTheme(id: number) {
  return seed.themesSeed.find((t) => t.id === id) ?? null;
}

// ---- Plans ----
export function listPlans() {
  return seed.plansSeed;
}
export function getPlan(name: string) {
  return seed.plansSeed.find((p) => p.name === name) ?? null;
}

// ---- YouTube ----
export function listChannels() {
  return seed.channelsSeed;
}
export function getChannel(id: number) {
  return seed.channelsSeed.find((c) => c.id === id) ?? null;
}
export function listEventStreams() {
  return seed.eventStreamsSeed;
}
export function getEventStream(id: number) {
  return seed.eventStreamsSeed.find((e) => e.id === id) ?? null;
}

// ---- Recordings ----
export function listRecordings() {
  return seed.recordingsSeed;
}

// ---- Live now ----
export function listLiveNow() {
  return seed.liveNowSeed;
}

// ---- Profile ----
export function listSessions() {
  return seed.sessionsSeed;
}
export function listLoginHistory() {
  return seed.loginHistorySeed;
}

// ---- Analytics ----
export function getAnalyticsStats(tab: string) {
  return seed.analyticsStatsByTab[tab] ?? seed.analyticsStatsByTab.Platform;
}
export function getAnalyticsBreakdown(tab: string) {
  return (
    seed.analyticsBreakdownByTab[tab] ?? seed.analyticsBreakdownByTab.Platform
  );
}
