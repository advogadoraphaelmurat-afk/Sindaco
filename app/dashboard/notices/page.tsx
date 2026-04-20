import { verifySession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GlassCard } from "@/components/GlassCard";
import { Bell, Plus, Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function NoticesPage() {
  const session = await verifySession();
  if (!session || !session.buildingId) return null;

  const isSindico = session.role === "SINDICO";

  const notices = await prisma.notice.findMany({
    where: { buildingId: session.buildingId },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Quadro de Avisos</h1>
          <p className="text-white/50 mt-1">
            {isSindico ? "Publique comunicados oficiais para todos os moradores." : "Confira os comunicados publicados pela administração."}
          </p>
        </div>
      </div>

      {notices.length === 0 ? (
        <GlassCard delay={0.1} className="p-12 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 rounded-full bg-white/5 mb-4 flex items-center justify-center">
              <Megaphone className="w-10 h-10 text-white/20" />
           </div>
           <h3 className="text-xl font-bold text-white/80 mb-2">Nenhum Aviso Publicado</h3>
           <p className="text-white/40 max-w-sm">
             Ainda não há comunicados oficiais registrados no sistema.
           </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {notices.map((notice, idx) => (
            <GlassCard key={notice.id} delay={0.05 * idx} className="p-6">
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-1">
                    <Bell className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-lg font-bold text-white mb-1">{notice.title}</h3>
                   <p className="text-white/60 text-sm whitespace-pre-wrap">{notice.content}</p>
                   <div className="flex items-center gap-3 mt-3 text-xs text-white/30">
                      <span>Por: {notice.author.name}</span>
                      <span>•</span>
                      <span>{new Date(notice.createdAt).toLocaleString('pt-BR')}</span>
                   </div>
                 </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
