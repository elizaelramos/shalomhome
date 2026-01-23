import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIAS_BASE_SAIDA = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Vestuário",
  "Contas",
  "Dízimos e Ofertas",
  "Outros",
];

const CATEGORIAS_BASE_ENTRADA = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Presente",
  "Outros",
];

async function main() {
  console.log("Adicionando categorias às famílias existentes...");

  // Buscar todas as famílias
  const familias = await prisma.home.findMany({
    include: {
      categorias: true,
    },
  });

  for (const familia of familias) {
    // Verificar se já tem categorias
    if (familia.categorias.length > 0) {
      console.log(`Família "${familia.nome}" já possui categorias. Pulando...`);
      continue;
    }

    console.log(`Adicionando categorias à família "${familia.nome}"...`);

    // Criar categorias de saída
    for (const nome of CATEGORIAS_BASE_SAIDA) {
      await prisma.categoria.create({
        data: {
          nome,
          tipo: "SAIDA",
          homeId: familia.id,
        },
      });
    }

    // Criar categorias de entrada
    for (const nome of CATEGORIAS_BASE_ENTRADA) {
      await prisma.categoria.create({
        data: {
          nome,
          tipo: "ENTRADA",
          homeId: familia.id,
        },
      });
    }

    console.log(`  ✓ ${CATEGORIAS_BASE_SAIDA.length + CATEGORIAS_BASE_ENTRADA.length} categorias adicionadas`);
  }

  console.log("\nConcluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
