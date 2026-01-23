import Link from "next/link";
import { Home, BookOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { getVersiculoAleatorio } from "@/lib/actions/versiculos";
import BotaoSair from "./BotaoSair";

interface HeaderProps {
  mostrarVoltar?: boolean;
  linkVoltar?: string;
}

export default async function Header({ mostrarVoltar = false, linkVoltar = "/familias" }: HeaderProps) {
  const [session, versiculo] = await Promise.all([
    auth(),
    getVersiculoAleatorio(),
  ]);

  const primeiroNome = session?.user?.name?.split(" ")[0] || "Usuário";

  return (
    <header className="border-b border-slate-200 bg-white">
      {/* Linha principal */}
      <div className="py-4 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/familias" className="flex items-center gap-3">
            <Home className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              ShalomHome
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            {mostrarVoltar && (
              <Link
                href={linkVoltar}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span className="text-sm">Voltar</span>
              </Link>
            )}
            <BotaoSair />
          </div>
        </div>
      </div>

      {/* Linha de saudação com versículo */}
      {session?.user && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100 py-3 px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-slate-900">
                Olá, {primeiroNome}!
              </span>
              {versiculo && (
                <span className="text-slate-600 text-sm">
                  <span className="hidden sm:inline">— </span>
                  <span className="italic">&ldquo;{versiculo.texto}&rdquo;</span>
                  <span className="text-emerald-700 font-medium ml-1">
                    ({versiculo.referencia})
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
