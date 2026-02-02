import { notFound } from "next/navigation";
import { getFamiliaByIdForUser } from "@/lib/actions/familias";
import { getTransacoesByFamilia, getResumoFinanceiro, getPrevisaoDetalhada } from "@/lib/actions/transacoes";
import { getCategoriasComUso } from "@/lib/actions/categorias";
import { getVersiculoAleatorio } from "@/lib/actions/versiculos";
import { auth } from "@/lib/auth";
import DashboardCliente from "@/components/DashboardCliente";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ ano?: string; mes?: string }>;
}

export default async function DashboardFamiliaPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const familiaId = parseInt(id, 10);

  // Validar se o ID é um número válido
  if (isNaN(familiaId)) {
    notFound();
  }

  const ano = resolvedSearchParams?.ano;
  const mes = resolvedSearchParams?.mes;

  // Se não houver ano/mes nos query params, usar mês/ano atual (UTC)
  const now = new Date();
  const defaultAno = String(now.getUTCFullYear());
  const defaultMes = String(now.getUTCMonth() + 1).padStart(2, "0");

  // Obter sessão primeiro para saber o usuário
  const session = await auth();

  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  if (!userId) {
    notFound();
  }

  // Buscar dados da família apenas se o usuário for membro
  const familia = await getFamiliaByIdForUser(userId, familiaId);

  if (!familia) {
    notFound();
  }

  // Determinar role do usuário atual dentro da família
  const usuarioRole = familia.membros.find((m) => m.userId === userId)?.role ?? "membro";

  // Buscar transações, resumo financeiro, categorias e versículo em paralelo
  const [transacoes, resumo, categorias, versiculo] = await Promise.all([
    getTransacoesByFamilia(familiaId, ano, mes),
    getResumoFinanceiro(familiaId, ano ?? defaultAno, mes ?? defaultMes),
    getCategoriasComUso(familiaId),
    getVersiculoAleatorio(),
  ]);

  // Buscar detalhes da previsão especificamente para Janeiro/2026 (solicitação de verificação)
  const previsaoDetalhesJan2026 = await getPrevisaoDetalhada(familiaId, '2026', '01');

  return (
    <DashboardCliente
      familia={{
        id: familia.id,
        nome: familia.nome,
        membros: familia.membros.length,
      }}
      transacoesIniciais={transacoes}
      resumoInicial={resumo}
      previsaoDetalhesJan2026={previsaoDetalhesJan2026}
      membrosIniciais={familia.membros}
      categoriasIniciais={categorias}
      usuario={
        session?.user
          ? { nome: session.user.name || "Usuário", email: session.user.email || null, id: session.user.id || null }
          : undefined
      }
      currentUserRole={usuarioRole}
      versiculo={versiculo}
    />
  );
}
