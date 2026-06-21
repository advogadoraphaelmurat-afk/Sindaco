import { verifySession } from "@/lib/auth";
import { NoticeForm } from "@/components/NoticeForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function NewNoticePage() {
  const session = await verifySession();

  if (!session || session.role !== "SINDICO" || !session.buildingId) {
    redirect("/dashboard");
  }

  // Buscar todas as subunidades do condomínio do síndico
  const subUnits = await prisma.subUnit.findMany({
    where: { buildingId: session.buildingId },
    select: {
      id: true,
      identifier: true,
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { identifier: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/notices" 
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Criar Novo Aviso</h1>
          <p className="text-white/50 mt-1">
            Publique comunicados ou envie notificações particulares diretamente para um morador.
          </p>
        </div>
      </div>

      <NoticeForm subUnits={subUnits} />
    </div>
  );
}
