"use server";

import { verifySession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function createSupportTicketAction(formData: FormData) {
  const session = await verifySession();
  if (!session || session.role !== "SINDICO") throw new Error("Acesso negado.");

  const subject = formData.get("subject")?.toString();
  const content = formData.get("content")?.toString();

  if (!subject || !content) throw new Error("Campos obrigatórios não preenchidos.");

  try {
    await prisma.supportTicket.create({
      data: {
        subject,
        content,
        buildingId: session.buildingId!,
        authorId: session.userId,
        status: "OPEN"
      }
    });
  } catch (error) {
    throw new Error("Erro ao criar chamado.");
  }

  revalidatePath("/dashboard/support");
  redirect("/dashboard/support");
}

export async function respondSupportTicketAction(formData: FormData) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") throw new Error("Acesso negado.");

  const ticketId = formData.get("ticketId")?.toString();
  const response = formData.get("response")?.toString();

  if (!ticketId || !response) throw new Error("Resposta é obrigatória.");

  try {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        response,
        status: "CLOSED" 
      }
    });
  } catch (error) {
    throw new Error("Erro ao responder chamado.");
  }

  revalidatePath("/dashboard/admin/support");
  revalidatePath(`/dashboard/admin/support/${ticketId}`);
}
