
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          budget_data: Json
          created_at: string
          user_id: string
        }
        Insert: {
          budget_data: Json
          created_at?: string
          user_id: string
        }
        Update: {
          budget_data?: Json
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_profiles: {
        Row: {
          created_at: string
          diet_preference: Database["public"]["Enums"]["DietPreference"]
          user_id: string
        }
        Insert: {
          created_at?: string
          diet_preference: Database["public"]["Enums"]["DietPreference"]
          user_id: string
        }
        Update: {
          created_at?: string
          diet_preference?: Database["public"]["Enums"]["DietPreference"]
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: Database["public"]["Enums"]["ExpenseCategory"] | null
          created_at: string
          date: string
          description: string
          id: string
          spending_analysis:
            | Database["public"]["Enums"]["SpendingAnalysis"]
            | null
          type: Database["public"]["Enums"]["TransactionType"]
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category?: Database["public"]["Enums"]["ExpenseCategory"] | null
          created_at?: string
          date: string
          description: string
          id?: string
          spending_analysis?:
            | Database["public"]["Enums"]["SpendingAnalysis"]
            | null
          type: Database["public"]["Enums"]["TransactionType"]
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: Database["public"]["Enums"]["ExpenseCategory"] | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          spending_analysis?:
            | Database["public"]["Enums"]["SpendingAnalysis"]
            | null
          type?: Database["public"]["Enums"]["TransactionType"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      DietPreference: "Normal" | "Vegetarian" | "RendahGula"
      ExpenseCategory:
        | "Makanan"
        | "Transportasi"
        | "Tagihan"
        | "Hiburan"
        | "Belanja"
        | "Kesehatan"
        | "Lainnya"
      SpendingAnalysis: "Hemat" | "Wajar" | "Cenderung Boros"
      TransactionType: "INCOME" | "EXPENSE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
