const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$queryRaw`SELECT 1`
  .then(() => {
    console.log('CONEXAO OK');
    process.exit(0);
  })
  .catch((e) => {
    console.error('ERRO:', e.message);
    process.exit(1);
  });
