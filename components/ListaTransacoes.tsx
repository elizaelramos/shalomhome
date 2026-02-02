"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Calendar, Pencil, Trash2, ChevronDown, ChevronRight, Package, Eye, X } from "lucide-react";

function formatLocalDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return new Date(dateStr).toLocaleDateString("pt-BR");
  const [y, m, d] = parts;
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return dt.toLocaleDateString("pt-BR");
}

export interface TransactionItem {
  id?: number;
  descricao: string;
  quantidade?: number | null;
  unidade?: string | null;
  valorTotal: number;
  itemCategoria?: string | null;
}

export interface Transacao {
  id: number;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  pago?: boolean;
  pagoEm?: string | null;
  status?: "PENDENTE" | "PAGO" | "PARCIAL" | "TRANSFERIDO" | null;
  origemId?: number | null;
  totalPago?: number;
  valorRestante?: number;
  items?: TransactionItem[];
}

interface ListaTransacoesProps {
  transacoes: Transacao[];
  onEditar?: (transacao: Transacao) => void;
  onExcluir?: (transacao: Transacao) => void;
  onTogglePago?: (id: number, pago: boolean) => void;
  onChangeStatus?: (id: number, status: "PENDENTE" | "PAGO" | "TRANSFERIR" | "PAGAR_PARCIAL" | "TRANSFERIR_RESTANTE") => void;
}

export default function ListaTransacoes({
  transacoes,
  onEditar,
  onExcluir,
  onTogglePago,
  onChangeStatus,
}: ListaTransacoesProps) {
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Set<string>>(new Set());
  const [transacoesExpandidas, setTransacoesExpandidas] = useState<Set<number>>(new Set());
  const [modalItensAberto, setModalItensAberto] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<Transacao | null>(null);

  if (transacoes.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="max-w-sm mx-auto space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Nenhuma transação cadastrada
          </h3>
          <p className="text-sm text-slate-600">
            Comece cadastrando um gasto ou rendimento usando os botões acima
          </p>
        </div>
      </div>
    );
  }

  // Agrupar transações por categoria
  const transacoesPorCategoria = transacoes.reduce((acc, transacao) => {
    const categoria = transacao.categoria || "Sem categoria";
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(transacao);
    return acc;
  }, {} as Record<string, Transacao[]>);

  // Ordenar categorias alfabeticamente
  const categorias = Object.keys(transacoesPorCategoria).sort();

  const toggleCategoria = (categoria: string) => {
    const novasExpandidas = new Set(categoriasExpandidas);
    if (novasExpandidas.has(categoria)) {
      novasExpandidas.delete(categoria);
    } else {
      novasExpandidas.add(categoria);
    }
    setCategoriasExpandidas(novasExpandidas);
  };

  const toggleTransacao = (transacaoId: number) => {
    const novasExpandidas = new Set(transacoesExpandidas);
    if (novasExpandidas.has(transacaoId)) {
      novasExpandidas.delete(transacaoId);
    } else {
      novasExpandidas.add(transacaoId);
    }
    setTransacoesExpandidas(novasExpandidas);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-white relative z-20">
        <h3 className="text-lg font-semibold text-slate-900">
          Transações Recentes
        </h3>
      </div>

      <div className="divide-y divide-slate-100">
        {categorias.map((categoria) => {
          const transacoesCategoria = transacoesPorCategoria[categoria];
          const valorTotal = transacoesCategoria.reduce((sum, t) => {
            return sum + (t.tipo === "entrada" ? t.valor : -t.valor);
          }, 0);
          const isExpandida = categoriasExpandidas.has(categoria);

          return (
            <div key={categoria}>
              {/* Linha da categoria */}
              <div
                onClick={() => toggleCategoria(categoria)}
                className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isExpandida ? 'rotate-180' : ''
                    }`}
                  />
                  <span className="font-semibold text-slate-900">{categoria}</span>
                </div>
                <span
                  className={`text-lg font-bold ${
                    valorTotal >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {valorTotal >= 0 ? "+" : ""}R${" "}
                  {Math.abs(valorTotal).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Transações da categoria (expandidas) */}
              {isExpandida && transacoesCategoria.map((transacao) => (
          <div
            key={transacao.id}
            className="px-6 py-4 hover:bg-slate-50 transition-colors group min-h-[64px]"
          >
            {/* Linha em grid: 3 colunas (descrição | pago/ações | valor) — responsivo */}
            <div className="grid grid-cols-1 md:grid-cols-3 md:[grid-template-columns:2fr_1fr_auto] items-center gap-4">
              {/* Ícone e Informações */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  transacao.tipo === "entrada"
                    ? "bg-emerald-100"
                    : "bg-red-100"
                }`}>
                  {transacao.tipo === "entrada" ? (
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate whitespace-nowrap overflow-hidden">
                    {transacao.descricao}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {transacao.categoria}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {formatLocalDate(transacao.data)}
                    </span>
                    {transacao.items && transacao.items.length > 0 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTransacao(transacao.id);
                          }}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                          title="Ver itens detalhados"
                        >
                          <Package className="w-3 h-3" />
                          {transacao.items.length} {transacao.items.length === 1 ? 'item' : 'itens'}
                          <ChevronRight className={`w-3 h-3 transition-transform ${transacoesExpandidas.has(transacao.id) ? 'rotate-90' : ''}`} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTransacaoSelecionada(transacao);
                            setModalItensAberto(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Visualização rápida"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Valor e Ações */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Coluna central: Pago e Ações (full-width em mobile, largura fixa em md+) */}
                <div className="w-full md:flex-1 flex items-center justify-center md:justify-start gap-3 self-center">
                  {transacao.tipo === "saida" ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={
                          transacao.status === "PAGO" || transacao.pago ? "PAGO" :
                          transacao.status === "TRANSFERIDO" ? "TRANSFERIDO" :
                          transacao.status === "PARCIAL" ? "PARCIAL" :
                          "PENDENTE"
                        }
                        onChange={(e) => onChangeStatus?.(transacao.id, e.target.value as any)}
                        className="px-2 py-1 rounded border border-slate-200 text-sm bg-white"
                        aria-label={`Status de ${transacao.descricao}`}
                      >
                        <option value="PENDENTE">Pendente</option>
                        <option value="PAGO">Pago Total</option>
                        <option value="PAGAR_PARCIAL">Pagar Parcial...</option>
                        <option value="TRANSFERIR">Transferir Tudo</option>
                        {(transacao.status === "PARCIAL" || (transacao.totalPago && transacao.totalPago > 0)) && (
                          <option value="TRANSFERIR_RESTANTE">Transferir Restante</option>
                        )}
                        {transacao.status === "PARCIAL" && (
                          <option value="PARCIAL" disabled>Parcial</option>
                        )}
                        {transacao.status === "TRANSFERIDO" && (
                          <option value="TRANSFERIDO" disabled>Transferido</option>
                        )}
                      </select>
                      <span className={`text-sm font-medium ${
                        transacao.status === "PAGO" || transacao.pago ? 'text-emerald-600' :
                        transacao.status === "TRANSFERIDO" ? 'text-amber-600' :
                        transacao.status === "PARCIAL" ? 'text-blue-600' :
                        'text-red-600'
                      }`}>
                        {transacao.status === "TRANSFERIDO" ? 'Transferido' :
                         transacao.status === "PARCIAL" ? 'Parcial' :
                         transacao.pago ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                  ) : (
                    <span className="w-full" />
                  )}

                  {/* Botões de ação (aparecem no hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                    {onEditar && (
                      <button
                        onClick={() => onEditar(transacao)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar transação"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {onExcluir && (
                      <button
                        onClick={() => onExcluir(transacao)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir transação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>



                {/* Coluna direita: Valor (central em mobile, largura automática em md+) - no mobile aparece abaixo */}
                <div className="text-center md:text-right w-full md:w-auto self-center order-last md:order-none mt-3 md:mt-0">
                  <p
                    className={`text-lg font-bold ${
                      transacao.tipo === "entrada"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {transacao.tipo === "entrada" ? "+" : "-"}
                    R${" "}
                    {transacao.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  {transacao.status === "PARCIAL" && transacao.totalPago != null && transacao.totalPago > 0 && (
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center justify-center md:justify-end gap-2 text-xs">
                        <span className="text-emerald-600 font-medium">
                          Pago: R$ {transacao.totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-orange-500 font-medium">
                          Resta: R$ {(transacao.valorRestante ?? (transacao.valor - transacao.totalPago)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (transacao.totalPago / transacao.valor) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seção de itens expandida */}
            {transacao.items && transacao.items.length > 0 && transacoesExpandidas.has(transacao.id) && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Itens da compra
                  </h4>
                  <div className="space-y-2">
                    {transacao.items.map((item, index) => (
                      <div key={index} className="bg-white rounded p-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{item.descricao}</p>
                            <div className="flex items-center gap-2 mt-1 text-slate-600">
                              {item.quantidade && (
                                <span>
                                  {item.quantidade.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                                  {item.unidade ? ` ${item.unidade}` : ''}
                                </span>
                              )}
                              {item.itemCategoria && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded">
                                  {item.itemCategoria}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-slate-900 ml-2">
                            R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Modal de Visualização Rápida de Itens */}
      {modalItensAberto && transacaoSelecionada && transacaoSelecionada.items && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setModalItensAberto(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Itens da Compra</h3>
                <p className="text-sm text-slate-600 mt-1">{transacaoSelecionada.descricao}</p>
              </div>
              <button
                onClick={() => setModalItensAberto(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Lista de Itens */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {transacaoSelecionada.items.map((item, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{item.descricao}</h4>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                          {item.quantidade && (
                            <span className="flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" />
                              {item.quantidade.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                              {item.unidade && ` ${item.unidade}`}
                            </span>
                          )}
                          {item.itemCategoria && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              {item.itemCategoria}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-slate-900">
                          R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer com Total */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">Total:</span>
              <span className="text-xl font-bold text-slate-900">
                R$ {transacaoSelecionada.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
