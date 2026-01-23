"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Buscar todas as famílias
export async function getFamilias() {
  try {
    const familias = await prisma.home.findMany({
      include: {
        _count: {
          select: { membros: true, transacoes: true },
        },
        transacoes: {
          select: {
            valor: true,
            tipo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calcular saldo de cada família
    return familias.map((familia) => {
      const saldo = familia.transacoes.reduce((acc, t) => {
        const valor = Number(t.valor);
        return t.tipo === "ENTRADA" ? acc + valor : acc - valor;
      }, 0);

      return {
        id: familia.id,
        nome: familia.nome,
        membros: familia._count.membros || 1,
        saldo,
        createdAt: familia.createdAt,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar famílias:", error);
    throw new Error("Não foi possível carregar as famílias");
  }
}

// Buscar apenas as famílias às quais o usuário pertence
export async function getFamiliasForUser(userId: number) {
  try {
    const userHomes = await prisma.userHome.findMany({
      where: { userId },
      include: {
        home: {
          include: {
            _count: {
              select: { membros: true, transacoes: true },
            },
            transacoes: {
              select: { valor: true, tipo: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return userHomes.map(({ home }) => {
      const saldo = home.transacoes.reduce((acc, t) => {
        const valor = Number(t.valor);
        return t.tipo === "ENTRADA" ? acc + valor : acc - valor;
      }, 0);

      return {
        id: home.id,
        nome: home.nome,
        membros: home._count?.membros || 1,
        saldo,
        createdAt: home.createdAt,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar famílias do usuário:", error);
    throw new Error("Não foi possível carregar as famílias");
  }
}

// Buscar uma família específica por ID com membros
export async function getFamiliaById(id: number) {
  try {
    const familia = await prisma.home.findUnique({
      where: { id },
      include: {
        membros: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!familia) {
      return null;
    }

    return {
      id: familia.id,
      nome: familia.nome,
      membros: familia.membros.map((uh) => ({
        id: uh.id,
        userId: uh.user.id,
        nome: uh.user.nome,
        apelido: uh.user.apelido,
        email: uh.user.email,
        role: uh.role,
        createdAt: uh.createdAt,
      })),
      createdAt: familia.createdAt,
    };
  } catch (error) {
    console.error("Erro ao buscar família:", error);
    throw new Error("Não foi possível carregar a família");
  }
}

// Buscar uma família apenas se o usuário for membro
export async function getFamiliaByIdForUser(userId: number, id: number) {
  try {
    const userHome = await prisma.userHome.findUnique({
      where: {
        userId_homeId: {
          userId,
          homeId: id,
        },
      },
      include: {
        home: {
          include: {
            membros: {
              include: { user: true },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!userHome || !userHome.home) {
      return null;
    }

    const familia = userHome.home;

    return {
      id: familia.id,
      nome: familia.nome,
      membros: familia.membros.map((uh) => ({
        id: uh.id,
        userId: uh.user.id,
        nome: uh.user.nome,
        apelido: uh.user.apelido,
        email: uh.user.email,
        role: uh.role,
        createdAt: uh.createdAt,
      })),
      createdAt: familia.createdAt,
    };
  } catch (error) {
    console.error("Erro ao buscar família para usuário:", error);
    throw new Error("Não foi possível carregar a família");
  }
}

// Categorias base para novas famílias
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

// Criar nova família
export async function criarFamilia(nome: string) {
  try {
    const novaFamilia = await prisma.home.create({
      data: {
        nome,
        categorias: {
          createMany: {
            data: [
              ...CATEGORIAS_BASE_SAIDA.map((cat) => ({
                nome: cat,
                tipo: "SAIDA" as const,
              })),
              ...CATEGORIAS_BASE_ENTRADA.map((cat) => ({
                nome: cat,
                tipo: "ENTRADA" as const,
              })),
            ],
          },
        },
      },
    });

    revalidatePath("/familias");

    return {
      success: true,
      familia: {
        id: novaFamilia.id,
        nome: novaFamilia.nome,
      },
    };
  } catch (error) {
    console.error("Erro ao criar família:", error);
    return {
      success: false,
      error: "Não foi possível criar a família",
    };
  }
}

// Deletar família
export async function deletarFamilia(id: number) {
  try {
    await prisma.home.delete({
      where: { id },
    });

    revalidatePath("/familias");

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar família:", error);
    return {
      success: false,
      error: "Não foi possível deletar a família",
    };
  }
}

// Atualizar nome da família
export async function atualizarFamilia(id: number, nome: string) {
  try {
    const familia = await prisma.home.update({
      where: { id },
      data: { nome },
    });

    revalidatePath("/familias");

    return {
      success: true,
      familia: {
        id: familia.id,
        nome: familia.nome,
      },
    };
  } catch (error) {
    console.error("Erro ao atualizar família:", error);
    return {
      success: false,
      error: "Não foi possível atualizar a família",
    };
  }
}
