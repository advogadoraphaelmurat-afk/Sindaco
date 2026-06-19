const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  // Busca o síndico
  const sindico = await prisma.user.findUnique({ where: { email: 'sindico@aurora.com' } });
  if (!sindico) { console.error('Síndico não encontrado'); process.exit(1); }
  
  console.log('Síndico:', sindico.id, '| buildingId:', sindico.buildingId);

  try {
    const startDate = new Date(); startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(); endDate.setDate(endDate.getDate() + 2);

    const result = await prisma.$transaction(async (tx) => {
      const voting = await tx.voting.create({
        data: {
          title: 'Teste Direto Script',
          description: 'Descricao teste',
          startDate,
          endDate,
          quorumType: 'SIMPLES',
          buildingId: sindico.buildingId,
          authorId: sindico.id,
          options: { create: [{ text: 'Sim' }, { text: 'Nao' }] }
        }
      });

      await tx.auditLog.create({
        data: {
          userId: sindico.id,
          action: 'VOTING_CREATED',
          entityType: 'Voting',
          entityId: voting.id,
          details: `Voting "Teste Direto Script" created.`
        }
      });

      return voting;
    });

    console.log('VOTAÇÃO CRIADA COM SUCESSO:', result.id, result.title);
  } catch (e) {
    console.error('ERRO NA CRIAÇÃO:', e.message);
    console.error(e);
  }

  await prisma.$disconnect();
}

test();
