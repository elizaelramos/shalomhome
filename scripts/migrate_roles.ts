import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.userHome.updateMany({
    where: { role: 'admin' },
    data: { role: 'administrador' },
  });

  console.log(`Updated ${result.count} userHome records from 'admin' to 'administrador'.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
