import { verifySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. Criar e expor o mock do prisma no escopo global de forma hoisted
jest.mock("@prisma/client", () => {
  const mockPrismaInstance = {
    message: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  (global as any).mockPrisma = mockPrismaInstance;
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaInstance),
  };
});

// 2. Importar as dependências e o arquivo a ser testado
import { sendMessageAction, replyMessageAction } from "../message";

// Recupera a referência do mock global para usar nos testes
const mockPrisma = (global as any).mockPrisma;

// Mock da biblioteca auth
jest.mock("@/lib/auth", () => ({
  verifySession: jest.fn(),
}));

describe("Message Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendMessageAction", () => {
    it("deve enviar mensagem com sucesso se o usuário for MORADOR e os dados estiverem completos", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "morador-123",
        role: "MORADOR",
        buildingId: "predio-456",
        email: "morador@condo.com",
      });

      const formData = new FormData();
      formData.append("subject", "Problema no elevador");
      formData.append("content", "O elevador de serviço está fazendo barulhos estranhos");

      mockPrisma.message.create.mockResolvedValue({ id: "msg-789" });

      try {
        await sendMessageAction(null, formData);
      } catch (error: any) {
        expect(error.message).toBe("NEXT_REDIRECT");
      }

      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          subject: "Problema no elevador",
          content: "O elevador de serviço está fazendo barulhos estranhos",
          buildingId: "predio-456",
          authorId: "morador-123",
        },
      });
    });

    it("deve rejeitar se o usuário logado for SÍNDICO", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "sindico-123",
        role: "SINDICO",
        buildingId: "predio-456",
        email: "sindico@condo.com",
      });

      const formData = new FormData();
      const result = await sendMessageAction(null, formData);

      expect(result).toEqual({
        error: "Apenas moradores validados podem enviar solicitações.",
      });
      expect(mockPrisma.message.create).not.toHaveBeenCalled();
    });

    it("deve falhar se faltarem assunto ou conteúdo", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "morador-123",
        role: "MORADOR",
        buildingId: "predio-456",
        email: "morador@condo.com",
      });

      const formData = new FormData();
      formData.append("subject", "Problema");

      const result = await sendMessageAction(null, formData);

      expect(result).toEqual({
        error: "Preencha o assunto e o contexto da ocorrência.",
      });
      expect(mockPrisma.message.create).not.toHaveBeenCalled();
    });
  });

  describe("replyMessageAction", () => {
    it("deve registrar a resposta do síndico e marcar como resolvida com sucesso", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "sindico-123",
        role: "SINDICO",
        buildingId: "predio-456",
        email: "sindico@condo.com",
      });

      const formData = new FormData();
      formData.append("messageId", "msg-789");
      formData.append("response", "Manutenção já foi notificada e fará o reparo amanhã.");

      mockPrisma.message.update.mockResolvedValue({ id: "msg-789" });

      await replyMessageAction(formData);

      expect(mockPrisma.message.update).toHaveBeenCalledWith({
        where: { id: "msg-789" },
        data: {
          response: "Manutenção já foi notificada e fará o reparo amanhã.",
          isResolved: true,
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/messages");
    });

    it("deve lançar erro se o usuário não for SÍNDICO", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "morador-123",
        role: "MORADOR",
        buildingId: "predio-456",
        email: "morador@condo.com",
      });

      const formData = new FormData();
      formData.append("messageId", "msg-789");
      formData.append("response", "Resposta proibida");

      await expect(replyMessageAction(formData)).rejects.toThrow("Acesso negado");
      expect(mockPrisma.message.update).not.toHaveBeenCalled();
    });
  });
});
