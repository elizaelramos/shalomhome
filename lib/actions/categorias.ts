"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CategoriaData {
  id: number;
  nome: string;
  tipo: "ENTRADA" | "SAIDA";
  emUso?: boolean;
}

// Buscar categorias de uma família
export async function getCategoriasByFamilia(homeId: number) {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { homeId },
      orderBy: [{ tipo: "asc" }, { nome: "asc" }],
    });

    return categorias.map((cat) => ({
      id: cat.id,
      nome: cat.nome,
      tipo: cat.tipo as "ENTRADA" | "SAIDA",
    }));
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    throw new Error("Não foi possível carregar as categorias");
  }
}

// Buscar categorias por tipo (para os modais de gasto/rendimento)
export async function getCategoriasByTipo(homeId: number, tipo: "ENTRADA" | "SAIDA") {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { homeId, tipo },
      orderBy: { nome: "asc" },
    });

    return categorias.map((cat) => cat.nome);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

// Buscar categorias com informação de uso
export async function getCategoriasComUso(homeId: number) {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { homeId },
      orderBy: [{ tipo: "asc" }, { nome: "asc" }],
    });

    // Verificar quais categorias estão em uso
    const categoriasComUso = await Promise.all(
      categorias.map(async (cat) => {
        const count = await prisma.transaction.count({
          where: {
            homeId,
            categoria: cat.nome,
            tipo: cat.tipo,
          },
        });

        return {
          id: cat.id,
          nome: cat.nome,
          tipo: cat.tipo as "ENTRADA" | "SAIDA",
          emUso: count > 0,
        };
      })
    );

    return categoriasComUso;
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    throw new Error("Não foi possível carregar as categorias");
  }
}

// Criar nova categoria
export async function criarCategoria(homeId: number, nome: string, tipo: "ENTRADA" | "SAIDA") {
  try {
    // Verificar se já existe
    const existente = await prisma.categoria.findFirst({
      where: { homeId, nome, tipo },
    });

    if (existente) {
      return {
        success: false,
        error: "Já existe uma categoria com este nome",
      };
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome,
        tipo,
        homeId,
      },
    });

    revalidatePath(`/familias/${homeId}`);

    return {
      success: true,
      categoria: {
        id: categoria.id,
        nome: categoria.nome,
        tipo: categoria.tipo as "ENTRADA" | "SAIDA",
        emUso: false,
      },
    };
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return {
      success: false,
      error: "Não foi possível criar a categoria",
    };
  }
}

// Atualizar nome da categoria
export async function atualizarCategoria(id: number, nome: string, homeId: number) {
  try {
    // Buscar categoria atual
    const categoriaAtual = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoriaAtual) {
      return { success: false, error: "Categoria não encontrada" };
    }

    // Verificar se o novo nome já existe
    const existente = await prisma.categoria.findFirst({
      where: {
        homeId,
        nome,
        tipo: categoriaAtual.tipo,
        NOT: { id },
      },
    });

    if (existente) {
      return {
        success: false,
        error: "Já existe uma categoria com este nome",
      };
    }

    // Atualizar categoria
    const categoria = await prisma.categoria.update({
      where: { id },
      data: { nome },
    });

    // Atualizar transações que usam esta categoria
    await prisma.transaction.updateMany({
      where: {
        homeId,
        categoria: categoriaAtual.nome,
        tipo: categoriaAtual.tipo,
      },
      data: { categoria: nome },
    });

    revalidatePath(`/familias/${homeId}`);

    return {
      success: true,
      categoria: {
        id: categoria.id,
        nome: categoria.nome,
        tipo: categoria.tipo as "ENTRADA" | "SAIDA",
      },
    };
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return {
      success: false,
      error: "Não foi possível atualizar a categoria",
    };
  }
}

// Deletar categoria (apenas se não estiver em uso)
export async function deletarCategoria(id: number, homeId: number) {
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      return { success: false, error: "Categoria não encontrada" };
    }

    // Verificar se está em uso
    const emUso = await prisma.transaction.count({
      where: {
        homeId,
        categoria: categoria.nome,
        tipo: categoria.tipo,
      },
    });

    if (emUso > 0) {
      return {
        success: false,
        error: "Não é possível excluir uma categoria em uso. Altere as transações primeiro.",
      };
    }

    await prisma.categoria.delete({
      where: { id },
    });

    revalidatePath(`/familias/${homeId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    return {
      success: false,
      error: "Não foi possível deletar a categoria",
    };
  }
}
