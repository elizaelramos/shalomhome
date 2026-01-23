# Prompt de Criação: Aplicação ShalomHome

## 1. Visão Geral
Crie uma aplicação web de planejamento financeiro familiar chamada **ShalomHome**. O sistema deve ser focado em princípios de mordomia, harmonia e transparência financeira entre membros de um lar. A aplicação deve ser elegante, minimalista e intuitiva.

## 2. Stack Tecnológica
- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide-React ou HeroIcons
- **Componentes de UI:** Radix UI ou Shadcn/UI (opcional, mas recomendado para elegância)
- **Gerenciamento de Estado/Dados:** Server Actions e React Hooks

## 3. Estrutura de Fluxo da Aplicação

### Fase 1: Landing Page (Página Inicial/Dashboard Institucional)
- **Design:** Fundo claro (Slate-50), tipografia serifada para títulos para transmitir paz e autoridade.
- **Conteúdo:** Explicar que o ShalomHome é um sistema de planejamento financeiro familiar baseado na união e providência.
- **Botão Principal:** Um botão de destaque "Entrar no Sistema".

### Fase 2: Seleção de Família (Hub de Lares)
- Após o "Entrar", exibir uma tela de transição elegante.
- Listar "Famílias" às quais o usuário pertence (usar cards brancos com sombras suaves).
- Botão "Criar Nova Família" (estilo card tracejado).
- Ao clicar em uma família, o usuário é direcionado para o Dashboard específico daquela casa.

### Fase 3: Dashboard Interno da Família
- **Resumo Financeiro:** Exibir cards com "Saldo Total", "Rendimentos do Mês" e "Gastos Planejados".
- **Funcionalidades:** - Botão para "Cadastrar Gasto" (Modal).
    - Botão para "Cadastrar Rendimento" (Modal).
    - Lista de transações recentes com categorias (Alimentação, Moradia, Lazer, Dízimos/Ofertas).
- **Gráficos:** Um gráfico simples (barra ou rosca) mostrando a distribuição dos gastos por categoria.

## 4. Requisitos de Banco de Dados (Sugestão de Schema)
O banco de dados deve suportar multi-tenancy por "Home":
- **User:** ID, Nome, Email.
- **Home:** ID, Nome da Família (Ex: Família Silva).
- **User_Home:** Tabela pivô para associar usuários a uma ou mais casas.
- **Transaction:** ID, Descrição, Valor, Tipo (Entrada/Saída), Categoria, HomeID.

## 5. Instruções de Design (Tailwind)
- Use uma paleta de cores baseada em:
    - Primary: `slate-900`
    - Accent: `blue-600` (Paz/Confiança) ou `emerald-600` (Provisão/Crescimento)
    - Background: `slate-50`
- Bordas arredondadas (`rounded-2xl`) para um toque moderno e amigável.
- Espaçamento generoso para evitar poluição visual.

## 6. Tarefa Inicial
1. Crie a estrutura de pastas do Next.js.
2. Implemente a Landing Page institucional.
3. Crie a página de seleção de famílias com dados mockados para visualização.
4. Desenvolva o layout do Dashboard principal com o menu lateral e área de resumo.