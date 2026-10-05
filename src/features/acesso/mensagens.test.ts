import { describe, expect, it } from 'vitest'
import { lerRetornoDoLink, mensagemDeErro } from './mensagens'

describe('mensagemDeErro', () => {
  it('explica senha errada sem dizer qual dos dois está errado', () => {
    expect(mensagemDeErro({ code: 'invalid_credentials', status: 400 })).toBe('E-mail ou senha não conferem. Confira e tente de novo.')
  })

  it('reconhece falta de conexão', () => {
    expect(mensagemDeErro({ status: 0, name: 'AuthRetryableFetchError', message: 'Failed to fetch' })).toMatch(/internet/)
  })

  it('mostra o detalhe quando o código é desconhecido', () => {
    expect(mensagemDeErro({ code: 'novo_codigo', message: 'algo' })).toContain('(algo)')
  })
})

describe('lerRetornoDoLink', () => {
  it('detecta o link de troca de senha', () => {
    expect(lerRetornoDoLink('#access_token=x&refresh_token=y&type=recovery')).toEqual({ recuperacao: true, erro: null })
  })

  it('traduz link expirado', () => {
    const r = lerRetornoDoLink('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid')
    expect(r.recuperacao).toBe(false)
    expect(r.erro).toMatch(/expirou/)
  })

  it('ignora endereço sem nada do Supabase', () => {
    expect(lerRetornoDoLink('')).toEqual({ recuperacao: false, erro: null })
  })
})
