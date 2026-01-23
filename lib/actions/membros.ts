"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Interface para dados de membro
export interface MembroData {
  id: number;
  nome: string;
  apelido?: string;
  email: string;
  role: string;
  createdAt: Date;
}

// Interface para entrada de novo membro
interface NovoMembroInput {
  nome?: string;
  apelido?: string;
  email: string;
  role?: string;
  homeId: number;
}

// Buscar membros de uma família
export async function getMembrosByFamilia(homeId: number): Promise<MembroData[]> {
  try {
    // Verificar se solicitante é membro desta família
    try {
      const session = await auth();
      const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
      if (!userId) throw new Error("Não autorizado");

      const userHome = await prisma.userHome.findUnique({
        where: { userId_homeId: { userId, homeId } },
      });
      if (!userHome) throw new Error("Não autorizado");
    } catch (e) {
      console.error("Acesso negado ao listar membros:", e);
      throw new Error("Não autorizado");
    }

    const membros = await prisma.userHome.findMany({
      where: { homeId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return membros.map((uh) => ({
      id: uh.id,
      nome: uh.user.nome,
      apelido: uh.user.apelido,
      email: uh.user.email,
      role: uh.role,
      createdAt: uh.createdAt,
    }));
  } catch (error) {
    console.error("Erro ao buscar membros:", error);
    throw new Error("Não foi possível carregar os membros");
  }
}

// Adicionar membro a família (cria User se não existir)
export async function adicionarMembro(data: NovoMembroInput) {
  try {
    // Verificar que o solicitante é administrador da família
    const session = await auth();
    const actingUserId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    if (!actingUserId) {
      return { success: false, error: "Não autorizado" };
    }

    const actingUserHome = await prisma.userHome.findUnique({
      where: { userId_homeId: { userId: actingUserId, homeId: data.homeId } },
    });

    if (!actingUserHome || actingUserHome.role !== "administrador") {
      return { success: false, error: "Permissão negada" };
    }

    const { nome, email, role = "membro", homeId } = data;

    // Verificar se usuário já existe
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      // Verificar se já é membro desta família
      const membroExistente = await prisma.userHome.findUnique({
        where: {
          userId_homeId: {
            userId: user.id,
            homeId,
          },
        },
      });

      if (membroExistente) {
        return {
          success: false,
          error: "Este email já está cadastrado nesta família",
        };
      }

      // Adicionar à família existente (não modificamos dados do usuário)
      const userHome = await prisma.userHome.create({
        data: {
          userId: user.id,
          homeId,
          role,
        },
        include: { user: true },
      });

      revalidatePath(`/familias/${homeId}`);

      // Notificar o usuário por email (não bloqueante)
      try {
        const home = await prisma.home.findUnique({ where: { id: homeId } });
        const subject = `Você foi adicionado à família ${home?.nome || "uma família"}`;
        const html = `<p>Olá ${user.nome},</p>
          <p>Você foi adicionado à família <strong>${home?.nome || "(não informado)"}</strong> no ShalomHome.</p>
          <p>Se já possui uma conta, faça login em <a href="${process.env.AUTH_URL}/login">${process.env.AUTH_URL}</a>.</p>
          <p>Se ainda não possui conta, registre-se em <a href="${process.env.AUTH_URL}/cadastro">${process.env.AUTH_URL}/cadastro</a> usando este email para completar o cadastro.</p>
          <p>— Equipe ShalomHome</p>`;

        const { sendEmail } = await import("@/lib/mailer");
        await sendEmail(user.email, subject, html);
      } catch (e) {
        console.error("Erro ao enviar email de adição para usuário existente:", e);
      }

      return {
        success: true,
        membro: {
          id: userHome.id,
          nome: userHome.user.nome,
          apelido: userHome.user.apelido,
          email: userHome.user.email,
          role: userHome.role,
          createdAt: userHome.createdAt,
        },
      };
    }

    // Criar novo usuário e vínculo em transação
    const resultado = await prisma.$transaction(async (tx) => {
      const novoUser = await tx.user.create({
        data: { nome: nome || email.split('@')[0], apelido: data.apelido ?? null, email: email.toLowerCase() },
      });

      const userHome = await tx.userHome.create({
        data: {
          userId: novoUser.id,
          homeId,
          role,
        },
      });

      return { user: novoUser, userHome };
    });

    revalidatePath(`/familias/${homeId}`);

    // Enviar email de convite/boas-vindas
    try {
      const home = await prisma.home.findUnique({ where: { id: homeId } });
      const subject = `Você foi adicionado à família ${home?.nome || "uma família"}`;
      const html = `<p>Olá ${resultado.user.apelido || resultado.user.nome},</p>
        <p>Você foi adicionado à família <strong>${home?.nome || "(não informado)"}</strong> no ShalomHome.</p>
        <p>Para completar seu cadastro e criar uma senha, acesse <a href="${process.env.AUTH_URL}/cadastro">${process.env.AUTH_URL}/cadastro</a> e registre usando este endereço de email.</p>
        <p>— Equipe ShalomHome</p>`;

      const { sendEmail } = await import("@/lib/mailer");
      await sendEmail(resultado.user.email, subject, html);
    } catch (e) {
      console.error("Erro ao enviar email para novo usuário:", e);
    }

    return {
      success: true,
      membro: {
        id: resultado.userHome.id,
        nome: resultado.user.nome,
        apelido: resultado.user.apelido,
        email: resultado.user.email,
        role: resultado.userHome.role,
        createdAt: resultado.userHome.createdAt,
      },
    };

    revalidatePath(`/familias/${homeId}`);

    return {
      success: true,
      membro: {
        id: resultado.userHome.id,
        nome: resultado.user.nome,
        email: resultado.user.email,
        role: resultado.userHome.role,
        createdAt: resultado.userHome.createdAt,
      },
    };
  } catch (error) {
    console.error("Erro ao adicionar membro:", error);
    return {
      success: false,
      error: "Não foi possível adicionar o membro",
    };
  }
}

// Remover membro de família (deleta UserHome, mantém User)
export async function removerMembro(userHomeId: number, homeId: number) {
  try {
    // Verificar que o solicitante é administrador da família
    const session = await auth();
    const actingUserId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    if (!actingUserId) {
      return { success: false, error: "Não autorizado" };
    }

    const actingUserHome = await prisma.userHome.findUnique({
      where: { userId_homeId: { userId: actingUserId, homeId } },
    });

    if (!actingUserHome || actingUserHome.role !== "administrador") {
      return { success: false, error: "Permissão negada" };
    }

    await prisma.userHome.delete({
      where: { id: userHomeId },
    });

    revalidatePath(`/familias/${homeId}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    return {
      success: false,
      error: "Não foi possível remover o membro",
    };
  }
}

// Alterar role do membro
export async function alterarRoleMembro(
  userHomeId: number,
  novoRole: string,
  homeId: number
) {
  try {
    // Verificar que o solicitante é administrador da família
    const session = await auth();
    const actingUserId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    if (!actingUserId) {
      return { success: false, error: "Não autorizado" };
    }

    const actingUserHome = await prisma.userHome.findUnique({
      where: { userId_homeId: { userId: actingUserId, homeId } },
    });

    if (!actingUserHome || actingUserHome.role !== "administrador") {
      return { success: false, error: "Permissão negada" };
    }

    const membroAtualizado = await prisma.userHome.update({
      where: { id: userHomeId },
      data: { role: novoRole },
      include: { user: true },
    });

    revalidatePath(`/familias/${homeId}`);

    return {
      success: true,
      membro: {
        id: membroAtualizado.id,
        nome: membroAtualizado.user.nome,
        apelido: membroAtualizado.user.apelido,
        email: membroAtualizado.user.email,
        role: membroAtualizado.role,
        createdAt: membroAtualizado.createdAt,
      },
    };
  } catch (error) {
    console.error("Erro ao alterar role do membro:", error);
    return {
      success: false,
      error: "Não foi possível alterar o papel do membro",
    };
  }
}
