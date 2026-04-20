"use server";

import { PrismaClient } from "@prisma/client";
import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createVotingAction(prevState: unknown, formData: FormData) {
  const session = await verifySession();
  
  if (!session || session.role !== "SINDICO" || !session.buildingId) {
    return { error: "Acesso negado. Apenas o síndico pode criar votações." };
  }

  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const startDate = formData.get("startDate")?.toString();
  const endDate = formData.get("endDate")?.toString();
  const quorumType = formData.get("quorumType")?.toString() || "SIMPLES";
  
  // Pegando todos os inputs de options[] dinâmicos
  const options = formData.getAll("options").map(o => o.toString()).filter(o => o.trim() !== "");

  if (!title || !startDate || !endDate || options.length < 2) {
    return { error: "Preencha o título, dadas e forneça pelo menos 2 (duas) alternativas para a votação." };
  }

  try {
    await prisma.voting.create({
      data: {
        title,
        description: description || "",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        quorumType,
        buildingId: session.buildingId,
        authorId: session.userId,
        options: {
          create: options.map(text => ({ text }))
        }
      }
    });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error; // Deixa o redirect passar
    }
    return { error: "Erro interno ao cadastrar a votação." };
  }

  redirect("/dashboard/votings");
}

export async function submitVoteAction(prevState: unknown, formData: FormData) {
  const session = await verifySession();
  
  if (!session || session.role !== "MORADOR") {
    return { error: "Apenas moradores validados podem votar." };
  }

  const votingId = formData.get("votingId")?.toString();
  const optionId = formData.get("optionId")?.toString();

  if (!votingId || !optionId) {
    return { error: "Voto incompleto. Selecione uma opção." };
  }

  // Descobrindo a subUnidade atrelada a este usuário (Morador)
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { subUnits: true }
  });

  if (!user || user.subUnits.length === 0) {
    return { error: "Você não possui nenhuma unidade de apartamento atrelada para votar." };
  }

  const subUnitId = user.subUnits[0].id; // MVP: assumindo 1 a 1

  // Impedir duplo voto
  const existingVote = await prisma.vote.findUnique({
    where: {
      votingId_subUnitId: {
        votingId,
        subUnitId
      }
    }
  });

  if (existingVote) {
    return { error: "Sua unidade já registrou um voto nesta assembleia." };
  }

  try {
    await prisma.vote.create({
      data: {
        votingId,
        optionId,
        subUnitId
      }
    });
  } catch (error) {
    return { error: "Falha de comunicação e criptografia ao registrar voto." };
  }

  revalidatePath(`/dashboard/votings/${votingId}`);
  return { success: true };
}
