import { verifySession } from "@/lib/auth";
import { VotingForm } from "@/components/VotingForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

export default async function NewVotingPage() {
  const session = await verifySession();

  if (!session || session.role !== "SINDICO") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/votings" 
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Criar Nova Votação</h1>
          <p className="text-white/50 mt-1">Configure os prazos e defina as alternativas disponíveis para os moradores.</p>
        </div>
      </div>

      <VotingForm />
    </div>
  );
}
