import { verifySession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GlassCard } from "@/components/GlassCard";
import { Building2, Users, ClipboardList, MessageSquare, TrendingUp, ArrowRight, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await verifySession();
  if (!session) return null;

  // ======== ADMIN ========
  if (session.role === "ADMIN") {
    const [buildings, totalUsers, totalVotings, totalMessages, buildingData] = await Promise.all([
      prisma.building.count(),
      prisma.user.count(),
      prisma.voting.count(),
      prisma.message.count(),
      prisma.building.findMany({ select: { maxSubUnits: true, name: true, _count: { select: { users: true } } } })
    ]);

    const totalCapacity = buildingData.reduce((acc, b) => acc + (b.maxSubUnits || 0), 0);
    const estimatedMRR = totalCapacity * 12.00;

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Painel Administrativo</h1>
            <p className="text-white/60">Controle global da infraestrutura <strong className="text-primary">Sindaco</strong>.</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em] mb-1">Status do Sistema</p>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE 
            </div>
          </div>
        </div>

        {/* MÉTRICAS SaaS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard delay={0.1} className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-12 h-12" />
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Faturamento Estimado (MRR)</p>
            <p className="text-3xl font-bold text-emerald-400">
              <span className="text-sm font-normal mr-1">R$</span>
              {estimatedMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-white/30 mt-2">Baseado em R$ 12,00 por unidade/mês</p>
          </GlassCard>

          <Link href="/dashboard/buildings" className="group">
            <div className="bg-white/5 border border-white/10 hover:border-primary/40 p-6 rounded-2xl transition-all h-full">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Condomínios</p>
              <div className="flex items-end gap-3 mt-1">
                <p className="text-3xl font-bold text-white">{buildings}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mb-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                   +100%
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Usuários Totais</p>
            <p className="text-3xl font-bold text-white mt-1">{totalUsers}</p>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
               <div className="bg-primary h-full w-[65%] rounded-full"></div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
             <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Capacidade (Vagas)</p>
             <p className="text-3xl font-bold text-white mt-1">{totalCapacity}</p>
             <p className="text-[10px] text-white/30 mt-2">Limite contratual total</p>
          </div>
        </div>

        {/* PERFORMANCE VISUAL (GRÁFICO CSS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <GlassCard delay={0.2} className="lg:col-span-2 p-8">
              <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Distribuição por Prédio
              </h3>
              <div className="flex items-end gap-4 h-48 px-4">
                 {buildingData.slice(0, 6).map((b, i) => {
                    const height = Math.max(20, Math.min(100, (b._count.users / (b.maxSubUnits || 1)) * 100));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                         <div className="w-full relative flex items-end justify-center h-full">
                            <div 
                              className="w-full bg-primary/20 border border-primary/30 rounded-t-lg transition-all duration-1000 group-hover:bg-primary/40" 
                              style={{ height: `${height}%` }}
                            >
                               <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black text-white text-[10px] px-2 py-1 rounded">
                                  {b._count.users} moradores
                               </div>
                            </div>
                         </div>
                         <p className="text-[10px] text-white/40 uppercase truncate w-full text-center">{b.name.substring(0, 10)}</p>
                      </div>
                    );
                 })}
              </div>
           </GlassCard>

           <div className="space-y-4 text-center">
              <GlassCard delay={0.3} className="p-8 aspect-square flex flex-col items-center justify-center relative">
                 <div className="w-40 h-40 rounded-full border-[12px] border-white/5 border-t-primary border-r-primary flex flex-col items-center justify-center">
                    <p className="text-4xl font-bold text-white">{totalVotings}</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase">Votações</p>
                 </div>
                 <p className="mt-6 text-sm text-white/60">Histórico Total da Plataforma</p>
              </GlassCard>
           </div>
        </div>
      </div>
    );
  }

  // ======== SINDICO & MORADOR (código existente movido) ========
  if (!session.buildingId) return null;

  const now = new Date();

  const [activeVotings, totalUsers, pendingMessages, totalMessages] = await Promise.all([
    prisma.voting.count({
      where: {
        buildingId: session.buildingId,
        status: "OPEN",
        startDate: { lte: now },
        endDate: { gte: now },
      }
    }),
    prisma.user.count({ where: { buildingId: session.buildingId } }),
    prisma.message.count({ where: { buildingId: session.buildingId, isResolved: false } }),
    prisma.message.count({
      where: {
        buildingId: session.buildingId,
        ...(session.role === "MORADOR" ? { authorId: session.userId } : {})
      }
    }),
  ]);

  let pendingVotingsForMorador: {id: string; title: string; endDate: Date}[] = [];
  if (session.role === "MORADOR") {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { subUnits: true }
    });
    const subUnitId = user?.subUnits?.[0]?.id;

    if (subUnitId) {
      const openVotings = await prisma.voting.findMany({
        where: {
          buildingId: session.buildingId,
          status: "OPEN",
          startDate: { lte: now },
          endDate: { gte: now },
        },
        include: {
          votes: { where: { subUnitId } }
        },
        orderBy: { endDate: "asc" }
      });
      pendingVotingsForMorador = openVotings.filter(v => v.votes.length === 0);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Visão Geral</h1>
        <p className="text-white/60">Bem-vindo(a) de volta! Você está conectado como <strong className="text-primary">{session.role}</strong>.</p>
      </div>

      {session.role === "SINDICO" && (
        <div className="grid grid-cols-1 gap-4 mt-8">
           <Link href="/dashboard/settings" className="group">
             <div className="bg-primary/10 border border-primary/20 hover:border-primary/40 p-6 rounded-2xl flex items-center justify-between transition-all shadow-lg shadow-primary/5">
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-inner">
                     <Settings className="w-7 h-7" />
                 </div>
                 <div>
                     <h2 className="text-xl font-bold text-white">Configurações de Acesso</h2>
                     <p className="text-white/50 text-sm">Gerencie o código de convite e crie as unidades/vagas do prédio.</p>
                 </div>
               </div>
               <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-2 transition-transform" />
             </div>
           </Link>
        </div>
      )}

      {session.role === "SINDICO" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
           <Link href="/dashboard/votings" className="group">
             <div className="bg-white/5 border border-white/10 hover:border-primary/40 p-5 rounded-2xl flex items-center gap-4 transition-all">
               <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                   <ClipboardList className="w-6 h-6" />
               </div>
               <div>
                   <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Votações Ativas</p>
                   <p className="text-2xl font-bold">{activeVotings}</p>
               </div>
             </div>
           </Link>
           
           <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                 <Users className="w-6 h-6" />
             </div>
             <div>
                 <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Moradores</p>
                 <p className="text-2xl font-bold">{totalUsers}</p>
             </div>
           </div>

           <Link href="/dashboard/messages" className="group">
             <div className={`bg-white/5 border p-5 rounded-2xl flex items-center gap-4 transition-all ${pendingMessages > 0 ? 'border-orange-500/30 hover:border-orange-400/50' : 'border-white/10 hover:border-primary/40'}`}>
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pendingMessages > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-purple-500/20 text-purple-400'}`}>
                   <MessageSquare className="w-6 h-6" />
               </div>
               <div>
                   <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Caixa de Entrada</p>
                   <p className="text-2xl font-bold">{pendingMessages > 0 ? <span className="text-orange-400">{pendingMessages}</span> : "0"}</p>
               </div>
             </div>
           </Link>
        </div>
      )}

      {session.role === "MORADOR" && (
        <div className="grid grid-cols-1 gap-6 mt-8">
           <GlassCard delay={0.1} className="p-6">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-bold">Votações Pendentes</h2>
                 {pendingVotingsForMorador.length > 0 && (
                    <span className="bg-primary/20 text-primary px-3 py-1 text-xs rounded-full font-bold border border-primary/30 animate-pulse">
                      {pendingVotingsForMorador.length} nova(s)
                    </span>
                 )}
              </div>
              {pendingVotingsForMorador.length === 0 ? (
                <div className="text-center py-8 text-white/40 rounded-xl border border-dashed border-white/10">
                  Nenhuma votação pendente no momento.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingVotingsForMorador.map((v) => (
                    <Link key={v.id} href={`/dashboard/votings/${v.id}`} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-primary/40 hover:bg-white/5 transition-all group">
                       <div>
                         <p className="font-bold text-white group-hover:text-primary transition-colors">{v.title}</p>
                         <p className="text-xs text-white/40 mt-1">Encerra em {new Date(v.endDate).toLocaleDateString('pt-BR')}</p>
                       </div>
                       <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold border border-emerald-500/30">
                          Votar →
                       </span>
                    </Link>
                  ))}
                </div>
              )}
           </GlassCard>

           <GlassCard delay={0.2} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Fale com o Síndico</h2>
                <Link href="/dashboard/messages/new" className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-bold border border-primary/30 hover:bg-primary/30 transition-colors">
                  + Nova Mensagem
                </Link>
              </div>
              {totalMessages === 0 ? (
                <div className="text-center py-8 text-white/40 rounded-xl border border-dashed border-white/10">
                  Nenhuma mensagem enviada ainda.
                </div>
              ) : (
                <Link href="/dashboard/messages" className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-primary/40 hover:bg-white/5 transition-all">
                   <div>
                     <p className="font-bold text-white">{totalMessages} mensagem(s)</p>
                     <p className="text-xs text-white/40 mt-1">Ver histórico completo</p>
                   </div>
                </Link>
              )}
           </GlassCard>
        </div>
      )}
    </div>
  );
}
