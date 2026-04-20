import { AnimatedBackground } from "@/components/AnimatedBackground";
import { GlassCard } from "@/components/GlassCard";
import { LoginForm } from "@/components/LoginForm";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const params = await searchParams;
  const showSuccess = params.registered === "true";

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           Voltar para a Home
        </Link>
      </div>

      <GlassCard delay={0.2} className="w-full max-w-md p-8 pt-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-48 h-48 flex items-center justify-center mb-2 drop-shadow-xl">
            <Image 
              src="/logo.png" 
              alt="Logo Sindaco" 
              width={190} 
              height={190} 
              className="object-contain"
              priority
            />
          </div>
          <p className="text-white/60 text-center font-medium">
            Entre na sua conta para gerir suas votações.
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-500/20 border border-green-500/50 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-sm text-green-100 italic">
              Cadastro realizado com sucesso! Aguarde a aprovação do síndico para logar.
            </p>
          </div>
        )}

        <LoginForm />

        <div className="mt-8 text-center space-y-4">
           <Link href="/register" className="inline-block text-primary hover:text-primary/80 font-bold transition-all hover:scale-105 active:scale-95">
              Não tem conta? Cadastre seu Condomínio
           </Link>
           <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">
              Powered by Murats Tech
           </p>
        </div>
      </GlassCard>
    </main>
  );
}
