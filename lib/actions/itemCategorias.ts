"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Buscar subcategorias de itens de uma família
export async function getItemCategoriasByHome(homeId: number) {
  try {
    const categorias = await prisma.itemCategoria.findMany({
      where: { homeId },
      orderBy: { nome: "asc" },
    });

    return categorias.map((c) => ({
      id: c.id,
      nome: c.nome,
    }));
  } catch (error) {
    console.error("Erro ao buscar subcategorias de itens:", error);
    return [];
  }
}

// Criar nova subcategoria de item
export async function criarItemCategoria(homeId: number, nome: string) {
  try {
    const categoriaExistente = await prisma.itemCategoria.findFirst({
      where: {
        homeId,
        nome: nome.trim(),
      },
    });

    if (categoriaExistente) {
      return {
        success: false,
        error: "Subcategoria já existe",
      };
    }

    const novaCategoria = await prisma.itemCategoria.create({
      data: {
        nome: nome.trim(),
        homeId,
      },
    });

    revalidatePath(`/familias/${homeId}`);

    return {
      success: true,
      data: {
        id: novaCategoria.id,
        nome: novaCategoria.nome,
      },
    };
  } catch (error) {
    console.error("Erro ao criar subcategoria de item:", error);
    return {
      success: false,
      error: "Não foi possível criar a subcategoria",
    };
  }
}
