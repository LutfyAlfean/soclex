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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          created_at: string | null
          hostname: string
          id: string
          ip_address: string
          last_heartbeat: string | null
          os: string | null
          server_id: string | null
          status: Database["public"]["Enums"]["agent_status"]
          updated_at: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          hostname: string
          id?: string
          ip_address: string
          last_heartbeat?: string | null
          os?: string | null
          server_id?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          hostname?: string
          id?: string
          ip_address?: string
          last_heartbeat?: string | null
          os?: string | null
          server_id?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          server_id: string | null
          severity: Database["public"]["Enums"]["threat_severity"]
          source: string | null
          threat_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          server_id?: string | null
          severity?: Database["public"]["Enums"]["threat_severity"]
          source?: string | null
          threat_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          server_id?: string | null
          severity?: Database["public"]["Enums"]["threat_severity"]
          source?: string | null
          threat_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_threat_id_fkey"
            columns: ["threat_id"]
            isOneToOne: false
            referencedRelation: "threats"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string | null
          email_address: string | null
          email_enabled: boolean | null
          id: string
          telegram_bot_token: string | null
          telegram_chat_id: string | null
          telegram_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_address?: string | null
          email_enabled?: boolean | null
          id?: string
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          telegram_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_address?: string | null
          email_enabled?: boolean | null
          id?: string
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          telegram_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      server_logs: {
        Row: {
          created_at: string | null
          id: string
          log_type: string
          message: string
          metadata: Json | null
          server_id: string
          severity: Database["public"]["Enums"]["threat_severity"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_type: string
          message: string
          metadata?: Json | null
          server_id: string
          severity?: Database["public"]["Enums"]["threat_severity"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          log_type?: string
          message?: string
          metadata?: Json | null
          server_id?: string
          severity?: Database["public"]["Enums"]["threat_severity"] | null
        }
        Relationships: [
          {
            foreignKeyName: "server_logs_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      server_metrics: {
        Row: {
          cpu_usage: number
          disk_usage: number
          id: string
          memory_usage: number
          network_in: number | null
          network_out: number | null
          recorded_at: string | null
          server_id: string
        }
        Insert: {
          cpu_usage: number
          disk_usage: number
          id?: string
          memory_usage: number
          network_in?: number | null
          network_out?: number | null
          recorded_at?: string | null
          server_id: string
        }
        Update: {
          cpu_usage?: number
          disk_usage?: number
          id?: string
          memory_usage?: number
          network_in?: number | null
          network_out?: number | null
          recorded_at?: string | null
          server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "server_metrics_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      servers: {
        Row: {
          cpu_usage: number | null
          created_at: string | null
          disk_usage: number | null
          id: string
          ip_address: string
          last_seen_at: string | null
          memory_usage: number | null
          name: string
          os: string | null
          server_type: Database["public"]["Enums"]["server_type"]
          status: Database["public"]["Enums"]["server_status"]
          updated_at: string | null
        }
        Insert: {
          cpu_usage?: number | null
          created_at?: string | null
          disk_usage?: number | null
          id?: string
          ip_address: string
          last_seen_at?: string | null
          memory_usage?: number | null
          name: string
          os?: string | null
          server_type?: Database["public"]["Enums"]["server_type"]
          status?: Database["public"]["Enums"]["server_status"]
          updated_at?: string | null
        }
        Update: {
          cpu_usage?: number | null
          created_at?: string | null
          disk_usage?: number | null
          id?: string
          ip_address?: string
          last_seen_at?: string | null
          memory_usage?: number | null
          name?: string
          os?: string | null
          server_type?: Database["public"]["Enums"]["server_type"]
          status?: Database["public"]["Enums"]["server_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      threats: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          detected_at: string | null
          id: string
          ip_address: string
          is_resolved: boolean | null
          latitude: number | null
          longitude: number | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["threat_severity"]
          threat_type: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          detected_at?: string | null
          id?: string
          ip_address: string
          is_resolved?: boolean | null
          latitude?: number | null
          longitude?: number | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["threat_severity"]
          threat_type: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          detected_at?: string | null
          id?: string
          ip_address?: string
          is_resolved?: boolean | null
          latitude?: number | null
          longitude?: number | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["threat_severity"]
          threat_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agent_status: "connected" | "disconnected" | "pending"
      server_status: "online" | "warning" | "critical" | "offline"
      server_type: "proxmox" | "vm" | "container" | "physical"
      threat_severity: "critical" | "high" | "medium" | "low" | "info"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_status: ["connected", "disconnected", "pending"],
      server_status: ["online", "warning", "critical", "offline"],
      server_type: ["proxmox", "vm", "container", "physical"],
      threat_severity: ["critical", "high", "medium", "low", "info"],
    },
  },
} as const
