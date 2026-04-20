"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Menu, X, Home, Bell, ClipboardList, Users, MessageSquare, Building2, Settings } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

// Mapa de ícones para evitar passar componentes React via Server → Client
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Bell, ClipboardList, Users, MessageSquare, Building2, Settings
};

interface MenuItem {
  name: string;
  iconName: string;
  href: string;
}

interface MobileSidebarProps {
  menu: MenuItem[];
  email: string;
  role: string;
}

export function MobileSidebar({ menu, email, role }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 safe-area-inset">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Sindaco" width={26} height={26} className="object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="font-bold text-base tracking-tight text-white">Sindaco</span>
        </div>
        <div className="flex items-center gap-2">
          <form action={logoutAction}>
            <button type="submit" className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors active:scale-95" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors active:scale-95"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`
        lg:hidden fixed top-14 right-0 z-50 w-72 h-[calc(100vh-3.5rem)]
        bg-[#0B0F19]/98 backdrop-blur-xl border-l border-white/5
        flex flex-col transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-white/40 mb-4 px-2 uppercase tracking-wider">
            Menu Principal
          </div>
          {menu.map((item) => {
            const Icon = iconMap[item.iconName] || Home;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 active:bg-white/10 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                <Icon className="w-5 h-5 text-primary" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 mb-3">
             <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold text-xs">
                {role.substring(0, 1)}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{email}</p>
                <p className="text-xs text-white/40 truncate">{role}</p>
             </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-2 px-3 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 active:bg-red-500/20 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              Sair da Aplicação
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
