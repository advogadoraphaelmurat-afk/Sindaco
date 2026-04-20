"use client";

import { useActionState } from "react";
import { createUserAction } from "@/app/actions/admin";
import { GlassCard } from "@/components/GlassCard";
import { Send, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function NewUserPage() {
  const params = useParams<{ id: string }>();
  const buildingId = params.id;
  const [state, formAction, isPending] = useActionState(createUserAction, null);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/dashboard/buildings/${buildingId}`}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <UserPlus className="text-primary w-8 h-8" />
            Novo Usuário
          </h1>
          <p className="text-white/50 mt-1">Cadastre um síndico ou morador neste condomínio.</p>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="buildingId" value={buildingId} />
        
        {state?.error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm">
            {state.error}
          </div>
        )}

        <GlassCard delay={0.1} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/60 mb-2 block">Nome Completo</label>
              <input type="text" name="name" required placeholder="Ex: João Silva"
                className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/60 mb-2 block">E-mail de Acesso</label>
              <input type="email" name="email" required placeholder="usuario@email.com"
                className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/60 mb-2 block">Senha Inicial</label>
              <input type="password" name="password" required placeholder="Mínimo 6 caracteres" minLength={6}
                className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/60 mb-2 block">Papel / Role</label>
              <select name="role" required
                className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="MORADOR">Morador</option>
                <option value="SINDICO">Síndico</option>
              </select>
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end pt-4 pb-12">
          <button type="submit" disabled={isPending}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(59,130,246,0.4)] flex items-center gap-3 text-lg"
          >
            {isPending ? "Cadastrando..." : "Cadastrar Usuário"}
            {!isPending && <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}
