"use client";

import { useState } from "react";
import { Tag, Plus, Pencil, Trash2, TrendingUp, TrendingDown, X, Check } from "lucide-react";
import { CategoriaData, criarCategoria, atualizarCategoria, deletarCategoria } from "@/lib/actions/categorias";

interface GerenciadorCategoriasProps {
  categorias: CategoriaData[];
  homeId: number;
  onCategoriasChange: (categorias: CategoriaData[]) => void;
}

export default function GerenciadorCategorias({
  categorias,
  homeId,
  onCategoriasChange,
}: GerenciadorCategoriasProps) {
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoTipo, setNovoTipo] = useState<"ENTRADA" | "SAIDA">("SAIDA");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoNome, setEditandoNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  const categoriasEntrada = categorias.filter((c) => c.tipo === "ENTRADA");
  const categoriasSaida = categorias.filter((c) => c.tipo === "SAIDA");

  const handleCriar = async () => {
    if (!novaCategoria.trim()) return;

    setSalvando(true);
    const resultado = await criarCategoria(homeId, novaCategoria.trim(), novoTipo);

    if (resultado.success && resultado.categoria) {
      onCategoriasChange([...categorias, resultado.categoria]);
      setNovaCategoria("");
    } else {
      alert(resultado.error || "Erro ao criar categoria");
    }
    setSalvando(false);
  };

  const handleEditar = async (id: number) => {
    if (!editandoNome.trim()) return;

    setSalvando(true);
    const resultado = await atualizarCategoria(id, editandoNome.trim(), homeId);

    if (resultado.success && resultado.categoria) {
      onCategoriasChange(
        categorias.map((c) =>
          c.id === id ? { ...c, nome: resultado.categoria!.nome } : c
        )
      );
      setEditandoId(null);
      setEditandoNome("");
    } else {
      alert(resultado.error || "Erro ao atualizar categoria");
    }
    setSalvando(false);
  };

  const handleDeletar = async (categoria: CategoriaData) => {
    if (categoria.emUso) {
      alert("Não é possível excluir uma categoria em uso. Altere as transações primeiro.");
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente excluir a categoria "${categoria.nome}"?`
    );

    if (!confirmar) return;

    setSalvando(true);
    const resultado = await deletarCategoria(categoria.id, homeId);

    if (resultado.success) {
      onCategoriasChange(categorias.filter((c) => c.id !== categoria.id));
    } else {
      alert(resultado.error || "Erro ao deletar categoria");
    }
    setSalvando(false);
  };

  const iniciarEdicao = (categoria: CategoriaData) => {
    setEditandoId(categoria.id);
    setEditandoNome(categoria.nome);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditandoNome("");
  };

  const renderCategoria = (categoria: CategoriaData) => {
    const estaEditando = editandoId === categoria.id;

    return (
      <div
        key={categoria.id}
        className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg group"
      >
        {estaEditando ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editandoNome}
              onChange={(e) => setEditandoNome(e.target.value)}
              className="flex-1 px-2 py-1 rounded border border-slate-300 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditar(categoria.id);
                if (e.key === "Escape") cancelarEdicao();
              }}
            />
            <button
              onClick={() => handleEditar(categoria.id)}
              disabled={salvando}
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={cancelarEdicao}
              className="p-1 text-slate-400 hover:bg-slate-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-sm text-slate-700">{categoria.nome}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => iniciarEdicao(categoria)}
                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                title="Editar"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeletar(categoria)}
                disabled={categoria.emUso}
                className={`p-1 rounded ${
                  categoria.emUso
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                }`}
                title={categoria.emUso ? "Categoria em uso" : "Excluir"}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Tag className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            Gerenciar Categorias
          </h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Formulário para nova categoria */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            placeholder="Nome da categoria"
            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCriar();
            }}
          />
          <select
            value={novoTipo}
            onChange={(e) => setNovoTipo(e.target.value as "ENTRADA" | "SAIDA")}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
          >
            <option value="SAIDA">Gasto</option>
            <option value="ENTRADA">Rendimento</option>
          </select>
          <button
            onClick={handleCriar}
            disabled={salvando || !novaCategoria.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        {/* Lista de categorias */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Categorias de Gasto */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <h4 className="font-medium text-slate-700">Gastos</h4>
              <span className="text-xs text-slate-400">({categoriasSaida.length})</span>
            </div>
            <div className="space-y-2">
              {categoriasSaida.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhuma categoria</p>
              ) : (
                categoriasSaida.map(renderCategoria)
              )}
            </div>
          </div>

          {/* Categorias de Rendimento */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h4 className="font-medium text-slate-700">Rendimentos</h4>
              <span className="text-xs text-slate-400">({categoriasEntrada.length})</span>
            </div>
            <div className="space-y-2">
              {categoriasEntrada.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhuma categoria</p>
              ) : (
                categoriasEntrada.map(renderCategoria)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
