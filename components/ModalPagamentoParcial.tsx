"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ModalPagamentoParcialProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (valorPago: number, dataPagamento: string) => void;
  transacao: {
    id: number;
    descricao: string;
    valor: number;
    totalPago?: number;
  } | null;
}

export default function ModalPagamentoParcial({
  isOpen,
  onClose,
  onSave,
  transacao,
}: ModalPagamentoParcialProps) {
  const [valorPago, setValorPago] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");

  const valorTotal = transacao?.valor ?? 0;
  const totalJaPago = transacao?.totalPago ?? 0;
  const valorRestante = valorTotal - totalJaPago;

  useEffect(() => {
    if (isOpen) {
      setValorPago("");
      setDataPagamento(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen]);

  if (!isOpen || !transacao) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(valorPago.replace(",", "."));
    if (isNaN(valor) || valor <= 0) {
      alert("Digite um valor válido");
      return;
    }
    if (valor > valorRestante + 0.01) {
      alert(`O valor máximo permitido é R$ ${valorRestante.toFixed(2)}`);
      return;
    }
    onSave(valor, dataPagamento);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Pagamento Parcial
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Gasto:</p>
            <p className="font-semibold text-slate-900">{transacao.descricao}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-slate-500">Total</p>
                <p className="font-semibold">R$ {valorTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-500">Pago</p>
                <p className="font-semibold text-emerald-600">R$ {totalJaPago.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-500">Restante</p>
                <p className="font-semibold text-red-600">R$ {valorRestante.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Valor a pagar agora
            </label>
            <input
              type="text"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              placeholder={`Máximo: ${valorRestante.toFixed(2)}`}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data do pagamento
            </label>
            <input
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Registrar Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
