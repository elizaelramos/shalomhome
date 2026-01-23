"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { User, Mail, Shield } from "lucide-react";

interface ModalAdicionarMembroProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (membro: NovoMembroData) => void;
}

export interface NovoMembroData {
  nome?: string;
  apelido?: string;
  email: string;
  role: string;
}

const roles = [
  { value: "membro", label: "Membro" },
  { value: "administrador", label: "Administrador" },
];

export default function ModalAdicionarMembro({
  isOpen,
  onClose,
  onSave,
}: ModalAdicionarMembroProps) {
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("membro");
  const [loading, setLoading] = useState(false);
  const [existingUser, setExistingUser] = useState<{ id: number; nome: string; apelido?: string; email: string } | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Verificar email quando for digitado (debounce)
  useEffect(() => {
    setEmailError(null);
    setExistingUser(null);

    if (!email || email.trim().length < 3 || !email.includes("@")) return;

    let mounted = true;
    setCheckingEmail(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/by-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        const data = await res.json();
        if (!mounted) return;
        if (data?.error) {
          setEmailError('Erro ao verificar email');
        } else if (data?.found) {
          setExistingUser(data.user);
        }
      } catch (err) {
        if (mounted) setEmailError('Erro ao verificar email');
      } finally {
        if (mounted) setCheckingEmail(false);
      }
    }, 400);

    return () => {
      mounted = false;
      clearTimeout(id);
      setCheckingEmail(false);
    };
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Por favor, informe o email");
      return;
    }

    // Validação básica de email
    if (!email.includes("@") || !email.includes(".")) {
      alert("Por favor, informe um email válido");
      return;
    }

    // Se usuário existente, usamos os dados retornados (não permitimos alteração de cadastro)
    const payload: NovoMembroData = {
      email: email.trim().toLowerCase(),
      role,
    };

    if (!existingUser) {
      if (!nome.trim()) {
        alert("Por favor, informe o nome do novo membro");
        return;
      }

      payload.nome = nome.trim();
      if (apelido.trim()) payload.apelido = apelido.trim();
    }

    setLoading(true);

    try {
      onSave(payload);

      // Reset form
      setNome("");
      setApelido("");
      setEmail("");
      setRole("membro");
      setExistingUser(null);
      setEmailError(null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNome("");
      setApelido("");
      setEmail("");
      setRole("membro");
      setExistingUser(null);
      setEmailError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Membro">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campo Email (primeiro) */}
        <div className="space-y-2">
          <label
            htmlFor="membro-email"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <Mail className="w-4 h-4" />
            Email
          </label>
          <input
            type="email"
            id="membro-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 placeholder:text-slate-400"
            required
          />
          {checkingEmail && <p className="text-xs text-slate-500">Verificando email...</p>}
          {emailError && <p className="text-xs text-red-600">{emailError}</p>}
          {existingUser && (
            <p className="text-xs text-slate-600">Usuário existente encontrado — dados preenchidos automaticamente.</p>
          )}
        </div>

        {/* Nome / Apelido */}
        <div className="space-y-2">
          <label
            htmlFor="membro-nome"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <User className="w-4 h-4" />
            Nome
          </label>
          <input
            type="text"
            id="membro-nome"
            value={existingUser ? (existingUser.apelido || existingUser.nome) : nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do membro"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 placeholder:text-slate-400"
            required={!existingUser}
            readOnly={!!existingUser}
          />

          {/* Apelido (para novos usuários) */}
          {!existingUser && (
            <div>
              <label
                htmlFor="membro-apelido"
                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <User className="w-4 h-4" />
                Como prefere ser chamado (opcional)
              </label>
              <input
                type="text"
                id="membro-apelido"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="Apelido (ex: João)"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* Campo Role */}
        <div className="space-y-2">
          <label
            htmlFor="membro-role"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <Shield className="w-4 h-4" />
            Papel na Família
          </label>
          <select
            id="membro-role"
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
            {loading ? "Adicionando..." : "Adicionar Membro"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
