import { verifySession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GlassCard } from "@/components/GlassCard";
import { Plus, MessageSquare, Check, MailOpen, Send } from "lucide-react";
import Link from "next/link";
import { replyMessageAction } from "@/app/actions/message";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function MessagesListPage() {
  const session = await verifySession();
  
  if (!session || !session.buildingId) return <div>Sessão inválida.</div>;

  const isSindico = session.role === "SINDICO";

  // Se for SINDICO, vê todas as mensagens do prédio. Se for MORADOR, apenas as próprias.
  const messages = await prisma.message.findMany({
    where: { 
       buildingId: session.buildingId,
       ...(isSindico ? {} : { authorId: session.userId })
    },
    include: {
       author: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isSindico ? "Caixa de Entrada" : "Meus Chamados: Síndico"}
          </h1>
          <p className="text-white/50 mt-1">
            {isSindico ? "Responda às ocorrências criadas pelos moradores." : "Acompanhe aqui o histórico de comunicação das suas chamadas."}
          </p>
        </div>
        
        {!isSindico && (
          <Link 
            href="/dashboard/messages/new"
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-5 py-3 font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Solicitação
          </Link>
        )}
      </div>

      {messages.length === 0 ? (
        <GlassCard delay={0.1} className="p-12 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 rounded-full bg-white/5 mb-4 flex items-center justify-center">
              <MailOpen className="w-10 h-10 text-white/20" />
           </div>
           <h3 className="text-xl font-bold text-white/80 mb-2">Caixa Vazia</h3>
           <p className="text-white/40 max-w-sm">Nenhuma mensagem registrada no momento.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {messages.map((msg, idx) => (
             <GlassCard delay={0.05 * idx} key={msg.id} className="p-0 overflow-hidden border-white/5 bg-white/[0.02]">
                <div className="p-6 border-b border-white/5 flex flex-col gap-3">
                   <div className="flex justify-between items-start">
                     <div>
                       {isSindico && <div className="text-xs font-bold text-white/40 uppercase mb-1">DE: {msg.author.name}</div>}
                       <h3 className="text-xl font-bold text-white">{msg.subject}</h3>
                       <div className="text-xs text-white/30 mt-1">{new Date(msg.createdAt).toLocaleString('pt-BR')}</div>
                     </div>
                     {msg.isResolved ? (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1">
                           <Check className="w-3 h-3" /> Respondido
                        </span>
                     ) : (
                        <span className="bg-orange-500/10 text-orange-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-orange-500/20">
                           Aguardando Análise
                        </span>
                     )}
                   </div>
                   <p className="text-white/70 bg-black/20 p-4 rounded-xl border border-white/5 text-sm">{msg.content}</p>
                </div>

                {/* Área de Resposta */}
                {msg.isResolved && msg.response ? (
                   <div className="p-6 bg-emerald-500/5 relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/30"></div>
                      <div className="text-xs font-bold text-emerald-500/70 mb-2 flex items-center gap-2">
                         <Check className="w-3 h-3" /> Resposta Oficial do Síndico
                      </div>
                      <p className="text-white/90 text-sm">{msg.response}</p>
                   </div>
                ) : (isSindico && !msg.isResolved) ? (
                   <div className="p-6 bg-white/5">
                      <form action={replyMessageAction} className="flex gap-4">
                         <input type="hidden" name="messageId" value={msg.id} />
                         <input 
                           type="text" 
                           name="response" 
                           placeholder="Digite a resposta encerrenta para este chamado..." 
                           required 
                           className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                         />
                         <button type="submit" className="bg-primary hover:bg-primary/80 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2">
                            Aprovar & Responder <Send className="w-4 h-4" />
                         </button>
                      </form>
                   </div>
                ) : null}
             </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
