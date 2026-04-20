"use client";

import { useActionState, useState } from "react";
import { createVotingAction } from "@/app/actions/voting";
import { Plus, Trash2, CalendarClock, Send } from "lucide-react";
import { GlassCard } from "./GlassCard";

export function VotingForm() {
  const [state, formAction, isPending] = useActionState(createVotingAction, null);
  const [options, setOptions] = useState(["", ""]); // Ao menos 2 vazias por padrão

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm">
          {state.error}
        </div>
      )}

      <GlassCard delay={0.1} className="p-6">
        <h2 className="text-xl font-bold mb-6 text-white/90">Dados Principais</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/60 mb-2 block">Título da Assembleia/Votação</label>
            <input 
              type="text" 
              name="title"
              placeholder="Ex: Pintura da Fachada do Prédio" 
              className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/60 mb-2 block">Descrição e Contexto (Opcional)</label>
            <textarea 
              name="description"
              rows={3}
              placeholder="Forneça os detalhes e orçamentos referentes a essa pauta..." 
              className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white/60 mb-2 flex items-center gap-2"><CalendarClock className="w-4 h-4" /> Data e Hora de Início</label>
              <input 
                type="datetime-local" 
                name="startDate"
                className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all color-scheme-dark"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/60 mb-2 flex items-center gap-2"><CalendarClock className="w-4 h-4" /> Data e Hora de Fim</label>
              <input 
                type="datetime-local" 
                name="endDate"
                className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all color-scheme-dark"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white/60 mb-2 block">Quórum Exigido (Lei / Convenção)</label>
            <select 
              name="quorumType"
              className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
              required
            >
              <option value="SIMPLES">Maioria Simples (Presentes)</option>
              <option value="ABSOLUTA">Maioria Absoluta (Mais de 50% de todas as unidades)</option>
              <option value="DOIS_TERCOS">Quórum Qualificado (2/3 de todas as unidades)</option>
              <option value="TRES_QUARTOS">Quórum Específico (3/4 de todas as unidades)</option>
              <option value="UNANIMIDADE">Unanimidade (100% das unidades)</option>
            </select>
            <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">
               * O sistema validará se a votação atingiu o quórum para fins de Ata Jurídica.
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard delay={0.2} className="p-6">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-white/90">Alternativas de Voto</h2>
           <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold border border-primary/30">Múltipla Escolha</span>
        </div>

        <div className="space-y-3">
          {options.map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 font-bold shrink-0 shadow-inner">
                {String.fromCharCode(65 + index)}
              </div>
              <input 
                type="text" 
                name="options"
                placeholder={`Opção ${index + 1}`} 
                className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
              <button 
                type="button" 
                onClick={() => removeOption(index)}
                disabled={options.length <= 2}
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-20 transition-all shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <button 
          type="button" 
          onClick={addOption}
          className="mt-6 w-full py-4 rounded-xl border-2 border-dashed border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" /> Adicionar Alternativa
        </button>
      </GlassCard>

      <div className="flex justify-end pt-4 pb-12">
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-[0_4px_20px_rgba(59,130,246,0.4)] flex items-center gap-3 text-lg"
        >
          {isPending ? "Processando..." : "Lançar Votação no Sistema"}
          {!isPending && <Send className="w-5 h-5" />}
        </button>
      </div>

    </form>
  );
}
