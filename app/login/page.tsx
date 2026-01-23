"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const result = await signIn("credentials", {
        email,
        password: senha,
        redirect: false,
      });

      if (result?.error) {
        setErro("Email ou senha incorretos");
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
                Entrar
              </h2>
              <p className="text-slate-600 mt-2">
                Acesse sua conta para gerenciar suas finanças
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
                    placeholder="Sua senha"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {carregando ? (
                  "Entrando..."
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Entrar
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Ainda nao tem conta?{" "}
                <Link
                  href="/cadastro"
                  className="text-emerald-600 font-semibold hover:text-emerald-700"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
