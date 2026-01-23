"use server";

import prisma from "@/lib/prisma";

export async function getGastosPorCategoria(homeId: number, ano?: string, mes?: string) {
  const where: any = { homeId, tipo: "SAIDA" };

  if (ano && mes) {
    const yearNum = Number(ano);
    const monthIndex = Number(mes) - 1;
    const start = new Date(Date.UTC(yearNum, monthIndex, 1, 0, 0, 0));
    const next = new Date(Date.UTC(yearNum, monthIndex + 1, 1, 0, 0, 0));
    where.data = { gte: start, lt: next };
  }

  // Excluir transferidos por padrão
  where.status = { not: "TRANSFERIDO" };

  const results = await prisma.transaction.groupBy({
    by: ["categoria"],
    where,
    _sum: { valor: true },
    orderBy: { _sum: { valor: "desc" } },
  });

  return results.map((r) => ({ categoria: r.categoria, total: Number(r._sum.valor ?? 0) }));
}

// Retornar transações de uma categoria em um mês (para detalhamento do relatório)
export async function getTransacoesPorCategoria(homeId: number, categoria: string, ano?: string, mes?: string) {
  const where: any = { homeId, tipo: "SAIDA", categoria };

  if (ano && mes) {
    const yearNum = Number(ano);
    const monthIndex = Number(mes) - 1;
    const start = new Date(Date.UTC(yearNum, monthIndex, 1, 0, 0, 0));
    const next = new Date(Date.UTC(yearNum, monthIndex + 1, 1, 0, 0, 0));
    where.data = { gte: start, lt: next };
  }

  // Excluir transferidos (seguindo o relatório por categoria)
  where.status = { not: "TRANSFERIDO" };

  const transacoes = await prisma.transaction.findMany({
    where,
    orderBy: { data: "desc" },
    select: {
      id: true,
      descricao: true,
      valor: true,
      data: true,
      status: true,
      categoria: true,
    },
  });

  return transacoes.map((t) => ({
    id: t.id,
    descricao: t.descricao,
    valor: Number(t.valor),
    data: t.data.toISOString().split("T")[0],
    status: t.status ?? null,
    categoria: t.categoria,
  }));
}

export async function getResumoSimples(homeId: number, ano?: string, mes?: string) {
  // Entradas: sum ENTRADA by data in month
  const whereData: any = { homeId };
  if (ano && mes) {
    const yearNum = Number(ano);
    const monthIndex = Number(mes) - 1;
    const start = new Date(Date.UTC(yearNum, monthIndex, 1, 0, 0, 0));
    const next = new Date(Date.UTC(yearNum, monthIndex + 1, 1, 0, 0, 0));
    whereData.data = { gte: start, lt: next };
  }

  // Se não houver transações no período, retornar null para sinalizar "sem dados"
  const totalTransacoesNoPeriodo = await prisma.transaction.count({ where: whereData });
  if (totalTransacoesNoPeriodo === 0) {
    return null;
  }

  const entradas = await prisma.transaction.aggregate({
    _sum: { valor: true },
    where: { ...whereData, tipo: "ENTRADA" },
  });

  // Gastos: sum SAIDA with data in month excluding transferidos
  const gastos = await prisma.transaction.aggregate({
    _sum: { valor: true },
    where: { ...whereData, tipo: "SAIDA", status: { not: "TRANSFERIDO" } },
  });

  // Previsão: SAIDA no mês que ainda não foram pagas (PENDENTE)
  const previsao = await prisma.transaction.aggregate({
    _sum: { valor: true },
    where: { ...whereData, tipo: "SAIDA", status: "PENDENTE" },
  });

  // Transferidos: SAIDA no mês que têm status TRANSFERIDO
  const transferidos = await prisma.transaction.aggregate({
    _sum: { valor: true },
    where: { ...whereData, tipo: "SAIDA", status: "TRANSFERIDO" },
  });

  const totalEntradas = Number(entradas._sum.valor ?? 0);
  const totalGastos = Number(gastos._sum.valor ?? 0);
  const totalPrevisao = Number(previsao._sum.valor ?? 0);
  const totalTransferidos = Number(transferidos._sum.valor ?? 0);
  const saldo = totalEntradas - totalGastos;

  return { entradas: totalEntradas, gastos: totalGastos, previsao: totalPrevisao, transferidos: totalTransferidos, saldo };
}

// Buscar pagamentos realizados em um mês específico (independente do mês do gasto)
export async function getPagamentosPorMes(homeId: number, ano?: string, mes?: string) {
  const where: any = {};

  if (ano && mes) {
    const yearNum = Number(ano);
    const monthIndex = Number(mes) - 1;
    const start = new Date(Date.UTC(yearNum, monthIndex, 1, 0, 0, 0));
    const next = new Date(Date.UTC(yearNum, monthIndex + 1, 1, 0, 0, 0));
    where.data = { gte: start, lt: next };
  }

  // Buscar pagamentos do mês que pertencem a transações desta família
  const pagamentos = await (prisma as any).pagamento.findMany({
    where,
    include: {
      transacao: {
        select: {
          id: true,
          descricao: true,
          valor: true,
          categoria: true,
          data: true,
          homeId: true,
        },
      },
    },
    orderBy: { data: "desc" },
  });

  // Filtrar apenas pagamentos de transações desta família
  const pagamentosFiltrados = pagamentos.filter(
    (p: any) => p.transacao.homeId === homeId
  );

  return pagamentosFiltrados.map((p: any) => ({
    id: p.id,
    valor: Number(p.valor),
    data: p.data.toISOString().split("T")[0],
    transacao: {
      id: p.transacao.id,
      descricao: p.transacao.descricao,
      valorTotal: Number(p.transacao.valor),
      categoria: p.transacao.categoria,
      dataOriginal: p.transacao.data.toISOString().split("T")[0],
    },
  }));
}

// Resumo de pagamentos do mês
export async function getResumoPagamentosMes(homeId: number, ano?: string, mes?: string) {
  const pagamentos = await getPagamentosPorMes(homeId, ano, mes);

  const totalPago = pagamentos.reduce((acc: number, p: any) => acc + p.valor, 0);

  // Agrupar por categoria
  const porCategoria: Record<string, number> = {};
  for (const p of pagamentos) {
    const cat = p.transacao.categoria;
    porCategoria[cat] = (porCategoria[cat] || 0) + p.valor;
  }

  const categorias = Object.entries(porCategoria)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);

  return { totalPago, categorias, pagamentos };
}
