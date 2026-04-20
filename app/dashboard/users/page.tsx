import { verifySession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GlassCard } from "@/components/GlassCard";
import { Users as UsersIcon, Home, Mail, Check, X, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { toggleUserApprovalAction } from "@/app/actions/admin";
import { UnitWeightManager } from "@/components/UnitWeightManager";
import { Scale } from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function UsersPage() {
  const session = await verifySession();
  if (!session || (session.role !== "SINDICO" && session.role !== "ADMIN") || !session.buildingId) {
    redirect("/dashboard");
  }

  const [allUsers, building, units] = await Promise.all([
    prisma.user.findMany({
      where: { buildingId: session.buildingId },
      include: { subUnits: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.building.findUnique({
      where: { id: session.buildingId },
      select: { useFractionalWeight: true }
    }),
    prisma.subUnit.findMany({
      where: { buildingId: session.buildingId },
      orderBy: { identifier: "asc" }
    })
  ]);

  const pendingUsers = allUsers.filter(u => u.status === "PENDING");
  const approvedUsers = allUsers.filter(u => u.status === "APPROVED");

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
             <UsersIcon className="w-8 h-8 text-primary" />
             Gestão de Moradores
          </h1>
          <p className="text-white/50 mt-1">Gerencie os moradores e aprove novos cadastros.</p>
        </div>
      </div>

      {/* GESTÃO DE FRAÇÃO IDEAL (SÓ SÍNDICO E SE ATIVO) */}
      {session.role === "SINDICO" && building?.useFractionalWeight && (
        <section className="space-y-4">
           <div className="flex items-center gap-2 px-1 text-primary">
              <Scale className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white">Configuração de Fração Ideal</h2>
           </div>
           <GlassCard delay={0.05} className="p-6">
              <p className="text-sm text-white/50 mb-6">Como o <strong>Voto por Fração Ideal</strong> está ativo para este condomínio, você deve conferir os pesos decimais de cada unidade abaixo. Clique no valor para editar.</p>
              <UnitWeightManager units={units} />
           </GlassCard>
        </section>
      )}

      {/* FILA DE APROVAÇÃO */}
      {pendingUsers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <Clock className="w-5 h-5 text-yellow-500" />
             <h2 className="text-lg font-bold text-white">Aguardando Aprovação ({pendingUsers.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map((user) => (
              <GlassCard key={user.id} delay={0.1} className="p-5 border-yellow-500/20 bg-yellow-500/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-lg border border-yellow-500/30">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{user.name}</h3>
                      <p className="text-xs text-white/40">{user.email}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-yellow-500 font-bold uppercase tracking-wider">
                         <Home className="w-3 h-3" />
                         Unidade: {user.subUnits.map(s => s.identifier).join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={toggleUserApprovalAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="approve" value="true" />
                        <button type="submit" className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-green-500/20" title="Aprovar">
                            <Check className="w-5 h-5" />
                        </button>
                    </form>
                    <form action={toggleUserApprovalAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="approve" value="false" />
                        <button type="submit" className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 p-2.5 rounded-xl transition-all" title="Recusar">
                            <X className="w-5 h-5" />
                        </button>
                    </form>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* LISTA DE APROVADOS */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-white px-1">Moradores Ativos ({approvedUsers.length})</h2>
        {approvedUsers.length === 0 ? (
          <GlassCard delay={0.1} className="p-12 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 rounded-full bg-white/5 mb-4 flex items-center justify-center">
                <UsersIcon className="w-10 h-10 text-white/20" />
             </div>
             <h3 className="text-xl font-bold text-white/80 mb-2">Nenhum Morador Ativo</h3>
             <p className="text-white/40 max-w-sm">Os moradores aprovados aparecerão aqui.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedUsers.map((user, idx) => (
              <GlassCard key={user.id} delay={0.05 * idx} className="p-5 group hover:border-white/20 transition-all">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border ${user.role === 'SINDICO' ? 'bg-primary/20 text-primary border-primary/40' : 'bg-white/5 text-white/50 border-white/10'}`}>
                      {user.name.charAt(0).toUpperCase()}
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white">{user.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${user.role === 'SINDICO' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                          {user.role}
                        </span>
                     </div>
                     <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>
                     </div>
                     {user.subUnits.length > 0 && (
                       <div className="flex items-center gap-1 mt-2 text-xs text-white/30 font-medium">
                          <Home className="w-3 h-3 text-primary/40" />
                          {user.subUnits.map(s => s.identifier).join(', ')}
                       </div>
                     )}
                   </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
