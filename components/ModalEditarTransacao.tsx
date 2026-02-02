"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { DollarSign, Tag, Calendar, FileText, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { Transacao } from "./ListaTransacoes";
import { TransactionItemInput } from "@/lib/actions/transacoes";

interface ModalEditarTransacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transacao: Transacao) => void;
  transacao: Transacao | null;
  categoriasGasto?: string[];
  categoriasRendimento?: string[];
}

const defaultCategoriasGasto = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Vestuário",
  "Dízimos/Ofertas",
  "Outros",
];

const defaultCategoriasRendimento = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Presente",
  "Bônus",
  "Outros",
];

export default function ModalEditarTransacao({
  isOpen,
  onClose,
  onSave,
  transacao,
  categoriasGasto: categoriasGastoProp,
  categoriasRendimento: categoriasRendimentoProp,
}: ModalEditarTransacaoProps) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [data, setData] = useState("");
  const [status, setStatus] = useState<'PENDENTE' | 'PAGO' | 'TRANSFERIDO'>('PENDENTE');
  const [pagoEm, setPagoEm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mostrarItens, setMostrarItens] = useState(false);
  const [itens, setItens] = useState<TransactionItemInput[]>([]);

  // Preencher formulário quando transação mudar
  useEffect(() => {
    if (transacao) {
      setDescricao(transacao.descricao);
      setValor(transacao.valor.toString());
      // escolher lista de categorias apropriada (prop ou default)
      const lista = transacao.tipo === 'entrada' ? (categoriasRendimentoProp ?? defaultCategoriasRendimento) : (categoriasGastoProp ?? defaultCategoriasGasto);
      if (transacao.categoria && lista.includes(transacao.categoria)) {
        setCategoria(transacao.categoria);
      } else {
        setCategoria(transacao.categoria || (lista[0] ?? ""));
      }
      setData(transacao.data);
      setStatus((transacao as any).status ?? (transacao.pago ? 'PAGO' : 'PENDENTE'));
      setPagoEm((transacao as any).pagoEm ?? null);

      // Carregar itens se existirem
      const transacaoItems = (transacao as any).items || [];
      if (transacaoItems.length > 0) {
        setItens(transacaoItems);
        setMostrarItens(true);
      } else {
        setItens([]);
        setMostrarItens(false);
      }
    }
  }, [transacao, categoriasGastoProp, categoriasRendimentoProp]);

  // Calcular valor total quando há itens
  const valorCalculado = itens.length > 0
    ? itens.reduce((sum, item) => sum + item.valorTotal, 0)
    : parseFloat(valor) || 0;

  // Funções para gerenciar itens
  const adicionarItem = () => {
    setItens([...itens, {
      descricao: "",
      quantidade: undefined,
      unidade: undefined,
      valorTotal: 0,
      itemCategoria: undefined,
    }]);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const atualizarItem = (index: number, field: keyof TransactionItemInput, value: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [field]: value };
    setItens(novosItens);
  };

  const categorias = transacao?.tipo === "entrada" ? (categoriasRendimentoProp ?? defaultCategoriasRendimento) : (categoriasGastoProp ?? defaultCategoriasGasto);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao.trim() || !transacao) {
      alert("Por favor, preencha a descrição");
      return;
    }

    // Se há itens, validar que todos têm descrição e valor
    if (mostrarItens && itens.length > 0) {
      const itemInvalido = itens.find(item => !item.descricao.trim() || item.valorTotal <= 0);
      if (itemInvalido) {
        alert("Todos os itens devem ter descrição e valor maior que zero");
        return;
      }
    } else if (!valor) {
      // Se não há itens, validar valor tradicional
      alert("Por favor, preencha o valor");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const transacaoAtualizada: Transacao = {
        id: transacao.id,
        tipo: transacao.tipo,
        descricao: descricao.trim(),
        valor: valorCalculado,
        categoria,
        data,
        pago: status === 'PAGO',
        // @ts-ignore
        status: status,
        // @ts-ignore
        pagoEm: status === 'PAGO' ? (pagoEm ?? data) : null,
        // @ts-ignore
        items: (mostrarItens && itens.length > 0) ? itens : undefined,
      } as any;

      onSave(transacaoAtualizada);
      setLoading(false);
      onClose();
    }, 500);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const isGasto = transacao?.tipo === "saida";
  const corPrimaria = isGasto ? "red" : "emerald";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Editar ${isGasto ? "Gasto" : "Rendimento"}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tipo (somente leitura) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            Tipo
          </label>
          <div
            className={`px-4 py-3 rounded-xl border ${
              isGasto
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            } font-semibold`}
          >
            {isGasto ? "Gasto" : "Rendimento"}
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <label
            htmlFor="descricao-edit"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <FileText className="w-4 h-4" />
            Descrição
          </label>
          <input
            type="text"
            id="descricao-edit"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder={
              isGasto ? "Ex: Compra no supermercado" : "Ex: Salário mensal"
            }
            className={`w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-${corPrimaria}-500 focus:ring-2 focus:ring-${corPrimaria}-200 outline-none transition-all text-slate-900 placeholder:text-slate-400`}
            required
          />
        </div>

        {/* Valor */}
        <div className="space-y-2">
          <label
            htmlFor="valor-edit"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <DollarSign className="w-4 h-4" />
            Valor (R$)
          </label>
          {mostrarItens && itens.length > 0 ? (
            <div className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 font-semibold">
              R$ {valorCalculado.toFixed(2)} (calculado dos itens)
            </div>
          ) : (
            <input
              type="number"
              id="valor-edit"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              step="0.01"
              min="0"
              className={`w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-${corPrimaria}-500 focus:ring-2 focus:ring-${corPrimaria}-200 outline-none transition-all text-slate-900 placeholder:text-slate-400`}
              required={!mostrarItens || itens.length === 0}
            />
          )}
        </div>

        {/* Toggle para detalhamento de itens (apenas para gastos) */}
        {isGasto && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setMostrarItens(!mostrarItens)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {mostrarItens ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {mostrarItens ? "Ocultar detalhamento" : "+ Adicionar itens"}
            </button>
          </div>
        )}

        {/* Seção de itens (colapsável, apenas para gastos) */}
        {isGasto && mostrarItens && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-slate-700">Itens da compra</h4>
              <button
                type="button"
                onClick={adicionarItem}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                Adicionar item
              </button>
            </div>

            {itens.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhum item adicionado. Clique em &quot;Adicionar item&quot; para começar.
              </p>
            ) : (
              <div className="space-y-2">
                {itens.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Descrição do item"
                        value={item.descricao}
                        onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removerItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Quantidade"
                        value={item.quantidade ?? ""}
                        onChange={(e) => atualizarItem(index, 'quantidade', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                        step="0.001"
                        min="0"
                      />
                      <input
                        type="text"
                        placeholder="Unidade (kg, un, L)"
                        value={item.unidade ?? ""}
                        onChange={(e) => atualizarItem(index, 'unidade', e.target.value || undefined)}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Categoria do item"
                        value={item.itemCategoria ?? ""}
                        onChange={(e) => atualizarItem(index, 'itemCategoria', e.target.value || undefined)}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Valor (R$)"
                        value={item.valorTotal || ""}
                        onChange={(e) => atualizarItem(index, 'valorTotal', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {itens.length > 0 && (
              <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">Total:</span>
                <span className="text-lg font-bold text-slate-900">R$ {valorCalculado.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Categoria */}
        <div className="space-y-2">
          <label
            htmlFor="categoria-edit"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <Tag className="w-4 h-4" />
            {isGasto ? "Categoria" : "Fonte"}
          </label>
          <select
            id="categoria-edit"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-${corPrimaria}-500 focus:ring-2 focus:ring-${corPrimaria}-200 outline-none transition-all text-slate-900 bg-white`}
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            {/* Mostrar categoria atual se não estiver na lista */}
            {!categorias.includes(categoria) && categoria && (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            )}
          </select>
        </div>

        {/* Data */}
        <div className="space-y-2">
          <label
            htmlFor="data-edit"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <Calendar className="w-4 h-4" />
            Data
          </label>
          <input
            type="date"
            id="data-edit"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-${corPrimaria}-500 focus:ring-2 focus:ring-${corPrimaria}-200 outline-none transition-all text-slate-900`}
            required
          />
        </div>

        {/* Status (apenas para gasto) */}
        {isGasto && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="text-sm">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="ml-3 px-3 py-2 rounded-xl border border-slate-300 bg-white">
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago</option>
                <option value="TRANSFERIDO">Transferido</option>
              </select>
            </label>

            {status === 'PAGO' && (
              <div className="mt-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-sm">Data do pagamento</span>
                  <input type="date" value={pagoEm ?? data} onChange={(e) => setPagoEm(e.target.value)} className="ml-3 px-3 py-2 rounded-xl border border-slate-300" />
                </label>
              </div>
            )}
          </div>
        )}
        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-4 py-3 rounded-xl ${
              isGasto
                ? "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                : "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
            } text-white font-semibold shadow-lg hover:shadow-xl transition-all`}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
