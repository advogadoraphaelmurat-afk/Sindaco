const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');
  
  // Limpando DB para evitar duplicatas em testes seguidos
  await prisma.vote.deleteMany();
  await prisma.voteOption.deleteMany();
  await prisma.voting.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.subUnit.deleteMany();
  await prisma.user.deleteMany();
  await prisma.building.deleteMany();
  await prisma.systemAdmin.deleteMany();

  const tempPassword = await bcrypt.hash('123456', 10);

  // 1. Criar System Admin
  const sysAdmin = await prisma.systemAdmin.create({
    data: {
      email: 'admin@sindaco.com',
      password: tempPassword,
    }
  });

  // 2. Criar um Condomínio
  const building = await prisma.building.create({
    data: {
      name: 'Residencial Aurora',
      address: 'Rua do Sol, 100 - Centro',
      active: true,
      maxSubUnits: 50,
      inviteCode: 'AURORA2026',
    }
  });

  // 3. Criar SubUnidade e relacionar
  const apto101 = await prisma.subUnit.create({
    data: {
      identifier: 'Apto 101',
      buildingId: building.id,
    }
  });

  // 4. Criar Users (Sindico e Morador)
  const sindico = await prisma.user.create({
    data: {
      email: 'sindico@aurora.com',
      passwordHash: tempPassword,
      name: 'Carlos Síndico',
      role: 'SINDICO',
      buildingId: building.id,
    }
  });

  const morador = await prisma.user.create({
    data: {
      email: 'morador@aurora.com',
      passwordHash: tempPassword,
      name: 'Maria Clara',
      role: 'MORADOR',
      buildingId: building.id,
      subUnits: {
        connect: { id: apto101.id }
      }
    }
  });

  // Outra unidade vazia para testes reais depoi
  await prisma.subUnit.create({
    data: {
      identifier: 'Apto 102',
      buildingId: building.id,
    }
  });

  console.log('--- SEED CONCLUIDO ---');
  console.log('Contas de Teste disponíveis (Senha: 123456 para todas):');
  console.log('Admim Geral: admin@sindaco.com');
  console.log('Síndico: sindico@aurora.com');
  console.log('Morador: morador@aurora.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
