import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "ShalomHome - Planejamento Financeiro Familiar",
  description: "Sistema de planejamento financeiro familiar baseado em economia familiar, harmonia e transparência.",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
