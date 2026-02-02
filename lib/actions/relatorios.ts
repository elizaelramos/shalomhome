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
  let start: Date | undefined;
  let next: Date | undefined;

  if (ano && mes) {
    const yearNum = Number(ano);
    const monthIndex = Number(mes) - 1;
    start = new Date(Date.UTC(yearNum, monthIndex, 1, 0, 0, 0));
    next = new Date(Date.UTC(yearNum, monthIndex + 1, 1, 0, 0, 0));
    whereData.data = { gte: start, lt: next };
  }

  // Se não houver transações no período, retornar null para sinalizar "sem dados"
  const totalTransacoesNoPeriodo = await prisma.transaction.count({ where: whereData });
  if (totalTransacoesNoPeriodo === 0) {
    return null;
  }

  // Calcular saldo anterior (transações antes do período)
  let saldoAnterior = 0;
  if (start) {
    // Entradas anteriores ao período
    const entradasAnteriores = await prisma.transaction.aggregate({
      _sum: { valor: true },
      where: {
        homeId,
        tipo: "ENTRADA",
        data: { lt: start },
      },
    });

    // Gastos anteriores ao período (excluindo transferidos)
    const gastosAnteriores = await prisma.transaction.aggregate({
      _sum: { valor: true },
      where: {
        homeId,
        tipo: "SAIDA",
        status: { not: "TRANSFERIDO" },
        data: { lt: start },
      },
    });

    saldoAnterior = Number(entradasAnteriores._sum.valor ?? 0) - Number(gastosAnteriores._sum.valor ?? 0);
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
  const saldoAcumulado = saldoAnterior + totalEntradas - totalGastos;

  return {
    entradas: totalEntradas,
    gastos: totalGastos,
    previsao: totalPrevisao,
    transferidos: totalTransferidos,
    saldo: saldoAcumulado,
    saldoAnterior,
    saldoMes: totalEntradas - totalGastos,
  };
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

// Agregação por categoria de item (inclui transações sem itens usando categoria da transaction)
export async function getGastosPorItemCategoria(homeId: number, ano?: string, mes?: string) {
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

  // Buscar transações com items
  const transacoes = await prisma.transaction.findMany({
    where,
    include: {
      items: true,
    },
  });

  // Agrupar por itemCategoria
  const porCategoria: Record<string, number> = {};

  for (const transacao of transacoes) {
    if (transacao.items && transacao.items.length > 0) {
      // Se tem items, agrupar por itemCategoria
      for (const item of transacao.items) {
        const cat = item.itemCategoria || "Sem categoria";
        porCategoria[cat] = (porCategoria[cat] || 0) + Number(item.valorTotal);
      }
    } else {
      // Se não tem items, usar categoria da transação
      const cat = transacao.categoria;
      porCategoria[cat] = (porCategoria[cat] || 0) + Number(transacao.valor);
    }
  }

  // Ordenar por total descendente
  const results = Object.entries(porCategoria)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);

  return results;
}

// Top itens por quantidade
export async function getItensMaisComprados(homeId: number, ano?: string, mes?: string, limit: number = 20) {
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

  // Buscar transações com items que têm quantidade
  const transacoes = await prisma.transaction.findMany({
    where,
    include: {
      items: {
        where: {
          quantidade: { not: null },
        },
      },
    },
  });

  // Agrupar por descrição do item
  const porItem: Record<string, { quantidade: number; unidade: string; valorTotal: number; ocorrencias: number }> = {};

  for (const transacao of transacoes) {
    for (const item of transacao.items) {
      if (item.quantidade) {
        const key = `${item.descricao}|${item.unidade || ""}`;
        if (!porItem[key]) {
          porItem[key] = {
            quantidade: 0,
            unidade: item.unidade || "",
            valorTotal: 0,
            ocorrencias: 0,
          };
        }
        porItem[key].quantidade += Number(item.quantidade);
        porItem[key].valorTotal += Number(item.valorTotal);
        porItem[key].ocorrencias += 1;
      }
    }
  }

  // Ordenar por quantidade descendente e limitar
  const results = Object.entries(porItem)
    .map(([key, data]) => {
      const [descricao, unidade] = key.split("|");
      return {
        descricao,
        unidade: unidade || null,
        quantidade: data.quantidade,
        valorTotal: data.valorTotal,
        ocorrencias: data.ocorrencias,
      };
    })
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, limit);

  return results;
}

// Top itens por valor gasto
export async function getItensComMaiorGasto(homeId: number, ano?: string, mes?: string, limit: number = 20) {
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

  // Buscar transações com items
  const transacoes = await prisma.transaction.findMany({
    where,
    include: {
      items: true,
    },
  });

  // Agrupar por descrição do item
  const porItem: Record<string, { valorTotal: number; quantidade: number | null; ocorrencias: number }> = {};

  for (const transacao of transacoes) {
    for (const item of transacao.items) {
      const key = item.descricao;
      if (!porItem[key]) {
        porItem[key] = {
          valorTotal: 0,
          quantidade: item.quantidade ? Number(item.quantidade) : null,
          ocorrencias: 0,
        };
      }
      porItem[key].valorTotal += Number(item.valorTotal);
      if (item.quantidade) {
        porItem[key].quantidade = (porItem[key].quantidade || 0) + Number(item.quantidade);
      }
      porItem[key].ocorrencias += 1;
    }
  }

  // Ordenar por valor total descendente e limitar
  const results = Object.entries(porItem)
    .map(([descricao, data]) => ({
      descricao,
      valorTotal: data.valorTotal,
      quantidade: data.quantidade,
      ocorrencias: data.ocorrencias,
    }))
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, limit);

  return results;
}
