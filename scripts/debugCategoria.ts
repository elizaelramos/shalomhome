import "dotenv/config";
import { getTransacoesPorCategoria } from "../lib/actions/relatorios";

async function main() {
  const r = await getTransacoesPorCategoria(1, 'Alimentação', '2025', '01');
  console.log('Detalhes Alimentação:', r);
}

main().catch((e) => { console.error(e); process.exit(1); });