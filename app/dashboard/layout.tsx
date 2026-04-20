import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { LogOut, Home, Bell, ClipboardList, Users, MessageSquare, Building2, Settings, LifeBuoy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MobileSidebar } from "@/components/MobileSidebar";

// Ícones só usados no desktop (Server Component — sem restrição)
const desktopIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, ClipboardList, MessageSquare, Bell, Users, Building2, Settings, LifeBuoy
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  if (!session) {
    redirect("/");
  }

  // Menu unificado com iconName (string serializável)
  let menu: { name: string; iconName: string; href: string }[] = [];
  
  if (session.role === "SINDICO") {
    menu = [
      { name: "Painel Síndico", iconName: "Home", href: "/dashboard" },
      { name: "Votações", iconName: "ClipboardList", href: "/dashboard/votings" },
      { name: "Caixa de Entrada", iconName: "MessageSquare", href: "/dashboard/messages" },
      { name: "Avisos Gerais", iconName: "Bell", href: "/dashboard/notices" },
      { name: "Moradores", iconName: "Users", href: "/dashboard/users" },
      { name: "Suporte Master", iconName: "LifeBuoy", href: "/dashboard/support" },
      { name: "Configurações", iconName: "Settings", href: "/dashboard/settings" },
    ];
  } else if (session.role === "MORADOR") {
    menu = [
      { name: "Meu Início", iconName: "Home", href: "/dashboard" },
      { name: "Votações", iconName: "ClipboardList", href: "/dashboard/votings" },
      { name: "Fale com o Síndico", iconName: "MessageSquare", href: "/dashboard/messages" },
      { name: "Avisos", iconName: "Bell", href: "/dashboard/notices" },
    ];
  } else if (session.role === "ADMIN") {
    menu = [
      { name: "Painel Geral", iconName: "Home", href: "/dashboard" },
      { name: "Condomínios", iconName: "Building2", href: "/dashboard/buildings" },
      { name: "Atendimento Master", iconName: "LifeBuoy", href: "/dashboard/admin/support" },
    ];
  } else {
    menu = [{ name: "Dashboard", iconName: "Home", href: "/dashboard" }];
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white lg:flex">
      
      {/* ==================== SIDEBAR DESKTOP (lg+) ==================== */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 bg-white/[0.02] flex-col backdrop-blur-md shrink-0 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <Image src="/logo.png" alt="Sindaco Logo" width={32} height={32} className="object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="font-bold text-lg tracking-tight">Sindaco</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-xs font-semibold text-white/40 mb-4 px-2 uppercase tracking-wider">
            Menu Principal
          </div>
          {menu.map((item) => {
            const Icon = desktopIcons[item.iconName] || Home;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                <Icon className="w-4 h-4 text-primary" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 mb-3">
             <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold text-xs">
                {session.role.substring(0, 1)}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{session.email}</p>
                <p className="text-xs text-white/40 truncate">{session.role}</p>
             </div>
          </div>
          
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              Sair da Aplicação
            </button>
          </form>
        </div>
      </aside>

      {/* ==================== SIDEBAR MOBILE (<lg) ==================== */}
      <MobileSidebar menu={menu} email={session.email} role={session.role} />

      {/* ==================== CONTENT AREA ==================== */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        <div className="px-4 pt-18 pb-8 lg:px-8 lg:pt-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
