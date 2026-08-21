"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError } from "./api";

export async function deleteRecordingAction(id: string, formData: FormData) {
  void formData;
  try {
    await api.delete(`/recordings/${id}`);
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Failed to delete recording.";
    redirect(`/recordings?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/recordings");
  redirect("/recordings");
}
