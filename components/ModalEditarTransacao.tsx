"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { DollarSign, Tag, Calendar, FileText } from "lucide-react";
import { Transacao } from "./ListaTransacoes";

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
    }
  }, [transacao, categoriasGastoProp, categoriasRendimentoProp]);

  const categorias = transacao?.tipo === "entrada" ? (categoriasRendimentoProp ?? defaultCategoriasRendimento) : (categoriasGastoProp ?? defaultCategoriasGasto);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao.trim() || !valor || !transacao) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const transacaoAtualizada: Transacao = {
        id: transacao.id,
        tipo: transacao.tipo,
        descricao: descricao.trim(),
        valor: parseFloat(valor),
        categoria,
        data,
        pago: status === 'PAGO',
        // @ts-ignore
        status: status,
        // @ts-ignore
        pagoEm: status === 'PAGO' ? (pagoEm ?? data) : null,
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
          <input
            type="number"
            id="valor-edit"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            step="0.01"
            min="0"
            className={`w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-${corPrimaria}-500 focus:ring-2 focus:ring-${corPrimaria}-200 outline-none transition-all text-slate-900 placeholder:text-slate-400`}
            required
          />
        </div>

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
