import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Refresh session if expired - required for Server Components
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // Se tentar acessar login ou cadastro estando logado, redirecionar para home
    if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/cadastro')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }

    // Se não estiver logado e tentar acessar páginas protegidas, redirecionar para login
    if (!session && !['/login', '/cadastro'].includes(request.nextUrl.pathname)) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Se tentar acessar o painel da agência
    if (request.nextUrl.pathname === '/painel-agencia') {
      // Verificar se o usuário é uma agência
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tipo_usuario')
        .eq('id', session?.user?.id ?? '')
        .single()

      if (profileError || !profile || profile.tipo_usuario !== 'agencia') {
        // Redirecionar para o perfil com mensagem de erro
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/perfil'
        redirectUrl.searchParams.set('error', 'agency_access_denied')
        return NextResponse.redirect(redirectUrl)
      }
    }

    return NextResponse.next()
  } catch (e) {
    // Em caso de erro, redirecionar para login
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }
}

// Configurar em quais rotas o middleware será executado
export const config = {
  matcher: [
    '/login',
    '/cadastro',
    '/painel-agencia/:path*',
    '/perfil/:path*',
    '/planos/:path*',
    '/cadastro-veiculo/:path*',
    '/editar-veiculo/:path*',
    '/meus-veiculos/:path*'
  ]
}