"use client";

import { TrendingUp, TrendingDown, Calendar, Pencil, Trash2 } from "lucide-react";

function formatLocalDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return new Date(dateStr).toLocaleDateString("pt-BR");
  const [y, m, d] = parts;
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return dt.toLocaleDateString("pt-BR");
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-white relative z-20">
        <h3 className="text-lg font-semibold text-slate-900">
          Transações Recentes
        </h3>
      </div>

      <div className="divide-y divide-slate-100">
        {transacoes.map((transacao) => (
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
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
