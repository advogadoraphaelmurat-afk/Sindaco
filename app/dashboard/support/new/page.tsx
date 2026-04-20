import { verifySession } from "@/lib/auth";
import { GlassCard } from "@/components/GlassCard";
import { MessageSquare, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupportTicketAction } from "@/app/actions/support";

export default async function NewTicketPage() {
  const session = await verifySession();
  if (!session || session.role !== "SINDICO") redirect("/dashboard");

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/support" 
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Novo Chamado</h1>
          <p className="text-sm text-white/40">Descreva sua dúvida ou problema para o Suporte Master.</p>
        </div>
      </div>

      <GlassCard delay={0.1} className="p-8">
        <form action={createSupportTicketAction} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-white/70 ml-1">Assunto</label>
            <input 
              name="subject"
              type="text"
              required
              placeholder="Ex: Dúvida sobre cálculo de quórum"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-white/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white/70 ml-1">Descrição Detalhada</label>
            <textarea 
              name="content"
              required
              rows={6}
              placeholder="Explique detalhadamente como podemos te ajudar..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-white/20 resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/20"
          >
            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            Enviar Chamado
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
