"use client";

import { useActionState } from "react";
import { createSubUnitAction } from "@/app/actions/admin";
import { Plus } from "lucide-react";

export function AddSubUnitForm({ buildingId }: { buildingId: string }) {
  const [state, formAction, isPending] = useActionState(createSubUnitAction, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="buildingId" value={buildingId} />
      
      {state?.error && (
        <span className="text-red-400 text-xs mr-2">{state.error}</span>
      )}

      <input 
        type="text" 
        name="identifier" 
        placeholder="Ex: Apto 201" 
        required
        className="flex-1 bg-black/30 border border-white/5 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
      />
      <button 
        type="submit" 
        disabled={isPending}
        className="bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold border border-primary/30 hover:bg-primary/30 transition-colors flex items-center gap-1 disabled:opacity-50"
      >
        <Plus className="w-4 h-4" /> Unidade
      </button>
    </form>
  );
}
