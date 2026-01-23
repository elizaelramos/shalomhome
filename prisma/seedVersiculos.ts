import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const versiculos = [
  {
    texto: "Honra ao Senhor com os teus bens e com as primícias de toda a tua renda.",
    referencia: "Provérbios 3:9",
  },
  {
    texto: "O que ama o dinheiro nunca se fartará de dinheiro; e quem ama a abundância nunca se fartará da renda.",
    referencia: "Eclesiastes 5:10",
  },
  {
    texto: "Melhor é o pouco com o temor do Senhor do que um grande tesouro onde há inquietação.",
    referencia: "Provérbios 15:16",
  },
  {
    texto: "Porque onde estiver o vosso tesouro, aí estará também o vosso coração.",
    referencia: "Mateus 6:21",
  },
  {
    texto: "Não acumulem para vocês tesouros na terra, onde a traça e a ferrugem destroem, e onde os ladrões arrombam e furtam.",
    referencia: "Mateus 6:19",
  },
  {
    texto: "Dai, e ser-vos-á dado; boa medida, recalcada, sacudida e transbordando.",
    referencia: "Lucas 6:38",
  },
  {
    texto: "A bênção do Senhor é que enriquece; e não acrescenta dores.",
    referencia: "Provérbios 10:22",
  },
  {
    texto: "Os planos do diligente tendem à abundância, mas a pressa excessiva, à pobreza.",
    referencia: "Provérbios 21:5",
  },
  {
    texto: "O rico domina sobre os pobres, e o que toma emprestado é servo do que empresta.",
    referencia: "Provérbios 22:7",
  },
  {
    texto: "Trazei todos os dízimos à casa do tesouro, e provai-me nisto, diz o Senhor.",
    referencia: "Malaquias 3:10",
  },
  {
    texto: "Não devais nada a ninguém, a não ser o amor uns aos outros.",
    referencia: "Romanos 13:8",
  },
  {
    texto: "Quem confia nas suas riquezas cairá, mas os justos reverdecerão como a folhagem.",
    referencia: "Provérbios 11:28",
  },
  {
    texto: "Mas, se alguém não cuida dos seus, e principalmente dos de sua própria casa, tem negado a fé.",
    referencia: "1 Timóteo 5:8",
  },
  {
    texto: "Cada um contribua segundo tiver proposto no coração, não com tristeza ou por necessidade; porque Deus ama a quem dá com alegria.",
    referencia: "2 Coríntios 9:7",
  },
  {
    texto: "O homem bom deixa herança aos filhos de seus filhos, mas a riqueza do pecador é reservada para o justo.",
    referencia: "Provérbios 13:22",
  },
  {
    texto: "Não te canses para enriqueceres; dá de mão à tua própria sabedoria.",
    referencia: "Provérbios 23:4",
  },
  {
    texto: "Melhor é a mão cheia com descanso do que ambas as mãos cheias com trabalho e aflição de espírito.",
    referencia: "Eclesiastes 4:6",
  },
  {
    texto: "Quem lavra a sua terra terá fartura de pão, mas o que segue os ociosos se fartará de pobreza.",
    referencia: "Provérbios 28:19",
  },
  {
    texto: "A alma generosa prosperará, e o que regar também será regado.",
    referencia: "Provérbios 11:25",
  },
  {
    texto: "Não ameis o mundo nem o que há no mundo. Se alguém ama o mundo, o amor do Pai não está nele.",
    referencia: "1 João 2:15",
  },
  {
    texto: "O meu Deus suprirá todas as vossas necessidades segundo as suas riquezas na glória em Cristo Jesus.",
    referencia: "Filipenses 4:19",
  },
  {
    texto: "Buscai primeiro o Reino de Deus e a sua justiça, e todas estas coisas vos serão acrescentadas.",
    referencia: "Mateus 6:33",
  },
  {
    texto: "Bem-aventurado o homem que acha sabedoria, e o homem que adquire conhecimento.",
    referencia: "Provérbios 3:13",
  },
  {
    texto: "O que aumenta os seus bens com juros e ganância ajunta-os para o que se compadece do pobre.",
    referencia: "Provérbios 28:8",
  },
  {
    texto: "Confia ao Senhor as tuas obras, e teus pensamentos serão estabelecidos.",
    referencia: "Provérbios 16:3",
  },
  {
    texto: "Portanto, não se preocupem, dizendo: 'Que vamos comer?' ou 'Que vamos beber?' ou 'Que vamos vestir?' Pois os pagãos é que correm atrás dessas coisas; mas o Pai celestial sabe que vocês precisam delas. Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas serão acrescentadas a vocês.",
    referencia: "Mateus 6:31-33",
  },
  {
    texto: "O dinheiro ganho com desonestidade diminuirá, mas quem o ajunta aos poucos terá cada vez mais.",
    referencia: "Provérbios 13:11",
  },
  {
    texto: "Há quem dê generosamente, e vê aumentar suas riquezas; outros retêm o que deveriam dar, e caem na pobreza.",
    referencia: "Provérbios 11:24",
  },
  {
    texto: "Pois o amor ao dinheiro é a raiz de todos os males. Algumas pessoas, por cobiçarem o dinheiro, desviaram-se da fé e se atormentaram com muitos sofrimentos.",
    referencia: "1 Timóteo 6:10",
  },
  {
    texto: "Para o homem não existe nada melhor do que comer, beber e encontrar prazer em seu trabalho. E vi que isso também vem da mão de Deus.",
    referencia: "Eclesiastes 2:24",
  },
  {
    texto: "Então lhes disse: \"Cuidado! Fiquem de sobreaviso contra todo tipo de ganância; a vida de um homem não consiste na quantidade dos seus bens\".",
    referencia: "Lucas 12:15",
  },
];

async function main() {
  console.log("Inserindo versículos...");

  // Limpar versículos existentes
  await prisma.versiculo.deleteMany();

  // Inserir novos versículos
  for (const versiculo of versiculos) {
    await prisma.versiculo.create({
      data: versiculo,
    });
  }

  console.log(`${versiculos.length} versículos inseridos com sucesso!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
