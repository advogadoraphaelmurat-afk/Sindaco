const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, buildingId: true }
  });
  console.log(JSON.stringify(users, null, 2));
  
  const admins = await prisma.systemAdmin.findMany();
  console.log('Admins:', JSON.stringify(admins, null, 2));

  const buildings = await prisma.building.findMany();
  console.log('Buildings:', JSON.stringify(buildings, null, 2));
}

check().then(() => prisma.$disconnect());
