"use client";

import { useActionState } from "react";
import { createNoticeAction } from "@/app/actions/notice";
import { Send, Bell } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface SubUnitProps {
  id: string;
  identifier: string;
  user: {
    name: string;
  } | null;
}

interface NoticeFormProps {
  subUnits: SubUnitProps[];
}

export function NoticeForm({ subUnits }: NoticeFormProps) {
  const [state, formAction, isPending] = useActionState(createNoticeAction, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm">
          {state.error}
        </div>
      )}

      <GlassCard delay={0.1} className="p-6">
        <h2 className="text-xl font-bold mb-6 text-white/90 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" /> Detalhes do Comunicado
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/60 mb-2 block">Destinatário</label>
            <select 
              name="targetSubUnitId"
              className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
              defaultValue="ALL"
            >
              <option value="ALL" className="bg-neutral-900 text-white">📢 Público / Todos os Moradores (Geral)</option>
              {subUnits.map((su) => (
                <option key={su.id} value={su.id} className="bg-neutral-900 text-white">
                  🔒 Privado: {su.identifier} {su.user ? `- ${su.user.name}` : "(Não cadastrado)"}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">
               * Selecione Público para enviar a todos ou escolha uma unidade para enviar de forma particular.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-white/60 mb-2 block">Título do Aviso</label>
            <input 
              type="text" 
              name="title"
              placeholder="Ex: Manutenção dos Elevadores ou Notificação de Barulho" 
              className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/60 mb-2 block">Conteúdo do Aviso</label>
            <textarea 
              name="content"
              rows={6}
              placeholder="Descreva detalhadamente o comunicado ou a ocorrência..." 
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
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-[0_4px_20px_rgba(59,130,246,0.4)] flex items-center gap-3 text-lg"
        >
          {isPending ? "Processando..." : "Publicar Aviso"}
          {!isPending && <Send className="w-5 h-5" />}
        </button>
      </div>
    </form>
  );
}
