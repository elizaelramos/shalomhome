import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const homes = await prisma.home.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      membros: {
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  for (const home of homes) {
    console.log(`Home id=${home.id} nome="${home.nome}" createdAt=${home.createdAt}`);
    if (home.membros.length === 0) {
      console.log('  (sem membros)');
    } else {
      for (const m of home.membros) {
        console.log(`  userHome id=${m.id} userId=${m.userId} role=${m.role} user.email=${m.user?.email}`);
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
