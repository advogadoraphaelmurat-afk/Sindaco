import { verifySession } from "@/lib/auth";

// 1. Criar e expor o mock do prisma no escopo global
jest.mock("@prisma/client", () => {
  const mockPrismaInstance = {
    notice: {
      create: jest.fn(),
    },
    subunit: {
      findUnique: jest.fn(),
    },
  };
  (global as any).mockPrisma = mockPrismaInstance;
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaInstance),
  };
});

// 2. Importar as dependências e o arquivo a ser testado
import { createNoticeAction } from "../notice";

const mockPrisma = (global as any).mockPrisma;

jest.mock("@/lib/auth", () => ({
  verifySession: jest.fn(),
}));

describe("Notice Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createNoticeAction", () => {
    it("deve criar um aviso geral com sucesso se o usuário for SÍNDICO e os dados estiverem corretos", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "sindico-123",
        role: "SINDICO",
        buildingId: "predio-456",
        email: "sindico@condo.com",
      });

      const formData = new FormData();
      formData.append("title", "Dedetização Geral");
      formData.append("content", "A dedetização ocorrerá no sábado.");
      formData.append("targetSubUnitId", "ALL");

      mockPrisma.notice.create.mockResolvedValue({ id: "notice-789" });

      try {
        await createNoticeAction(null, formData);
      } catch (error: any) {
        expect(error.message).toBe("NEXT_REDIRECT");
      }

      expect(mockPrisma.notice.create).toHaveBeenCalledWith({
        data: {
          title: "Dedetização Geral",
          content: "A dedetização ocorrerá no sábado.",
          buildingId: "predio-456",
          authorId: "sindico-123",
          targetSubUnitId: null,
        },
      });
    });

    it("deve criar um aviso privado com sucesso se o destinatário pertencer ao mesmo prédio do síndico", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "sindico-123",
        role: "SINDICO",
        buildingId: "predio-456",
        email: "sindico@condo.com",
      });

      const formData = new FormData();
      formData.append("title", "Multa por Barulho");
      formData.append("content", "Você excedeu os limites de ruído ontem.");
      formData.append("targetSubUnitId", "subunit-789");

      mockPrisma.subunit.findUnique.mockResolvedValue({
        id: "subunit-789",
        buildingId: "predio-456",
      });
      mockPrisma.notice.create.mockResolvedValue({ id: "notice-999" });

      try {
        await createNoticeAction(null, formData);
      } catch (error: any) {
        expect(error.message).toBe("NEXT_REDIRECT");
      }

      expect(mockPrisma.subunit.findUnique).toHaveBeenCalledWith({
        where: { id: "subunit-789" },
        select: { buildingId: true },
      });
      expect(mockPrisma.notice.create).toHaveBeenCalledWith({
        data: {
          title: "Multa por Barulho",
          content: "Você excedeu os limites de ruído ontem.",
          buildingId: "predio-456",
          authorId: "sindico-123",
          targetSubUnitId: "subunit-789",
        },
      });
    });

    it("deve falhar se o destinatário pertencer a um condomínio diferente (segurança contra cross-condo)", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "sindico-123",
        role: "SINDICO",
        buildingId: "predio-456",
        email: "sindico@condo.com",
      });

      const formData = new FormData();
      formData.append("title", "Aviso Confuso");
      formData.append("content", "Conteúdo qualquer");
      formData.append("targetSubUnitId", "subunit-outro-predio");

      mockPrisma.subunit.findUnique.mockResolvedValue({
        id: "subunit-outro-predio",
        buildingId: "predio-outro-999",
      });

      const result = await createNoticeAction(null, formData);

      expect(result).toEqual({
        error: "Operação não permitida. O destinatário selecionado não pertence ao seu condomínio.",
      });
      expect(mockPrisma.notice.create).not.toHaveBeenCalled();
    });

    it("deve rejeitar se o usuário não for SÍNDICO", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "morador-123",
        role: "MORADOR",
        buildingId: "predio-456",
        email: "morador@condo.com",
      });

      const formData = new FormData();
      const result = await createNoticeAction(null, formData);

      expect(result).toEqual({
        error: "Apenas síndicos podem publicar avisos.",
      });
      expect(mockPrisma.notice.create).not.toHaveBeenCalled();
    });

    it("deve falhar se faltarem título ou conteúdo", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "sindico-123",
        role: "SINDICO",
        buildingId: "predio-456",
        email: "sindico@condo.com",
      });

      const formData = new FormData();
      formData.append("title", "Apenas título");

      const result = await createNoticeAction(null, formData);

      expect(result).toEqual({
        error: "Preencha o título e o conteúdo do aviso.",
      });
      expect(mockPrisma.notice.create).not.toHaveBeenCalled();
    });
  });
});
