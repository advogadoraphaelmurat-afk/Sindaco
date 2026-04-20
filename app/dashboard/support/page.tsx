import { verifySession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GlassCard } from "@/components/GlassCard";
import { MessageSquare, Plus, Clock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupportTicketAction } from "@/app/actions/support";

const prisma = new PrismaClient();

export default async function SupportPage() {
  const session = await verifySession();
  if (!session || session.role !== "SINDICO") redirect("/dashboard");

  const tickets = await prisma.supportTicket.findMany({
    where: { buildingId: session.buildingId! },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Suporte à Administradora</h1>
          <p className="text-white/60">Canal direto para dúvidas, suporte técnico e solicitações master.</p>
        </div>
        <Link 
          href="/dashboard/support/new"
          className="bg-primary hover:bg-primary/90 text-white rounded-xl px-5 py-3 font-bold transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Novo Chamado
        </Link>
      </div>

      {tickets.length === 0 ? (
        <GlassCard delay={0.1} className="p-12 text-center">
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white/20" />
           </div>
           <h3 className="text-xl font-bold text-white/80">Nenhum chamado aberto</h3>
           <p className="text-white/40 mt-2">Suas solicitações para a administradora aparecerão aqui.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <GlassCard key={t.id} className="p-6">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.subject}</h3>
                    <p className="text-xs text-white/40 mt-1 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3 h-3" /> {new Date(t.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                    t.status === 'OPEN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    t.status === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {t.status === 'OPEN' ? 'Aberto' : t.status === 'CLOSED' ? 'Resolvido' : 'Em Análise'}
                  </span>
               </div>
               
               <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4 italic text-white/70 text-sm">
                  &quot;{t.content}&quot;
               </div>

               {t.response && (
                 <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl relative">
                    <div className="flex items-center gap-2 mb-2">
                       <ShieldCheck className="w-4 h-4 text-primary" />
                       <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Resposta da Administradora</span>
                    </div>
                    <p className="text-sm text-white/80">{t.response}</p>
                    <div className="absolute top-4 right-4 text-emerald-400/20">
                       <CheckCircle2 className="w-8 h-8" />
                    </div>
                 </div>
               )}

               {!t.response && (
                 <div className="flex items-center gap-2 text-xs text-white/30 italic">
                    <AlertCircle className="w-3.5 h-3.5" /> Aguardando retorno da equipe master.
                 </div>
               )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
  );
}
