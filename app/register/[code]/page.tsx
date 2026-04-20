import { GlassCard } from "@/components/GlassCard";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { RegistrationForm } from "@/components/RegistrationForm";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function RegisterDetailsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />

      <GlassCard delay={0.1} className="w-full max-w-lg p-6 sm:p-10 my-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/register" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/50" />
          </Link>
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Sindaco" width={40} height={40} className="object-contain" />
            <span className="font-bold text-xl text-white">Sindaco</span>
          </div>
          <div className="w-10 h-10"></div> {/* Spacer */}
        </div>

        <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Quase lá!</h1>
            <p className="text-white/50 text-sm">
              Você está se cadastrando no condomínio com a chave <span className="text-primary font-bold tracking-widest">{code.toUpperCase()}</span>.
            </p>
        </div>

        <RegistrationForm inviteCode={code.toUpperCase()} />
      </GlassCard>
    </main>
  );
}
