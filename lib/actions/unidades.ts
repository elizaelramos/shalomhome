"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Buscar unidades de uma família
export async function getUnidadesByHome(homeId: number) {
  try {
    const unidades = await prisma.unidade.findMany({
      where: { homeId },
      orderBy: { abreviacao: "asc" },
    });

    return unidades.map((u) => ({
      id: u.id,
      nome: u.nome,
      abreviacao: u.abreviacao,
    }));
  } catch (error) {
    console.error("Erro ao buscar unidades:", error);
    return [];
  }
}

// Criar nova unidade
export async function criarUnidade(homeId: number, nome: string, abreviacao: string) {
  try {
    const unidadeExistente = await prisma.unidade.findFirst({
      where: {
        homeId,
        abreviacao: abreviacao.trim(),
      },
    });

    if (unidadeExistente) {
      return {
        success: false,
        error: "Unidade com essa abreviação já existe",
      };
    }

    const novaUnidade = await prisma.unidade.create({
      data: {
        nome: nome.trim(),
        abreviacao: abreviacao.trim(),
        homeId,
      },
    });

    revalidatePath(`/familias/${homeId}`);

    return {
      success: true,
      data: {
        id: novaUnidade.id,
        nome: novaUnidade.nome,
        abreviacao: novaUnidade.abreviacao,
      },
    };
  } catch (error) {
    console.error("Erro ao criar unidade:", error);
    return {
      success: false,
      error: "Não foi possível criar a unidade",
    };
  }
}
