import { verifySession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GlassCard } from "@/components/GlassCard";
import { MessageSquare, Clock, Building2, User, Send, CheckCircle2 } from "lucide-react";
import { redirect } from "next/navigation";
import { respondSupportTicketAction } from "@/app/actions/support";

const prisma = new PrismaClient();

export default async function AdminSupportPage() {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const tickets = await prisma.supportTicket.findMany({
    include: {
      building: { select: { name: true } },
      author: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const openTickets = tickets.filter(t => t.status === "OPEN");
  const closedTickets = tickets.filter(t => t.status === "CLOSED");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-display">Central de Atendimento Master</h1>
        <p className="text-white/40">Responda aos chamados dos síndicos para garantir o sucesso da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Chamados Abertos */}
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Chamados Pendentes ({openTickets.length})
           </h2>
           
           {openTickets.length === 0 ? (
             <GlassCard className="p-12 text-center text-white/40">
                🚀 Todos os chamados foram respondidos!
             </GlassCard>
           ) : (
             <div className="space-y-4">
               {openTickets.map((t) => (
                 <GlassCard key={t.id} className="p-6 border-blue-500/20 bg-blue-500/5">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <div className="bg-white/5 p-2 rounded-lg">
                             <Building2 className="w-4 h-4 text-white/40" />
                          </div>
                          <div>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t.building.name}</p>
                            <h3 className="text-lg font-bold text-white">{t.subject}</h3>
                          </div>
                       </div>
                       <span className="text-[10px] text-white/30 font-mono">{new Date(t.createdAt).toLocaleString('pt-BR')}</span>
                    </div>

                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-6 text-sm text-white/80">
                       <p className="flex items-center gap-2 text-primary font-bold mb-2">
                          <User className="w-3.5 h-3.5" /> {t.author.name} escreveu:
                       </p>
                       &quot;{t.content}&quot;
                    </div>

                    <form action={respondSupportTicketAction} className="space-y-3">
                       <input type="hidden" name="ticketId" value={t.id} />
                       <textarea 
                         name="response"
                         placeholder="Escreva sua resposta técnica aqui..."
                         required
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                         rows={4}
                       />
                       <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                          <Send className="w-4 h-4" /> Enviar Resposta e Encerrar
                       </button>
                    </form>
                 </GlassCard>
               ))}
             </div>
           )}
        </div>

        {/* Coluna Lateral: Histórico */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-white/60 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500/50" />
              Recentemente Resolvidos
           </h2>
           <div className="space-y-3">
             {closedTickets.slice(0, 5).map(t => (
               <div key={t.id} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Resolvido</p>
                  <p className="text-sm font-bold text-white truncate">{t.subject}</p>
                  <p className="text-[10px] text-white/30 mt-1">{t.building.name}</p>
               </div>
             ))}
             {closedTickets.length === 0 && (
               <p className="text-xs text-center text-white/20 py-8">Nenhum histórico ainda.</p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
