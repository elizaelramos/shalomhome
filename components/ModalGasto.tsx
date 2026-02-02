"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { DollarSign, Tag, Calendar, FileText, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { TransactionItemInput } from "@/lib/actions/transacoes";
import { getUnidadesByHome, criarUnidade } from "@/lib/actions/unidades";
import { getItemCategoriasByHome, criarItemCategoria } from "@/lib/actions/itemCategorias";

interface ModalGastoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gasto: GastoData) => void;
  initialDate?: string;
  categorias: string[];
  homeId: number;
}

export interface GastoData {
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  pago: boolean;
  status?: "PENDENTE" | "PAGO" | "TRANSFERIDO";
  pagoEm?: string | null;
  items?: TransactionItemInput[];
}

export default function ModalGasto({ isOpen, onClose, onSave, initialDate, categorias, homeId }: ModalGastoProps) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState(categorias[0] || "");
  const [data, setData] = useState(initialDate ?? new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'PENDENTE' | 'PAGO'>('PENDENTE');
  const [pago, setPago] = useState(false);
  const [pagoEm, setPagoEm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mostrarItens, setMostrarItens] = useState(false);
  const [itens, setItens] = useState<TransactionItemInput[]>([]);
  const [unidades, setUnidades] = useState<Array<{ id: number; nome: string; abreviacao: string }>>([]);
  const [subcategorias, setSubcategorias] = useState<Array<{ id: number; nome: string }>>([]);
  const [adicionandoUnidade, setAdicionandoUnidade] = useState(false);
  const [adicionandoSubcategoria, setAdicionandoSubcategoria] = useState(false);
  const [novaUnidadeNome, setNovaUnidadeNome] = useState("");
  const [novaUnidadeAbrev, setNovaUnidadeAbrev] = useState("");
  const [novaSubcategoria, setNovaSubcategoria] = useState("");

  // Reset do formulário e carregamento de dados quando o modal abre
  useEffect(() => {
    if (isOpen && homeId) {
      setData(initialDate ?? new Date().toISOString().split('T')[0]);
      setStatus('PENDENTE');
      setPago(false);
      setPagoEm(null);
      setMostrarItens(false);
      setItens([]);

      // Carregar unidades e subcategorias
      async function carregarDados() {
        try {
          const [unidadesData, subcategoriasData] = await Promise.all([
            getUnidadesByHome(homeId),
            getItemCategoriasByHome(homeId),
          ]);
          setUnidades(unidadesData);
          setSubcategorias(subcategoriasData);
        } catch (error) {
          console.error('[ModalGasto] Erro ao carregar dados:', error);
        }
      }
      carregarDados();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, homeId]);

  // Validar categoria selecionada quando a lista de categorias muda
  useEffect(() => {
    if (categorias.length > 0 && !categorias.includes(categoria)) {
      setCategoria(categorias[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorias]);

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

  const handleAdicionarUnidade = async () => {
    if (!novaUnidadeNome.trim() || !novaUnidadeAbrev.trim()) {
      alert("Preencha nome e abreviação da unidade");
      return;
    }

    const result = await criarUnidade(homeId, novaUnidadeNome, novaUnidadeAbrev);
    if (result.success && result.data) {
      setUnidades([...unidades, result.data]);
      setNovaUnidadeNome("");
      setNovaUnidadeAbrev("");
      setAdicionandoUnidade(false);
    } else {
      alert(result.error || "Erro ao criar unidade");
    }
  };

  const handleAdicionarSubcategoria = async () => {
    if (!novaSubcategoria.trim()) {
      alert("Preencha o nome da subcategoria");
      return;
    }

    const result = await criarItemCategoria(homeId, novaSubcategoria);
    if (result.success && result.data) {
      setSubcategorias([...subcategorias, result.data]);
      setNovaSubcategoria("");
      setAdicionandoSubcategoria(false);
    } else {
      alert(result.error || "Erro ao criar subcategoria");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!descricao.trim()) {
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
      const isPago = status === 'PAGO';
      const gastoData: GastoData = {
        descricao: descricao.trim(),
        valor: valorCalculado,
        categoria,
        data,
        pago: isPago,
        status: status,
        pagoEm: isPago ? (pagoEm ?? data) : null,
        items: (mostrarItens && itens.length > 0) ? itens : undefined,
      };

      console.log('[ModalGasto] Salvando gasto:', gastoData);
      console.log('[ModalGasto] Items:', gastoData.items);
      onSave(gastoData);

      // Limpar formulário
      setDescricao("");
      setValor("");
      setCategoria(categorias[0] || "");
      setData(initialDate ?? new Date().toISOString().split('T')[0]);
      setStatus('PENDENTE');
      setPago(false);
      setPagoEm(null);
      setMostrarItens(false);
      setItens([]);
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Cadastrar Gasto">
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
            placeholder="Ex: Compra no supermercado"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-slate-900 placeholder:text-slate-400"
            required
          />
        </div>

        {/* Valor */}
        <div className="space-y-2">
          <label htmlFor="valor" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
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
              id="valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-slate-900 placeholder:text-slate-400"
              required={!mostrarItens || itens.length === 0}
            />
          )}
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <label htmlFor="categoria" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Tag className="w-4 h-4" />
            Categoria
          </label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-slate-900 bg-white"
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle para detalhamento de itens */}
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

        {/* Seção de itens (colapsável) */}
        {mostrarItens && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-slate-700">Itens da compra</h4>
              {/* Botões para gerenciar unidades e subcategorias */}
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAdicionandoUnidade(true)}
                  className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:bg-white hover:text-blue-600 rounded transition-colors border border-slate-300"
                >
                  <Plus className="w-3 h-3" />
                  Nova Unidade
                </button>
                <button
                  type="button"
                  onClick={() => setAdicionandoSubcategoria(true)}
                  className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:bg-white hover:text-blue-600 rounded transition-colors border border-slate-300"
                >
                  <Plus className="w-3 h-3" />
                  Nova Subcategoria
                </button>
              </div>
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
                      <div className="flex gap-1">
                        <select
                          value={item.unidade ?? ""}
                          onChange={(e) => atualizarItem(index, 'unidade', e.target.value || undefined)}
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                        >
                          <option value="">Unidade</option>
                          {unidades.map((u) => (
                            <option key={u.id} value={u.abreviacao}>{u.abreviacao} - {u.nome}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setAdicionandoUnidade(true)}
                          className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-bold"
                          title="Adicionar nova unidade"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex gap-1">
                        <select
                          value={item.itemCategoria ?? ""}
                          onChange={(e) => atualizarItem(index, 'itemCategoria', e.target.value || undefined)}
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                        >
                          <option value="">Subcategoria</option>
                          {subcategorias.map((s) => (
                            <option key={s.id} value={s.nome}>{s.nome}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setAdicionandoSubcategoria(true)}
                          className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-bold"
                          title="Adicionar nova subcategoria"
                        >
                          +
                        </button>
                      </div>
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

            <button
              type="button"
              onClick={adicionarItem}
              className="flex items-center justify-center gap-1 w-full px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-dashed border-blue-300"
            >
              <Plus className="w-4 h-4" />
              Adicionar item
            </button>

            {itens.length > 0 && (
              <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">Total:</span>
                <span className="text-lg font-bold text-slate-900">R$ {valorCalculado.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

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
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-slate-900"
            required
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="text-sm">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="ml-3 px-3 py-2 rounded-xl border border-slate-300 bg-white">
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
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
            className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? "Salvando..." : "Salvar Gasto"}
          </button>
        </div>
      </form>

      {/* Modal inline para adicionar unidade */}
      {adicionandoUnidade && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Nova Unidade</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome (ex: Quilograma)"
                value={novaUnidadeNome}
                onChange={(e) => setNovaUnidadeNome(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              />
              <input
                type="text"
                placeholder="Abreviação (ex: kg)"
                value={novaUnidadeAbrev}
                onChange={(e) => setNovaUnidadeAbrev(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdicionandoUnidade(false);
                    setNovaUnidadeNome("");
                    setNovaUnidadeAbrev("");
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAdicionarUnidade}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal inline para adicionar subcategoria */}
      {adicionandoSubcategoria && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Nova Subcategoria</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome (ex: Frutas, Limpeza, etc.)"
                value={novaSubcategoria}
                onChange={(e) => setNovaSubcategoria(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdicionandoSubcategoria(false);
                    setNovaSubcategoria("");
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAdicionarSubcategoria}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
