/** Per-vendor wallet fetchers for the admin panel (admin looks up any vendor's wallet by id). */

import { api } from "@/lib/api";

export interface Wallet {
  id: string;
  vendorId: string;
  balance: number;
  currency: string;
  updatedAt: string;
}

export type WalletTransactionType = "CREDIT" | "DEBIT" | "REFUND" | "ADJUSTMENT";

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}

export async function fetchVendorWallet(vendorId: string): Promise<Wallet> {
  return api.get<Wallet>(`/wallet/${vendorId}`);
}

export async function fetchVendorWalletTransactions(vendorId: string, params: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 20 } = params;
  const { items, meta } = await api.getList<WalletTransaction>(`/wallet/${vendorId}/transactions`, {
    params: { page, limit },
  });
  return { items, page: meta.page, totalPages: meta.totalPages, total: meta.total };
}
