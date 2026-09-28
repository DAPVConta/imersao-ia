// ARQUIVO GERADO — não editar à mão.
// Regenerar depois de toda migração: `npm run gerar-tipos`
// (ou pela ferramenta generate_typescript_types do MCP do Supabase).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          atualizado_em: string
          categoria_id: string | null
          competencia_id: string | null
          criado_em: string
          data_prevista: string
          descricao: string
          id: string
          lancamento_id: string | null
          observacoes: string | null
          origem: Database["public"]["Enums"]["origem_lancamento"]
          situacao: Database["public"]["Enums"]["situacao_agendamento"]
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          usuario_id: string | null
          valor: number
        }
        Insert: {
          atualizado_em?: string
          categoria_id?: string | null
          competencia_id?: string | null
          criado_em?: string
          data_prevista: string
          descricao: string
          id?: string
          lancamento_id?: string | null
          observacoes?: string | null
          origem: Database["public"]["Enums"]["origem_lancamento"]
          situacao?: Database["public"]["Enums"]["situacao_agendamento"]
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          usuario_id?: string | null
          valor: number
        }
        Update: {
          atualizado_em?: string
          categoria_id?: string | null
          competencia_id?: string | null
          criado_em?: string
          data_prevista?: string
          descricao?: string
          id?: string
          lancamento_id?: string | null
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_lancamento"]
          situacao?: Database["public"]["Enums"]["situacao_agendamento"]
          tipo?: Database["public"]["Enums"]["tipo_lancamento"]
          usuario_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_competencia_id_fkey"
            columns: ["competencia_id"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_competencia_id_fkey"
            columns: ["competencia_id"]
            isOneToOne: false
            referencedRelation: "vw_gastos_por_categoria"
            referencedColumns: ["competencia_id"]
          },
          {
            foreignKeyName: "agendamentos_competencia_id_fkey"
            columns: ["competencia_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_competencia"
            referencedColumns: ["competencia_id"]
          },
          {
            foreignKeyName: "agendamentos_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "lancamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "vw_lancamentos_detalhados"
            referencedColumns: ["id"]
          },
        ]
      }
      cartoes: {
        Row: {
          apelido: string
          ativo: boolean
          atualizado_em: string
          bandeira: string | null
          conta_id: string | null
          criado_em: string
          dia_fechamento: number | null
          dia_vencimento: number | null
          id: string
          limite_total: number | null
          numero_final: string | null
          usuario_id: string | null
        }
        Insert: {
          apelido: string
          ativo?: boolean
          atualizado_em?: string
          bandeira?: string | null
          conta_id?: string | null
          criado_em?: string
          dia_fechamento?: number | null
          dia_vencimento?: number | null
          id?: string
          limite_total?: number | null
          numero_final?: string | null
          usuario_id?: string | null
        }
        Update: {
          apelido?: string
          ativo?: boolean
          atualizado_em?: string
          bandeira?: string | null
          conta_id?: string | null
          criado_em?: string
          dia_fechamento?: number | null
          dia_vencimento?: number | null
          id?: string
          limite_total?: number | null
          numero_final?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cartoes_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          atualizado_em: string
          cor_token: string
          criado_em: string
          id: string
          natureza: Database["public"]["Enums"]["natureza_categoria"]
          nome: string
          ordem: number
          sistema: boolean
          slug: string
          usuario_id: string | null
        }
        Insert: {
          atualizado_em?: string
          cor_token?: string
          criado_em?: string
          id?: string
          natureza?: Database["public"]["Enums"]["natureza_categoria"]
          nome: string
          ordem?: number
          sistema?: boolean
          slug: string
          usuario_id?: string | null
        }
        Update: {
          atualizado_em?: string
          cor_token?: string
          criado_em?: string
          id?: string
          natureza?: Database["public"]["Enums"]["natureza_categoria"]
          nome?: string
          ordem?: number
          sistema?: boolean
          slug?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      competencias: {
        Row: {
          ano: number
          atualizado_em: string
          criado_em: string
          id: string
          mes: number
          observacoes: string | null
          referencia: string | null
          saldo_conta_anterior: number | null
          saldo_conta_final: number | null
          usuario_id: string | null
        }
        Insert: {
          ano: number
          atualizado_em?: string
          criado_em?: string
          id?: string
          mes: number
          observacoes?: string | null
          referencia?: string | null
          saldo_conta_anterior?: number | null
          saldo_conta_final?: number | null
          usuario_id?: string | null
        }
        Update: {
          ano?: number
          atualizado_em?: string
          criado_em?: string
          id?: string
          mes?: number
          observacoes?: string | null
          referencia?: string | null
          saldo_conta_anterior?: number | null
          saldo_conta_final?: number | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      contas: {
        Row: {
          agencia: string | null
          apelido: string
          ativa: boolean
          atualizado_em: string
          criado_em: string
          id: string
          instituicao: string | null
          numero_final: string | null
          usuario_id: string | null
        }
        Insert: {
          agencia?: string | null
          apelido: string
          ativa?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          instituicao?: string | null
          numero_final?: string | null
          usuario_id?: string | null
        }
        Update: {
          agencia?: string | null
          apelido?: string
          ativa?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          instituicao?: string | null
          numero_final?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      faturas: {
        Row: {
          atualizado_em: string
          cartao_id: string | null
          competencia_id: string
          compras_periodo: number | null
          criado_em: string
          data_fechamento: string | null
          data_vencimento: string | null
          id: string
          limite_total: number | null
          pagamento: number | null
          pagamento_minimo: number | null
          saldo_anterior: number | null
          total: number | null
          usuario_id: string | null
        }
        Insert: {
          atualizado_em?: string
          cartao_id?: string | null
          competencia_id: string
          compras_periodo?: number | null
          criado_em?: string
          data_fechamento?: string | null
          data_vencimento?: string | null
          id?: string
          limite_total?: number | null
          pagamento?: number | null
          pagamento_minimo?: number | null
          saldo_anterior?: number | null
          total?: number | null
          usuario_id?: string | null
        }
        Update: {
          atualizado_em?: string
          cartao_id?: string | null
          competencia_id?: string
          compras_periodo?: number | null
          criado_em?: string
          data_fechamento?: string | null
          data_vencimento?: string | null
          id?: string
          limite_total?: number | null
          pagamento?: number | null
          pagamento_minimo?: number | null
          saldo_anterior?: number | null
          total?: number | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cartao_id_fkey"
            columns: ["cartao_id"]
            isOneToOne: false
            referencedRelation: "cartoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_competencia_id_fkey"
            columns: ["competencia_id"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_competencia_id_fkey"
            columns: ["competencia_id"]
            isOneToOne: false
            referencedRelation: "vw_gastos_por_categoria"
            referencedColumns: ["competencia_id"]
          },
          {
            foreignKeyName: "faturas_competencia_id_fkey"
            columns: ["competencia_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_competencia"
            referencedColumns: ["competencia_id"]
          },
        ]
      }
      lancamentos: {
        Row: {
          atualizado_em: string
          categoria_id: string | null
          categorizado_por: Database["public"]["Enums"]["tipo_regra"] | null
          competencia_id: string
          conta_id: string | null
          criado_em: string
          data: string
          descricao: string
          documento: string | null
          fatura_id: string | null
          id: string
          mcc: string | null
          origem: Database["public"]["Enums"]["origem_lancamento"]
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          tipo_operacao: string | null
          usuario_id: string | null
          valor: number
        }
        Insert: {
          atualizado_em?: string
          categoria_id?: string | null
          categorizado_por?: Database["public"]["Enums"]["tipo_regra"] | null
          competencia_id: string
          conta_id?: string | null
          criado_em?: string
          data: string
          descricao: string
          documento?: string | null
          fatura_id?: string | null
          id?: string
          mcc?: string | null
          origem: Database["public"]["Enums"]["origem_lancamento"]
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          tipo_operacao?: string | null
          usuario_id?: string | null
          valor: number
        }
        Update: {
          atualizado_em?: string
          categoria_id?: string | null
          categorizado_por?: Database["public"]["Enums"]["tipo_regra"] | null
          competencia_id?: string
          conta_id?: string | null
          criado_em?: string
          data?: string
          descricao?: string
          documento?: string | null
          fatura_id?: string | null
          id?: string
          mcc?: string | null
          origem?: Database["public"]["Enums"]["origem_lancamento"]
          tipo?: Database["public"]["Enums"]["tipo_lancamento"]
          tipo_operacao?: string | null
          usuario_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_competencia_id_fkey"
            columns: ["competencia_id"]
            isOneToOne: false
            referencedRelation: "competencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_competencia_id_fkey"
            columns: ["competencia_id"]
            isOneToOne: false
            referencedRelation: "vw_gastos_por_categoria"
            referencedColumns: ["competencia_id"]
          },
          {
            foreignKeyName: "lancamentos_competencia_id_fkey"
            columns: ["competencia_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_competencia"
            referencedColumns: ["competencia_id"]
          },
          {
            foreignKeyName: "lancamentos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_fatura_id_fkey"
            columns: ["fatura_id"]
            isOneToOne: false
            referencedRelation: "faturas"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          atualizado_em: string
          criado_em: string
          fuso_horario: string
          id: string
          moeda: string
          nome_exibicao: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          fuso_horario?: string
          id: string
          moeda?: string
          nome_exibicao?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          fuso_horario?: string
          id?: string
          moeda?: string
          nome_exibicao?: string | null
        }
        Relationships: []
      }
      regras_categorizacao: {
        Row: {
          ativa: boolean
          atualizado_em: string
          categoria_id: string | null
          chave: string
          criado_em: string
          id: string
          prioridade: number
          resolver_por_operacao: boolean
          rotulo: string
          tipo: Database["public"]["Enums"]["tipo_regra"]
          tipo_sugerido: Database["public"]["Enums"]["tipo_lancamento"] | null
          usuario_id: string | null
        }
        Insert: {
          ativa?: boolean
          atualizado_em?: string
          categoria_id?: string | null
          chave: string
          criado_em?: string
          id?: string
          prioridade?: number
          resolver_por_operacao?: boolean
          rotulo: string
          tipo: Database["public"]["Enums"]["tipo_regra"]
          tipo_sugerido?: Database["public"]["Enums"]["tipo_lancamento"] | null
          usuario_id?: string | null
        }
        Update: {
          ativa?: boolean
          atualizado_em?: string
          categoria_id?: string | null
          chave?: string
          criado_em?: string
          id?: string
          prioridade?: number
          resolver_por_operacao?: boolean
          rotulo?: string
          tipo?: Database["public"]["Enums"]["tipo_regra"]
          tipo_sugerido?: Database["public"]["Enums"]["tipo_lancamento"] | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regras_categorizacao_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_agenda_detalhada: {
        Row: {
          atrasado: boolean | null
          categoria: string | null
          categoria_slug: string | null
          competencia_id: string | null
          cor_token: string | null
          criado_em: string | null
          data_prevista: string | null
          descricao: string | null
          dias_restantes: number | null
          id: string | null
          lancamento_id: string | null
          observacoes: string | null
          origem: Database["public"]["Enums"]["origem_lancamento"] | null
          situacao: Database["public"]["Enums"]["situacao_agendamento"] | null
          tipo: Database["public"]["Enums"]["tipo_lancamento"] | null
          usuario_id: string | null
          valor: number | null
          valor_com_sinal: number | null
        }
        Relationships: []
      }
      vw_gastos_por_categoria: {
        Row: {
          ano: number | null
          categoria: string | null
          categoria_slug: string | null
          competencia_id: string | null
          cor_token: string | null
          mes: number | null
          percentual: number | null
          qtd_lancamentos: number | null
          total: number | null
          usuario_id: string | null
        }
        Relationships: []
      }
      vw_lancamentos_detalhados: {
        Row: {
          ano: number | null
          categoria: string | null
          categoria_slug: string | null
          competencia_id: string | null
          cor_token: string | null
          data: string | null
          descricao: string | null
          documento: string | null
          id: string | null
          mcc: string | null
          mes: number | null
          origem: Database["public"]["Enums"]["origem_lancamento"] | null
          referencia: string | null
          tipo: Database["public"]["Enums"]["tipo_lancamento"] | null
          tipo_operacao: string | null
          usuario_id: string | null
          valor: number | null
          valor_com_sinal: number | null
        }
        Relationships: []
      }
      vw_resumo_competencia: {
        Row: {
          ano: number | null
          competencia_id: string | null
          despesas: number | null
          despesas_cartao: number | null
          despesas_conta: number | null
          mes: number | null
          qtd_lancamentos: number | null
          receitas: number | null
          referencia: string | null
          resultado: number | null
          saldo_conta_anterior: number | null
          saldo_conta_final: number | null
          transferencias: number | null
          usuario_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      natureza_categoria: "receita" | "despesa" | "transferencia"
      origem_lancamento: "conta" | "cartao"
      situacao_agendamento: "pendente" | "realizado" | "cancelado"
      tipo_lancamento: "receita" | "despesa" | "transferencia"
      tipo_regra: "cnpj" | "mcc" | "palavra_chave"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])> =
  (PublicSchema["Tables"] & PublicSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      natureza_categoria: ["receita", "despesa", "transferencia"],
      origem_lancamento: ["conta", "cartao"],
      situacao_agendamento: ["pendente", "realizado", "cancelado"],
      tipo_lancamento: ["receita", "despesa", "transferencia"],
      tipo_regra: ["cnpj", "mcc", "palavra_chave"],
    },
  },
} as const
