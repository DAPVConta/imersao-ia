/**
 * Traduz os erros do Supabase Auth para português simples: o que houve e o
 * que fazer. Os códigos vêm de `AuthError.code` (supabase-js).
 */
export type ErroDeAuth = { code?: string; status?: number; message?: string; name?: string }

export function mensagemDeErro(erro: ErroDeAuth): string {
  switch (erro.code) {
    case 'invalid_credentials':
      return 'E-mail ou senha não conferem. Confira e tente de novo.'
    case 'email_not_confirmed':
      return 'Este e-mail ainda não foi confirmado. Abra o e-mail de confirmação que o Supabase enviou e depois entre.'
    case 'user_banned':
      return 'Esta conta está bloqueada. Peça ao dono do painel para liberar.'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.'
    case 'weak_password':
      return 'Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.'
    case 'same_password':
      return 'A nova senha é igual à anterior. Escolha uma diferente.'
    case 'otp_expired':
      return 'O link do e-mail expirou ou já foi usado. Peça um novo em "Esqueci minha senha".'
  }
  // Sem resposta do servidor: internet ou Supabase fora do ar.
  if (erro.status === 0 || erro.name === 'AuthRetryableFetchError') {
    return 'Não foi possível falar com o servidor. Confira a internet e tente de novo.'
  }
  return `Não foi possível entrar (${erro.message ?? 'erro desconhecido'}). Tente de novo.`
}

/**
 * Lê o que o Supabase põe no endereço ao voltar de um link de e-mail
 * (`#access_token=...&type=recovery` ou `#error_code=otp_expired&...`).
 */
export function lerRetornoDoLink(hash: string): { recuperacao: boolean; erro: string | null } {
  const p = new URLSearchParams(hash.replace(/^#/, ''))
  const codigo = p.get('error_code')
  const erro = codigo || p.get('error')
    ? mensagemDeErro({ code: codigo ?? undefined, message: p.get('error_description') ?? undefined })
    : null
  return { recuperacao: p.get('type') === 'recovery', erro }
}
