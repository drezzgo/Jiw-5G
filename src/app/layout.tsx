import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Crosswalk 5G Simulator",
  description: "Academic mMTC + URLLC simulation for a school pedestrian crossing",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
