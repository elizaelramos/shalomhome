import RelatoriosClient from "@/components/RelatoriosClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RelatoriosPage({ params }: PageProps) {
  const { id } = await params;
  const familiaId = parseInt(id, 10);

  if (isNaN(familiaId)) return <div>Família inválida</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="py-6 px-8 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-slate-900">Relatórios</h1>
          <div className="flex items-center gap-4">
            <a href={`/familias/${familiaId}`} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span className="text-sm">Voltar</span>
            </a>
            <div className="hidden md:block">
              {/* Usar BotaoSair para executar signOut */}
              <a href="/login" className="flex items-center gap-2 text-slate-600 hover:text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                <span className="text-sm">Sair</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <RelatoriosClient familiaId={familiaId} />
      </main>
    </div>
  );
}
