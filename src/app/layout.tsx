import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jiw 5G · Simulador de cruce peatonal inteligente",
  description: "Simulador académico web-first para comparar estrategias mMTC y URLLC en un cruce peatonal escolar inteligente.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
