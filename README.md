# ShalomHome

Sistema de planejamento financeiro familiar fundamentado em economia familiar, harmonia e transparência.

## Sobre o Projeto

ShalomHome é uma aplicação web que ajuda famílias a gerenciarem suas finanças de forma colaborativa, promovendo união, responsabilidade e propósito no uso dos recursos.

## Stack Tecnológica

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide React
- **Runtime:** Node.js

## Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Variáveis de ambiente necessárias (exemplo em `.env`):
```dotenv
DATABASE_URL="mysql://user:pass@localhost:3306/shalomhome"
AUTH_SECRET="sua_chave_de_autenticacao"
AUTH_URL="http://localhost:3000"

# SMTP (opcional, para envio de emails)
SMTP_HOST="smtp.exemplo.com"
SMTP_PORT="587"
SMTP_USER="seu_usuario_smtp"
SMTP_PASS="sua_senha_smtp"
SMTP_SECURE="false" # true para 465/TLS
EMAIL_FROM="ShalomHome <no-reply@seudominio.com>"
```

> Dica: para desenvolvimento use serviços como Mailtrap (https://mailtrap.io) ou Ethereal (https://ethereal.email) para capturar emails de teste.

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Teste envio de email (dev):
- Use o endpoint de teste: `GET /api/debug/send-test-email?email=seu@email.com`

## Estrutura do Projeto

```
shalomhome/
├── app/
│   ├── page.tsx                    # Landing Page institucional
│   ├── layout.tsx                  # Layout raiz
│   ├── globals.css                 # Estilos globais
│   └── familias/
│       ├── page.tsx                # Hub de seleção de famílias
│       ├── nova/
│       │   └── page.tsx            # Criação de nova família
│       └── [id]/
│           └── page.tsx            # Dashboard da família
├── components/                      # Componentes reutilizáveis
│   ├── Modal.tsx                   # Modal base reutilizável
│   ├── ModalGasto.tsx              # Modal de cadastro de gastos
│   ├── ModalRendimento.tsx         # Modal de cadastro de rendimentos
│   └── ListaTransacoes.tsx         # Lista de transações recentes
├── public/                         # Arquivos estáticos
└── ...                             # Arquivos de configuração
```

## Funcionalidades Implementadas

- ✅ Landing Page institucional
- ✅ Seleção de famílias (Hub de Lares)
- ✅ Criação de nova família
- ✅ Dashboard interativo da família
- ✅ Cadastro de rendimentos (modal interativo)
- ✅ Cadastro de gastos (modal interativo)
- ✅ Lista de transações recentes com categorias
- ✅ Cálculo automático de saldos e totais
- ⏳ Gráficos de visualização de dados
- ⏳ Sistema de autenticação
- ⏳ Banco de dados e persistência
- ⏳ Sistema multi-usuário

## Licença

Desenvolvido para servir famílias.
