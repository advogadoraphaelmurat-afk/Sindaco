const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const buildingId = "cmo7dde5s00015594ap4c1gff"; // ID do Aurora que encontramos
  const prefix = "Apto";
  const start = 101;
  const end = 105;

  console.log(`Tentando criar unidades de ${start} a ${end} para o prédio ${buildingId}...`);

  try {
    const units = [];
    for (let i = start; i <= end; i++) {
      units.push({
        identifier: `${prefix} ${i}`.trim(),
        buildingId: buildingId,
      });
    }

    const result = await prisma.subUnit.createMany({
      data: units,
      skipDuplicates: true,
    });
    
    console.log('Sucesso!', result);
  } catch (error) {
    console.error('Erro no Prisma:', error);
  }
}

test().then(() => prisma.$disconnect());
