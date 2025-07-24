import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'RX NEGOCIO - Plataforma de Negócios Automotivos'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#fff',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '40px' }}>
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150' viewBox='0 0 300 150'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='48' font-weight='bold'%3E%3Ctspan fill='%23f97316'%3ERX%3C/tspan%3E%3Ctspan fill='%23333333'%3E Veículos%3C/tspan%3E%3C/text%3E%3C/svg%3E"
            alt="RX Veículos"
            width={300}
            height={150}
          />
        </div>

        {/* Título */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center',
            marginBottom: '24px',
            lineHeight: 1.2,
          }}
        >
          Conectando Agências de Carros com Compradores
        </div>

        {/* Subtítulo */}
        <div
          style={{
            fontSize: '24px',
            color: '#666',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          Plataforma ideal para compra e venda de veículos com agilidade, segurança e praticidade
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
} 