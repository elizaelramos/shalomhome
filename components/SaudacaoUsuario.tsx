import { BookOpen } from "lucide-react";

interface Versiculo {
  id: number;
  texto: string;
  referencia: string;
}

interface SaudacaoUsuarioProps {
  nomeUsuario: string;
  versiculo: Versiculo | null;
}

export default function SaudacaoUsuario({ nomeUsuario, versiculo }: SaudacaoUsuarioProps) {
  // Pegar primeiro nome
  const primeiroNome = nomeUsuario.split(" ")[0];

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Olá, {primeiroNome}!
          </h3>
          {versiculo ? (
            <div>
              <p className="text-slate-700 italic leading-relaxed">
                &ldquo;{versiculo.texto}&rdquo;
              </p>
              <p className="text-sm text-emerald-700 font-medium mt-2">
                — {versiculo.referencia}
              </p>
            </div>
          ) : (
            <p className="text-slate-600">
              Que Deus abençoe suas finanças!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
