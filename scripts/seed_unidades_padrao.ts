import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const unidadesPadrao = [
  { nome: "Unidade", abreviacao: "un" },
  { nome: "Quilograma", abreviacao: "kg" },
  { nome: "Grama", abreviacao: "g" },
  { nome: "Litro", abreviacao: "L" },
  { nome: "Mililitro", abreviacao: "mL" },
  { nome: "Metro", abreviacao: "m" },
  { nome: "Centímetro", abreviacao: "cm" },
  { nome: "Pacote", abreviacao: "pct" },
  { nome: "Caixa", abreviacao: "cx" },
  { nome: "Dúzia", abreviacao: "dz" },
];

const subcategoriasPadrao = [
  "Frutas",
  "Verduras",
  "Legumes",
  "Padaria",
  "Laticínios",
  "Carnes",
  "Bebidas",
  "Limpeza",
  "Higiene",
  "Petiscos",
];

async function main() {
  // Buscar todas as famílias
  const homes = await prisma.home.findMany();

  for (const home of homes) {
    console.log(`\nAdicionando dados padrão para família ${home.id} (${home.nome})...`);

    // Adicionar unidades
    for (const unidade of unidadesPadrao) {
      const existe = await prisma.unidade.findFirst({
        where: {
          homeId: home.id,
          abreviacao: unidade.abreviacao,
        },
      });

      if (!existe) {
        await prisma.unidade.create({
          data: {
            nome: unidade.nome,
            abreviacao: unidade.abreviacao,
            homeId: home.id,
          },
        });
        console.log(`  ✓ Unidade: ${unidade.abreviacao}`);
      }
    }

    // Adicionar subcategorias
    for (const nome of subcategoriasPadrao) {
      const existe = await prisma.itemCategoria.findFirst({
        where: {
          homeId: home.id,
          nome,
        },
      });

      if (!existe) {
        await prisma.itemCategoria.create({
          data: {
            nome,
            homeId: home.id,
          },
        });
        console.log(`  ✓ Subcategoria: ${nome}`);
      }
    }
  }

  console.log("\n✅ Dados padrão adicionados com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao adicionar dados padrão:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
