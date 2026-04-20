"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// ============ BUILDINGS ============

export async function setupNewCondoAction(prevState: unknown, formData: FormData) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Acesso negado." };
  }

  // Dados do Prédio
  const name = formData.get("name")?.toString();
  const address = formData.get("address")?.toString();
  const maxSubUnits = parseInt(formData.get("maxSubUnits")?.toString() || "50");

  // Dados do Síndico
  const syndicName = formData.get("syndicName")?.toString();
  const syndicEmail = formData.get("syndicEmail")?.toString();
  const syndicPassword = formData.get("syndicPassword")?.toString();

  if (!name || !syndicName || !syndicEmail || !syndicPassword) {
    return { error: "Todos os campos marcados são obrigatórios." };
  }

  // Verificar se e-mail já existe
  const existing = await prisma.user.findUnique({ where: { email: syndicEmail } });
  if (existing) return { error: "O e-mail do síndico já está em uso na plataforma." };

  const passwordHash = await bcrypt.hash(syndicPassword, 10);

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Criar Prédio
      const building = await tx.building.create({
        data: {
          name,
          address: address || null,
          maxSubUnits,
          active: true,
          inviteCode: `RES-${name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
        }
      });

      // 2. Criar Síndico vinculado
      await tx.user.create({
        data: {
          name: syndicName,
          email: syndicEmail,
          passwordHash,
          role: "SINDICO",
          buildingId: building.id,
          status: "APPROVED"
        }
      });
    });
  } catch (error) {
    return { error: "Falha técnica ao realizar setup. Tente novamente." };
  }

  redirect("/dashboard/buildings");
}

export async function toggleBuildingAction(formData: FormData) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") return;

  const buildingId = formData.get("buildingId")?.toString();
  if (!buildingId) return;

  const building = await prisma.building.findUnique({ where: { id: buildingId } });
  if (!building) return;

  await prisma.building.update({
    where: { id: buildingId },
    data: { active: !building.active }
  });

  revalidatePath("/dashboard/buildings");
}

export async function updateSubUnitWeightAction(formData: FormData) {
  const session = await verifySession();
  if (!session || (session.role !== "SINDICO" && session.role !== "ADMIN")) return;

  const subUnitId = formData.get("subUnitId")?.toString();
  const weightStr = formData.get("fractionalWeight")?.toString();
  
  if (!subUnitId || !weightStr) return;

  const fractionalWeight = parseFloat(weightStr.replace(',', '.'));
  if (isNaN(fractionalWeight)) return;

  await prisma.subUnit.update({
    where: { id: subUnitId },
    data: { fractionalWeight }
  });

  revalidatePath("/dashboard/users"); // Onde a lista de unidades estará
  revalidatePath("/dashboard/votings");
}

export async function toggleFractionalWeightAction(formData: FormData) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") return;

  const buildingId = formData.get("buildingId")?.toString();
  if (!buildingId) return;

  const building = await prisma.building.findUnique({ where: { id: buildingId } });
  if (!building) return;

  await prisma.building.update({
    where: { id: buildingId },
    data: { useFractionalWeight: !building.useFractionalWeight }
  });

  revalidatePath("/dashboard/buildings");
  revalidatePath(`/dashboard/buildings/${buildingId}`);
}

// ============ USERS (Síndicos e Moradores) ============

export async function createUserAction(prevState: unknown, formData: FormData) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Acesso negado." };
  }

  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();
  const buildingId = formData.get("buildingId")?.toString();

  if (!name || !email || !password || !role || !buildingId) {
    return { error: "Todos os campos são obrigatórios." };
  }

  if (!["SINDICO", "MORADOR"].includes(role)) {
    return { error: "Role inválida. Use SINDICO ou MORADOR." };
  }

  // Verificar se e-mail já existe
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Este e-mail já está cadastrado." };

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        buildingId,
      }
    });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { error: "Erro ao cadastrar usuário." };
  }

  redirect(`/dashboard/buildings/${buildingId}`);
}

export async function createSubUnitAction(prevState: unknown, formData: FormData) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Acesso negado." };
  }

  const identifier = formData.get("identifier")?.toString();
  const buildingId = formData.get("buildingId")?.toString();
  const userId = formData.get("userId")?.toString() || null;

  if (!identifier || !buildingId) {
    return { error: "Identificador da unidade e condomínio são obrigatórios." };
  }

  try {
    await prisma.subUnit.create({
      data: {
        identifier,
        buildingId,
        userId: userId || null,
      }
    });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { error: "Erro ao cadastrar unidade." };
  }

  revalidatePath(`/dashboard/buildings/${buildingId}`);
  return { success: true };
}

export async function deleteUserAction(formData: FormData) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") return;

  const userId = formData.get("userId")?.toString();
  const buildingId = formData.get("buildingId")?.toString();
  if (!userId) return;

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath(`/dashboard/buildings/${buildingId}`);
}
// ============ GESTÃO AVANÇADA / AUTO-CADASTRO ============

/**
 * Gera ou atualiza o código de convite do prédio
 */
export async function updateBuildingInviteCodeAction(formData: FormData) {
  const session = await verifySession();
  if (!session || !session.buildingId) throw new Error("Acesso negado.");

  const inviteCode = formData.get("inviteCode")?.toString();
  const cnpj = formData.get("cnpj")?.toString();

  try {
    await prisma.building.update({
      where: { id: session.buildingId },
      data: { 
        inviteCode: inviteCode || undefined,
        cnpj: cnpj || null
      }
    });
  } catch (error) {
    throw new Error("Erro ao atualizar dados do condomínio. O código pode já estar em uso.");
  }

  revalidatePath("/dashboard/settings");
}

/**
 * Aprova ou Rejeita um morador pendente
 */
export async function toggleUserApprovalAction(formData: FormData) {
  const session = await verifySession();
  if (!session || (session.role !== "SINDICO" && session.role !== "ADMIN")) return;

  const userId = formData.get("userId")?.toString();
  const approve = formData.get("approve")?.toString() === "true";
  
  if (!userId) return;

  if (approve) {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "APPROVED" }
    });
  } else {
    // Rejeitar: Remove o usuário e limpa a unidade
    await prisma.$transaction(async (tx) => {
      await tx.subUnit.updateMany({
        where: { userId: userId },
        data: { userId: null }
      });
      await tx.user.delete({ where: { id: userId } });
    });
  }

  revalidatePath("/dashboard/users");
}

/**
 * Criação de unidades em lote (Ex: 101 a 110)
 */
export async function bulkCreateSubUnitsAction(formData: FormData) {
  const session = await verifySession();
  if (!session || (session.role !== "SINDICO" && session.role !== "ADMIN")) {
     throw new Error("Acesso negado.");
  }

  const buildingId = session.buildingId || formData.get("buildingId")?.toString();
  const prefix = formData.get("prefix")?.toString() || ""; // Ex: "Apto"
  const start = parseInt(formData.get("start")?.toString() || "0");
  const end = parseInt(formData.get("end")?.toString() || "0");

  if (!buildingId || start > end) {
    throw new Error("Intervalo inválido.");
  }

  try {
    const units = [];
    for (let i = start; i <= end; i++) {
      units.push({
        identifier: `${prefix} ${i}`.trim(),
        buildingId: buildingId,
      });
    }

    await prisma.subUnit.createMany({
      data: units,
      skipDuplicates: true,
    });
  } catch (error) {
    throw new Error("Erro ao criar unidades em lote.");
  }

  revalidatePath("/dashboard/buildings/[id]");
  revalidatePath("/dashboard/settings");
}
