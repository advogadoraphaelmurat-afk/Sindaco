"use client";

import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ArrowRight, Building2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterStartPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/register/${code.toUpperCase()}`);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />

      <GlassCard delay={0.2} className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center">Cadastro de Morador</h1>
          <p className="text-white/50 text-center text-sm mt-2">
            Insira o código de acesso fornecido pelo seu síndico para começar.
          </p>
        </div>

        <form onSubmit={handleContinue} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Código do Condomínio</label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: RES-AURORA"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-center font-bold tracking-widest uppercase"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 group"
          >
            Continuar para o Cadastro
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
               Já tem uma conta? Voltar ao Login
            </Link>
        </div>
      </GlassCard>
    </main>
  );
}
