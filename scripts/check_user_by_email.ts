import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: tsx scripts/check_user_by_email.ts <email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { familias: true },
  });

  if (!user) {
    console.log(`Usuário não encontrado para email=${email}`);
    return;
  }

  console.log(`User id=${user.id} nome=${user.nome} apelido=${user.apelido} email=${user.email}`);
  console.log('UserHomes:');
  const userHomes = await prisma.userHome.findMany({ where: { userId: user.id }, include: { home: true } });
  for (const uh of userHomes) {
    console.log(`  userHome id=${uh.id} homeId=${uh.homeId} role=${uh.role} homeNome=${uh.home?.nome}`);
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
