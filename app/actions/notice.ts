"use server";

import { PrismaClient } from "@prisma/client";
import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createNoticeAction(prevState: unknown, formData: FormData) {
  const session = await verifySession();
  
  if (!session || session.role !== "SINDICO" || !session.buildingId) {
    return { error: "Apenas síndicos podem publicar avisos." };
  }

  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString().trim();
  let targetSubUnitId = formData.get("targetSubUnitId")?.toString().trim();

  if (!title || !content) {
    return { error: "Preencha o título e o conteúdo do aviso." };
  }

  if (targetSubUnitId === "" || targetSubUnitId === "ALL") {
    targetSubUnitId = undefined;
  }

  try {
    // Se um destinatário específico foi selecionado, garantir que ele pertence ao condomínio do síndico
    if (targetSubUnitId) {
      const subUnit = await prisma.subunit.findUnique({
        where: { id: targetSubUnitId },
        select: { buildingId: true }
      });

      if (!subUnit || subUnit.buildingId !== session.buildingId) {
        return { error: "Operação não permitida. O destinatário selecionado não pertence ao seu condomínio." };
      }
    }

    await prisma.notice.create({
      data: {
        title,
        content,
        buildingId: session.buildingId,
        authorId: session.userId,
        targetSubUnitId: targetSubUnitId || null,
      }
    });

  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error; 
    }
    return { error: "Erro interno ao publicar o aviso." };
  }

  revalidatePath("/dashboard/notices");
  redirect("/dashboard/notices");
}
