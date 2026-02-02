"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Users, Plus, Pencil } from "lucide-react";
import ModalEditarFamilia from "./ModalEditarFamilia";

export interface FamiliaItem {
  id: number;
  nome: string;
  membros: number;
  saldo: number;
}

interface ListaFamiliasProps {
  familias: FamiliaItem[];
}

export default function ListaFamilias({ familias: initialFamilias }: ListaFamiliasProps) {
  const [familias, setFamilias] = useState<FamiliaItem[]>(initialFamilias);
  const [selected, setSelected] = useState<FamiliaItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Preservar o período selecionado ao navegar para o dashboard da família
  const searchParams = useSearchParams();
  const ano = searchParams?.get("ano");
  const mes = searchParams?.get("mes");

  const openEdit = (e: React.MouseEvent, familia: FamiliaItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(familia);
    setIsOpen(true);
  };

  const onSaved = (updated: { id: number; nome: string }) => {
    setFamilias((prev) => prev.map((f) => (f.id === updated.id ? { ...f, nome: updated.nome } : f)));
  };

  const onDeleted = (id: number) => {
    setFamilias((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {familias.map((familia) => (
          <div
            key={familia.id}
            className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-pointer relative"
          >
            {/* Edit button (top-right) */}
            <button
              onClick={(e) => openEdit(e, familia)}
              aria-label={`Editar ${familia.nome}`}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors z-10"
              title="Editar nome"
            >
              <Pencil className="w-4 h-4 text-slate-600" />
            </button>

            <Link href={`/familias/${familia.id}${ano && mes ? `?ano=${ano}&mes=${mes}` : ""}`} className="block">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {familia.membros} {familia.membros === 1 ? "membro" : "membros"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {familia.nome}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Saldo Total</p>
                  <p className={`text-2xl font-bold ${familia.saldo >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                    R$ {familia.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {/* Card Criar Nova Família */}
        <Link
          href="/familias/nova"
          className="group bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[280px]"
        >
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 bg-slate-100 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all">
              <Plus className="w-7 h-7 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">
                Criar Nova Família
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                Adicione um novo lar para gerenciar
              </p>
            </div>
          </div>
        </Link>
      </div>

      <ModalEditarFamilia
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        familia={selected}
        onSaved={(f) => onSaved(f)}
        onDeleted={(id) => onDeleted(id)}
      />
    </>
  );
}
