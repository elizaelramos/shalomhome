import Link from "next/link";
import { Home, TrendingUp, Users, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              ShalomHome
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-8 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Título Principal */}
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 leading-tight">
              Paz e Providência para o seu Lar
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Um sistema de planejamento financeiro familiar fundamentado em{" "}
              <span className="text-emerald-600 font-semibold">economia familiar</span>,{" "}
              <span className="text-blue-600 font-semibold">harmonia</span> e{" "}
              <span className="text-slate-900 font-semibold">transparência</span>.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Controle Financeiro</h3>
              <p className="text-sm text-slate-600">
                Acompanhe rendimentos e gastos com clareza e simplicidade.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">União Familiar</h3>
              <p className="text-sm text-slate-600">
                Planeje em conjunto e fortaleça a harmonia do seu lar.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="font-semibold text-slate-900">Economia Familiar</h3>
              <p className="text-sm text-slate-600">
                Gerencie recursos com responsabilidade e propósito.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="pt-8">
            <Link
              href="/familias"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
            >
              Entrar no Sistema
              <Home className="w-5 h-5" />
            </Link>
          </div>

          {/* Subtle Footer Text */}
          <p className="text-sm text-slate-500 pt-12">
            Gerencie suas finanças com sabedoria e fé
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-600">
          <p>&copy; 2025 ShalomHome. Desenvolvido para servir famílias.</p>
        </div>
      </footer>
    </div>
  );
}
