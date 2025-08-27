import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Função para verificar se o usuário é administrador
 */
async function validateAdminStatus(supabase: any, userId: string) {
  try {
    const { data: adminRecord, error } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('user_id', userId)
      .eq('is_admin', true)
      .single()

    if (error) {
      console.warn(`🚨 [MIDDLEWARE] Usuário não é administrador: ${userId}`, error)
      return false
    }

    console.log(`✅ [MIDDLEWARE] Usuário administrador válido: ${userId}`)
    return true
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro ao verificar status de administrador:', error)
    return false
  }
}

/**
 * Função para verificar se o usuário ainda é válido no sistema
 */
async function validateUserStatus(supabase: any, userId: string) {
  try {
    // Verificar se o perfil ainda existe na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, tipo_usuario, created_at')
      .eq('id', userId)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Perfil não encontrado - usuário foi excluído
        console.warn(`🚨 [MIDDLEWARE] Perfil não encontrado para usuário: ${userId}`)
        return { isValid: false, reason: 'profile_not_found' }
      } else {
        console.error('❌ [MIDDLEWARE] Erro ao buscar perfil:', profileError)
        // Em caso de erro de rede, permitir acesso temporariamente
        return { isValid: true, reason: 'network_error' }
      }
    }

    // Verificar se o perfil está ativo (campo status removido - não existe na tabela)
    // if (profile && profile.status && profile.status === 'inactive') {
    //   console.warn(`🚨 [MIDDLEWARE] Perfil inativo para usuário: ${userId}`)
    //   return { isValid: false, reason: 'profile_inactive' }
    // }

    // Verificar se o usuário ainda existe no Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || user.id !== userId) {
      console.warn(`🚨 [MIDDLEWARE] Usuário não encontrado no Auth: ${userId}`)
      return { isValid: false, reason: 'auth_user_not_found' }
    }

    // Verificar consistência entre Auth e Profile
    if (profile.email && user.email && profile.email !== user.email) {
      console.warn(`🚨 [MIDDLEWARE] Inconsistência de email para usuário: ${userId}`)
      return { isValid: false, reason: 'email_mismatch' }
    }

    console.log(`✅ [MIDDLEWARE] Usuário válido: ${userId}`)
    return { isValid: true, profile }
    
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro inesperado na validação:', error)
    // Em caso de erro inesperado, permitir acesso temporariamente
    return { isValid: true, reason: 'unexpected_error' }
  }
}

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

    // Lista de páginas públicas que não requerem autenticação
    const publicPages = ['/login', '/cadastro', '/', '/veiculos', '/agencias']
    const isPublicPage = publicPages.some(page => 
      request.nextUrl.pathname === page || 
      request.nextUrl.pathname.startsWith('/veiculo/') ||
      request.nextUrl.pathname.startsWith('/agencia/')
    )

    // Se há uma sessão, verificar se o usuário ainda é válido (apenas para páginas protegidas)
    if (session?.user && !isPublicPage) {
      const validation = await validateUserStatus(supabase, session.user.id)
      
      if (!validation.isValid && validation.reason !== 'network_error' && validation.reason !== 'unexpected_error') {
        console.warn(`🚨 [MIDDLEWARE] Usuário inválido detectado: ${validation.reason}`)
        
        // Fazer logout do usuário inválido
        await supabase.auth.signOut()
        
        // Redirecionar para login com mensagem de erro
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/login'
        redirectUrl.searchParams.set('error', 'session_expired')
        redirectUrl.searchParams.set('reason', validation.reason || 'unknown')
        
        const response = NextResponse.redirect(redirectUrl)
        
        // Limpar cookies de autenticação
        response.cookies.delete('sb-access-token')
        response.cookies.delete('sb-refresh-token')
        
        return response
      }
    }

    // Para páginas públicas, não fazer validação adicional mesmo se houver sessão
    if (isPublicPage) {
      return NextResponse.next()
    }

    // Se tentar acessar login ou cadastro estando logado, redirecionar para home
    // Exceção: permitir acesso a /admin/login mesmo estando logado (para troca de conta admin)
    if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/cadastro')) {
      // Não redirecionar se for a página de login administrativo
      if (request.nextUrl.pathname !== '/admin/login' as any) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/'
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Se não estiver logado e tentar acessar páginas protegidas, redirecionar para login
    if (!session && !isPublicPage) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Se tentar acessar rotas administrativas (exceto a página de login)
    if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
      if (!session?.user) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/admin/login'
        return NextResponse.redirect(redirectUrl)
      }

      // Verificar se o usuário é administrador
      const isAdmin = await validateAdminStatus(supabase, session.user.id)
      if (!isAdmin) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/admin/login'
        redirectUrl.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(redirectUrl)
      }
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
    '/',
    '/login',
    '/cadastro',
    '/admin/:path*',
    '/painel-agencia/:path*',
    '/perfil/:path*',
    '/planos/:path*',
    '/cadastro-veiculo/:path*',
    '/editar-veiculo/:path*',
    '/meus-veiculos/:path*',
    '/veiculos/:path*',
    '/veiculo/:path*',
    '/dashboard/:path*'
  ]
}