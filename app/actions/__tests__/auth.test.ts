import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { cookies } from "next/headers";

// 1. Criar e expor o mock do prisma no escopo global de forma hoisted
jest.mock("@prisma/client", () => {
  const mockPrismaInstance = {
    systemAdmin: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };
  (global as any).mockPrisma = mockPrismaInstance;
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaInstance),
  };
});

// 2. Importar as dependências e o arquivo a ser testado
import { loginAction, logoutAction } from "../auth";

// Recupera a referência do mock global para usar nos testes
const mockPrisma = (global as any).mockPrisma;

// Mock do módulo de sessões
jest.mock("@/lib/auth", () => ({
  createSession: jest.fn(),
}));

// Mock do bcrypt
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

describe("Auth Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginAction", () => {
    it("deve logar como ADMIN com sucesso com credenciais válidas", async () => {
      const formData = new FormData();
      formData.append("email", "admin@sindaco.com");
      formData.append("password", "admin123");

      mockPrisma.systemAdmin.findUnique.mockResolvedValue({
        id: "admin-id",
        email: "admin@sindaco.com",
        password: "hashedPasswordAdmin",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      try {
        await loginAction(null, formData);
      } catch (error: any) {
        expect(error.message).toBe("NEXT_REDIRECT");
      }

      expect(mockPrisma.systemAdmin.findUnique).toHaveBeenCalledWith({
        where: { email: "admin@sindaco.com" },
      });
      expect(createSession).toHaveBeenCalledWith({
        userId: "admin-id",
        role: "ADMIN",
        email: "admin@sindaco.com",
      });
    });

    it("deve logar como SÍNDICO ou MORADOR com sucesso se a conta estiver APROVADA", async () => {
      const formData = new FormData();
      formData.append("email", "sindico@predio.com");
      formData.append("password", "senha123");

      mockPrisma.systemAdmin.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-id",
        email: "sindico@predio.com",
        passwordHash: "hashedPasswordUser",
        role: "SINDICO",
        status: "APPROVED",
        buildingId: "predio-abc",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      try {
        await loginAction(null, formData);
      } catch (error: any) {
        expect(error.message).toBe("NEXT_REDIRECT");
      }

      expect(createSession).toHaveBeenCalledWith({
        userId: "user-id",
        role: "SINDICO",
        buildingId: "predio-abc",
        email: "sindico@predio.com",
      });
    });

    it("deve retornar erro se a conta estiver PENDENTE", async () => {
      const formData = new FormData();
      formData.append("email", "morador@predio.com");
      formData.append("password", "senha123");

      mockPrisma.systemAdmin.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-id",
        email: "morador@predio.com",
        passwordHash: "hashedPasswordUser",
        role: "MORADOR",
        status: "PENDING",
        buildingId: "predio-abc",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await loginAction(null, formData);

      expect(result).toEqual({
        error: "Sua conta está aguardando aprovação do síndico.",
      });
      expect(createSession).not.toHaveBeenCalled();
    });

    it("deve retornar erro para credenciais inválidas", async () => {
      const formData = new FormData();
      formData.append("email", "desconhecido@predio.com");
      formData.append("password", "senhaErrada");

      mockPrisma.systemAdmin.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await loginAction(null, formData);

      expect(result).toEqual({
        error: "Credenciais inválidas.",
      });
      expect(createSession).not.toHaveBeenCalled();
    });
  });

  describe("logoutAction", () => {
    it("deve excluir o cookie de sessão e redirecionar", async () => {
      const mockCookieStore = {
        delete: jest.fn(),
      };
      (cookies as jest.Mock).mockResolvedValue(mockCookieStore);

      try {
        await logoutAction();
      } catch (error: any) {
        expect(error.message).toBe("NEXT_REDIRECT");
      }

      expect(mockCookieStore.delete).toHaveBeenCalledWith("session");
    });
  });
});
