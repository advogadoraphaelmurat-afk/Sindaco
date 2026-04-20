import { verifySession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GlassCard } from "@/components/GlassCard";
import { SubmitVoteForm } from "@/components/SubmitVoteForm";
import Link from "next/link";
import { ArrowLeft, Clock, CalendarCheck, FileSignature, BarChart3 } from "lucide-react";
import { redirect } from "next/navigation";
import { AtaPDFGenerator } from "@/components/AtaPDFGenerator";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// In Next.js 15, dynamic route params must be awaited if accessed directly (though in page components they are a promise)
export default async function VotingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session) redirect("/");

  const resolvedParams = await params;

  const voting = await prisma.voting.findUnique({
    where: { id: resolvedParams.id, buildingId: session.buildingId! },
    include: {
      options: {
        include: {
          votes: {
            include: { subUnit: { select: { fractionalWeight: true } } }
          }
        }
      },
      votes: {
        include: { subUnit: { select: { fractionalWeight: true } } }
      },
      building: { select: { useFractionalWeight: true } }
    }
  });

  if (!voting) {
    return (
      <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Votação não encontrada.</h1>
        <Link href="/dashboard/votings" className="text-primary hover:underline">Voltar para a listagem</Link>
      </div>
    );
  }

  const now = new Date();
  const isOpen = now >= new Date(voting.startDate) && now <= new Date(voting.endDate) && voting.status === "OPEN";

  // Verificar se o usuário atual logado (se for morador) já votou.
  let hasVoted = false;
  if (session.role === "MORADOR") {
     const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { subUnits: true }});
     if (user && user.subUnits.length > 0) {
       const subUnitId = user.subUnits[0].id;
       hasVoted = voting.votes.some(v => v.subUnitId === subUnitId);
     }
  }


  // Resultados Ponderados
  const isFractional = voting.building.useFractionalWeight;
  const totalWeight = isFractional 
    ? voting.votes.reduce((acc, v) => acc + (v.subUnit.fractionalWeight || 1.0), 0)
    : voting.votes.length;

  const totalVotesCount = voting.votes.length;

  // Dados para o PDF
  const buildingInfo = await prisma.building.findUnique({
    where: { id: session.buildingId! },
    include: { _count: { select: { subUnits: true } } }
  });

  const participants = await prisma.vote.findMany({
    where: { votingId: voting.id },
    include: { subUnit: { include: { user: true } } }
  });

  const participantList = participants.map(v => ({
    unit: v.subUnit.identifier,
    name: v.subUnit.user?.name || "N/A"
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/votings" 
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">{voting.title}</h1>
            {isOpen ? (
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500/30 flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Aberta
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <span className="bg-white/10 text-white/40 text-xs px-3 py-1 rounded-full font-bold uppercase border border-white/10">Encerrada</span>
                {session.role === "SINDICO" && buildingInfo && (
                  <AtaPDFGenerator 
                    building={{
                      name: buildingInfo.name,
                      address: buildingInfo.address,
                      cnpj: buildingInfo.cnpj,
                      totalUnits: buildingInfo._count.subUnits
                    }}
                    voting={{
                      ...voting,
                      startDate: new Date(voting.startDate),
                      endDate: new Date(voting.endDate),
                      options: voting.options.map(o => {
                        const w = isFractional 
                          ? o.votes.reduce((acc, v) => acc + (v.subUnit.fractionalWeight || 1.0), 0)
                          : o.votes.length;
                        return { text: o.text, votes: w };
                      }),
                      totalVotes: isFractional ? totalWeight : totalVotesCount,
                      participants: participantList
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-white/40">
             <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Início: {new Date(voting.startDate).toLocaleString('pt-BR')}</span>
             <span className="flex items-center gap-1.5"><CalendarCheck className="w-4 h-4" /> Fim: {new Date(voting.endDate).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {voting.description && (
        <GlassCard delay={0.1} className="p-6">
           <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2"><FileSignature className="w-4 h-4" /> Justificativa / Pauta</h3>
           <p className="text-white/80 whitespace-pre-wrap">{voting.description}</p>
        </GlassCard>
      )}

      {/* RENDERIZAÇÃO CONDICIONAL DE PAPEL E ESTADO */}

      {(session.role === "SINDICO" || hasVoted || !isOpen) ? (
        <GlassCard delay={0.2} className="p-6">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
             <h3 className="text-xl font-bold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Resultados {isOpen ? "Parciais" : "Finais"}</h3>
             <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-medium text-white/50 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                   Votos: <strong className="text-white ml-1">{totalVotesCount}</strong>
                </span>
                {isFractional && (
                  <span className="text-[10px] font-bold text-primary/70 uppercase tracking-tighter bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    Fração Total: {totalWeight.toFixed(4)}
                  </span>
                )}
             </div>
           </div>

           <div className="space-y-5">
             {voting.options.map((option, index) => {
               const optionWeight = isFractional 
                  ? option.votes.reduce((acc, v) => acc + (v.subUnit.fractionalWeight || 1.0), 0)
                  : option.votes.length;

               const percentage = totalWeight > 0 ? Math.round((optionWeight / totalWeight) * 100) : 0;
               return (
                 <div key={option.id}>
                   <div className="flex justify-between items-end mb-2">
                     <span className="font-medium text-white/90">
                       <span className="text-white/30 font-bold mr-2">{String.fromCharCode(65 + index)}</span>
                       {option.text}
                     </span>
                     <div className="text-right">
                        <span className="text-sm font-bold text-white/60">
                          {isFractional ? optionWeight.toFixed(4) : `${option.votes.length} voto(s)`}
                          <span className="text-primary ml-1">({percentage}%)</span>
                        </span>
                     </div>
                   </div>
                   <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-1000 relative" 
                        style={{ width: `${percentage}%` }}
                      >
                         <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                      </div>
                   </div>
                 </div>
               )
             })}
           </div>
        </GlassCard>
      ) : (
        <SubmitVoteForm votingId={voting.id} options={voting.options.map(o => ({ id: o.id, text: o.text }))} />
      )}

    </div>
  );
}
