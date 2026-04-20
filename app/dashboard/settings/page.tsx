import { verifySession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { Settings, Key, LayoutGrid, Plus, Trash2, ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { updateBuildingInviteCodeAction, bulkCreateSubUnitsAction } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";
import { UnitManagerTable } from "@/components/UnitManagerTable";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function SettingsPage() {
  const session = await verifySession();
  if (!session || session.role !== "SINDICO") {
    redirect("/dashboard");
  }

  const building = await prisma.building.findUnique({
    where: { id: session.buildingId! },
    include: {
      subUnits: {
        orderBy: { identifier: 'asc' }
      },
      _count: {
        select: { subUnits: true }
      }
    }
  });

  if (!building) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
        <h2 className="text-xl font-bold text-red-400">Prédio não localizado</h2>
        <p className="text-white/60 mt-2">Sua conta de Síndico não possui um condomínio vinculado. Fale com o suporte.</p>
        <Link href="/dashboard" className="text-primary mt-4 inline-block font-bold">Voltar ao Início</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Configurações do Condomínio
        </h1>
        <p className="text-white/50 mt-1">Gerencie chaves de acesso e unidades habitacionais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CHAVE DE ACESSO */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1">
            <Key className="w-5 h-5 text-yellow-500" />
            Auto-Cadastro
          </h2>
          <GlassCard delay={0.1} className="p-6">
            <form action={updateBuildingInviteCodeAction} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/40 block mb-2">Chave de Convite (Invite Code)</label>
                  <input 
                    name="inviteCode"
                    defaultValue={building.inviteCode || ""}
                    placeholder="Ex: RES-AURORA"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/40 block mb-2">CNPJ do Condomínio</label>
                  <input 
                    name="cnpj"
                    defaultValue={building.cnpj || ""}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              <p className="text-xs text-white/30 italic">
                * Compartilhe este código com os moradores para que eles possam se cadastrar sozinhos.
              </p>
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all">
                Salvar Chave de Acesso
              </button>
            </form>
          </GlassCard>
        </div>

        {/* ESTATÍSTICAS RÁPIDAS */}
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1">
                Visualização Geral
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <GlassCard delay={0.2} className="p-5 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-primary">{building._count.subUnits}</span>
                    <span className="text-xs text-white/40 uppercase tracking-wider mt-1">Unidades Totais</span>
                </GlassCard>
                <GlassCard delay={0.3} className="p-5 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-white">{building.inviteCode ? "Ativa" : "Inativa"}</span>
                    <span className="text-xs text-white/40 uppercase tracking-wider mt-1">Status do Registro</span>
                </GlassCard>
            </div>
        </div>

      </div>

      {/* CRIAÇÃO EM LOTE */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1">
          <LayoutGrid className="w-5 h-5 text-primary" />
          Gerenciar Unidades (Lote)
        </h2>
        <GlassCard delay={0.4} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                    <h3 className="font-bold text-white text-base">Criação Instantânea</h3>
                    <p className="text-sm text-white/50">
                        Crie múltiplas unidades de uma vez. Útil para o setup inicial do prédio.
                        Ex: Crie do &quot;Apto 101&quot; até o &quot;Apto 120&quot;.
                    </p>
                    <form action={bulkCreateSubUnitsAction} className="grid grid-cols-2 gap-4 pt-4">
                        <div className="col-span-2">
                             <label className="text-xs text-white/40 block mb-1">Prefixo (Opcional)</label>
                             <input name="prefix" placeholder="Ex: Bloco A - Apto" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                             <label className="text-xs text-white/40 block mb-1">Início (Número)</label>
                             <input type="number" name="start" defaultValue={101} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                        </div>
                        <div>
                             <label className="text-xs text-white/40 block mb-1">Fim (Número)</label>
                             <input type="number" name="end" defaultValue={110} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                        </div>
                        <button className="col-span-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
                            <Plus className="w-5 h-5" /> Criar Unidades em Lote
                        </button>
                    </form>
                </div>

                <div className="space-y-4 border-l border-white/5 pl-0 lg:pl-12">
                    <h3 className="font-bold text-white text-base">Links de Auxílio</h3>
                    <div className="space-y-2">
                         <Link href="/dashboard/users" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl group transition-all">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-primary/50" />
                                <span className="text-sm font-medium">Ver Fila de Aprovação</span>
                            </div>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                         </Link>
                         <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-3">
                            <Trash2 className="w-5 h-5 text-red-500/50" />
                            <span className="text-sm text-red-200/50">Limpar Unidades Vazias (Em breve)</span>
                         </div>
                    </div>
                </div>
            </div>
        </GlassCard>
        {/* LISTAGEM DE UNIDADES EXISTENTES */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1">
          <Users className="w-5 h-5 text-emerald-400" />
          Unidades Cadastradas
        </h2>
        <UnitManagerTable initialUnits={building.subUnits} />
      </div>
    </div>
    </div>
  );
}
