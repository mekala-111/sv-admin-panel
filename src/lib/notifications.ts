"use server";

import { revalidatePath } from "next/cache";
import { api } from "./api";

export async function markNotificationReadAction(id: string, formData: FormData) {
  void formData;
  await api.post(`/notifications/${id}/read`).catch(() => undefined);
  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction(formData: FormData) {
  void formData;
  await api.post("/notifications/read-all").catch(() => undefined);
  revalidatePath("/notifications");
}
