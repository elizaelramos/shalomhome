"use server";

import prisma from "@/lib/prisma";

export async function getVersiculoAleatorio() {
  try {
    // Contar total de versículos
    const count = await prisma.versiculo.count();

    if (count === 0) {
      return null;
    }

    // Gerar índice aleatório
    const randomIndex = Math.floor(Math.random() * count);

    // Buscar versículo aleatório
    const versiculo = await prisma.versiculo.findFirst({
      skip: randomIndex,
      select: {
        id: true,
        texto: true,
        referencia: true,
      },
    });

    return versiculo;
  } catch (error) {
    console.error("Erro ao buscar versículo:", error);
    return null;
  }
}
