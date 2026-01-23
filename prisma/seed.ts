import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  console.log("Iniciando seed...");

  // Criar conexão direta com MySQL
  const connection = await mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "elizaelramos",
    password: "Elizael@011224",
    database: "shalomhome",
  });

  try {
    // Limpar dados existentes
    console.log("Limpando dados existentes...");
    await connection.execute("DELETE FROM transactions");
    await connection.execute("DELETE FROM user_homes");
    await connection.execute("DELETE FROM homes");
    await connection.execute("DELETE FROM users");

    // Criar famílias
    console.log("Criando famílias...");
    const [result1] = await connection.execute(
      "INSERT INTO homes (nome, createdAt, updatedAt) VALUES (?, NOW(), NOW())",
      ["Família Silva"]
    );
    const familiaSilvaId = (result1 as any).insertId;

    const [result2] = await connection.execute(
      "INSERT INTO homes (nome, createdAt, updatedAt) VALUES (?, NOW(), NOW())",
      ["Família Santos"]
    );
    const familiaSantosId = (result2 as any).insertId;

    const [result3] = await connection.execute(
      "INSERT INTO homes (nome, createdAt, updatedAt) VALUES (?, NOW(), NOW())",
      ["Família Oliveira"]
    );
    const familiaOliveiraId = (result3 as any).insertId;

    console.log("Famílias criadas:", {
      familiaSilva: familiaSilvaId,
      familiaSantos: familiaSantosId,
      familiaOliveira: familiaOliveiraId,
    });

    // Transações para Família Silva
    const transacoesSilva = [
      ["Salário Janeiro", 8500.0, "ENTRADA", "Salário", "2025-01-05", familiaSilvaId],
      ["Aluguel", 1800.0, "SAIDA", "Moradia", "2025-01-10", familiaSilvaId],
      ["Supermercado Mensal", 950.0, "SAIDA", "Alimentação", "2025-01-12", familiaSilvaId],
      ["Dízimo", 850.0, "SAIDA", "Dízimos/Ofertas", "2025-01-07", familiaSilvaId],
      ["Conta de Luz", 280.0, "SAIDA", "Moradia", "2025-01-15", familiaSilvaId],
      ["Freelance Design", 1200.0, "ENTRADA", "Freelance", "2025-01-18", familiaSilvaId],
    ];

    // Transações para Família Santos
    const transacoesSantos = [
      ["Salário Janeiro", 6200.0, "ENTRADA", "Salário", "2025-01-05", familiaSantosId],
      ["Financiamento Casa", 1500.0, "SAIDA", "Moradia", "2025-01-08", familiaSantosId],
      ["Supermercado", 720.0, "SAIDA", "Alimentação", "2025-01-10", familiaSantosId],
      ["Plano de Saúde", 450.0, "SAIDA", "Saúde", "2025-01-12", familiaSantosId],
    ];

    // Transações para Família Oliveira
    const transacoesOliveira = [
      ["Salário Principal", 12000.0, "ENTRADA", "Salário", "2025-01-05", familiaOliveiraId],
      ["Rendimentos Investimentos", 800.0, "ENTRADA", "Investimentos", "2025-01-10", familiaOliveiraId],
      ["Aluguel Apartamento", 2500.0, "SAIDA", "Moradia", "2025-01-08", familiaOliveiraId],
      ["Escola dos Filhos", 1800.0, "SAIDA", "Educação", "2025-01-10", familiaOliveiraId],
      ["Supermercado", 1200.0, "SAIDA", "Alimentação", "2025-01-15", familiaOliveiraId],
      ["Cinema em Família", 150.0, "SAIDA", "Lazer", "2025-01-17", familiaOliveiraId],
    ];

    const todasTransacoes = [
      ...transacoesSilva,
      ...transacoesSantos,
      ...transacoesOliveira,
    ];

    console.log("Inserindo transações...");
    for (const t of todasTransacoes) {
      await connection.execute(
        "INSERT INTO transactions (descricao, valor, tipo, categoria, data, homeId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
        t
      );
    }

    console.log(`${todasTransacoes.length} transações criadas!`);
    console.log("Seed concluído com sucesso!");
  } finally {
    await connection.end();
  }
}

main().catch((e) => {
  console.error("Erro no seed:", e);
  process.exit(1);
});
