import { NextResponse } from "next/server";
import {
  getGastosPorCategoria,
  getResumoSimples,
  getResumoPagamentosMes,
  getTransacoesPorCategoria,
  getGastosPorItemCategoria,
  getItensMaisComprados,
  getItensComMaiorGasto
} from "@/lib/actions/relatorios";
import { auth } from "@/lib/auth";
import { getFamiliaByIdForUser } from "@/lib/actions/familias";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo") ?? "porCategoria";
    const ano = searchParams.get("ano") ?? undefined;
    const mes = searchParams.get("mes") ?? undefined;

    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid family id" }, { status: 400 });
    }

    // Verificar sessão e associação do usuário à família
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const familiaForUser = await getFamiliaByIdForUser(userId, id);
    if (!familiaForUser) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (tipo === "porCategoria") {
      const data = await getGastosPorCategoria(id, ano, mes);
      return NextResponse.json({ type: 'porCategoria', data });
    }

    if (tipo === "porCategoriaDetalhes") {
      const categoria = searchParams.get("categoria");
      if (!categoria) return NextResponse.json({ error: "Categoria obrigatória" }, { status: 400 });
      const data = await getTransacoesPorCategoria(id, categoria, ano, mes);
      return NextResponse.json({ type: 'porCategoriaDetalhes', data });
    }

    if (tipo === "resumoMensal") {
      const resumo = await getResumoSimples(id, ano, mes);
      return NextResponse.json({ type: 'resumoMensal', data: resumo });
    }

    if (tipo === "pagamentosMensal") {
      const resumo = await getResumoPagamentosMes(id, ano, mes);
      return NextResponse.json({ type: 'pagamentosMensal', data: resumo });
    }

    if (tipo === "itemCategoria") {
      const data = await getGastosPorItemCategoria(id, ano, mes);
      return NextResponse.json({ type: 'itemCategoria', data });
    }

    if (tipo === "itensMaisComprados") {
      const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;
      const data = await getItensMaisComprados(id, ano, mes, limit);
      return NextResponse.json({ type: 'itensMaisComprados', data });
    }

    if (tipo === "maioresGastos") {
      const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;
      const data = await getItensComMaiorGasto(id, ano, mes, limit);
      return NextResponse.json({ type: 'maioresGastos', data });
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (error) {
    console.error("Erro na API de relatórios:", error);
    return NextResponse.json({ error: "Erro ao obter relatório" }, { status: 500 });
  }
}
