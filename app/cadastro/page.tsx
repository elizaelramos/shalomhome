"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Mail, Lock, User, UserPlus } from "lucide-react";
import { cadastrarUsuario } from "@/lib/actions/auth";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setCarregando(true);

    try {
      const result = await cadastrarUsuario({ nome, apelido, email, senha });

      if (!result.success) {
        setErro(result.error || "Erro ao criar conta");
        return;
      }

      // Login automático após cadastro
      const loginResult = await signIn("credentials", {
        email,
        password: senha,
        redirect: false,
      });

      if (loginResult?.error) {
        // Conta criada, mas falhou o login automático
        router.push("/login");
      } else {
        router.push("/familias");
        router.refresh();
      }
    } catch {
      setErro("Ocorreu um erro. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Link href="/" className="flex items-center gap-3">
            <Home className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              ShalomHome
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-slate-900">
                Criar Conta
              </h2>
              <p className="text-slate-600 mt-2">
                Comece a gerenciar suas finanças familiares
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {erro && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {erro}
                </div>
              )}

              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="apelido"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Como você quer ser chamado
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="apelido"
                    type="text"
                    value={apelido}
                    onChange={(e) => setApelido(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Como prefere ser chamado (ex: João)"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="senha"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmarSenha"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Digite a senha novamente"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {carregando ? (
                  "Criando conta..."
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Criar Conta
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-emerald-600 font-semibold hover:text-emerald-700"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
