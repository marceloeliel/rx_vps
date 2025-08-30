import './globals.css'

export const metadata = {
  title: 'RX Negócio',
  description: 'Sistema de Gestão Automotiva',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
