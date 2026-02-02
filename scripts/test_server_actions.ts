import { getUnidadesByHome } from "../lib/actions/unidades";
import { getItemCategoriasByHome } from "../lib/actions/itemCategorias";

async function test() {
  console.log("Testando getUnidadesByHome para homeId=8...");
  const unidades = await getUnidadesByHome(8);
  console.log("Unidades encontradas:", unidades);

  console.log("\nTestando getItemCategoriasByHome para homeId=8...");
  const categorias = await getItemCategoriasByHome(8);
  console.log("Categorias encontradas:", categorias);
}

test()
  .then(() => {
    console.log("\nTeste concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro no teste:", error);
    process.exit(1);
  });
