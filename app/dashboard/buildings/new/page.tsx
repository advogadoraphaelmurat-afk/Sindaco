"use client";

import { useActionState } from "react";
import { setupNewCondoAction } from "@/app/actions/admin";
import { GlassCard } from "@/components/GlassCard";
import { Building2, UserPlus, ShieldCheck, Mail, Lock, Maximize2, MapPin, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

export default function NewBuildingPage() {
  const [state, action, isPending] = useActionState(setupNewCondoAction, null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/buildings" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Setup Completo</h1>
          <p className="text-white/40">Crie um novo ambiente e o síndico responsável em um único clique.</p>
        </div>
      </div>

      <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LADO ESQUERDO: CONDOMÍNIO */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 text-primary mb-2">
              <Building2 className="w-6 h-6" />
              <h2 className="font-bold text-lg uppercase tracking-wider">Dados do Condomínio</h2>
           </div>

           <GlassCard delay={0.1} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-white/60 mb-2 block">Nome do Condomínio *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                  <input 
                    name="name"
                    required
                    placeholder="Ex: Residencial Aurora"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/60 mb-2 block">Endereço Completo</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                  <input 
                    name="address"
                    placeholder="Rua das Palmas, 123 - Centro"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/60 mb-2 block">Capacidade de Unidades (Vagas contratadas) *</label>
                <div className="relative">
                  <Maximize2 className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                  <input 
                    name="maxSubUnits"
                    type="number"
                    defaultValue={50}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <p className="text-[10px] text-white/30 mt-1.5 flex items-center gap-1 italic"><Zap className="w-3 h-3" /> Faturamento será calculado em R$ 12,00 x este valor.</p>
              </div>
           </GlassCard>
        </div>

        {/* LADO DIREITO: SÍNDICO */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 text-purple-400 mb-2">
              <UserPlus className="w-6 h-6" />
              <h2 className="font-bold text-lg uppercase tracking-wider">Acesso do Síndico</h2>
           </div>

           <GlassCard delay={0.2} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-white/60 mb-2 block">Nome do Responsável *</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                  <input 
                    name="syndicName"
                    required
                    placeholder="Nome Completo"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/60 mb-2 block">E-mail de Acesso *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                  <input 
                    name="syndicEmail"
                    type="email"
                    required
                    placeholder="email@condominio.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/60 mb-2 block">Senha de Acesso *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                  <input 
                    name="syndicPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
           </GlassCard>

           {state?.error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium">
                 {state.error}
              </div>
           )}

           <button 
             type="submit"
             disabled={isPending}
             className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
             {isPending ? (
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
             ) : (
               <>Finalizar e Lançar Condomínio</>
             )}
           </button>
        </div>

      </form>
    </div>
  );
}
