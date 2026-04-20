import { verifySession } from "@/lib/auth";
import { MessageForm } from "@/components/MessageForm";
import Link from "next/link";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function NewMessagePage() {
  const session = await verifySession();

  if (!session || session.role !== "MORADOR") {
    redirect("/dashboard/messages");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/messages" 
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
             <MessageSquarePlus className="text-primary w-8 h-8" /> 
             Fale com o Síndico
          </h1>
          <p className="text-white/50 mt-1">Este canal é exclusivo, seguro e direto. Apenas você e a moderação tem acesso.</p>
        </div>
      </div>

      <MessageForm />
    </div>
  );
}
