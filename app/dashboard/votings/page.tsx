import { verifySession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GlassCard } from "@/components/GlassCard";
import { Plus, ListTodo, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic"; // Obriga o Next a não usar Cache estático na db

const prisma = new PrismaClient();

export default async function VotingsListPage() {
  const session = await verifySession();
  
  if (!session || !session.buildingId) {
    return <div>Sessão inválida.</div>;
  }

  // Buscar todas as votações desse Condomínio
  const votings = await prisma.voting.findMany({
    where: { buildingId: session.buildingId },
    include: {
       _count: {
          select: { options: true, votes: true }
       }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Gestão de Votações</h1>
          <p className="text-white/50 mt-1">Acompanhe as assembleias ativas e o registro de encerramentos.</p>
        </div>
        
        {session.role === "SINDICO" && (
          <Link 
            href="/dashboard/votings/new"
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-5 py-3 font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Votação
          </Link>
        )}
      </div>

      {votings.length === 0 ? (
        <GlassCard delay={0.1} className="p-12 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 rounded-full bg-white/5 mb-4 flex items-center justify-center">
              <ListTodo className="w-10 h-10 text-white/20" />
           </div>
           <h3 className="text-xl font-bold text-white/80 mb-2">Nenhuma Votação Registrada</h3>
           <p className="text-white/40 max-w-sm">
             Ainda não há nenhuma ocorrência ou assembleia digital sendo pautada neste condomínio.
           </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {votings.map((voting) => {
             const isOpen = new Date() >= new Date(voting.startDate) && new Date() <= new Date(voting.endDate) && voting.status === "OPEN";

             return (
               <Link href={`/dashboard/votings/${voting.id}`} key={voting.id} className="block group">
                 <div className="bg-white/[0.03] border border-white/5 hover:border-primary/50 hover:bg-white/[0.05] p-5 rounded-2xl transition-all flex items-center justify-between">
                   <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${isOpen ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 text-white/30'}`}>
                         <ListTodo className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{voting.title}</h3>
                          {isOpen ? (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/30">Aberta</span>
                          ) : (
                            <span className="bg-white/10 text-white/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-white/10">Fechada / Agendada</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/40 font-medium">
                           <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Fim: {new Date(voting.endDate).toLocaleDateString('pt-BR')}</span>
                           <span>•</span>
                           <span>{voting._count.options} Alternativas</span>
                           <span>•</span>
                           <span>{voting._count.votes} Voto(s) Apurados</span>
                        </div>
                      </div>
                   </div>
                   
                   <div className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-6 h-6" />
                   </div>
                 </div>
               </Link>
             )
          })}
        </div>
      )}
    </div>
  );
}
