import { verifySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. Criar e expor o mock do prisma no escopo global de forma hoisted
jest.mock("@prisma/client", () => {
  const mockPrismaInstance = {
    voting: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    vote: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return callback(mockPrismaInstance);
    }),
  };
  (global as any).mockPrisma = mockPrismaInstance;
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaInstance),
  };
});

jest.mock("next/headers", () => ({
  headers: jest.fn().mockReturnValue(new Map([["x-forwarded-for", "127.0.0.1"]])),
}));

// Mock do módulo de email para evitar o carregamento do resend/postal-mime
// que depende de TextEncoder (não disponível no jsdom)
jest.mock("@/lib/email", () => ({
  sendVotingCreatedEmail: jest.fn().mockResolvedValue({ success: true, simulated: true }),
}));

// 2. Agora sim importamos as funções do arquivo de actions
import { createVotingAction, submitVoteAction } from "../voting";

// Recupera a referência do mock global para usar nos testes
const mockPrisma = (global as any).mockPrisma;

// Mock da biblioteca auth
jest.mock("@/lib/auth", () => ({
  verifySession: jest.fn(),
}));

describe("Voting Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createVotingAction", () => {
    it("deve criar uma votação com sucesso se o usuário for SÍNDICO e os dados forem válidos", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "sindico-123",
        role: "SINDICO",
        buildingId: "predio-456",
        email: "sindico@condo.com",
      });

      const formData = new FormData();
      formData.append("title", "Aprovação de Orçamento 2026");
      formData.append("description", "Revisão das contas anuais");
      formData.append("startDate", "2026-06-01T08:00");
      formData.append("endDate", "2026-06-10T18:00");
      formData.append("quorumType", "SIMPLES");
      formData.append("options", "A favor");
      formData.append("options", "Contra");

      mockPrisma.voting.create.mockResolvedValue({ id: "voting-abc" });

      try {
        await createVotingAction(null, formData);
      } catch (error: any) {
        expect(error.message).toBe("NEXT_REDIRECT");
      }

      expect(mockPrisma.voting.create).toHaveBeenCalledWith({
        data: {
          title: "Aprovação de Orçamento 2026",
          description: "Revisão das contas anuais",
          startDate: new Date("2026-06-01T08:00"),
          endDate: new Date("2026-06-10T18:00"),
          quorumType: "SIMPLES",
          buildingId: "predio-456",
          authorId: "sindico-123",
          options: {
            create: [{ text: "A favor" }, { text: "Contra" }],
          },
        },
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: "VOTING_CREATED",
          entityType: "Voting",
          entityId: "voting-abc",
        }),
      });
    });

    it("deve falhar se o usuário logado for um MORADOR", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "morador-123",
        role: "MORADOR",
        buildingId: "predio-456",
        email: "morador@condo.com",
      });

      const formData = new FormData();
      const result = await createVotingAction(null, formData);

      expect(result).toEqual({
        error: "Acesso negado. Apenas o síndico pode criar votações.",
      });
      expect(mockPrisma.voting.create).not.toHaveBeenCalled();
    });

    it("deve falhar se faltarem campos obrigatórios ou menos de 2 opções", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "sindico-123",
        role: "SINDICO",
        buildingId: "predio-456",
        email: "sindico@condo.com",
      });

      const formData = new FormData();
      formData.append("title", "Obra da Fachada");
      
      const result = await createVotingAction(null, formData);

      expect(result).toEqual({
        error: "Preencha o título, dadas e forneça pelo menos 2 (duas) alternativas para a votação.",
      });
      expect(mockPrisma.voting.create).not.toHaveBeenCalled();
    });
  });

  describe("submitVoteAction", () => {
    it("deve registrar o voto com sucesso para morador elegível que não votou ainda", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "morador-123",
        role: "MORADOR",
        buildingId: "predio-456",
        email: "morador@condo.com",
      });

      const formData = new FormData();
      formData.append("votingId", "votacao-123");
      formData.append("optionId", "opcao-favor");

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "morador-123",
        subUnits: [{ id: "apto-101", identifier: "Apto 101" }],
      });

      mockPrisma.vote.findUnique.mockResolvedValue(null);
      mockPrisma.vote.create.mockResolvedValue({ id: "voto-789" });

      const result = await submitVoteAction(null, formData);

      expect(result).toEqual({ success: true });
      expect(mockPrisma.vote.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          votingId: "votacao-123",
          optionId: "opcao-favor",
          subUnitId: "apto-101",
          ipAddress: "127.0.0.1",
          hash: expect.any(String),
        }),
      });
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: "VOTE_SUBMITTED",
          entityType: "Vote",
          entityId: "voto-789",
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/votings/votacao-123");
    });

    it("deve bloquear o voto se o usuário logado for SÍNDICO", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "sindico-123",
        role: "SINDICO",
        buildingId: "predio-456",
        email: "sindico@condo.com",
      });

      const formData = new FormData();
      const result = await submitVoteAction(null, formData);

      expect(result).toEqual({
        error: "Apenas moradores validados podem votar.",
      });
      expect(mockPrisma.vote.create).not.toHaveBeenCalled();
    });

    it("deve impedir o voto duplo se a unidade já votou", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "morador-123",
        role: "MORADOR",
        buildingId: "predio-456",
        email: "morador@condo.com",
      });

      const formData = new FormData();
      formData.append("votingId", "votacao-123");
      formData.append("optionId", "opcao-favor");

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "morador-123",
        subUnits: [{ id: "apto-101", identifier: "Apto 101" }],
      });

      mockPrisma.vote.findUnique.mockResolvedValue({
        id: "voto-existente",
        votingId: "votacao-123",
        subUnitId: "apto-101",
      });

      const result = await submitVoteAction(null, formData);

      expect(result).toEqual({
        error: "Sua unidade já registrou um voto nesta assembleia.",
      });
      expect(mockPrisma.vote.create).not.toHaveBeenCalled();
    });

    it("deve falhar se o morador não tiver nenhuma sub-unidade vinculada", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        userId: "morador-123",
        role: "MORADOR",
        buildingId: "predio-456",
        email: "morador@condo.com",
      });

      const formData = new FormData();
      formData.append("votingId", "votacao-123");
      formData.append("optionId", "opcao-favor");

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "morador-123",
        subUnits: [],
      });

      const result = await submitVoteAction(null, formData);

      expect(result).toEqual({
        error: "Você não possui nenhuma unidade de apartamento atrelada para votar.",
      });
      expect(mockPrisma.vote.create).not.toHaveBeenCalled();
    });
  });
});
