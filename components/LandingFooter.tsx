"use client";

import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 py-16 bg-black/20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="space-y-4 text-center md:text-left">
          <Link href="/" className="flex items-center justify-center md:justify-start gap-3">
            <Image src="/logo.png" alt="Sindaco Logo" width={40} height={40} />
            <span className="font-bold text-2xl">Sindaco</span>
          </Link>
          <p className="text-white/30 text-sm max-w-xs">
            A plataforma definitiva para assembleias digitais e governança condominial inteligente.
          </p>
          <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
            © 2026 Sindaco - Powered by Murats Tech
          </p>
        </div>

        <div className="grid grid-cols-2 gap-16">
          <div className="space-y-4">
             <h6 className="text-[10px] font-bold uppercase tracking-widest text-primary">Produto</h6>
             <nav className="flex flex-col gap-2">
                <Link href="#features" className="text-sm text-white/40 hover:text-white transition-colors">Funcionalidades</Link>
                <Link href="#pricing" className="text-sm text-white/40 hover:text-white transition-colors">Preços</Link>
                <Link href="/register" className="text-sm text-white/40 hover:text-white transition-colors">Cadastrar Prédio</Link>
             </nav>
          </div>
          
          <div className="space-y-4">
             <h6 className="text-[10px] font-bold uppercase tracking-widest text-primary">Jurídico</h6>
             <nav className="flex flex-col gap-2">
                <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">Termos de Uso</Link>
                <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">Privacidade</Link>
                <Link href="#legal" className="text-sm text-white/40 hover:text-white transition-colors">Conformidade Legal</Link>
             </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
