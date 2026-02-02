"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home, ArrowLeft, TrendingUp, TrendingDown, Wallet, Plus, Users, UserPlus, LogOut, BookOpen, ChevronDown, Repeat } from "lucide-react";
import { signOut } from "next-auth/react";
import FiltroPeriodo from "@/components/FiltroPeriodo";
import ModalGasto, { GastoData } from "@/components/ModalGasto";
import ModalRendimento, { RendimentoData } from "@/components/ModalRendimento";
import ModalEditarTransacao from "@/components/ModalEditarTransacao";
import ModalPagamentoParcial from "@/components/ModalPagamentoParcial";
import { setPagoTransacao, transferirTransacao, registrarPagamentoParcial, transferirRestante } from "@/lib/actions/transacoes";
import { useRouter } from "next/navigation";
import ModalAdicionarMembro, { NovoMembroData } from "@/components/ModalAdicionarMembro";
import ModalEditarMembro from "@/components/ModalEditarMembro";
import ListaTransacoes, { Transacao } from "@/components/ListaTransacoes";
import ListaMembros, { Membro } from "@/components/ListaMembros";
import { criarTransacao, atualizarTransacao, deletarTransacao } from "@/lib/actions/transacoes";
import { adicionarMembro, removerMembro, alterarRoleMembro } from "@/lib/actions/membros";
import GerenciadorCategorias from "@/components/GerenciadorCategorias";
import { CategoriaData } from "@/lib/actions/categorias";

interface FamiliaData {
  id: number;
  nome: string;
  membros: number;
}

interface ResumoFinanceiro {
  rendimentos: number;
  gastos: number;
  previsao: number;
  transferidos: number;
  saldo: number;
  saldoAnterior?: number;
  saldoMes?: number;
}

interface VersiculoData {
  id: number;
  texto: string;
  referencia: string;
}

interface DashboardClienteProps {
  familia: FamiliaData;
  transacoesIniciais: Transacao[];
  resumoInicial: ResumoFinanceiro;
  membrosIniciais: Membro[];
  categoriasIniciais: CategoriaData[];
  previsaoDetalhesJan2026?: Array<{ id: number; descricao: string; categoria: string; data: string; valor: number; totalPago: number; restante: number; status: string | null }>;
  usuario?: { nome: string; email?: string | null; id?: string | null };
  versiculo?: VersiculoData | null;
  currentUserRole?: string;
}

export default function DashboardCliente({
  familia,
  transacoesIniciais,
  resumoInicial,
  membrosIniciais,
  categoriasIniciais,
  previsaoDetalhesJan2026,
  usuario,
  versiculo,
  currentUserRole,
}: DashboardClienteProps) {
  const primeiroNome = usuario?.nome?.split(" ")[0] || "Usuário";
  const usuarioEmail = (usuario as any)?.email;
  const usuarioId = (usuario as any)?.id;
  const [modalGastoAberto, setModalGastoAberto] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaData[]>(categoriasIniciais);
  const [expandCategorias, setExpandCategorias] = useState(false);

  // Filtrar categorias por tipo
  const categoriasGasto = categorias.filter((c) => c.tipo === "SAIDA").map((c) => c.nome);
  const categoriasRendimento = categorias.filter((c) => c.tipo === "ENTRADA").map((c) => c.nome);
  const [modalRendimentoAberto, setModalRendimentoAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalAdicionarMembroAberto, setModalAdicionarMembroAberto] = useState(false);
  const [modalEditarMembroAberto, setModalEditarMembroAberto] = useState(false);
  const [transacaoParaEditar, setTransacaoParaEditar] = useState<Transacao | null>(null);
  const [membroParaEditar, setMembroParaEditar] = useState<Membro | null>(null);
  const [modalPagamentoParcialAberto, setModalPagamentoParcialAberto] = useState(false);
  const [transacaoParaPagamentoParcial, setTransacaoParaPagamentoParcial] = useState<Transacao | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>(transacoesIniciais);
  const [membros, setMembros] = useState<Membro[]>(membrosIniciais);
  const [resumo, setResumo] = useState<ResumoFinanceiro>(resumoInicial);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  // Paginação para transações recentes
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalTransacoes, setTotalTransacoes] = useState<number | null>(null);

  // Ler período selecionado na URL e preparar initialDate para modais
  const searchParams = useSearchParams();
  const anoParam = searchParams?.get("ano");
  const mesParam = searchParams?.get("mes");
  const initialDate = anoParam && mesParam ? `${anoParam}-${mesParam}-01` : undefined;

  const monthNames: Record<string, string> = {
    '01': 'Janeiro','02': 'Fevereiro','03': 'Março','04': 'Abril','05': 'Maio','06': 'Junho',
    '07': 'Julho','08': 'Agosto','09': 'Setembro','10': 'Outubro','11': 'Novembro','12': 'Dezembro'
  };

  const periodoLabel = anoParam && mesParam ? `${monthNames[mesParam] ?? mesParam} de ${anoParam}` : 'mês atual';

  // Atualizar transações/resumo quando o filtro muda
  const [carregandoPeriodo, setCarregandoPeriodo] = useState(false);

  const fetchPeriodo = async () => {
    if (!familia?.id) return;

    setCarregandoPeriodo(true);
    try {
      const params = new URLSearchParams();
      if (anoParam) params.set('ano', anoParam);
      if (mesParam) params.set('mes', mesParam);
      // Paginação
      params.set('page', String(currentPage));
      params.set('limit', '15');

      const url = `/api/familias/${familia.id}/transacoes?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao buscar transações');
      const data = await res.json();

      if (data.transacoes) setTransacoes(data.transacoes);
      if (data.resumo) setResumo(data.resumo);
      if (typeof data.total === 'number') setTotalTransacoes(data.total);
      if (typeof data.totalPages === 'number') setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Erro ao atualizar período:', err);
    } finally {
      setCarregandoPeriodo(false);
    }
  };

  useEffect(() => {
    // Quando muda o período, resetar paginação e buscar a página 1
    setCurrentPage(1);
  }, [anoParam, mesParam, familia.id]);

  useEffect(() => {
    fetchPeriodo();
  }, [anoParam, mesParam, familia.id, currentPage]);

  // Toggle pago handler
  const handleTogglePago = async (id: number, pago: boolean) => {
    try {
      setCarregandoPeriodo(true);
      const resultado = await setPagoTransacao(id, pago);
      if (!resultado.success) {
        console.error('Erro ao alternar pago:', resultado.error);
        alert(resultado.error || 'Erro ao atualizar pagamento. Tente novamente.');
        return;
      }
      // Recarrega o período para manter o resumo consistente
      await fetchPeriodo();
    } catch (err) {
      console.error('Erro ao alternar pago:', err);
      alert('Erro ao atualizar pagamento. Tente novamente.');
    } finally {
      setCarregandoPeriodo(false);
    }
  };

  // Alterar status (PENDENTE | PAGO | TRANSFERIR | PAGAR_PARCIAL | TRANSFERIR_RESTANTE)
  const handleChangeStatus = async (id: number, status: "PENDENTE" | "PAGO" | "TRANSFERIR" | "PAGAR_PARCIAL" | "TRANSFERIR_RESTANTE" | "PARCIAL" | "TRANSFERIDO") => {
    // Ignora valores de estado (PARCIAL, TRANSFERIDO) que não são ações
    if (status === "PARCIAL" || status === "TRANSFERIDO") return;

    try {
      setCarregandoPeriodo(true);

      if (status === "PAGO") {
        // marca como pago hoje
        const resultado = await setPagoTransacao(id, true, new Date().toISOString());
        if (!resultado.success) {
          alert(resultado.error || 'Erro ao marcar como pago');
        }
      } else if (status === "PENDENTE") {
        const resultado = await setPagoTransacao(id, false, null);
        if (!resultado.success) {
          alert(resultado.error || 'Erro ao marcar como pendente');
        }
      } else if (status === "TRANSFERIR") {
        const confirmar = window.confirm('Deseja transferir este gasto inteiro para o próximo mês (dia 1)?');
        if (!confirmar) {
          setCarregandoPeriodo(false);
          return;
        }
        const resultado = await transferirTransacao(id);
        if (!resultado.success) {
          alert(resultado.error || 'Erro ao transferir transação');
        }
      } else if (status === "PAGAR_PARCIAL") {
        // Abre modal de pagamento parcial
        const transacao = transacoes.find(t => t.id === id);
        if (transacao) {
          setTransacaoParaPagamentoParcial(transacao);
          setModalPagamentoParcialAberto(true);
        }
        setCarregandoPeriodo(false);
        return; // Não recarrega período aqui, será feito após salvar o pagamento
      } else if (status === "TRANSFERIR_RESTANTE") {
        const confirmar = window.confirm('Deseja transferir o valor restante deste gasto para o próximo mês?');
        if (!confirmar) {
          setCarregandoPeriodo(false);
          return;
        }
        const resultado = await transferirRestante(id);
        if (!resultado.success) {
          alert(resultado.error || 'Erro ao transferir restante');
        }
      }

      await fetchPeriodo();
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      alert('Erro ao alterar status. Tente novamente.');
    } finally {
      setCarregandoPeriodo(false);
    }
  };

  // Handler para salvar pagamento parcial
  const handleSalvarPagamentoParcial = async (valorPago: number, dataPagamento: string) => {
    if (!transacaoParaPagamentoParcial) return;

    setSalvando(true);
    try {
      const resultado = await registrarPagamentoParcial(
        transacaoParaPagamentoParcial.id,
        valorPago,
        dataPagamento
      );

      if (!resultado.success) {
        alert(resultado.error || 'Erro ao registrar pagamento parcial');
        return;
      }

      setModalPagamentoParcialAberto(false);
      setTransacaoParaPagamentoParcial(null);
      await fetchPeriodo();
    } catch (err) {
      console.error('Erro ao registrar pagamento parcial:', err);
      alert('Erro ao registrar pagamento. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarGasto = async (gasto: GastoData) => {
    setSalvando(true);
    try {
      console.log('[DashboardCliente] Recebeu gasto:', gasto);
      console.log('[DashboardCliente] Items do gasto:', gasto.items);

      const transacaoData = {
        descricao: gasto.descricao,
        valor: gasto.valor,
        tipo: "SAIDA" as const,
        categoria: gasto.categoria,
        data: gasto.data,
        homeId: familia.id,
        pago: gasto.pago,
        pagoEm: (gasto as any).pagoEm ?? null,
        status: (gasto as any).status ?? (gasto.pago ? 'PAGO' : 'PENDENTE'),
        items: gasto.items,
      };

      console.log('[DashboardCliente] Enviando para criarTransacao:', transacaoData);
      const resultado = await criarTransacao(transacaoData);

      if (resultado.success && resultado.transacao) {
        // Recarregar período e ir para a primeira página para ver o novo registro
        setCurrentPage(1);
        await fetchPeriodo();
      }
    } catch (error) {
      console.error("Erro ao salvar gasto:", error);
      alert("Erro ao salvar gasto. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarRendimento = async (rendimento: RendimentoData) => {
    setSalvando(true);
    try {
      const resultado = await criarTransacao({
        descricao: rendimento.descricao,
        valor: rendimento.valor,
        tipo: "ENTRADA",
        categoria: rendimento.fonte,
        data: rendimento.data,
        homeId: familia.id,
      });

      if (resultado.success && resultado.transacao) {
        // Recarregar período e ir para a primeira página para ver o novo registro
        setCurrentPage(1);
        await fetchPeriodo();
      }
    } catch (error) {
      console.error("Erro ao salvar rendimento:", error);
      alert("Erro ao salvar rendimento. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleEditarTransacao = (transacao: Transacao) => {
    setTransacaoParaEditar(transacao);
    setModalEditarAberto(true);
  };

  const handleSalvarEdicao = async (transacaoEditada: Transacao) => {
    setSalvando(true);
    try {
      const resultado = await atualizarTransacao(transacaoEditada.id, {
        descricao: transacaoEditada.descricao,
        valor: transacaoEditada.valor,
        tipo: transacaoEditada.tipo === "entrada" ? "ENTRADA" : "SAIDA",
        categoria: transacaoEditada.categoria,
        data: transacaoEditada.data,
        // @ts-ignore
        pago: (transacaoEditada as any).pago,
        // @ts-ignore
        pagoEm: (transacaoEditada as any).pagoEm ?? null,
        // @ts-ignore
        status: (transacaoEditada as any).status ?? undefined,
      });

      if (resultado.success && resultado.transacao) {
        // Simples: recarregar o período atual para manter resumo consistente
        await fetchPeriodo();
      }
    } catch (error) {
      console.error("Erro ao editar transação:", error);
      alert("Erro ao editar transação. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirTransacao = async (transacao: Transacao) => {
    const confirmar = window.confirm(
      `Deseja realmente excluir a transação "${transacao.descricao}"?`
    );

    if (!confirmar) return;

    setSalvando(true);
    try {
      const resultado = await deletarTransacao(transacao.id, familia.id);

      if (resultado.success) {
        // Recarrega o período para manter os cálculos consistentes
        await fetchPeriodo();
      } else {
        alert("Erro ao excluir transação. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      alert("Erro ao excluir transação. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  // Handlers de Membros
  const handleAdicionarMembro = async (dados: NovoMembroData) => {
    setSalvando(true);
    try {
      const resultado = await adicionarMembro({
        ...dados,
        homeId: familia.id,
      });

      if (resultado.success && resultado.membro) {
        setMembros([...membros, resultado.membro as Membro]);
      } else {
        alert(resultado.error || "Erro ao adicionar membro");
      }
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      alert("Erro ao adicionar membro. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleEditarMembro = (membro: Membro) => {
    setMembroParaEditar(membro);
    setModalEditarMembroAberto(true);
  };

  const handleSalvarEdicaoMembro = async (membroEditado: Membro) => {
    setSalvando(true);
    try {
      const resultado = await alterarRoleMembro(
        membroEditado.id,
        membroEditado.role,
        familia.id
      );

      if (resultado.success && resultado.membro) {
        setMembros(
          membros.map((m) =>
            m.id === membroEditado.id ? (resultado.membro as Membro) : m
          )
        );
      } else {
        alert(resultado.error || "Erro ao editar membro");
      }
    } catch (error) {
      console.error("Erro ao editar membro:", error);
      alert("Erro ao editar membro. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleRemoverMembro = async (membro: Membro) => {
    const confirmar = window.confirm(
      `Deseja realmente remover "${membro.apelido || membro.nome}" da família?`
    );

    if (!confirmar) return;

    setSalvando(true);
    try {
      const resultado = await removerMembro(membro.id, familia.id);

      if (resultado.success) {
        setMembros(membros.filter((m) => m.id !== membro.id));
      } else {
        alert(resultado.error || "Erro ao remover membro");
      }
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      alert("Erro ao remover membro. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="py-4 px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/familias" className="flex items-center gap-3">
              <Home className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-900">
                  {familia.nome}
                </h1>
                <p className="text-xs text-slate-500">
                  {familia.membros} {familia.membros === 1 ? "membro" : "membros"}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/familias"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Voltar</span>
              </Link>
 

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors"
                title="Sair do sistema"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Linha de saudação com versículo */}
        {usuario && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100 py-3 px-8">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-medium text-slate-900">
                  Olá, {primeiroNome}!
                </span>
                    {usuarioEmail && (
                      <span className="text-xs text-slate-600">{usuarioEmail} {usuarioId ? ` (id:${usuarioId})` : ''}</span>
                    )}
                    {versiculo && (
                  <span className="text-slate-600 text-sm">
                    <span className="hidden sm:inline">— </span>
                    <span className="italic">&ldquo;{versiculo.texto}&rdquo;</span>
                    <span className="text-emerald-700 font-medium ml-1">
                      ({versiculo.referencia})
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <FiltroPeriodo />

      {/* Gerenciar Categorias (barra expansível) */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="bg-white border border-slate-200 rounded-2xl mt-4 overflow-hidden">
          <button
            onClick={() => setExpandCategorias((s) => !s)}
            className="w-full flex items-center justify-between px-6 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
            aria-expanded="false"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Gerenciar categorias</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${expandCategorias ? 'rotate-180' : ''}`} />
          </button>

          {expandCategorias && (
            <div className="px-6 py-6 border-t border-slate-100">
              <GerenciadorCategorias
                categorias={categorias}
                homeId={familia.id}
                onCategoriasChange={setCategorias}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Título e Botões de Ação */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              Dashboard Financeiro
            </h2>
            <p className="text-slate-600 mt-2">
              Visão geral das finanças de {periodoLabel}
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <Link href={`/familias/${familia.id}/relatorios`} className="flex items-center gap-2 border border-slate-200 px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm sm:text-base">
              Relatórios
            </Link>

            

            <button
              onClick={() => setModalRendimentoAberto(true)}
              disabled={salvando}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-3 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Cadastrar Rendimento</span>
              <span className="sm:hidden">Rendimento</span>
            </button>

            <button
              onClick={() => setModalGastoAberto(true)}
              disabled={salvando}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-3 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Cadastrar Gasto</span>
              <span className="sm:hidden">Gasto</span>
            </button>
          </div>
        </div>

        {/* Cards de Resumo Financeiro */}
        <div className="flex gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 md:grid md:grid-cols-5 md:gap-6 mb-12">
          {/* Card Saldo Total - com breakdown */}
          <div className="min-w-[220px] md:min-w-0 flex-shrink-0 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Saldo Total</h3>
            </div>
            <div className="space-y-2">
              {/* Saldo Anterior */}
              {resumo.saldoAnterior !== undefined && (
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-slate-600">Saldo anterior:</span>
                  <span className={`font-medium ${resumo.saldoAnterior >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                    R$ {resumo.saldoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Entradas do Mês */}
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-600">Entradas do mês:</span>
                <span className="font-medium text-emerald-600">
                  +R$ {resumo.rendimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Gastos do Mês */}
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-600">Gastos do mês:</span>
                <span className="font-medium text-red-600">
                  -R$ {resumo.gastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Linha divisória */}
              <div className="border-t border-slate-200 my-2"></div>

              {/* Saldo Atual (acumulado) */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-900">Saldo atual:</span>
                <span className={`text-lg sm:text-xl font-bold ${resumo.saldo >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                  R$ {resumo.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Card Rendimentos */}
          <div className="min-w-[220px] md:min-w-0 flex-shrink-0 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-1">Rendimentos do mês</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600">
              R$ {resumo.rendimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Card Previsão */}
          <div className="min-w-[220px] md:min-w-0 flex-shrink-0 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-1">Previsão de gastos</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">
              R$ {resumo.previsao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            {previsaoDetalhesJan2026 && previsaoDetalhesJan2026.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">Jan/2026 — {previsaoDetalhesJan2026.length} itens pendentes • R$ {previsaoDetalhesJan2026.reduce((s, it) => s + it.restante, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            )}
          </div>

          {/* Card Transferidos */}
          <div className="min-w-[220px] md:min-w-0 flex-shrink-0 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl flex items-center justify-center">
                <Repeat className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-1">Gastos Transferidos</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">
              R$ {resumo.transferidos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Card Gastos */}
          <div className="min-w-[220px] md:min-w-0 flex-shrink-0 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-1">Gastos do mês</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              R$ {resumo.gastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Seção de Membros */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-semibold text-slate-900">
                Membros da Família
              </h3>
            </div>
              {currentUserRole === "administrador" && (
                <button
                  onClick={() => setModalAdicionarMembroAberto(true)}
                  disabled={salvando}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Adicionar Membro
                </button>
              )}
          </div>

          <ListaMembros
            membros={membros}
            onEditar={currentUserRole === "administrador" ? handleEditarMembro : undefined}
            onRemover={currentUserRole === "administrador" ? handleRemoverMembro : undefined}
          />
        </div>

        {/* Lista de Transações */}
        <ListaTransacoes
          transacoes={transacoes}
          onEditar={handleEditarTransacao}
          onExcluir={handleExcluirTransacao}
          onTogglePago={handleTogglePago}
          onChangeStatus={handleChangeStatus}
        />

        {/* Paginação para transações recentes */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">{totalTransacoes !== null ? `Mostrando ${transacoes.length} de ${totalTransacoes} transações` : ''}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 rounded border border-slate-200 bg-white disabled:opacity-50"
            >
              Anterior
            </button>

            <div className="px-3 py-1 border border-slate-100 bg-white text-sm">Página {currentPage} de {totalPages}</div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 rounded border border-slate-200 bg-white disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        </div>


      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-600">
          <p>&copy; 2025 ShalomHome. Desenvolvido para servir famílias.</p>
        </div>
      </footer>

      {/* Modais */}
      <ModalGasto
        isOpen={modalGastoAberto}
        onClose={() => setModalGastoAberto(false)}
        onSave={handleSalvarGasto}
        initialDate={initialDate}
        categorias={categoriasGasto}
        homeId={familia.id}
      />

      <ModalRendimento
        isOpen={modalRendimentoAberto}
        onClose={() => setModalRendimentoAberto(false)}
        onSave={handleSalvarRendimento}
        initialDate={initialDate}
        categorias={categoriasRendimento}
      />

      <ModalEditarTransacao
        isOpen={modalEditarAberto}
        onClose={() => {
          setModalEditarAberto(false);
          setTransacaoParaEditar(null);
        }}
        onSave={handleSalvarEdicao}
        transacao={transacaoParaEditar}
        categoriasGasto={categoriasGasto}
        categoriasRendimento={categoriasRendimento}
      />

      <ModalAdicionarMembro
        isOpen={modalAdicionarMembroAberto}
        onClose={() => setModalAdicionarMembroAberto(false)}
        onSave={handleAdicionarMembro}
      />

      <ModalEditarMembro
        isOpen={modalEditarMembroAberto}
        onClose={() => {
          setModalEditarMembroAberto(false);
          setMembroParaEditar(null);
        }}
        onSave={handleSalvarEdicaoMembro}
        membro={membroParaEditar}
      />

      <ModalPagamentoParcial
        isOpen={modalPagamentoParcialAberto}
        onClose={() => {
          setModalPagamentoParcialAberto(false);
          setTransacaoParaPagamentoParcial(null);
        }}
        onSave={handleSalvarPagamentoParcial}
        transacao={transacaoParaPagamentoParcial}
      />
    </div>
  );
}
