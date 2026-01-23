"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

interface CadastroInput {
  nome: string;
  email: string;
  senha: string;
  apelido?: string;
}

export async function cadastrarUsuario(data: CadastroInput) {
  try {
    const email = data.email.toLowerCase().trim();

    const usuarioExistente = await prisma.user.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      if (!usuarioExistente.senha) {
        // Conta "stub" criada por convite — permitir completar cadastro
        const senhaHash = await bcrypt.hash(data.senha, 10);
        const nomeParaSalvar = data.nome;
        const apelidoParaSalvar = data.apelido && data.apelido.trim() !== "" ? data.apelido : null;
        const usuarioAtualizado = await prisma.user.update({
          where: { id: usuarioExistente.id },
          data: {
            nome: nomeParaSalvar || usuarioExistente.nome,
            apelido: apelidoParaSalvar,
            senha: senhaHash,
          },
        });

        return {
          success: true,
          usuario: {
            id: usuarioAtualizado.id,
            nome: usuarioAtualizado.nome,
            email: usuarioAtualizado.email,
          },
        };
      }

      return {
        success: false,
        error: "Este email já está cadastrado",
      };
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);

    const nomeParaSalvar = data.nome;
    const apelidoParaSalvar = data.apelido && data.apelido.trim() !== "" ? data.apelido : null;

    const usuario = await prisma.user.create({
      data: {
        nome: nomeParaSalvar,
        apelido: apelidoParaSalvar,
        email,
        senha: senhaHash,
      },
    });

    return {
      success: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return {
      success: false,
      error: "Não foi possível criar a conta. Tente novamente.",
    };
  }
}
