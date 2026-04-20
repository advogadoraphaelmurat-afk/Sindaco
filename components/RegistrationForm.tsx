"use client";

import { useActionState, useEffect, useState } from "react";
import { registerUserAction, getAvailableUnitsByCode } from "@/app/actions/register";
import { GlassCard } from "@/components/GlassCard";
import { UserPlus, Home, Mail, Lock, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function RegistrationForm({ inviteCode }: { inviteCode: string }) {
  const [state, formAction, isPending] = useActionState(registerUserAction, null);
  const [units, setUnits] = useState<{id: string; identifier: string}[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);

  useEffect(() => {
    async function loadUnits() {
      const data = await getAvailableUnitsByCode(inviteCode);
      setUnits(data);
      setLoadingUnits(false);
    }
    loadUnits();
  }, [inviteCode]);

  if (loadingUnits) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (units.length === 0 && !loadingUnits) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60 mb-4">Que pena! Não encontramos unidades disponíveis para este código ou o condomínio é inválido.</p>
        <Link href="/register" className="text-primary hover:underline flex items-center justify-center gap-2">
           <ArrowLeft className="w-4 h-4" /> Tentar outro código
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="inviteCode" value={inviteCode} />
      
      {state?.error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        <div className="relative group">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5 block px-1">Seu Nome Completo</label>
          <div className="relative">
            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              name="name" 
              type="text" 
              required 
              placeholder="Digite seu nome"
              className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
            />
          </div>
        </div>

        <div className="relative group">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5 block px-1">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="seu@email.com"
              className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
            />
          </div>
        </div>

        <div className="relative group">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5 block px-1">Senha</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              name="password" 
              type="password" 
              required 
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
            />
          </div>
        </div>

        <div className="relative group">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5 block px-1">Selecione sua Unidade</label>
          <div className="relative">
            <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors pointer-events-none" />
            <select 
              name="subUnitId" 
              required
              className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium appearance-none"
            >
              <option value="" className="bg-slate-900">Clique para escolher...</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id} className="bg-slate-900">
                  {unit.identifier}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3 text-lg mt-4 group"
      >
        {isPending ? "Cadastrando..." : "Finalizar Cadastro"}
        {!isPending && <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
      </button>

      <p className="text-[10px] text-white/20 text-center uppercase tracking-widest font-bold mt-4">
        Seu acesso será liberado após confirmação do síndico.
      </p>
    </form>
  );
}
