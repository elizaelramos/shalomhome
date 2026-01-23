import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 });

  const subject = 'Teste de Email - ShalomHome';
  const html = `<p>Este é um email de teste enviado em ${new Date().toISOString()}</p>`;

  try {
    const res = await sendEmail(email, subject, html);
    if (res.success) return NextResponse.json({ success: true });
    return NextResponse.json({ success: false, error: res.error }, { status: 500 });
  } catch (e) {
    console.error('Erro ao enviar email de teste', e);
    return NextResponse.json({ success: false, error: 'internal' }, { status: 500 });
  }
}