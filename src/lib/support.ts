"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "./api";
import type { TicketStatus } from "./hooks/useAdminSupport";

function errorRedirect(to: string, message: string): never {
  redirect(`${to}?error=${encodeURIComponent(message)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createSupportTicketAction(formData: FormData) {
  const subject = str(formData, "subject");
  if (subject.length < 3) errorRedirect("/support", "Subject must be at least 3 characters.");

  const category = str(formData, "category");
  const priority = str(formData, "priority");
  const body = str(formData, "body");
  const vendorId = str(formData, "vendorId");

  let created: { id: string };
  try {
    created = await api.post<{ id: string }>("/support/tickets", {
      subject,
      ...(category ? { category } : {}),
      ...(priority ? { priority } : {}),
      ...(body ? { body } : {}),
      ...(vendorId ? { vendorId } : {}),
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to create ticket.";
    errorRedirect("/support", message);
  }

  revalidatePath("/support");
  redirect(`/support/${created.id}`);
}

export async function addTicketMessageAction(id: string, formData: FormData) {
  const message = str(formData, "message");
  if (!message) errorRedirect(`/support/${id}`, "Enter a message first.");

  try {
    await api.patch(`/support/tickets/${id}`, { message });
  } catch (error) {
    const msg = error instanceof ApiError ? error.message : "Failed to send message.";
    errorRedirect(`/support/${id}`, msg);
  }

  revalidatePath(`/support/${id}`);
  redirect(`/support/${id}`);
}

export async function setTicketStatusAction(id: string, status: TicketStatus, formData: FormData) {
  void formData;
  try {
    await api.patch(`/support/tickets/${id}`, { status });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to update ticket status.";
    errorRedirect(`/support/${id}`, message);
  }

  revalidatePath("/support");
  revalidatePath(`/support/${id}`);
  redirect(`/support/${id}`);
}

export async function setTicketPriorityAction(id: string, priority: string, formData: FormData) {
  void formData;
  try {
    await api.patch(`/support/tickets/${id}`, { priority });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to update ticket priority.";
    errorRedirect(`/support/${id}`, message);
  }

  revalidatePath("/support");
  revalidatePath(`/support/${id}`);
  redirect(`/support/${id}`);
}

export async function assignTicketAction(id: string, formData: FormData) {
  const assignedTo = str(formData, "assignedTo");
  if (!assignedTo) errorRedirect(`/support/${id}`, "Select a staff member to assign.");

  try {
    await api.patch(`/support/tickets/${id}`, { assignedTo });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to assign ticket.";
    errorRedirect(`/support/${id}`, message);
  }

  revalidatePath(`/support/${id}`);
  redirect(`/support/${id}`);
}
