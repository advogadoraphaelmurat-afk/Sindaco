"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck, HeartHandshake, Zap } from "lucide-react";
import { GlassCard } from "./GlassCard";
import Link from "next/link";

export function LandingPricing() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em]">Preços</h2>
          <h3 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Simples, transparente e escalável
          </h3>
          <p className="text-lg text-white/40 leading-relaxed">
            Pague apenas pelo que usa. Sem taxas de instalação ou contratos fidelidade.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-8 border-primary/30 relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-bl-xl">
                 Mais Popular
               </div>

               <div className="flex items-end gap-2 mb-8">
                  <span className="text-sm font-bold text-white/40 mb-2 uppercase tracking-widest">R$</span>
                  <span className="text-6xl font-black text-white leading-none">12,00</span>
                  <span className="text-sm font-bold text-white/40 mb-2">/ unidade por mês</span>
               </div>

               <h4 className="text-xl font-bold text-white mb-6">Plano Professional</h4>

               <div className="space-y-4 mb-10">
                  {[
                    "Votações Ilimitadas",
                    "Geração de Atas em PDF",
                    "Cálculo de Fração Ideal",
                    "Gestão de Moradores",
                    "Suporte Master 24/7",
                    "Ambiente Seguro (SSL)",
                    "Backup Diário"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                       <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                       </div>
                       <span className="text-sm text-white/70">{item}</span>
                    </div>
                  ))}
               </div>

               <Link 
                 href="/register" 
                 className="w-full inline-block bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl text-center shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
               >
                 Começar Teste Grátis
               </Link>
            </GlassCard>
          </motion.div>
        </div>

        {/* Legal Trust Bar */}
        <div id="legal" className="mt-24 py-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
           <div className="space-y-3">
             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                <ShieldCheck className="w-6 h-6 text-primary" />
             </div>
             <h5 className="font-bold text-white">Segurança Jurídica</h5>
             <p className="text-xs text-white/30 leading-relaxed">Em total conformidade com a <strong>Lei 14.309/22</strong>, garantindo validade total para assembleias digitais.</p>
           </div>
           
           <div className="space-y-3">
             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                <HeartHandshake className="w-6 h-6 text-primary" />
             </div>
             <h5 className="font-bold text-white">Transparência Total</h5>
             <p className="text-xs text-white/30 leading-relaxed">Histórico imutável de votos e participações para auditoria e prestação de contas clara.</p>
           </div>

           <div className="space-y-3">
             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                <Zap className="w-6 h-6 text-primary" />
             </div>
             <h5 className="font-bold text-white">Agilidade Máxima</h5>
             <p className="text-xs text-white/30 leading-relaxed">Ata gerada em segundos após a votação, pronta para ser enviada por e-mail ou WhatsApp.</p>
           </div>
        </div>
      </div>
    </section>
  );
}
