import { verifySession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GlassCard } from "@/components/GlassCard";
import { Building2, Plus, Users, MapPin, Power, PowerOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { toggleBuildingAction } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function BuildingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const { q } = await searchParams;

  const buildings = await prisma.building.findMany({
    where: q ? {
      name: { contains: q }
    } : {},
    include: {
      _count: { select: { users: true, subUnits: true, votings: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Gestão de Condomínios</h1>
          <div className="flex items-center gap-4">
             <p className="text-white/50">Clientes ativos: <strong className="text-white">{buildings.length}</strong></p>
             <form className="relative hidden sm:block">
                <input 
                  name="q"
                  placeholder="Buscar prédio..."
                  className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 pl-8 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <Building2 className="absolute left-2.5 top-2 w-3.5 h-3.5 text-white/20" />
             </form>
          </div>
        </div>
        
        <Link 
          href="/dashboard/buildings/new"
          className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 py-4 font-bold transition-all shadow-[0_10px_25px_rgba(59,130,246,0.3)] flex items-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Novo Setup Completo
        </Link>
      </div>

      {buildings.length === 0 ? (
        <GlassCard delay={0.1} className="p-12 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 rounded-full bg-white/5 mb-4 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white/20" />
           </div>
           <h3 className="text-xl font-bold text-white/80 mb-2">A plataforma está vazia</h3>
           <p className="text-white/40 max-w-sm">Comece cadastrando um condomínio e um síndico responsável.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {buildings.map((b, idx) => {
             const mrr = (b.maxSubUnits || 0) * 12.00;
             return (
               <div key={b.id} className="group relative">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                 <div className="relative bg-[#161B28] border border-white/5 p-6 rounded-2xl transition-all">
                   <div className="flex justify-between items-start mb-6">
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className="text-xl font-bold text-white transition-colors">{b.name}</h3>
                           {!b.active && <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-tighter">Inativo</span>}
                        </div>
                        {b.address && (
                          <p className="text-sm text-white/30 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{b.address}</p>
                        )}
                     </div>
                     <form action={toggleBuildingAction}>
                       <input type="hidden" name="buildingId" value={b.id} />
                       <button type="submit" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${b.active ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
                         {b.active ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                       </button>
                     </form>
                   </div>

                   <div className="grid grid-cols-3 gap-2 bg-black/20 rounded-xl p-4 mb-6">
                      <div className="text-center">
                         <p className="text-[10px] text-white/30 font-bold uppercase mb-1">Unidades</p>
                         <p className="text-white font-medium">{b._count.subUnits}</p>
                      </div>
                      <div className="text-center border-x border-white/5">
                         <p className="text-[10px] text-white/30 font-bold uppercase mb-1">Votários</p>
                         <p className="text-white font-medium">{b._count.users}</p>
                      </div>
                      <div className="text-center">
                         <p className="text-[10px] text-white/30 font-bold uppercase mb-1">Recita MRR</p>
                         <p className="text-emerald-400 font-bold text-sm">R$ {mrr.toFixed(0)}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                         {[...Array(Math.min(b._count.users, 3))].map((_, i) => (
                           <div key={i} className="w-8 h-8 rounded-full bg-white/5 border-2 border-[#161B28] flex items-center justify-center text-[10px] font-bold">
                              {String.fromCharCode(65 + i)}
                           </div>
                         ))}
                         {b._count.users > 3 && (
                           <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-[#161B28] flex items-center justify-center text-[10px] font-bold text-primary">
                             +{b._count.users - 3}
                           </div>
                         )}
                      </div>
                      <Link href={`/dashboard/buildings/${b.id}`} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 py-2.5 px-4 rounded-xl text-xs font-bold transition-all">
                         Gerenciar Painel <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                   </div>
                 </div>
               </div>
             )
          })}
        </div>
      )}
    </div>
  );
}
