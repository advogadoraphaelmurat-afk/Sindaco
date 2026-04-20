import { verifySession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GlassCard } from "@/components/GlassCard";
import { ArrowLeft, Users, Home, Plus, Trash2, Building2, UserPlus, Scale, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteUserAction, toggleFractionalWeightAction } from "@/app/actions/admin";
import { AddSubUnitForm } from "@/components/AddSubUnitForm";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  const building = await prisma.building.findUnique({
    where: { id },
    include: {
      users: { orderBy: { name: "asc" } },
      subUnits: {
        include: { user: { select: { name: true } } },
        orderBy: { identifier: "asc" }
      },
      _count: { select: { votings: true, notices: true, messages: true } }
    }
  });

  if (!building) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-2">Condomínio não encontrado.</h1>
        <Link href="/dashboard/buildings" className="text-primary hover:underline">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/buildings" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{building.name}</h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${building.active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
              {building.active ? "Ativo" : "Inativo"}
            </span>
          </div>
          {building.address && <p className="text-sm text-white/40">{building.address}</p>}
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Usuários", value: building.users.length, color: "primary" },
          { label: "Unidades", value: building.subUnits.length, color: "emerald" },
          { label: "Votações", value: building._count.votings, color: "purple" },
          { label: "Mensagens", value: building._count.messages, color: "orange" },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-white/40 uppercase font-medium tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Configurações Master */}
      <GlassCard delay={0.05} className="p-6 border-primary/20 bg-primary/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                 <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                 <h2 className="font-bold text-white">Configurações Master</h2>
                 <p className="text-xs text-white/40">Controles exclusivos da Administradora.</p>
              </div>
           </div>

           <form action={toggleFractionalWeightAction} className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-white/5">
              <input type="hidden" name="buildingId" value={building.id} />
              <div className="flex items-center gap-2 px-2">
                 <Scale className={`w-4 h-4 ${building.useFractionalWeight ? 'text-primary' : 'text-white/20'}`} />
                 <span className="text-xs font-bold text-white/70">Voto por Fração Ideal</span>
              </div>
              <button 
                type="submit"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${building.useFractionalWeight ? 'bg-primary' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${building.useFractionalWeight ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
           </form>
        </div>
      </GlassCard>

      {/* Usuários */}
      <GlassCard delay={0.1} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Usuários</h2>
          <Link href={`/dashboard/buildings/${building.id}/users/new`} className="bg-primary/20 text-primary text-xs px-3 py-1.5 rounded-full font-bold border border-primary/30 hover:bg-primary/30 transition-colors flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5" /> Adicionar
          </Link>
        </div>

        {building.users.length === 0 ? (
          <div className="text-center py-6 text-white/40 border border-dashed border-white/10 rounded-xl">
            Nenhum usuário cadastrado.
          </div>
        ) : (
          <div className="space-y-2">
            {building.users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border ${user.role === 'SINDICO' ? 'bg-primary/20 text-primary border-primary/40' : 'bg-white/5 text-white/40 border-white/10'}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-white/40">{user.email} · <span className={`font-bold ${user.role === 'SINDICO' ? 'text-primary' : 'text-white/50'}`}>{user.role}</span></p>
                  </div>
                </div>
                <form action={deleteUserAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="buildingId" value={building.id} />
                  <button type="submit" className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors" title="Remover">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Sub-Unidades */}
      <GlassCard delay={0.2} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Home className="w-5 h-5 text-primary" /> Unidades Habitacionais</h2>
        </div>

        <AddSubUnitForm buildingId={building.id} />

        {building.subUnits.length === 0 ? (
          <div className="text-center py-6 text-white/40 border border-dashed border-white/10 rounded-xl mt-4">
            Nenhuma unidade cadastrada.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            {building.subUnits.map(su => (
              <div key={su.id} className="bg-black/20 border border-white/5 p-3 rounded-xl">
                <p className="text-sm font-bold text-white">{su.identifier}</p>
                <p className="text-xs text-white/30 mt-1">
                  {su.user ? `→ ${su.user.name}` : "Vaga"}
                </p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
