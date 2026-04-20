"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type Table = "applications" | "applicants" | "properties" | "property_tours" | "ai_scores";

export async function deleteRecord(table: Table, id: string) {
  const sb = await createClient();
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/admin/records");
  return { ok: true };
}
