import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Desarrollo de Apps II - Grupo 7",
  description: "Sistema de gestión de pagos - Módulo Pagos y Facturación",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="bg-white min-h-screen">
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Desarrollo de Apps II - Grupo 7</h1>
                  <p className="text-gray-600 font-normal mt-2">Sistema de gestión de pagos - Módulo Pagos y Facturación</p>
                </div>
                <div className="flex items-center">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    En Desarrollo
                  </span>
                </div>
              </div>
            </header>

            <main>
              {children}
            </main>

            <footer className="bg-gray-900 text-white py-8 mt-12">
              <div className="px-6 text-center">
                <p className="font-medium">Plataforma de Pagos DAII - 2C2025</p>
                <p className="text-sm opacity-80 mt-2">Sistema de gestión de pagos</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
