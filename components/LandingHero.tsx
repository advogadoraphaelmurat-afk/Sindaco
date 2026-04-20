"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-50" />
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Sua Gestão Condominial 2.0
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white mb-6">
            A forma inteligente de <span className="text-primary">Votar e Decidir</span> no seu condomínio.
          </h1>
          
          <p className="text-lg text-white/50 leading-relaxed max-w-xl">
            Acabe com as assembleias cansativas. O Sindaco oferece votações digitais juridicamente válidas, atas instantâneas e gestão completa de quórum.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold px-8 py-4 rounded-2xl transition-all flex items-center justify-center"
            >
              Ver Funcionalidades
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-4">
             {[
               "Válido pela Lei 14.309/22",
               "Atas em PDF automáticas",
               "Seguro e Criptografado"
             ].map((t) => (
               <div key={t} className="flex items-center gap-2 text-sm text-white/40">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {t}
               </div>
             ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-primary/20">
            {/* Placeholder para o preview do dashboard gerado */}
            <div className="aspect-[4/3] bg-black/40 flex items-center justify-center">
               <Image 
                 src="/dashboard-preview.png" // User can move the file here
                 alt="Sindaco Dashboard Preview" 
                 width={800} 
                 height={600}
                 className="object-cover"
                 onError={(e) => {
                    // Fallback to simple UI representation if image not found
                    e.currentTarget.style.display = 'none';
                 }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-60" />
            </div>
          </div>
          
          {/* Decorative Card */}
          <div className="absolute -bottom-6 -left-6 z-20 bg-white/5 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl hidden sm:block">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                   <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                   <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none">Votação Encerrada</p>
                   <p className="text-sm font-bold text-white mt-1">Aprovação por 2/3 atingida</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
