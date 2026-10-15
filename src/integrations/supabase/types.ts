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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_months: {
        Row: {
          data: Json
          month_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          data?: Json
          month_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          data?: Json
          month_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      listlynk_households: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code?: string
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      listlynk_members: {
        Row: {
          display_name: string | null
          household_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          display_name?: string | null
          household_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          display_name?: string | null
          household_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listlynk_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "listlynk_households"
            referencedColumns: ["id"]
          },
        ]
      }
      listlynk_shopping_items: {
        Row: {
          category: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          household_id: string
          id: string
          is_completed: boolean
          name: string
          notes: string | null
          quantity: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by: string
          household_id: string
          id?: string
          is_completed?: boolean
          name: string
          notes?: string | null
          quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          is_completed?: boolean
          name?: string
          notes?: string | null
          quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listlynk_shopping_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "listlynk_households"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          archived: boolean
          category: string
          color: string
          content: string
          created_at: string
          deleted: boolean
          id: string
          items: Json
          kind: string
          metadata: Json
          pinned: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          category?: string
          color: string
          content?: string
          created_at?: string
          deleted?: boolean
          id: string
          items?: Json
          kind?: string
          metadata?: Json
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          category?: string
          color?: string
          content?: string
          created_at?: string
          deleted?: boolean
          id?: string
          items?: Json
          kind?: string
          metadata?: Json
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          fin_ai_usage_count: number
          fin_ai_usage_date: string | null
          full_name: string
          id: string
          notification_lead_days: number
          notifications_enabled: boolean
          notify_due_today: boolean
          notify_overdue: boolean
          theme: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fin_ai_usage_count?: number
          fin_ai_usage_date?: string | null
          full_name?: string
          id: string
          notification_lead_days?: number
          notifications_enabled?: boolean
          notify_due_today?: boolean
          notify_overdue?: boolean
          theme?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fin_ai_usage_count?: number
          fin_ai_usage_date?: string | null
          full_name?: string
          id?: string
          notification_lead_days?: number
          notifications_enabled?: boolean
          notify_due_today?: boolean
          notify_overdue?: boolean
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      signup_requests: {
        Row: {
          approval_email_error: string | null
          approval_email_sent_at: string | null
          auth_user_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          processed_at: string | null
          processed_by: string | null
          status: string
        }
        Insert: {
          approval_email_error?: string | null
          approval_email_sent_at?: string | null
          auth_user_id?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
        }
        Update: {
          approval_email_error?: string | null
          approval_email_sent_at?: string | null
          auth_user_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_fin_ai_quota: { Args: never; Returns: Json }
      delete_current_user: { Args: never; Returns: undefined }
      get_fin_ai_quota: { Args: never; Returns: Json }
      listlynk_create_household: { Args: { p_name?: string }; Returns: string }
      listlynk_is_member: { Args: { p_household_id: string }; Returns: boolean }
      listlynk_is_owner: { Args: { p_household_id: string }; Returns: boolean }
      listlynk_join_household: { Args: { p_code: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
