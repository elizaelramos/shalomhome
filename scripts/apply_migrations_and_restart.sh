#!/usr/bin/env bash
set -euo pipefail

# Script de deploy básico para Hostinger
# Uso: no servidor, dentro do diretório do repo (ex: /var/www/shalomhome)
# TEST_EMAIL pode ser passado no ambiente para testar o endpoint de email

REPO_DIR="$(pwd)"

echo "[deploy] working dir: $REPO_DIR"

echo "[deploy] pull latest from origin/main"
git pull origin main

echo "[deploy] installing dependencies"
npm ci

if [ ! -f .env ]; then
  echo "[error] .env not found. Crie um .env com DATABASE_URL e outras variáveis de produção." >&2
  exit 1
fi

echo "[deploy] applying prisma migrations"
npx prisma migrate deploy

echo "[deploy] building app"
npm run build

# Restart service (systemd) or pm2 fallback
echo "[deploy] restarting service"
if sudo systemctl restart shalomhome 2>/dev/null; then
  echo "[deploy] systemd service 'shalomhome' restarted"
elif command -v pm2 >/dev/null 2>&1 && pm2 restart shalomhome >/dev/null 2>&1; then
  echo "[deploy] pm2 process 'shalomhome' restarted"
else
  echo "[warn] não consegui reiniciar automaticamente. Reinicie manualmente (systemd/pm2) ou execute 'npm run start'" >&2
fi

sleep 2

# Health check - tenta portas 3000 e 3001
echo "[deploy] health check"
if curl -fsS http://127.0.0.1:3000/ > /dev/null 2>&1; then
  echo "[deploy] app up at http://127.0.0.1:3000"
elif curl -fsS http://127.0.0.1:3001/ > /dev/null 2>&1; then
  echo "[deploy] app up at http://127.0.0.1:3001"
else
  echo "[error] app não respondeu nas portas 3000/3001" >&2
fi

# DB sanity check (requires mysql client)
if command -v mysql >/dev/null 2>&1; then
  echo "[deploy] verificando coluna 'apelido' na tabela users"
  echo "SHOW COLUMNS FROM users LIKE 'apelido';" | mysql -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" || true
else
  echo "[info] mysql client não encontrado; para verificar manualmente execute:"
  echo "  mysql -u <USER> -p -D <DB_NAME> -e \"SHOW COLUMNS FROM users LIKE 'apelido';\""
fi

# Test email endpoint
if [ -n "${TEST_EMAIL:-}" ]; then
  echo "[deploy] enviando email de teste para $TEST_EMAIL"
  curl -fsS "http://127.0.0.1:3000/api/debug/send-test-email?email=${TEST_EMAIL}" || echo "[warn] request retornou erro"
else
  echo "[info] para enviar email de teste, exporte TEST_EMAIL e reexecute o script:" 
  echo "  TEST_EMAIL=seu@email.com ./scripts/apply_migrations_and_restart.sh"
fi

echo "[deploy] concluído"