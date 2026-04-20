"use server";

import { PrismaClient } from "@prisma/client";
import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function sendMessageAction(prevState: unknown, formData: FormData) {
  const session = await verifySession();
  
  if (!session || session.role !== "MORADOR" || !session.buildingId) {
    return { error: "Apenas moradores validados podem enviar solicitações." };
  }

  const subject = formData.get("subject")?.toString();
  const content = formData.get("content")?.toString();
  
  if (!subject || !content) return { error: "Preencha o assunto e o contexto da ocorrência." };

  try {
    await prisma.message.create({
      data: {
        subject,
        content,
        buildingId: session.buildingId,
        authorId: session.userId,
      }
    });
  } catch(error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error; 
    }
    return { error: "Erro interno ao emitir sua mensagem pro painel." };
  }

  redirect("/dashboard/messages");
}

export async function replyMessageAction(formData: FormData) {
  const session = await verifySession();
  
  if (!session || session.role !== "SINDICO") {
    throw new Error("Acesso negado");
  }

  const messageId = formData.get("messageId")?.toString();
  const response = formData.get("response")?.toString();

  if (!messageId || !response) return;

  await prisma.message.update({
    where: { id: messageId },
    data: {
      response,
      isResolved: true
    }
  });

  revalidatePath("/dashboard/messages");
}
