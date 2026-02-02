"use client";

import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { Edit3 } from "lucide-react";

interface ModalEditarFamiliaProps {
  isOpen: boolean;
  onClose: () => void;
  familia: { id: number; nome: string } | null;
  onSaved?: (familia: { id: number; nome: string }) => void;
  onDeleted?: (id: number) => void;
}

export default function ModalEditarFamilia({ isOpen, onClose, familia, onSaved, onDeleted }: ModalEditarFamiliaProps) {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (familia) {
      setNome(familia.nome);
    }
  }, [familia]);

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familia) return;

    if (nome.trim().length === 0) {
      setError("O nome da família não pode estar vazio.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/familias/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: familia.id, nome: nome.trim() }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Erro ao atualizar família");
      } else {
        if (onSaved) onSaved(data.familia);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!familia) return;

    const confirmar = window.confirm('Deseja realmente excluir esta família? Essa ação é irreversível.');
    if (!confirmar) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/familias/deletar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: familia.id }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Erro ao excluir família');
      } else {
        if (onDeleted) onDeleted(familia.id);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError('Erro de rede. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Nome da Família">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Edit3 className="w-4 h-4" />
            Nome da Família
          </label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 bg-white"
            placeholder="Ex: Família Silva"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

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
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? '...' : 'Excluir Família'}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
