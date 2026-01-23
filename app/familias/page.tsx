import { getFamiliasForUser } from "@/lib/actions/familias";
import ListaFamilias from "@/components/ListaFamilias";
import FiltroPeriodo from "@/components/FiltroPeriodo";
import Header from "@/components/Header";
import { auth } from "@/lib/auth";

export default async function FamiliasPage() {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-7xl mx-auto px-8 py-16">Aguarde...</main>
      </div>
    );
  }

  const familias = await getFamiliasForUser(userId);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <FiltroPeriodo />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-16">
        {/* Título da Seção */}
        <div className="mb-12 text-center space-y-3">
          <h2 className="text-4xl font-serif font-bold text-slate-900">
            Selecione uma Família
          </h2>
          <p className="text-lg text-slate-600">
            Escolha o lar que deseja gerenciar ou crie uma nova família
          </p>
        </div>

        {/* Grid de Famílias */}
        <div>
          <ListaFamilias familias={familias} />
        </div>

        {/* Informação Adicional */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500">
            Você pode fazer parte de múltiplas famílias e gerenciar suas finanças de forma independente
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
