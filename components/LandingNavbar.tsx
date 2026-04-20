"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function LandingNavbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6"
    >
      <div className="w-full max-w-7xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl">
        <Link href="/" className="flex items-center gap-3 group">
          <Image 
            src="/logo.png" 
            alt="Sindaco Logo" 
            width={32} 
            height={32} 
            className="group-hover:rotate-12 transition-transform duration-500"
          />
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Sindaco
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-white/60 hover:text-primary transition-colors">Funcionalidades</Link>
          <Link href="#pricing" className="text-sm font-medium text-white/60 hover:text-primary transition-colors">Preços</Link>
          <Link href="#legal" className="text-sm font-medium text-white/60 hover:text-primary transition-colors">Jurídico</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-bold text-white/80 hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <Link 
            href="/register" 
            className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
