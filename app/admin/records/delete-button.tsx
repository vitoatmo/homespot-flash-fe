"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteRecord } from "./actions";

type Table = "applications" | "applicants" | "properties" | "property_tours" | "ai_scores";

export function DeleteButton({
  table,
  id,
  label,
}: {
  table: Table;
  id: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  const handle = () => {
    if (!confirm(`Hapus ${label}? Tindakan ini tidak bisa di-undo.`)) return;
    startTransition(async () => {
      const res = await deleteRecord(table, id);
      if (!res.ok) alert(`Gagal: ${res.error}`);
    });
  };

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="rounded p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
      title={`Hapus ${label}`}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
