"use client";

import { motion } from "framer-motion";

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0B0F19]">
      
      {/* Camada 1: Base do circuito estático com SVG mais complexo simulando uma PCB gigante */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.12]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern
          id="pcb-board"
          width="400"
          height="400"
          patternUnits="userSpaceOnUse"
        >
          {/* Desenho do Microchip (CI) no centro superior */}
          <g transform="translate(200, 100)">
            {/* O corpo do chip */}
            <rect x="-30" y="-30" width="60" height="60" fill="#0B0F19" stroke="#ffffff" strokeWidth="2" rx="4" />
            <circle cx="-18" cy="-18" r="3" fill="#ffffff" /> {/* Dot do pino 1 */}
            
            {/* Pinos verticais (Acima e Abaixo) */}
            <path d="M -20 -38 L -20 -30 M -10 -38 L -10 -30 M 0 -38 L 0 -30 M 10 -38 L 10 -30 M 20 -38 L 20 -30" stroke="#ffffff" strokeWidth="2" />
            <path d="M -20 30 L -20 38 M -10 30 L -10 38 M 0 30 L 0 38 M 10 30 L 10 38 M 20 30 L 20 38" stroke="#ffffff" strokeWidth="2" />
            
            {/* Pinos horizontais (Lados) */}
            <path d="M -38 -20 L -30 -20 M -38 -10 L -30 -10 M -38 0 L -30 0 M -38 10 L -30 10 M -38 20 L -30 20" stroke="#ffffff" strokeWidth="2" />
            <path d="M 30 -20 L 38 -20 M 30 -10 L 38 -10 M 30 0 L 38 0 M 30 10 L 38 10 M 30 20 L 38 20" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* Microchip Menor */}
          <g transform="translate(60, 300)">
            <rect x="-15" y="-15" width="30" height="30" fill="#0B0F19" stroke="#ffffff" strokeWidth="1.5" rx="2" />
            <path d="M -22 -5 L -15 -5 M -22 5 L -15 5" stroke="#ffffff" strokeWidth="2" />
            <path d="M 15 -5 L 22 -5 M 15 5 L 22 5" stroke="#ffffff" strokeWidth="2" />
            <path d="M -5 -22 L -5 -15 M 5 -22 L 5 -15" stroke="#ffffff" strokeWidth="2" />
            <path d="M -5 15 L -5 22 M 5 15 L 5 22" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* Trilhas densas ligando aos Pinos do Chip Central */}
          <path d="M 180 62 L 180 30 L 150 0" fill="none" stroke="#ffffff" strokeWidth="2" />
          <path d="M 190 62 L 190 40 L 220 10 L 270 10" fill="none" stroke="#ffffff" strokeWidth="2" />
          <path d="M 220 62 L 220 40 L 250 10 L 300 10" fill="none" stroke="#ffffff" strokeWidth="2" />
          
          <path d="M 162 100 L 120 100 L 100 80 L 50 80" fill="none" stroke="#ffffff" strokeWidth="2" />
          <path d="M 162 120 L 140 120 L 110 150 L 110 180" fill="none" stroke="#ffffff" strokeWidth="2" />

          {/* Trilhas ligando ao Chip Menor */}
          <path d="M 82 300 L 120 300 L 150 270 L 200 270" fill="none" stroke="#ffffff" strokeWidth="2" />
          <path d="M 60 278 L 60 220 L 30 190 L 0 190" fill="none" stroke="#ffffff" strokeWidth="2" />
          <path d="M 65 315 L 65 360 L 95 390 L 150 390" fill="none" stroke="#ffffff" strokeWidth="2" />

          {/* Outras malhas longas de suporte */}
          <path d="M 250 138 L 250 180 L 290 220 L 380 220" fill="none" stroke="#ffffff" strokeWidth="2" />
          <circle cx="380" cy="220" r="4" fill="#ffffff" />
          
          <path d="M 180 138 L 180 220 L 220 260 L 220 320" fill="none" stroke="#ffffff" strokeWidth="2" />
          <circle cx="220" cy="320" r="3" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          
          <path d="M 0 100 L 40 100 L 70 130" fill="none" stroke="#ffffff" strokeWidth="2" />
          <rect x="67" y="127" width="6" height="6" fill="#ffffff" />

          <path d="M 330 300 L 300 270 L 250 270" fill="none" stroke="#ffffff" strokeWidth="2" />
          <circle cx="330" cy="300" r="3.5" fill="#ffffff" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#pcb-board)" />
      </svg>

      {/* Camada 2: Correntes elétricas correndo nas mesmas trilhas da camada 1 */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.6]" xmlns="http://www.w3.org/2000/svg">
         <pattern id="pcb-data-flow" width="400" height="400" patternUnits="userSpaceOnUse">
           {/* Fluxo no Chip Menor (Azul) */}
           <motion.path
             d="M 60 278 L 60 220 L 30 190 L 0 190"
             fill="none"
             stroke="#3B82F6"
             strokeWidth="3"
             strokeDasharray="80"
             animate={{ strokeDashoffset: [200, -200] }}
             transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
           />
           
           <motion.path
             d="M 82 300 L 120 300 L 150 270 L 200 270"
             fill="none"
             stroke="#3B82F6"
             strokeWidth="3"
             strokeDasharray="70"
             animate={{ strokeDashoffset: [-150, 150] }}
             transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1 }}
           />

           {/* Fluxo no Chip Maior (Esmeralda) */}
           <motion.path
             d="M 190 62 L 190 40 L 220 10 L 270 10"
             fill="none"
             stroke="#10B981"
             strokeWidth="3"
             strokeDasharray="100"
             animate={{ strokeDashoffset: [-200, 200] }}
             transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
           />

           <motion.path
             d="M 162 100 L 120 100 L 100 80 L 50 80"
             fill="none"
             stroke="#10B981"
             strokeWidth="3"
             strokeDasharray="90"
             animate={{ strokeDashoffset: [180, -180] }}
             transition={{ duration: 4.5, repeat: Infinity, ease: "linear", delay: 1.5 }}
           />

           {/* Fluxo de Suporte Extra (Roxo) */}
           <motion.path
             d="M 250 138 L 250 180 L 290 220 L 380 220"
             fill="none"
             stroke="#8B5CF6"
             strokeWidth="3"
             strokeDasharray="120"
             animate={{ strokeDashoffset: [250, -250] }}
             transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2 }}
           />
         </pattern>
         <rect width="100%" height="100%" fill="url(#pcb-data-flow)" />
      </svg>

      {/* Gradiente escuro para que o login panel não brigue com as linhas visuais do fundo. Sem uso de blur dessa vez para manter nitidez dos traços. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/60 via-[#0B0F19]/20 to-[#0B0F19]/70" />
    </div>
  );
};
