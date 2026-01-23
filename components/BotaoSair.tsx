"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function BotaoSair() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors"
      title="Sair do sistema"
    >
      <LogOut className="w-4 h-4" />
      <span className="text-sm">Sair</span>
    </button>
  );
}
