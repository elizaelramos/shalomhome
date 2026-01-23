import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, nome: true, apelido: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, user });
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}