"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center">
          {state.error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-white/80 ml-1">E-mail ou CPF</label>
        <input 
          type="text" 
          name="email"
          placeholder="seu@email.com" 
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-white/80 ml-1">Senha</label>
        <input 
          type="password" 
          name="password"
          placeholder="••••••••" 
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          required
        />
      </div>

      <div className="flex items-center justify-between pt-2 pb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" className="rounded bg-black/20 border-white/10 text-primary focus:ring-primary/50 w-4 h-4" />
          <span className="text-sm text-white/60">Lembrar-me</span>
        </label>
        <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
          Esqueceu a senha?
        </a>
      </div>

      <button 
        type="submit"
        disabled={isPending}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl py-3.5 font-semibold transition-all duration-200 transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2"
      >
        {isPending ? "Autenticando..." : "Acessar Plataforma"}
        {!isPending && <LogIn className="w-4 h-4" />}
      </button>
    </form>
  );
}
