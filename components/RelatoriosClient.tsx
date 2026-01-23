"use client";

import { useEffect, useState } from "react";

interface Props {
  familiaId: number;
}

const months = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export default function RelatoriosClient({ familiaId }: Props) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

  const [ano, setAno] = useState(String(currentYear));
  const [mes, setMes] = useState(currentMonth);
  const [tipo, setTipo] = useState("porCategoria");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Validações/normalizações para evitar render undefined
  const entradasNum = data && typeof data.entradas !== 'undefined' ? Number(data.entradas) : 0;
  const gastosNum = data && typeof data.gastos !== 'undefined' ? Number(data.gastos) : 0;
  const transferidosNum = data && typeof data.transferidos !== 'undefined' ? Number(data.transferidos) : 0;
  const saldoNum = data && typeof data.saldo !== 'undefined' ? Number(data.saldo) : 0;

  // Auto-gerar relatório ao mudar filtros (tipo/ano/mês)
  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, ano, mes]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/familias/${familiaId}/relatorios?tipo=${tipo}&ano=${ano}&mes=${mes}`);
      if (!res.ok) throw new Error("Erro ao buscar relatório");
      const json = await res.json();
      setData(json.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro");
    } finally {
      setLoading(false);
    }
  };

  // Estado para detalhes por categoria (expand/collapse)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [detalhes, setDetalhes] = useState<Record<string, any[]>>({});
  const [loadingDetalhe, setLoadingDetalhe] = useState<Record<string, boolean>>({});

  const toggleCategoria = async (categoria: string) => {
    const isExpanded = !!expanded[categoria];
    if (isExpanded) {
      setExpanded((s) => ({ ...s, [categoria]: false }));
      return;
    }

    // se ainda não carregado, buscar detalhes
    if (!detalhes[categoria]) {
      setLoadingDetalhe((s) => ({ ...s, [categoria]: true }));
      try {
        const res = await fetch(
          `/api/familias/${familiaId}/relatorios?tipo=porCategoriaDetalhes&categoria=${encodeURIComponent(categoria)}&ano=${ano}&mes=${mes}`
        );
        if (!res.ok) throw new Error("Erro ao buscar detalhes");
        const json = await res.json();
        setDetalhes((s) => ({ ...s, [categoria]: json.data }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetalhe((s) => ({ ...s, [categoria]: false }));
      }
    }

    setExpanded((s) => ({ ...s, [categoria]: true }));
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div>
            <label className="text-sm text-slate-600">Ano</label>
            <select value={ano} onChange={(e) => setAno(e.target.value)} className="ml-2 px-3 py-2 rounded border border-slate-200">
              {Array.from({ length: 6 }).map((_, i) => (
                <option key={i} value={String(currentYear - 5 + i)}>{String(currentYear - 5 + i)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">Mês</label>
            <select value={mes} onChange={(e) => setMes(e.target.value)} className="ml-2 px-3 py-2 rounded border border-slate-200">
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="ml-2 px-3 py-2 rounded border border-slate-200">
              <option value="porCategoria">Gastos por Categoria</option>
              <option value="resumoMensal">Resumo Mensal</option>
              <option value="pagamentosMensal">Pagamentos do Mês</option>
            </select>
          </div>


        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        {error && <div className="text-red-600">{error}</div>}

        {/* Mensagens quando não há dados */}
        {!data && !loading && (
          <div className="text-sm text-slate-500">
            {tipo === 'resumoMensal' ? 'Nenhum dado encontrado no período.' : 'Nenhum relatório gerado ainda.'}
          </div>
        )}

        {loading && <div className="text-sm text-slate-500">Carregando...</div>}

        {data && tipo === 'porCategoria' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
            <div className="space-y-2">
              {Array.isArray(data) && data.length === 0 && <div className="text-sm text-slate-500">Nenhum gasto encontrado no período.</div>}
              {Array.isArray(data) && data.map((row: any) => (
                <div key={row.categoria}>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleCategoria(row.categoria)} className="text-slate-500 hover:text-slate-800">{expanded[row.categoria] ? '∧' : '∨'}</button>
                      <div className="text-sm text-slate-700">{row.categoria}</div>
                    </div>
                    <div className="text-sm font-semibold">R$ {Number(row.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>

                  {expanded[row.categoria] && (
                    <div className="pl-8 py-2 bg-slate-50">
                      {loadingDetalhe[row.categoria] && <div className="text-sm text-slate-500">Carregando...</div>}
                      {!loadingDetalhe[row.categoria] && (!detalhes[row.categoria] || detalhes[row.categoria].length === 0) && (
                        <div className="text-sm text-slate-500">Nenhum gasto encontrado nesta categoria no período.</div>
                      )}
                      {!loadingDetalhe[row.categoria] && detalhes[row.categoria] && detalhes[row.categoria].map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                          <div>
                            <div className="text-sm text-slate-700">{t.descricao}</div>
                            <div className="text-xs text-slate-400">{t.data} • {t.status ?? ''}</div>
                          </div>
                          <div className="text-sm font-semibold">R$ {Number(t.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data && tipo === 'resumoMensal' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Resumo Mensal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50 p-4 rounded">
                <div className="text-sm text-slate-500">Entradas</div>
                <div className="text-xl font-bold text-emerald-600">R$ {entradasNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-sm text-slate-500">Gastos</div>
                <div className="text-xl font-bold text-red-600">R$ {gastosNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded">
                <div className="text-sm text-slate-500">Gastos Transferidos</div>
                <div className="text-xl font-bold text-orange-600">R$ {transferidosNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded">
                <div className="text-sm text-slate-500">Saldo</div>
                <div className={`text-xl font-bold ${saldoNum >= 0 ? 'text-slate-900' : 'text-red-600'}`}>R$ {saldoNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        )}

        {data && tipo === 'pagamentosMensal' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Pagamentos Realizados no Mês</h3>

            <div className="bg-blue-50 p-4 rounded mb-6">
              <div className="text-sm text-slate-500">Total Pago no Mês</div>
              <div className="text-xl font-bold text-blue-600">
                R$ {Number(data.totalPago || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {data.categorias && data.categorias.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-600 mb-2">Por Categoria</h4>
                <div className="space-y-2">
                  {data.categorias.map((cat: any) => (
                    <div key={cat.categoria} className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div className="text-sm text-slate-700">{cat.categoria}</div>
                      <div className="text-sm font-semibold">R$ {Number(cat.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.pagamentos && data.pagamentos.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-600 mb-2">Detalhamento</h4>
                <div className="space-y-2">
                  {data.pagamentos.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div>
                        <div className="text-sm text-slate-700">{p.transacao.descricao}</div>
                        <div className="text-xs text-slate-400">
                          {p.transacao.categoria} • Gasto original: R$ {Number(p.transacao.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em {p.transacao.dataOriginal}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-blue-600">R$ {Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <div className="text-xs text-slate-400">Pago em {p.data}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!data.pagamentos || data.pagamentos.length === 0) && (
              <div className="text-sm text-slate-500">Nenhum pagamento encontrado no período.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
