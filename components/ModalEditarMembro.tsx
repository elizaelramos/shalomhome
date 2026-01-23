"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { User, Mail, Shield } from "lucide-react";
import { Membro } from "./ListaMembros";

interface ModalEditarMembroProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (membro: Membro) => void;
  membro: Membro | null;
}

const roles = [
  { value: "membro", label: "Membro" },
  { value: "administrador", label: "Administrador" },
];

export default function ModalEditarMembro({
  isOpen,
  onClose,
  onSave,
  membro,
}: ModalEditarMembroProps) {
  const [role, setRole] = useState("membro");
  const [loading, setLoading] = useState(false);

  // Preencher formulário quando membro mudar
  useEffect(() => {
    if (membro) {
      setRole(membro.role);
    }
  }, [membro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!membro) return;

    setLoading(true);

    setTimeout(() => {
      onSave({
        ...membro,
        role,
      });

      setLoading(false);
      onClose();
    }, 300);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Membro">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Apelido / Nome (somente leitura) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <User className="w-4 h-4" />
            Como prefere ser chamado
          </label>
          <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            {membro?.apelido || membro?.nome}
          </div>
        </div>

        {/* Email (somente leitura) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            {membro?.email}
          </div>
        </div>

        {/* Campo Role */}
        <div className="space-y-2">
          <label
            htmlFor="editar-membro-role"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <Shield className="w-4 h-4" />
            Papel na Família
          </label>
          <select
            id="editar-membro-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 bg-white"
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">
            Administradores podem gerenciar membros e transações
          </p>
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
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
