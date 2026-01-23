"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TipoTransacao } from "@prisma/client";

// Interface para dados de transação
interface TransacaoInput {
  descricao: string;
  valor: number;
  tipo: "ENTRADA" | "SAIDA";
  categoria: string;
  data: string;
  homeId: number;
  pago?: boolean;
  pagoEm?: string | null;
  status?: "PENDENTE" | "PAGO" | "PARCIAL" | "TRANSFERIDO";
  origemId?: number | null;
}

// Buscar transações de uma família (opcionalmente por ano, mês e paginação)
export async function getTransacoesByFamilia(homeId: number, ano?: string, mes?: string): Promise<any[]>;
export async function getTransacoesByFamilia(homeId: number, ano: string | undefined, mes: string | undefined, page: number, limit: number): Promise<{ transacoes: any[]; total: number }>;
export async function getTransacoesByFamilia(homeId: number, ano?: string, mes?: string, page?: number, limit?: number) {
  try {
    const where: any = { homeId };

    if (ano && mes) {
      const yearNum = Number(ano);
      const monthIndex = Number(mes) - 1; // 0-based for Date
      const start = new Date(Date.UTC(yearNum, monthIndex, 1, 0, 0, 0));
      const next = new Date(Date.UTC(yearNum, monthIndex + 1, 1, 0, 0, 0));
      where.data = { gte: start, lt: next };
    }

    // Se paginação for fornecida, usar skip/take e retornar total
    if (page !== undefined && limit !== undefined) {
      const [total, transacoes] = await Promise.all([
        (prisma as any).transaction.count({ where }),
        (prisma as any).transaction.findMany({
          where,
          orderBy: { data: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: { pagamentos: true },
        }),
      ]);

      const mapped = transacoes.map((t: any) => {
        const valorTotal = Number(t.valor);
        const totalPago = (t.pagamentos || []).reduce(
          (acc: number, p: any) => acc + Number(p.valor),
          0
        );
        const valorRestante = valorTotal - totalPago;

        return {
          id: t.id,
          tipo: (t.tipo === "ENTRADA" ? "entrada" : "saida") as "entrada" | "saida",
          descricao: t.descricao,
          valor: valorTotal,
          categoria: t.categoria,
          data: t.data.toISOString().split("T")[0],
          pago: t.pago,
          pagoEm: t.pagoEm ? t.pagoEm.toISOString().split("T")[0] : null,
          status: t.status ?? null,
          origemId: t.origemId ?? null,
          totalPago,
          valorRestante,
        };
      });

      return { transacoes: mapped, total };
    }

    // Comportamento antigo (sem paginação): retornar todas as transações como antes
    const transacoes: any[] = await (prisma as any).transaction.findMany({
      where,
      orderBy: {
        data: "desc",
      },
      include: {
        pagamentos: true,
      },
    });

    return transacoes.map((t) => {
      const valorTotal = Number(t.valor);
      const totalPago = (t.pagamentos || []).reduce(
        (acc: number, p: any) => acc + Number(p.valor),
        0
      );
      const valorRestante = valorTotal - totalPago;

      return {
        id: t.id,
        tipo: (t.tipo === "ENTRADA" ? "entrada" : "saida") as "entrada" | "saida",
        descricao: t.descricao,
        valor: valorTotal,
        categoria: t.categoria,
        data: t.data.toISOString().split("T")[0],
        pago: t.pago,
        pagoEm: t.pagoEm ? t.pagoEm.toISOString().split("T")[0] : null,
        status: t.status ?? null,
        origemId: t.origemId ?? null,
        totalPago,
        valorRestante,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    throw new Error("Não foi possível carregar as transações");
  }
} 

// Buscar resumo financeiro de uma família
export async function getResumoFinanceiro(homeId: number, ano?: string, mes?: string) {
  try {
    // Vamos considerar pagamentos parciais: buscar transações do mês com os pagamentos
    const whereData: any = { homeId };
    let start: Date | undefined;
    let next: Date | undefined;

    if (ano && mes) {
      const yearNum = Number(ano);
      const monthIndex = Number(mes) - 1;
      start = new Date(Date.UTC(yearNum, monthIndex, 1, 0, 0, 0));
      next = new Date(Date.UTC(yearNum, monthIndex + 1, 1, 0, 0, 0));
      whereData.data = { gte: start, lt: next };
    }

    try {
      // Buscar transações do mês incluindo pagamentos (para calcular valores restantes)
      const transacoesData = await prisma.transaction.findMany({
        where: whereData,
        include: { pagamentos: true },
      });

      // Gastos efetivamente pagos no mês: somar pagamentos cujo `data` está no mês e que pertençam a SAIDA
      let pagamentosNoMes: any[] = [];
      if (start && next) {
        pagamentosNoMes = await (prisma as any).pagamento.findMany({
          where: {
            data: { gte: start, lt: next },
            transacao: { homeId, tipo: "SAIDA" },
          },
        });
      } else {
        // Sem filtragem por mês, considerar todos os pagamentos da família
        pagamentosNoMes = await (prisma as any).pagamento.findMany({
          where: { transacao: { homeId, tipo: "SAIDA" } },
        });
      }

      const rendimentos = transacoesData
        .filter((t) => t.tipo === "ENTRADA")
        .reduce((acc, t) => acc + Number(t.valor), 0);

      // Gastos do mês = soma dos pagamentos de SAIDA registrados no mês
      const gastos = pagamentosNoMes.reduce((acc, p) => acc + Number(p.valor), 0);

      // Previsão: soma dos valores restantes (valor - pagamentos) das transações SAIDA do mês
      // que não foram transferidas. Isso garante que pagamentos parciais reduzam a previsão.
      const previsao = transacoesData
        .filter((t) => t.tipo === "SAIDA" && t.status !== "TRANSFERIDO")
        .reduce((acc, t) => {
          const totalPago = (t.pagamentos || []).reduce((a: number, p: any) => a + Number(p.valor), 0);
          const restante = Number(t.valor) - totalPago;
          return acc + (restante > 0 ? restante : 0);
        }, 0);

      const transferidos = transacoesData
        .filter((t) => t.tipo === "SAIDA" && t.status === "TRANSFERIDO")
        .reduce((acc, t) => acc + Number(t.valor), 0);

      return {
        rendimentos,
        gastos,
        previsao,
        transferidos,
        saldo: rendimentos - gastos,
      };
    } catch (error) {
      // Em caso de banco antigo sem campos/relacionamentos, faz fallback para compatibilidade
      console.warn("Erro ao calcular resumo com pagamentos; usando fallback simplificado.", error);
      try {
        const transacoes = await prisma.transaction.findMany({
          where: whereData,
          select: { valor: true, tipo: true, pago: true, status: true },
        });

        const rendimentos = transacoes.filter((t) => t.tipo === "ENTRADA").reduce((acc, t) => acc + Number(t.valor), 0);

        const gastos = transacoes
          .filter((t) => t.tipo === "SAIDA" && (t as any).pago !== false)
          .reduce((acc, t) => acc + Number(t.valor), 0);

        const previsao = transacoes
          .filter((t) => t.tipo === "SAIDA" && (t as any).pago === false)
          .reduce((acc, t) => acc + Number(t.valor), 0);

        return {
          rendimentos,
          gastos,
          previsao,
          transferidos: 0,
          saldo: rendimentos - gastos,
        };
      } catch (err) {
        console.error("Fallback também falhou ao calcular resumo financeiro:", err);
        throw err;
      }
    }
  } catch (error) {
    console.error("Erro ao buscar resumo financeiro:", error);
    throw new Error("Não foi possível carregar o resumo financeiro");
  }
}

// Retorna lista detalhada de gastos previstos (restante > 0) para um mês
export async function getPrevisaoDetalhada(homeId: number, ano: string, mes: string) {
  try {
    const yearNum = Number(ano);
    const monthIndex = Number(mes) - 1;
    const start = new Date(Date.UTC(yearNum, monthIndex, 1, 0, 0, 0));
    const next = new Date(Date.UTC(yearNum, monthIndex + 1, 1, 0, 0, 0));

    const transacoes = await (prisma as any).transaction.findMany({
      where: {
        homeId,
        data: { gte: start, lt: next },
        tipo: 'SAIDA',
      },
      include: { pagamentos: true },
      orderBy: { data: 'asc' },
    });

    const detalhes = transacoes
      .map((t: any) => {
        const totalPago = (t.pagamentos || []).reduce((acc: number, p: any) => acc + Number(p.valor), 0);
        const restante = Number(t.valor) - totalPago;
        return {
          id: t.id,
          descricao: t.descricao,
          categoria: t.categoria,
          data: t.data.toISOString().split('T')[0],
          valor: Number(t.valor),
          totalPago,
          restante,
          status: t.status ?? null,
        };
      })
      .filter((t: any) => t.restante > 0 && t.status !== 'TRANSFERIDO');

    return detalhes;
  } catch (error) {
    console.error('Erro ao buscar previsão detalhada:', error);
    return [];
  }
}

// Criar nova transação (gasto ou rendimento)
export async function criarTransacao(data: TransacaoInput) {
  try {
    // Tenta criar incluindo `pago` (se o campo existe). Se falhar por cliente Prisma estar
    // desatualizado, tenta criar sem o campo `pago`.
    let novaTransacao: any;
    try {
      novaTransacao = await prisma.transaction.create({
        data: {
          descricao: data.descricao,
          valor: data.valor,
          tipo: data.tipo as TipoTransacao,
          categoria: data.categoria,
          data: new Date(data.data),
          pago: data.pago ?? (data.tipo === "SAIDA" ? false : true),
          pagoEm: data.pagoEm ? new Date(data.pagoEm) : null,
          status: (data as any).status ?? (data.tipo === "SAIDA" ? "PENDENTE" : "PAGO"),
          origemId: (data as any).origemId ?? null,
          homeId: data.homeId,
        },
      });
    } catch (err: any) {
      const msg = String(err?.message ?? "");
      if (msg.includes("Unknown field `pago`") || msg.includes("Unknown field `status`") || msg.includes("Unknown field `pagoEm`") || err?.name === "PrismaClientValidationError") {
        console.warn("Alguns campos (pago/status/pagoEm) não suportados no DB ao criar transação: criando sem esses campos.");
        novaTransacao = await prisma.transaction.create({
          data: {
            descricao: data.descricao,
            valor: data.valor,
            tipo: data.tipo as TipoTransacao,
            categoria: data.categoria,
            data: new Date(data.data),
            homeId: data.homeId,
          },
        });
      } else {
        throw err;
      }
    }

    revalidatePath(`/familias/${data.homeId}`);

    return {
      success: true,
      transacao: {
        id: novaTransacao.id,
        tipo: novaTransacao.tipo === "ENTRADA" ? "entrada" : "saida",
        descricao: novaTransacao.descricao,
        valor: Number(novaTransacao.valor),
        categoria: novaTransacao.categoria,
        data: novaTransacao.data.toISOString().split("T")[0],
        pago: novaTransacao.pago,
        pagoEm: novaTransacao.pagoEm ? novaTransacao.pagoEm.toISOString().split("T")[0] : null,
        status: (novaTransacao as any).status ?? null,
        origemId: (novaTransacao as any).origemId ?? null,
      },
    };
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return {
      success: false,
      error: "Não foi possível criar a transação",
    };
  }
}

// Atualizar transação
export async function atualizarTransacao(
  id: number,
  data: Omit<TransacaoInput, "homeId">
) {
  try {
    // Tenta atualizar incluindo `pago` (se suportado). Em caso de validação por campo desconhecido
    // faz fallback e atualiza apenas os campos compatíveis.
    let transacaoAtualizada: any;
    try {
      transacaoAtualizada = await prisma.transaction.update({
        where: { id },
        data: {
          descricao: data.descricao,
          valor: data.valor,
          tipo: data.tipo as TipoTransacao,
          categoria: data.categoria,
          data: new Date(data.data),
          pago: (data as any).pago !== undefined ? (data as any).pago : undefined,
          pagoEm: (data as any).pagoEm ? new Date((data as any).pagoEm) : undefined,
          status: (data as any).status !== undefined ? (data as any).status : undefined,
          origemId: (data as any).origemId !== undefined ? (data as any).origemId : undefined,
        },
      });
    } catch (err: any) {
      const msg = String(err?.message ?? "");
      if (msg.includes("Unknown field `pago`") || msg.includes("Unknown field `pagoEm`") || msg.includes("Unknown field `status`") || err?.name === "PrismaClientValidationError") {
        console.warn("Alguns campos (pago/pagoEm/status) não suportados no DB ao atualizar transação: atualizando sem esses campos.");
        transacaoAtualizada = await prisma.transaction.update({
          where: { id },
          data: {
            descricao: data.descricao,
            valor: data.valor,
            tipo: data.tipo as TipoTransacao,
            categoria: data.categoria,
            data: new Date(data.data),
          },
        });
      } else {
        throw err;
      }
    }

    // Buscar homeId para revalidar a página correta
    revalidatePath(`/familias/${transacaoAtualizada.homeId}`);

    return {
      success: true,
      transacao: {
        id: transacaoAtualizada.id,
        tipo: (transacaoAtualizada.tipo === "ENTRADA" ? "entrada" : "saida") as
          | "entrada"
          | "saida",
        descricao: transacaoAtualizada.descricao,
        valor: Number(transacaoAtualizada.valor),
        categoria: transacaoAtualizada.categoria,
        data: transacaoAtualizada.data.toISOString().split("T")[0],
        pago: transacaoAtualizada.pago,
      },
    };
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    return {
      success: false,
      error: "Não foi possível atualizar a transação",
    };
  }
}

// Deletar transação
export async function deletarTransacao(id: number, homeId: number) {
  try {
    const transacao = await prisma.transaction.findUnique({
      where: { id },
      select: { valor: true, tipo: true },
    });

    if (!transacao) {
      return { success: false, error: "Transação não encontrada" };
    }

    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath(`/familias/${homeId}`);

    return {
      success: true,
      valorRemovido: Number(transacao.valor),
      tipoRemovido: transacao.tipo,
    };
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    return {
      success: false,
      error: "Não foi possível deletar a transação",
    };
  }
}

// Transferir transação para o próximo mês (marca original como TRANSFERIDO e cria cópia no primeiro dia do próximo mês)
export async function transferirTransacao(id: number) {
  try {
    const transacao = await prisma.transaction.findUnique({ where: { id } });

    if (!transacao) {
      return { success: false, error: "Transação não encontrada" };
    }

    if (transacao.tipo !== "SAIDA") {
      return { success: false, error: "Apenas gastos podem ser transferidos" };
    }

    // Calcular primeiro dia do próximo mês (UTC)
    const orig = new Date(transacao.data as any);
    const target = new Date(Date.UTC(orig.getUTCFullYear(), orig.getUTCMonth() + 1, 1, 0, 0, 0));

    // Marcar original como transferido
    await prisma.transaction.update({ where: { id }, data: { status: "TRANSFERIDO" } });

    // Criar cópia para o próximo mês
    const copia = await prisma.transaction.create({
      data: {
        descricao: transacao.descricao,
        valor: transacao.valor,
        tipo: transacao.tipo,
        categoria: transacao.categoria,
        data: target,
        pago: false,
        status: "PENDENTE",
        origemId: transacao.id,
        homeId: transacao.homeId,
      },
    });

    revalidatePath(`/familias/${transacao.homeId}`);

    return {
      success: true,
      originalId: transacao.id,
      copia: {
        id: copia.id,
        data: copia.data.toISOString().split("T")[0],
      },
    };
  } catch (error) {
    console.error("Erro ao transferir transação:", error);
    return { success: false, error: "Não foi possível transferir transação" };
  }
}

// Atualiza apenas o campo pago de uma transação
export async function setPagoTransacao(id: number, pago: boolean, pagoEm?: string | null) {
  try {
    // Buscar transação com pagamentos para calcular restante
    const transacaoExistente: any = await prisma.transaction.findUnique({
      where: { id },
      include: { pagamentos: true },
    });

    if (!transacaoExistente) {
      return { success: false, error: "Transação não encontrada" };
    }

    // Se marcando como pago, criar um pagamento para cobrir o restante se necessário
    if (pago) {
      const totalPago = (transacaoExistente.pagamentos || []).reduce((acc: number, p: any) => acc + Number(p.valor), 0);
      const valorTransacao = Number(transacaoExistente.valor);
      const restante = valorTransacao - totalPago;

      if (restante > 0.01) {
        // Criar pagamento cobrindo o restante
        await (prisma as any).pagamento.create({
          data: {
            transacaoId: id,
            valor: restante,
            data: pagoEm ? new Date(pagoEm) : new Date(),
          },
        });
      }
    }

    // Tenta atualizar campo `pago` e `pagoEm` e `status`.
    let transacao: any;
    try {
      transacao = await prisma.transaction.update({
        where: { id },
        data: {
          pago,
          pagoEm: pago ? (pagoEm ? new Date(pagoEm) : new Date()) : null,
          status: pago ? "PAGO" : "PENDENTE",
        },
      });
    } catch (err: any) {
      const msg = String(err?.message ?? "");
      if (msg.includes("Unknown field `pago`") || msg.includes("Unknown field `pagoEm`") || msg.includes("Unknown field `status`") || err?.name === "PrismaClientValidationError") {
        console.error("Atualização de 'pago' falhou: campos não existem no banco. Execute migração do Prisma.");
        return { success: false, error: "Campos de pagamento não existem no banco. Rode a migração do Prisma." };
      }
      throw err;
    }

    revalidatePath(`/familias/${transacao.homeId}`);

    return {
      success: true,
      transacao: {
        id: transacao.id,
        tipo: transacao.tipo === "ENTRADA" ? "entrada" : "saida",
        descricao: transacao.descricao,
        valor: Number(transacao.valor),
        categoria: transacao.categoria,
        data: transacao.data.toISOString().split("T")[0],
        pago: transacao.pago,
        pagoEm: transacao.pagoEm ? transacao.pagoEm.toISOString().split("T")[0] : null,
        status: (transacao as any).status ?? null,
      },
    };
  } catch (error) {
    console.error("Erro ao atualizar pago:", error);
    return {
      success: false,
      error: "Não foi possível atualizar o pagamento",
    };
  }
}

// Registrar pagamento parcial de uma transação
export async function registrarPagamentoParcial(
  transacaoId: number,
  valorPago: number,
  dataPagamento: string
) {
  try {
    const transacao: any = await (prisma as any).transaction.findUnique({
      where: { id: transacaoId },
      include: { pagamentos: true },
    });

    if (!transacao) {
      return { success: false, error: "Transação não encontrada" };
    }

    if (transacao.tipo !== "SAIDA") {
      return { success: false, error: "Apenas gastos podem ter pagamentos parciais" };
    }

    // Calcular total já pago
    const totalPago = (transacao.pagamentos || []).reduce(
      (acc: number, p: any) => acc + Number(p.valor),
      0
    );
    const valorTransacao = Number(transacao.valor);
    const restante = valorTransacao - totalPago;

    if (valorPago > restante + 0.01) {
      return {
        success: false,
        error: `Valor excede o restante. Máximo permitido: R$ ${restante.toFixed(2)}`,
      };
    }

    // Criar o pagamento
    const pagamento = await (prisma as any).pagamento.create({
      data: {
        transacaoId,
        valor: valorPago,
        data: new Date(dataPagamento),
      },
    });

    // Atualizar status da transação
    const novoTotalPago = totalPago + valorPago;
    const isPagoTotal = novoTotalPago >= valorTransacao - 0.01;

    await prisma.transaction.update({
      where: { id: transacaoId },
      data: {
        pago: isPagoTotal,
        pagoEm: isPagoTotal ? new Date(dataPagamento) : null,
        status: isPagoTotal ? "PAGO" : "PARCIAL",
      } as any,
    });

    revalidatePath(`/familias/${transacao.homeId}`);

    return {
      success: true,
      pagamento: {
        id: pagamento.id,
        valor: Number(pagamento.valor),
        data: pagamento.data.toISOString().split("T")[0],
      },
      totalPago: novoTotalPago,
      restante: valorTransacao - novoTotalPago,
      isPagoTotal,
    };
  } catch (error) {
    console.error("Erro ao registrar pagamento parcial:", error);
    return { success: false, error: "Não foi possível registrar o pagamento" };
  }
}

// Buscar pagamentos de uma transação
export async function getPagamentosByTransacao(transacaoId: number) {
  try {
    const pagamentos = await (prisma as any).pagamento.findMany({
      where: { transacaoId },
      orderBy: { data: "asc" },
    });

    return pagamentos.map((p: any) => ({
      id: p.id,
      valor: Number(p.valor),
      data: p.data.toISOString().split("T")[0],
    }));
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error);
    return [];
  }
}

// Deletar um pagamento
export async function deletarPagamento(pagamentoId: number) {
  try {
    const pagamento: any = await (prisma as any).pagamento.findUnique({
      where: { id: pagamentoId },
      include: { transacao: { include: { pagamentos: true } } },
    });

    if (!pagamento) {
      return { success: false, error: "Pagamento não encontrado" };
    }

    await (prisma as any).pagamento.delete({ where: { id: pagamentoId } });

    // Recalcular status da transação
    const valorTransacao = Number(pagamento.transacao.valor);
    const totalPagoRestante = (pagamento.transacao.pagamentos || [])
      .filter((p: any) => p.id !== pagamentoId)
      .reduce((acc: number, p: any) => acc + Number(p.valor), 0);

    let novoStatus: "PENDENTE" | "PARCIAL" | "PAGO" = "PENDENTE";
    if (totalPagoRestante >= valorTransacao - 0.01) {
      novoStatus = "PAGO";
    } else if (totalPagoRestante > 0) {
      novoStatus = "PARCIAL";
    }

    await prisma.transaction.update({
      where: { id: pagamento.transacaoId },
      data: {
        pago: novoStatus === "PAGO",
        pagoEm: novoStatus === "PAGO" ? pagamento.transacao.pagoEm : null,
        status: novoStatus,
      } as any,
    });

    revalidatePath(`/familias/${pagamento.transacao.homeId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar pagamento:", error);
    return { success: false, error: "Não foi possível deletar o pagamento" };
  }
}

// Transferir valor restante de uma transação para o próximo mês
export async function transferirRestante(transacaoId: number) {
  try {
    const transacao: any = await (prisma as any).transaction.findUnique({
      where: { id: transacaoId },
      include: { pagamentos: true },
    });

    if (!transacao) {
      return { success: false, error: "Transação não encontrada" };
    }

    if (transacao.tipo !== "SAIDA") {
      return { success: false, error: "Apenas gastos podem ser transferidos" };
    }

    const valorTransacao = Number(transacao.valor);
    const totalPago = (transacao.pagamentos || []).reduce(
      (acc: number, p: any) => acc + Number(p.valor),
      0
    );
    const valorRestante = valorTransacao - totalPago;

    if (valorRestante <= 0.01) {
      return { success: false, error: "Não há valor restante para transferir" };
    }

    // Calcular primeiro dia do próximo mês
    const orig = new Date(transacao.data as any);
    const target = new Date(
      Date.UTC(orig.getUTCFullYear(), orig.getUTCMonth() + 1, 1, 0, 0, 0)
    );

    // Marcar transação original como PARCIAL (já tem pagamentos) ou TRANSFERIDO (sem pagamentos)
    const novoStatus = totalPago > 0 ? "PARCIAL" : "TRANSFERIDO";
    await prisma.transaction.update({
      where: { id: transacaoId },
      data: { status: novoStatus } as any,
    });

    // Criar transação no próximo mês com o valor restante (marcada como transferida)
    const copia = await prisma.transaction.create({
      data: {
        descricao: transacao.descricao,
        valor: valorRestante,
        tipo: transacao.tipo,
        categoria: transacao.categoria,
        data: target,
        pago: false,
        status: "PENDENTE",
        origemId: transacao.id,
        homeId: transacao.homeId,
      },
    });

    revalidatePath(`/familias/${transacao.homeId}`);

    return {
      success: true,
      originalId: transacao.id,
      valorTransferido: valorRestante,
      copia: {
        id: copia.id,
        data: copia.data.toISOString().split("T")[0],
        valor: Number(copia.valor),
      },
    };
  } catch (error) {
    console.error("Erro ao transferir restante:", error);
    return { success: false, error: "Não foi possível transferir o restante" };
  }
}
