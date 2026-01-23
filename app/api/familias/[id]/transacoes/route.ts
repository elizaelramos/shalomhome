import { NextResponse } from "next/server";
import { getTransacoesByFamilia, getResumoFinanceiro } from "@/lib/actions/transacoes";
import { auth } from "@/lib/auth";
import { getFamiliaByIdForUser } from "@/lib/actions/familias";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const ano = searchParams.get("ano") ?? undefined;
    const mes = searchParams.get("mes") ?? undefined;
    const familiaId = parseInt(id, 10);

    if (isNaN(familiaId)) {
      return NextResponse.json({ error: "Invalid family id" }, { status: 400 });
    }

    // Verificar sessão e associação do usuário à família
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const familiaForUser = await getFamiliaByIdForUser(userId, familiaId);
    if (!familiaForUser) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page = pageParam ? parseInt(pageParam, 10) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const [resumo, transacoesResult] = await Promise.all([
      getResumoFinanceiro(familiaId, ano, mes),
      getTransacoesByFamilia(familiaId, ano, mes, page ?? 1, limit ?? undefined as any),
    ]);

    // Se transacoesResult for um objeto com total -> retorno paginado
    if (transacoesResult && (transacoesResult as any).total !== undefined) {
      const total = (transacoesResult as any).total as number;
      const transacoes = (transacoesResult as any).transacoes as any[];
      const usedLimit = limit ?? 15;
      const usedPage = page ?? 1;
      const totalPages = Math.max(1, Math.ceil(total / usedLimit));
      return NextResponse.json({ transacoes, resumo, total, page: usedPage, totalPages });
    }

    // Fallback (sem paginação)
    return NextResponse.json({ transacoes: transacoesResult, resumo });
  } catch (error) {
    console.error("Erro na API de transações:", error);
    return NextResponse.json({ error: "Erro ao obter transações" }, { status: 500 });
  }
}
