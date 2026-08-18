import type {
  AuditLog,
  Channel,
  Customer,
  Event,
  EventStream,
  LiveNowItem,
  LoginHistoryEntry,
  Notification,
  NotifTemplate,
  Plan,
  Recording,
  Role,
  Server,
  SessionInfo,
  Ticket,
  Theme,
  Transaction,
  Vendor,
  WalletTx,
} from "./types";

// Seed data ported from the SV Live Admin Panel design (Claude Design handoff).
// This is the single source of truth for the in-memory data layer in lib/db.ts.

export const vendorsSeed: Vendor[] = [
  { id: 0, name: "SV Events", company: "SV Events Pvt Ltd", email: "contact@svevents.in", events: 142, customers: 3200, revenue: "₹8.4L", wallet: "₹62,400", status: "Active", created: "Jan 12, 2024", logoId: "v-logo-1" },
  { id: 1, name: "Event Pro", company: "EventPro Solutions", email: "hello@eventpro.in", events: 98, customers: 2100, revenue: "₹5.1L", wallet: "₹34,200", status: "Active", created: "Mar 4, 2024", logoId: "v-logo-2" },
  { id: 2, name: "Dev Live", company: "Dev Live Media", email: "contact@devlive.in", events: 76, customers: 1450, revenue: "₹4.2L", wallet: "₹28,900", status: "Active", created: "May 20, 2024", logoId: "v-logo-3" },
  { id: 3, name: "Music Beats", company: "Music Beats Productions", email: "team@musicbeats.in", events: 54, customers: 980, revenue: "₹2.8L", wallet: "₹19,600", status: "Pending", created: "Jul 2, 2024", logoId: "v-logo-4" },
  { id: 4, name: "Campus Live", company: "Campus Live Streaming", email: "support@campuslive.in", events: 41, customers: 720, revenue: "₹1.6L", wallet: "₹11,200", status: "Active", created: "Sep 15, 2024", logoId: "v-logo-5" },
  { id: 5, name: "Tone Media", company: "Tone Media Works", email: "info@tonemedia.in", events: 29, customers: 510, revenue: "₹1.1L", wallet: "₹7,800", status: "Suspended", created: "Nov 30, 2024", logoId: "v-logo-6" },
];

export const customersSeed: Customer[] = [
  { id: 0, name: "Rahul Sharma", vendor: "SV Events", events: 12, spending: "₹1,24,000", lastEvent: "May 24, 2025", status: "Active", joined: "Jan 2024", avatarId: "c-av-1" },
  { id: 1, name: "XYZ Pvt Ltd", vendor: "Event Pro", events: 8, spending: "₹86,000", lastEvent: "May 24, 2025", status: "Active", joined: "Feb 2024", avatarId: "c-av-2" },
  { id: 2, name: "Sri Temple Trust", vendor: "Dev Live", events: 5, spending: "₹2,10,000", lastEvent: "May 23, 2025", status: "Active", joined: "Mar 2024", avatarId: "c-av-3" },
  { id: 3, name: "ABC College", vendor: "Campus Live", events: 6, spending: "₹64,000", lastEvent: "May 22, 2025", status: "Active", joined: "Apr 2024", avatarId: "c-av-4" },
  { id: 4, name: "Priya Nair", vendor: "SV Events", events: 3, spending: "₹42,000", lastEvent: "Apr 18, 2025", status: "Active", joined: "Jun 2024", avatarId: "c-av-5" },
  { id: 5, name: "Vikram Singh", vendor: "Music Beats", events: 2, spending: "₹28,000", lastEvent: "Mar 2, 2025", status: "Disabled", joined: "Jul 2024", avatarId: "c-av-6" },
];

export const eventsSeed: Event[] = [
  { id: 0, name: "Rahul & Priya Wedding", customer: "Rahul Sharma", vendor: "SV Events", date: "May 24, 2025", duration: "6h", viewers: 2481, peak: 3120, revenue: "₹1,84,000", status: "Live", heroId: "e-hero-1" },
  { id: 1, name: "Annual Business Conference", customer: "XYZ Pvt Ltd", vendor: "Event Pro", date: "May 24, 2025", duration: "4h", viewers: 1240, peak: 1580, revenue: "₹92,000", status: "Live", heroId: "e-hero-2" },
  { id: 2, name: "Temple Festival 2025", customer: "Sri Temple Trust", vendor: "Dev Live", date: "May 23, 2025", duration: "10h", viewers: 5832, peak: 7040, revenue: "₹3,20,000", status: "Completed", heroId: "e-hero-3" },
  { id: 3, name: "Music Concert Live", customer: "Vikram Singh", vendor: "Music Beats", date: "May 23, 2025", duration: "3h", viewers: 3421, peak: 4010, revenue: "₹1,10,000", status: "Completed", heroId: "e-hero-4" },
  { id: 4, name: "College Annual Day", customer: "ABC College", vendor: "Campus Live", date: "May 22, 2025", duration: "5h", viewers: 980, peak: 1120, revenue: "₹38,000", status: "Completed", heroId: "e-hero-5" },
  { id: 5, name: "Global Tech Summit", customer: "XYZ Pvt Ltd", vendor: "Event Pro", date: "Jun 2, 2025", duration: "—", viewers: 0, peak: 0, revenue: "₹0", status: "Upcoming", heroId: "e-hero-6" },
];

export const serversSeed: Server[] = [
  { name: "Server 01", location: "Hyderabad", cpu: 42, ram: 58, network: 36, status: "Healthy" },
  { name: "Server 02", location: "Mumbai", cpu: 64, ram: 52, network: 48, status: "Healthy" },
  { name: "Server 03", location: "Delhi", cpu: 38, ram: 46, network: 29, status: "Healthy" },
  { name: "Server 04", location: "Bangalore", cpu: 55, ram: 61, network: 41, status: "Healthy" },
];

export const transactionsSeed: Transaction[] = [
  { id: "TXN10234", customer: "Rahul Sharma", vendor: "SV Events", event: "Rahul & Priya Wedding", amount: "₹18,400", gateway: "Razorpay", date: "May 24, 2025", status: "Successful" },
  { id: "TXN10235", customer: "XYZ Pvt Ltd", vendor: "Event Pro", event: "Annual Business Conference", amount: "₹9,200", gateway: "Razorpay", date: "May 24, 2025", status: "Successful" },
  { id: "TXN10236", customer: "Sri Temple Trust", vendor: "Dev Live", event: "Temple Festival 2025", amount: "₹32,000", gateway: "Stripe", date: "May 23, 2025", status: "Successful" },
  { id: "TXN10237", customer: "Vikram Singh", vendor: "Music Beats", event: "Music Concert Live", amount: "₹11,000", gateway: "Razorpay", date: "May 23, 2025", status: "Pending" },
  { id: "TXN10238", customer: "ABC College", vendor: "Campus Live", event: "College Annual Day", amount: "₹3,800", gateway: "Razorpay", date: "May 22, 2025", status: "Failed" },
  { id: "TXN10239", customer: "Priya Nair", vendor: "SV Events", event: "Rahul & Priya Wedding", amount: "₹4,200", gateway: "Razorpay", date: "May 21, 2025", status: "Refunded" },
];

export const walletTxSeed: WalletTx[] = [
  { type: "Credit", vendor: "SV Events", amount: "+ ₹62,400", date: "May 24, 2025" },
  { type: "Debit", vendor: "Event Pro", amount: "- ₹8,200", date: "May 23, 2025" },
  { type: "Refund", vendor: "Campus Live", amount: "- ₹3,800", date: "May 22, 2025" },
  { type: "Adjustment", vendor: "Dev Live", amount: "+ ₹1,500", date: "May 21, 2025" },
  { type: "Event Charge", vendor: "Music Beats", amount: "- ₹2,200", date: "May 20, 2025" },
  { type: "Credit", vendor: "Campus Live", amount: "+ ₹9,000", date: "May 19, 2025" },
];

export const ticketsSeed: Ticket[] = [
  { id: "#T-2201", customer: "Priya Nair", vendor: "SV Events", category: "Streaming", priority: "High", assigned: "Support Admin", status: "Open" },
  { id: "#T-2202", customer: "XYZ Pvt Ltd", vendor: "Event Pro", category: "Payments", priority: "Critical", assigned: "Finance Admin", status: "Critical" },
  { id: "#T-2203", customer: "Sri Temple Trust", vendor: "Dev Live", category: "Recording", priority: "Medium", assigned: "Technical Admin", status: "Pending" },
  { id: "#T-2204", customer: "ABC College", vendor: "Campus Live", category: "Wallet", priority: "Low", assigned: "Support Admin", status: "Resolved" },
  { id: "#T-2205", customer: "Vikram Singh", vendor: "Music Beats", category: "Domain", priority: "Medium", assigned: "Technical Admin", status: "Resolved" },
];

export const auditLogsSeed: AuditLog[] = [
  { user: "Admin User", action: "Approved withdrawal", module: "Withdrawals", ip: "103.24.11.5", date: "May 24, 2025 10:42", details: "Approved ₹40,000 to SV Events" },
  { user: "Admin User", action: "Created vendor", module: "Vendors", ip: "103.24.11.5", date: "May 23, 2025 16:10", details: "Added Campus Live" },
  { user: "Finance Admin", action: "Refunded payment", module: "Payments", ip: "45.112.6.9", date: "May 22, 2025 09:05", details: "Refunded TXN10239" },
  { user: "Support Admin", action: "Updated ticket", module: "Support", ip: "45.112.6.9", date: "May 22, 2025 08:40", details: "Resolved #T-2204" },
  { user: "Admin User", action: "Changed settings", module: "Settings", ip: "103.24.11.5", date: "May 21, 2025 19:22", details: "Updated RTMP server" },
  { user: "Technical Admin", action: "Login", module: "System", ip: "78.90.4.2", date: "May 21, 2025 09:00", details: "Logged in" },
];

export const notificationsSeed: Notification[] = [
  { id: 0, message: "High viewers on Temple Festival 2025", category: "Streaming", time: "5 minutes ago", status: "Pending" },
  { id: 1, message: "Withdrawal request from Dev Live", category: "Vendors", time: "15 minutes ago", status: "Pending" },
  { id: 2, message: "New vendor registration: Campus Live", category: "Vendors", time: "1 hour ago", status: "Processing" },
  { id: 3, message: "Payment received from SV Events", category: "Payments", time: "2 hours ago", status: "Active" },
  { id: 4, message: "Stream disconnected: Music Night", category: "Streaming", time: "3 hours ago", status: "Live" },
];

export const rolesSeed: Role[] = [
  { name: "Super Admin", desc: "Full platform access", users: 2 },
  { name: "Admin", desc: "Manage vendors & events", users: 4 },
  { name: "Finance Admin", desc: "Payments & wallet only", users: 3 },
  { name: "Support Admin", desc: "Tickets & customers", users: 5 },
  { name: "Technical Admin", desc: "Streaming & servers", users: 3 },
];

export const themesSeed: Theme[] = [
  { id: 0, name: "Wedding Elegant", category: "Wedding", vendors: 42, status: "Available", imgId: "th-1", primary: "#FF7A00", secondary: "#F52222" },
  { id: 1, name: "Corporate Sharp", category: "Corporate", vendors: 28, status: "Available", imgId: "th-2", primary: "#2563EB", secondary: "#252525" },
  { id: 2, name: "Concert Neon", category: "Concert", vendors: 19, status: "Available", imgId: "th-3", primary: "#8B5CF6", secondary: "#F52222" },
  { id: 3, name: "Spiritual Serene", category: "Spiritual", vendors: 15, status: "Available", imgId: "th-4", primary: "#FFB000", secondary: "#16A34A" },
  { id: 4, name: "Sports Arena", category: "Sports", vendors: 9, status: "Available", imgId: "th-5", primary: "#DC2626", secondary: "#252525" },
  { id: 5, name: "Birthday Bash", category: "Birthday", vendors: 22, status: "Available", imgId: "th-6", primary: "#F52222", secondary: "#FFB000" },
  { id: 6, name: "Private Minimal", category: "Private", vendors: 6, status: "Disabled", imgId: "th-7", primary: "#707070", secondary: "#252525" },
  { id: 7, name: "Pure Minimal", category: "Minimal", vendors: 33, status: "Available", imgId: "th-8", primary: "#252525", secondary: "#707070" },
];

export const sessionsSeed: SessionInfo[] = [
  { device: "Chrome on MacBook Pro", location: "Hyderabad, IN", lastActive: "Active now" },
  { device: "Safari on iPhone 15", location: "Hyderabad, IN", lastActive: "2 hours ago" },
  { device: "Chrome on Windows PC", location: "Mumbai, IN", lastActive: "1 day ago" },
];

export const loginHistorySeed: LoginHistoryEntry[] = [
  { date: "May 24, 2025 09:02", ip: "103.24.11.5", device: "Chrome, macOS", location: "Hyderabad, IN", status: "Success" },
  { date: "May 23, 2025 08:55", ip: "103.24.11.5", device: "Chrome, macOS", location: "Hyderabad, IN", status: "Success" },
  { date: "May 20, 2025 21:14", ip: "78.90.4.2", device: "Safari, iOS", location: "Hyderabad, IN", status: "Success" },
  { date: "May 18, 2025 03:10", ip: "191.22.6.8", device: "Chrome, Windows", location: "Unknown", status: "Failed" },
  { date: "May 15, 2025 09:00", ip: "103.24.11.5", device: "Chrome, macOS", location: "Hyderabad, IN", status: "Success" },
];

export const notifTemplatesSeed: NotifTemplate[] = [
  { name: "Welcome", preview: "Welcome to SV Live! Your account is ready." },
  { name: "Payment Received", preview: "We have received your payment of {{amount}}." },
  { name: "Event Created", preview: "Your event {{event_name}} has been created." },
  { name: "Event Reminder", preview: "{{event_name}} goes live in 1 hour." },
  { name: "Event Live", preview: "{{event_name}} is live now — tap to watch." },
  { name: "Recording Ready", preview: "The recording for {{event_name}} is ready." },
  { name: "Wallet Low Balance", preview: "Your wallet balance is below ₹1,000." },
  { name: "Stream Failure", preview: "Your stream for {{event_name}} disconnected." },
];

export const plansSeed: Plan[] = [
  { name: "Starter", price: "₹2,999/mo", eventLimit: "10 / month", hours: "50 hrs", storage: "100 GB", viewerLimit: "500", recording: "Basic", branding: "—", support: "Email" },
  { name: "Professional", price: "₹8,999/mo", eventLimit: "50 / month", hours: "300 hrs", storage: "1 TB", viewerLimit: "5,000", recording: "Full", branding: "Custom Logo", support: "Priority" },
  { name: "Enterprise", price: "Custom", eventLimit: "Unlimited", hours: "Unlimited", storage: "10 TB", viewerLimit: "Unlimited", recording: "Full + Multi-camera", branding: "White-label", support: "Dedicated Manager" },
];

export const channelsSeed: Channel[] = [
  { id: 0, name: "SV Events Live", vendor: "SV Events", channelId: "UC1a2B3c4D5e", connectedDate: "Jan 15, 2024", status: "Active", totalStreams: 142 },
  { id: 1, name: "EventPro Broadcast", vendor: "Event Pro", channelId: "UC9f8G7h6I5j", connectedDate: "Mar 10, 2024", status: "Active", totalStreams: 98 },
  { id: 2, name: "Dev Live Channel", vendor: "Dev Live", channelId: "UC3k2L1m0N9o", connectedDate: "May 22, 2024", status: "Active", totalStreams: 76 },
  { id: 3, name: "Music Beats TV", vendor: "Music Beats", channelId: "UC7p6Q5r4S3t", connectedDate: "Jul 8, 2024", status: "Pending", totalStreams: 54 },
];

export const eventStreamsSeed: EventStream[] = [
  { id: 0, event: "Rahul & Priya Wedding", vendor: "SV Events", customer: "Rahul Sharma", videoId: "dQw4w9WgXcQ", status: "Live", date: "May 24, 2025", views: 2481 },
  { id: 1, event: "Annual Business Conference", vendor: "Event Pro", customer: "XYZ Pvt Ltd", videoId: "xvFZjo5PgG0", status: "Live", date: "May 24, 2025", views: 1240 },
  { id: 2, event: "Temple Festival 2025", vendor: "Dev Live", customer: "Sri Temple Trust", videoId: "9bZkp7q19f0", status: "Completed", date: "May 23, 2025", views: 5832 },
  { id: 3, event: "Music Concert Live", vendor: "Music Beats", customer: "Vikram Singh", videoId: "kXYiU_JCYtU", status: "Completed", date: "May 23, 2025", views: 3421 },
  { id: 4, event: "College Annual Day", vendor: "Campus Live", customer: "ABC College", videoId: "2Vv-BfVoq4g", status: "Completed", date: "May 22, 2025", views: 980 },
];

export const recordingsSeed: Recording[] = [
  { event: "Temple Festival 2025", vendor: "Dev Live", size: "12.4 GB", storage: "Server 01" },
  { event: "Rahul & Priya Wedding", vendor: "SV Events", size: "8.1 GB", storage: "Server 02" },
  { event: "Music Concert Live", vendor: "Music Beats", size: "6.7 GB", storage: "Server 02" },
  { event: "College Annual Day", vendor: "Campus Live", size: "3.2 GB", storage: "Server 03" },
];

export const liveNowSeed: LiveNowItem[] = [
  { name: "Rahul & Priya Wedding", vendor: "SV Events", viewers: "2,481", imgId: "ln-1" },
  { name: "Annual Business Conference", vendor: "Event Pro", viewers: "1,240", imgId: "ln-2" },
  { name: "Temple Festival 2025", vendor: "Dev Live", viewers: "5,832", imgId: "ln-3" },
  { name: "Music Concert Live", vendor: "Music Beats", viewers: "3,421", imgId: "ln-4" },
];

export const analyticsStatsByTab: Record<string, { label: string; value: string }[]> = {
  Platform: [{ label: "Total Revenue", value: "₹18.42L" }, { label: "Active Vendors", value: "248" }, { label: "Total Events", value: "12,438" }, { label: "Streaming Hours", value: "4,829" }],
  Vendors: [{ label: "Total Vendors", value: "248" }, { label: "New This Month", value: "14" }, { label: "Avg Revenue / Vendor", value: "₹7.4K" }, { label: "Top Vendor", value: "SV Events" }],
  Events: [{ label: "Total Events", value: "12,438" }, { label: "Live Now", value: "18" }, { label: "Completed", value: "8,842" }, { label: "Cancelled", value: "363" }],
  Geographic: [{ label: "Top State", value: "Maharashtra" }, { label: "Cities Covered", value: "86" }, { label: "Countries", value: "3" }, { label: "Avg Viewers / Event", value: "612" }],
  Devices: [{ label: "Mobile Share", value: "64%" }, { label: "Desktop Share", value: "24%" }, { label: "Tablet Share", value: "8%" }, { label: "Smart TV Share", value: "4%" }],
};

export const analyticsBreakdownByTab: Record<string, { label: string; pct: number }[]> = {
  Platform: [{ label: "Revenue", pct: 82 }, { label: "Vendors", pct: 64 }, { label: "Events", pct: 71 }, { label: "Streaming Hours", pct: 58 }],
  Vendors: [{ label: "SV Events", pct: 90 }, { label: "Event Pro", pct: 66 }, { label: "Dev Live", pct: 54 }, { label: "Music Beats", pct: 38 }, { label: "Campus Live", pct: 28 }],
  Events: [{ label: "Completed", pct: 71 }, { label: "Upcoming", pct: 26 }, { label: "Live", pct: 1 }, { label: "Cancelled", pct: 3 }],
  Geographic: [{ label: "Maharashtra", pct: 34 }, { label: "Telangana", pct: 28 }, { label: "Karnataka", pct: 19 }, { label: "Delhi NCR", pct: 12 }, { label: "Others", pct: 7 }],
  Devices: [{ label: "Mobile", pct: 64 }, { label: "Desktop", pct: 24 }, { label: "Tablet", pct: 8 }, { label: "Smart TV", pct: 4 }],
};
