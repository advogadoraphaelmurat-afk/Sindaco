"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

/**
 * Registra um novo morador (público)
 */
export async function registerUserAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const inviteCode = formData.get("inviteCode")?.toString();
  const subUnitId = formData.get("subUnitId")?.toString();

  if (!name || !email || !password || !inviteCode || !subUnitId) {
    return { error: "Todos os campos são obrigatórios." };
  }

  try {
    // 1. Validar prédio pelo inviteCode
    const building = await prisma.building.findUnique({
      where: { inviteCode }
    });

    if (!building) {
      return { error: "Chave de acesso inválida." };
    }

    // 2. Verificar se e-mail já existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "E-mail já cadastrado." };
    }

    // 3. Verificar se a unidade está disponível
    const subUnit = await prisma.subUnit.findUnique({
      where: { id: subUnitId },
      include: { user: true }
    });

    if (!subUnit || subUnit.buildingId !== building.id) {
      return { error: "Unidade inválida." };
    }

    if (subUnit.userId) {
      return { error: "Esta unidade já possui um morador cadastrado." };
    }

    // 4. Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Criar usuário (PENDING) e vincular à unidade
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "MORADOR",
          status: "PENDING", // Fila de aprovação
          buildingId: building.id,
        }
      });

      await tx.subUnit.update({
        where: { id: subUnitId },
        data: { userId: newUser.id }
      });
    });

  } catch (error) {
    console.error("Erro no registro:", error);
    return { error: "Erro interno no servidor." };
  }

  // Sucesso: Redireciona para login com aviso
  redirect("/?registered=true");
}

/**
 * Busca unidades disponíveis (vagas) por código de prédio
 */
export async function getAvailableUnitsByCode(code: string) {
  const building = await prisma.building.findUnique({
    where: { inviteCode: code },
    include: {
      subUnits: {
        where: { userId: null },
        orderBy: { identifier: "asc" }
      }
    }
  });

  return building?.subUnits || [];
}
