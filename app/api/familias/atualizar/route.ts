import { NextResponse } from 'next/server';
import { atualizarFamilia, getFamiliaByIdForUser } from '@/lib/actions/familias';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, nome } = body;

    if (!id || typeof nome !== 'string' || nome.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 });
    }

    // Verificar sessão e associação do usuário à família
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const familiaForUser = await getFamiliaByIdForUser(userId, Number(id));
    if (!familiaForUser) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const result = await atualizarFamilia(Number(id), nome.trim());

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, familia: result.familia });
  } catch (error) {
    console.error('Erro na rota /api/familias/atualizar:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}