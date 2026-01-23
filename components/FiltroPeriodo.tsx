"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const months = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export default function FiltroPeriodo() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const now = new Date();
  const currentYear = now.getFullYear();

  const [ano, setAno] = useState<string>(searchParams?.get("ano") ?? String(currentYear));
  const [mes, setMes] = useState<string>(
    searchParams?.get("mes") ?? String(String(now.getMonth() + 1).padStart(2, "0"))
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (ano) params.set("ano", ano);
    else params.delete("ano");

    if (mes) params.set("mes", mes);
    else params.delete("mes");

    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ano, mes]);

  const years = Array.from({ length: 11 }).map((_, i) => String(currentYear - 5 + i));

  return (
    <div className="py-4 px-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 font-semibold">Período</span>
          <div className="flex items-center gap-3">
            <select
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Escolha o ano e mês para consultar ou cadastrar transações neste período.
        </p>
      </div>
    </div>
  );
}
