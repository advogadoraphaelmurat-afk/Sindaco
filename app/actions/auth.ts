"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Todos os campos são obrigatórios." };
  }

  try {
    // Tentar localizar SystemAdmin
    const sysAdmin = await prisma.systemAdmin.findUnique({
      where: { email },
    });

    if (sysAdmin) {
      const match = await bcrypt.compare(password, sysAdmin.password);
      if (match) {
        await createSession({
          userId: sysAdmin.id,
          role: "ADMIN",
          email: sysAdmin.email,
        });
        redirect("/dashboard");
      }
    }

    // Tentar localizar um Usuário de Condomínio normal
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (match) {
        if (user.status === "PENDING") {
          return { error: "Sua conta está aguardando aprovação do síndico." };
        }
        await createSession({
          userId: user.id,
          role: user.role,
          buildingId: user.buildingId,
          email: user.email,
        });
        redirect("/dashboard");
      }
    }

    return { error: "Credenciais inválidas." };
  } catch (error) {
    // Bypass REDIRECT_ERROR handling que o NEXT dispara internamente
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    return { error: "Ocorreu um erro no servidor." };
  }
}

import { cookies } from "next/headers";

export async function logoutAction() {
  (await cookies()).delete("session");
  redirect("/");
}
