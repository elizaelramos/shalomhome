"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, ArrowLeft, Users, Save } from "lucide-react";
import { criarFamilia } from "@/lib/actions/familias";

export default function NovaFamiliaPage() {
  const router = useRouter();
  const [nomeFamilia, setNomeFamilia] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!nomeFamilia.trim()) {
      setErro("Por favor, informe o nome da família");
      return;
    }

    setLoading(true);

    try {
      const resultado = await criarFamilia(nomeFamilia.trim());

      if (resultado.success && resultado.familia) {
        // Redirecionar para o dashboard da nova família
        router.push(`/familias/${resultado.familia.id}`);
      } else {
        setErro(resultado.error || "Erro ao criar família");
        setLoading(false);
      }
    } catch (error) {
      setErro("Erro ao criar família. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="py-6 px-8 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              ShalomHome
            </h1>
          </div>
          <Link
            href="/familias"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-8 py-16">
        {/* Título */}
        <div className="mb-12 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-serif font-bold text-slate-900">
            Criar Nova Família
          </h2>
          <p className="text-lg text-slate-600">
            Adicione um novo lar para começar a gerenciar suas finanças
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            {/* Mensagem de Erro */}
            {erro && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800">{erro}</p>
              </div>
            )}

            {/* Campo Nome da Família */}
            <div className="space-y-2">
              <label
                htmlFor="nomeFamilia"
                className="block text-sm font-semibold text-slate-700"
              >
                Nome da Família
              </label>
              <input
                type="text"
                id="nomeFamilia"
                value={nomeFamilia}
                onChange={(e) => setNomeFamilia(e.target.value)}
                placeholder="Ex: Família Silva"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-500">
                Este nome será usado para identificar sua família no sistema
              </p>
            </div>

            {/* Informações Adicionais */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                O que você poderá fazer:
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>Cadastrar rendimentos e gastos mensais</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>Visualizar gráficos de despesas por categoria</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>Acompanhar o saldo total da família</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>Adicionar outros membros para gestão colaborativa</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <Link
              href="/familias"
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Criar Família
                </>
              )}
            </button>
          </div>
        </form>

        {/* Nota de Segurança */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Seus dados são privados e seguros. Apenas você e os membros que você convidar terão acesso às informações financeiras desta família.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-600">
          <p>&copy; 2025 ShalomHome. Desenvolvido para servir famílias.</p>
        </div>
      </footer>
    </div>
  );
}
