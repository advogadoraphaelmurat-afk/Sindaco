"use client";

import { useActionState } from "react";
import { submitVoteAction } from "@/app/actions/voting";
import { Send, CheckCircle } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface Option {
  id: string;
  text: string;
}

export function SubmitVoteForm({ votingId, options }: { votingId: string, options: Option[] }) {
  const [state, formAction, isPending] = useActionState(submitVoteAction, null);

  if (state?.success) {
    return (
      <GlassCard delay={0.1} className="p-8 flex flex-col items-center justify-center text-center border-emerald-500/30 bg-emerald-500/5">
         <div className="w-20 h-20 rounded-full bg-emerald-500/20 mb-6 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-2">Voto Computado com Sucesso!</h2>
         <p className="text-white/60 mb-6 max-w-sm">
           A sua unidade já está registrada com assinatura digital no livro dessa assembleia.
         </p>
         <button onClick={() => window.location.reload()} className="text-sm bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-2 rounded-full transition-all">
           Visualizar Resultados
         </button>
      </GlassCard>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="votingId" value={votingId} />
      
      {state?.error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm">
          {state.error}
        </div>
      )}

      <GlassCard delay={0.1} className="p-6">
        <h3 className="text-xl font-bold text-white/90 mb-4">Escolha uma alternativa:</h3>
        
        <div className="space-y-3">
          {options.map((option, index) => (
            <label 
              key={option.id} 
              className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:shadow-[0_0_15px_rgba(59,130,246,0.15)] group"
            >
              <input 
                type="radio" 
                name="optionId" 
                value={option.id}
                required
                className="w-5 h-5 accent-primary bg-black/50 border-white/20 focus:ring-primary focus:ring-offset-gray-900"
              />
              <span className="flex-1 text-white/80 group-has-[:checked]:text-white group-has-[:checked]:font-medium transition-colors">
                <span className="font-bold text-white/40 group-has-[:checked]:text-primary/70 mr-3">{String.fromCharCode(65 + index)}</span>
                {option.text}
              </span>
            </label>
          ))}
        </div>
      </GlassCard>

      <div className="flex justify-end pt-4 pb-12">
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-[0_4px_20px_rgba(59,130,246,0.4)] flex items-center gap-3 text-lg"
        >
          {isPending ? "Registrando no Blockchain..." : "Confirmar Voto Seguro"}
          {!isPending && <Send className="w-5 h-5" />}
        </button>
      </div>

    </form>
  );
}
