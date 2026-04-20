"use client";

import { motion } from "framer-motion";
import { Scale, FileText, Shield, Users, BarChart, Smartphone } from "lucide-react";
import { GlassCard } from "./GlassCard";

const features = [
  {
    title: "Voto por Fração Ideal",
    description: "Cálculos ponderados automáticos para condomínios que exigem peso de voto proporcional à metragem da unidade.",
    icon: Scale,
    color: "primary"
  },
  {
    title: "Atas Jurídicas Instantâneas",
    description: "Gere documentos oficiais em PDF prontos para registro logo após o encerramento da votação.",
    icon: FileText,
    color: "emerald"
  },
  {
    title: "Total Validade Jurídica",
    description: "Plataforma desenvolvida em conformidade com a Lei 14.309/22, garantindo segurança para suas decisões.",
    icon: Shield,
    color: "purple"
  },
  {
    title: "Auto-Cadastro de Moradores",
    description: "Moradores se cadastram via código de convite e o síndico aprova em um clique, sem burocracia.",
    icon: Users,
    color: "orange"
  },
  {
    title: "Gestão de Quórums",
    description: "Controle automático de maioria simples, 2/3, 3/4 ou unanimidade conforme o tema da pauta.",
    icon: BarChart,
    color: "blue"
  },
  {
    title: "Acesso em Qualquer Lugar",
    description: "Interface mobile-first otimizada para que o morador vote do próprio smartphone com total agilidade.",
    icon: Smartphone,
    color: "rose"
  }
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em]">Funcionalidades</h2>
        <h3 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
          Poder de decisão na palma da mão
        </h3>
        <p className="text-lg text-white/40 leading-relaxed">
          Tudo o que você precisa para uma governança transparente e moderna no seu condomínio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, idx) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard className="p-8 h-full group hover:border-primary/50 transition-colors">
              <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300`}>
                <f.icon className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">{f.title}</h4>
              <p className="text-white/40 leading-relaxed text-sm">
                {f.description}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
