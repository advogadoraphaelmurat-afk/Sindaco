"use client";

import { useActionState } from "react";
import { sendMessageAction } from "@/app/actions/message";
import { Send } from "lucide-react";
import { GlassCard } from "./GlassCard";

export function MessageForm() {
  const [state, formAction, isPending] = useActionState(sendMessageAction, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm">
          {state.error}
        </div>
      )}

      <GlassCard delay={0.1} className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/60 mb-2 block">Assunto da Ocorrência/Mensagem</label>
            <input 
              type="text" 
              name="subject"
              placeholder="Ex: Barulho após horário..." 
              className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/60 mb-2 block">Detalhamento</label>
            <textarea 
              name="content"
              rows={4}
              placeholder="Descreva a solicitação ou mensagem diretamente ao síndico..." 
              className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              required
            />
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-end pt-4 pb-12">
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(59,130,246,0.4)] flex items-center gap-3 text-lg"
        >
          {isPending ? "Emitindo..." : "Mandar Mensagem"}
          {!isPending && <Send className="w-5 h-5" />}
        </button>
      </div>
    </form>
  );
}
