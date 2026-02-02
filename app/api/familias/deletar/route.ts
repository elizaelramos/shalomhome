import { NextResponse } from 'next/server';
import { deletarFamilia } from '@/lib/actions/familias';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se o usuário é administrador desta família
    const userHome = await prisma.userHome.findUnique({
      where: { userId_homeId: { userId, homeId: Number(id) } },
    });

    if (!userHome || userHome.role !== 'administrador') {
      return NextResponse.json({ success: false, error: 'Permissão negada' }, { status: 403 });
    }

    const result = await deletarFamilia(Number(id));

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na rota /api/familias/deletar:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}
