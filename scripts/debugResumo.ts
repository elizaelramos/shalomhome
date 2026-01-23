import "dotenv/config";
import { getResumoSimples } from "../lib/actions/relatorios";

async function main() {
  const families = [1, 2, 3];
  const tests = [
    { ano: "2025", mes: "01" },
    { ano: "2026", mes: "01" },
  ];

  for (const fam of families) {
    for (const t of tests) {
      const r = await getResumoSimples(fam, t.ano, t.mes);
      console.log(`Familia ${fam} - ${t.ano}-${t.mes}:`, r);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});