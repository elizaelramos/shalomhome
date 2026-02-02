"use client";

import { User, Crown, Trash2, Pencil, Users } from "lucide-react";

export interface Membro {
  id: number;
  userId?: number;
  nome: string;
  apelido?: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

interface ListaMembrosProps {
  membros: Membro[];
  onEditar?: (membro: Membro) => void;
  onRemover?: (membro: Membro) => void;
}

export default function ListaMembros({
  membros,
  onEditar,
  onRemover,
}: ListaMembrosProps) {
  if (membros.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="max-w-sm mx-auto space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Nenhum membro cadastrado
          </h3>
          <p className="text-sm text-slate-600">
            Adicione membros da família para gestão colaborativa das finanças
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Membros da Família
        </h3>
        <span className="text-sm text-slate-500">
          {membros.length} {membros.length === 1 ? "membro" : "membros"}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {membros.map((membro) => (
          <div
            key={membro.id}
            className="px-6 py-4 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Avatar e Info */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 truncate">
                      {membro.apelido || membro.nome}
                    </p>
                    {membro.role === "administrador" && (
                      <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {membro.email}
                  </p>
                </div>
              </div>

              {/* Role badge e ações */}
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-md flex-shrink-0 ${
                    membro.role === "administrador"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {membro.role === "administrador" ? "Admin" : "Membro"}
                </span>

                {/* Botões de ação (hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEditar && (
                    <button
                      onClick={() => onEditar(membro)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar membro"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {onRemover && (
                    <button
                      onClick={() => onRemover(membro)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover membro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
