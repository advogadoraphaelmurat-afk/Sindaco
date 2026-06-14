import bcrypt from "bcryptjs";

// 1. Criar e expor o mock do prisma no escopo global de forma hoisted
jest.mock("@prisma/client", () => {
  const mockPrismaInstance = {
    building: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    subUnit: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  (global as any).mockPrisma = mockPrismaInstance;
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaInstance),
  };
});

// 2. Importar as dependências e o arquivo a ser testado
import { registerUserAction, getAvailableUnitsByCode } from "../register";

// Recupera a referência do mock global para usar nos testes
const mockPrisma = (global as any).mockPrisma;

// Mock do bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword123"),
}));

describe("Register Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUserAction", () => {
    it("deve registrar morador pendente com sucesso se todos os dados forem válidos", async () => {
      const formData = new FormData();
      formData.append("name", "Raphael Murat");
      formData.append("email", "raphael@sindaco.com");
      formData.append("password", "minhasenha");
      formData.append("inviteCode", "COND-123");
      formData.append("subUnitId", "apto-102");

      mockPrisma.building.findUnique.mockResolvedValue({
        id: "building-123",
        inviteCode: "COND-123",
      });

      mockPrisma.user.findUnique.mockResolvedValue(null);

      mockPrisma.subUnit.findUnique.mockResolvedValue({
        id: "apto-102",
        buildingId: "building-123",
        userId: null,
      });

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            create: jest.fn().mockResolvedValue({ id: "new-user-123" }),
          },
          subUnit: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(mockTx);
      });

      try {
        await registerUserAction(null, formData);
      } catch (error: any) {
        expect(error.message).toBe("NEXT_REDIRECT");
      }

      expect(mockPrisma.building.findUnique).toHaveBeenCalledWith({
        where: { inviteCode: "COND-123" },
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "raphael@sindaco.com" },
      });
      expect(mockPrisma.subUnit.findUnique).toHaveBeenCalledWith({
        where: { id: "apto-102" },
        include: { user: true },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("minhasenha", 10);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("deve rejeitar se o inviteCode for inválido", async () => {
      const formData = new FormData();
      formData.append("name", "Raphael Murat");
      formData.append("email", "raphael@sindaco.com");
      formData.append("password", "minhasenha");
      formData.append("inviteCode", "INVALID-CODE");
      formData.append("subUnitId", "apto-102");

      mockPrisma.building.findUnique.mockResolvedValue(null);

      const result = await registerUserAction(null, formData);

      expect(result).toEqual({ error: "Chave de acesso inválida." });
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("deve rejeitar se o e-mail já estiver cadastrado", async () => {
      const formData = new FormData();
      formData.append("name", "Raphael Murat");
      formData.append("email", "repetido@sindaco.com");
      formData.append("password", "minhasenha");
      formData.append("inviteCode", "COND-123");
      formData.append("subUnitId", "apto-102");

      mockPrisma.building.findUnique.mockResolvedValue({
        id: "building-123",
        inviteCode: "COND-123",
      });

      mockPrisma.user.findUnique.mockResolvedValue({ id: "outro-usuario" });

      const result = await registerUserAction(null, formData);

      expect(result).toEqual({ error: "E-mail já cadastrado." });
      expect(mockPrisma.subUnit.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("deve rejeitar se a unidade já estiver ocupada", async () => {
      const formData = new FormData();
      formData.append("name", "Raphael Murat");
      formData.append("email", "raphael@sindaco.com");
      formData.append("password", "minhasenha");
      formData.append("inviteCode", "COND-123");
      formData.append("subUnitId", "apto-ocupado");

      mockPrisma.building.findUnique.mockResolvedValue({
        id: "building-123",
        inviteCode: "COND-123",
      });

      mockPrisma.user.findUnique.mockResolvedValue(null);

      mockPrisma.subUnit.findUnique.mockResolvedValue({
        id: "apto-ocupado",
        buildingId: "building-123",
        userId: "outro-morador-id",
      });

      const result = await registerUserAction(null, formData);

      expect(result).toEqual({ error: "Esta unidade já possui um morador cadastrado." });
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("getAvailableUnitsByCode", () => {
    it("deve retornar a lista de unidades desocupadas pelo código do prédio", async () => {
      const mockUnits = [
        { id: "apto-101", identifier: "Apto 101", userId: null },
        { id: "apto-102", identifier: "Apto 102", userId: null },
      ];

      mockPrisma.building.findUnique.mockResolvedValue({
        id: "building-123",
        inviteCode: "COND-123",
        subUnits: mockUnits,
      });

      const result = await getAvailableUnitsByCode("COND-123");

      expect(result).toEqual(mockUnits);
      expect(mockPrisma.building.findUnique).toHaveBeenCalledWith({
        where: { inviteCode: "COND-123" },
        include: {
          subUnits: {
            where: { userId: null },
            orderBy: { identifier: "asc" },
          },
        },
      });
    });

    it("deve retornar array vazio se o prédio não existir", async () => {
      mockPrisma.building.findUnique.mockResolvedValue(null);

      const result = await getAvailableUnitsByCode("CODIGO-INEXISTENTE");

      expect(result).toEqual([]);
    });
  });
});
