import "dotenv/config";
import { getTransacoesByFamilia } from "../lib/actions/transacoes";

async function main() {
  const r1 = await getTransacoesByFamilia(1, '2025', '01', 1, 2);
  console.log('Pagina 1:', r1);
  const r2 = await getTransacoesByFamilia(1, '2025', '01', 2, 2);
  console.log('Pagina 2:', r2);
}

main().catch(e => { console.error(e); process.exit(1); });