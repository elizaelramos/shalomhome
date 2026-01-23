"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { DollarSign, Briefcase, Calendar, FileText } from "lucide-react";

interface ModalRendimentoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rendimento: RendimentoData) => void;
  initialDate?: string;
  categorias: string[];
}

export interface RendimentoData {
  descricao: string;
  valor: number;
  fonte: string;
  data: string;
}

export default function ModalRendimento({ isOpen, onClose, onSave, initialDate, categorias }: ModalRendimentoProps) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [fonte, setFonte] = useState(categorias[0] || "");
  const [data, setData] = useState(initialDate ?? new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setData(initialDate ?? new Date().toISOString().split('T')[0]);
      if (categorias.length > 0 && !categorias.includes(fonte)) {
        setFonte(categorias[0]);
      }
    }
  }, [isOpen, initialDate, categorias, fonte]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao.trim() || !valor) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const rendimentoData: RendimentoData = {
        descricao: descricao.trim(),
        valor: parseFloat(valor),
        fonte,
        data,
      };

      onSave(rendimentoData);

      // Limpar formulário
      setDescricao("");
      setValor("");
      setFonte(categorias[0] || "");
      setData(initialDate ?? new Date().toISOString().split('T')[0]);
      setLoading(false);
      onClose();
    }, 500);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cadastrar Rendimento">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Descrição */}
        <div className="space-y-2">
          <label htmlFor="descricao" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="w-4 h-4" />
            Descrição
          </label>
          <input
            type="text"
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Salário de Janeiro"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 placeholder:text-slate-400"
            required
          />
        </div>

        {/* Valor */}
        <div className="space-y-2">
          <label htmlFor="valor" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <DollarSign className="w-4 h-4" />
            Valor (R$)
          </label>
          <input
            type="number"
            id="valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            step="0.01"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 placeholder:text-slate-400"
            required
          />
        </div>

        {/* Fonte/Categoria */}
        <div className="space-y-2">
          <label htmlFor="fonte" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Briefcase className="w-4 h-4" />
            Categoria
          </label>
          <select
            id="fonte"
            value={fonte}
            onChange={(e) => setFonte(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 bg-white"
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Data */}
        <div className="space-y-2">
          <label htmlFor="data" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Calendar className="w-4 h-4" />
            Data
          </label>
          <input
            type="date"
            id="data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900"
            required
          />
        </div>

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
            className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? "Salvando..." : "Salvar Rendimento"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
