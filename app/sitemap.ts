import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rxnegocios.com.br'
  
  const routes = [
    '',
    '/planos',
    '/veiculos',
    '/agencias',
    '/cadastro',
    '/cadastro-agencia',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
} 