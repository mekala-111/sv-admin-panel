export type Vendor = {
  id: string | number;
  name: string;
  company: string;
  email: string;
  phone?: string;
  address?: string;
  events: number;
  customers: number;
  revenue: string;
  wallet: string;
  /** @deprecated Legacy single fee — use liveEventCreationFee / invitationCreationFee */
  eventCreationFee?: number;
  liveEventCreationFee?: number;
  invitationCreationFee?: number;
  status: "Active" | "Pending" | "Suspended";
  created: string;
  logoId: string;
};

export type Customer = {
  id: string | number;
  name: string;
  vendor: string;
  events: number;
  spending: string;
  lastEvent: string;
  status: "Active" | "Disabled";
  joined: string;
  avatarId: string;
};

export type Event = {
  id: string | number;
  name: string;
  customer: string;
  vendor: string;
  date: string;
  duration: string;
  viewers: number;
  peak: number;
  revenue: string;
  status: "Live" | "Completed" | "Upcoming" | "Cancelled";
  heroId: string;
};

export type Server = {
  name: string;
  location: string;
  cpu: number;
  ram: number;
  network: number;
  status: string;
};

export type Transaction = {
  id: string;
  customer: string;
  vendor: string;
  event: string;
  amount: string;
  gateway: string;
  date: string;
  status: "Successful" | "Pending" | "Failed" | "Refunded";
  purpose?: string;
  utrNumber?: string;
  paymentImage?: string;
  rejectionReason?: string;
};

export type WalletTx = {
  type: "Credit" | "Debit" | "Refund" | "Adjustment" | "Event Charge";
  vendor: string;
  amount: string;
  date: string;
};

export type Ticket = {
  id: string;
  customer: string;
  vendor: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  assigned: string;
  status: "Open" | "Pending" | "Resolved" | "Critical";
};

export type AuditLog = {
  user: string;
  action: string;
  module: string;
  ip: string;
  date: string;
  details: string;
};

export type Notification = {
  id: string | number;
  message: string;
  category: "System" | "Payments" | "Streaming" | "Vendors" | "Customers";
  time: string;
  status: string;
};

export type Role = {
  name: string;
  desc: string;
  users: number;
};

export type Theme = {
  id: string | number;
  name: string;
  category: string;
  vendors: number;
  status: "Available" | "Disabled" | "Draft";
  imgId: string;
  primary: string;
  secondary: string;
  slug?: string;
  layout?: string;
  fontFamily?: string;
  colors?: Record<string, string>;
  previewImage?: string | null;
  categoryId?: string | null;
  config?: import("@/themes/theme-templates").ThemeConfig | null;
  _id?: string;
};

export type SessionInfo = {
  device: string;
  location: string;
  lastActive: string;
};

export type LoginHistoryEntry = {
  date: string;
  ip: string;
  device: string;
  location: string;
  status: "Success" | "Failed";
};

export type NotifTemplate = {
  name: string;
  preview: string;
};

export type Plan = {
  name: string;
  price: string;
  eventLimit: string;
  hours: string;
  storage: string;
  viewerLimit: string;
  recording: string;
  branding: string;
  support: string;
};

export type Channel = {
  id: string | number;
  name: string;
  vendor: string;
  channelId: string;
  connectedDate: string;
  status: "Active" | "Pending";
  totalStreams: number;
  liveStreams: number;
  lastSync: string;
};

export type EventStream = {
  id: string | number;
  event: string;
  vendor: string;
  customer: string;
  channel: string;
  videoId: string;
  liveUrl: string | null;
  status: "Live" | "Completed" | "Upcoming" | "Error";
  date: string;
  views: number;
};

export type Recording = {
  event: string;
  vendor: string;
  size: string;
  storage: string;
};

export type LiveNowItem = {
  name: string;
  vendor: string;
  viewers: string;
  imgId: string;
};
