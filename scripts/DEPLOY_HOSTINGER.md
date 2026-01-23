# Deploy para servidor Hostinger (passo a passo)

Este documento descreve os passos mínimos e os comandos práticos para aplicar migrations do Prisma e colocar a aplicação em produção no seu servidor Linux (Hostinger).

> Premissas:
> - Você já criou o banco `shalomhome` no servidor MySQL (produção).
> - Você configurou as variáveis de ambiente no `.env` do servidor (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `SMTP_*`, `EMAIL_FROM`, `NODE_ENV=production`).

## 1) Atualizar repositório
```bash
cd /var/www/shalomhome   # ajuste para seu diretório
git pull origin main
```

## 2) Instalar dependências
```bash
npm ci
```

## 3) Aplicar migrations do Prisma (recomendado)
- Isto aplicará os arquivos presentes em `prisma/migrations` e deixará o banco com a estrutura atual.

```bash
npx prisma migrate deploy
```

Se preferir verificar antes, você pode ver as migrations já aplicadas com:
```bash
npx prisma migrate status --schema=prisma/schema.prisma
```

## 4) Build e start
```bash
npm run build
# Se usar systemd (recomendado):
sudo systemctl restart shalomhome
# ou com pm2:
pm2 start --name shalomhome npm -- start
# Ou, em um teste rápido:
npm run start
```

## 5) Checagens rápidas (smoke tests)
- Verificar se o app responde:
```bash
curl -I http://127.0.0.1:3000/
```
- Verificar se a coluna `apelido` existe:
```bash
mysql -u <DB_USER> -p -D shalomhome -e "SHOW COLUMNS FROM users LIKE 'apelido';"
```
- Testar envio de email (dev):
```bash
curl "http://127.0.0.1:3000/api/debug/send-test-email?email=seu@email.com"
```

## 6) Dicas e observações
- As variáveis críticas a configurar são: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `EMAIL_FROM`, `NODE_ENV=production`.
- Recomendo criar um `systemd` unit para manter o app rodando e configurar Nginx como reverse proxy com SSL (Let's Encrypt).
- Depois do deploy, valide fluxos-chave: cadastro, login, adicionar membro (email existente / email novo), envio de email de aviso.

## 7) Uso do script pronto
Criei um script utilitário `scripts/apply_migrations_and_restart.sh` que automatiza o `git pull`, `npm ci`, `npx prisma migrate deploy`, `npm run build` e tenta reiniciar o serviço (`systemd` ou `pm2`).

Exemplo de uso com email de teste:
```bash
cd /var/www/shalomhome
TEST_EMAIL=meu@teste.com ./scripts/apply_migrations_and_restart.sh
```

---
Se quiser, quando estiver logado no servidor eu posso executar o script por você (com sua autorização) para aplicar as migrations e validar tudo em tempo real.