import type { Metadata } from "next";
import "driver.js/dist/driver.css";
import "./globals.css";
import "./presentation.css";

export const metadata: Metadata = {
  title: "Jiw 5G · Simulador académico mMTC + URLLC",
  description: "Simulador académico y demostración interactiva de un cruce peatonal escolar inteligente con mMTC, URLLC, REPLAY y contexto vial TomTom.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
