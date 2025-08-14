
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
      categories: {
        Row: {
          id: string
          name: string
          color: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      health_profiles: {
        Row: {
          created_at: string
          diet_preference: "Normal" | "Vegetarian" | "RendahGula" | "Ibu Hamil" | "Badan Berisi" | "Pertumbuhan Anak"
          user_id: string
        }
        Insert: {
          created_at?: string
          diet_preference: "Normal" | "Vegetarian" | "RendahGula" | "Ibu Hamil" | "Badan Berisi" | "Pertumbuhan Anak"
          user_id: string
        }
        Update: {
          created_at?: string
          diet_preference?: "Normal" | "Vegetarian" | "RendahGula" | "Ibu Hamil" | "Badan Berisi" | "Pertumbuhan Anak"
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string
          date: string
          description: string
          id: string
          spending_analysis: string | null
          type: "INCOME" | "EXPENSE"
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          created_at?: string
          date: string
          description: string
          id?: string
          spending_analysis?: string | null
          type: "INCOME" | "EXPENSE"
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          spending_analysis?: string | null
          type?: "INCOME" | "EXPENSE"
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
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
      DietPreference: "Normal" | "Vegetarian" | "RendahGula" | "Ibu Hamil" | "Badan Berisi" | "Pertumbuhan Anak"
      TransactionType: "INCOME" | "EXPENSE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}