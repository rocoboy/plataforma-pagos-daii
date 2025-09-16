import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payments API',
  description: 'API del módulo de pagos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}
