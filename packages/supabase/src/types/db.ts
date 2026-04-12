export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string;
          id: string;
          offer_id: string;
          status: Database["public"]["Enums"]["application_status"];
          student_profile_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          offer_id: string;
          status?: Database["public"]["Enums"]["application_status"];
          student_profile_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          offer_id?: string;
          status?: Database["public"]["Enums"]["application_status"];
          student_profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "internship_offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_student_profile_id_fkey";
            columns: ["student_profile_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          address: string | null;
          approval_status: Database["public"]["Enums"]["company_approval_status"];
          contact_person: string | null;
          created_at: string;
          created_by_profile_id: string | null;
          id: string;
          name: string;
          tax_id: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          approval_status?: Database["public"]["Enums"]["company_approval_status"];
          contact_person?: string | null;
          created_at?: string;
          created_by_profile_id?: string | null;
          id?: string;
          name: string;
          tax_id?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          approval_status?: Database["public"]["Enums"]["company_approval_status"];
          contact_person?: string | null;
          created_at?: string;
          created_by_profile_id?: string | null;
          id?: string;
          name?: string;
          tax_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "companies_created_by_profile_id_fkey";
            columns: ["created_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      company_members: {
        Row: {
          company_id: string;
          created_at: string;
          profile_id: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          profile_id: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      internship_offers: {
        Row: {
          application_deadline: string | null;
          company_id: string;
          created_at: string;
          created_by_profile_id: string | null;
          description: string;
          end_date: string;
          id: string;
          is_active: boolean;
          location: string;
          number_of_positions: number;
          requirements: string | null;
          start_date: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          application_deadline?: string | null;
          company_id: string;
          created_at?: string;
          created_by_profile_id?: string | null;
          description?: string;
          end_date: string;
          id?: string;
          is_active?: boolean;
          location?: string;
          number_of_positions?: number;
          requirements?: string | null;
          start_date: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          application_deadline?: string | null;
          company_id?: string;
          created_at?: string;
          created_by_profile_id?: string | null;
          description?: string;
          end_date?: string;
          id?: string;
          is_active?: boolean;
          location?: string;
          number_of_positions?: number;
          requirements?: string | null;
          start_date?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "internship_offers_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "internship_offers_created_by_profile_id_fkey";
            columns: ["created_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          first_name: string | null;
          id: string;
          is_active: boolean;
          last_name: string | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id: string;
          is_active?: boolean;
          last_name?: string | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          is_active?: boolean;
          last_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      school_members: {
        Row: {
          created_at: string;
          profile_id: string;
          school_id: string;
        };
        Insert: {
          created_at?: string;
          profile_id: string;
          school_id: string;
        };
        Update: {
          created_at?: string;
          profile_id?: string;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "school_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "school_members_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      schools: {
        Row: {
          address: string | null;
          approval_status: Database["public"]["Enums"]["school_approval_status"];
          created_at: string;
          created_by_profile_id: string | null;
          id: string;
          name: string;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          approval_status?: Database["public"]["Enums"]["school_approval_status"];
          created_at?: string;
          created_by_profile_id?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          approval_status?: Database["public"]["Enums"]["school_approval_status"];
          created_at?: string;
          created_by_profile_id?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "schools_created_by_profile_id_fkey";
            columns: ["created_by_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      student_profiles: {
        Row: {
          created_at: string;
          id: string;
          index_number: string | null;
          major: string | null;
          school_id: string | null;
          updated_at: string;
          year_of_study: number | null;
        };
        Insert: {
          created_at?: string;
          id: string;
          index_number?: string | null;
          major?: string | null;
          school_id?: string | null;
          updated_at?: string;
          year_of_study?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          index_number?: string | null;
          major?: string | null;
          school_id?: string | null;
          updated_at?: string;
          year_of_study?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_profiles_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json };
    };
    Enums: {
      application_status: "pending" | "accepted" | "rejected" | "withdrawn";
      company_approval_status: "pending" | "approved" | "rejected";
      school_approval_status: "pending" | "approved" | "rejected";
      user_role: "student" | "employer" | "supervisor" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      application_status: ["pending", "accepted", "rejected", "withdrawn"],
      company_approval_status: ["pending", "approved", "rejected"],
      school_approval_status: ["pending", "approved", "rejected"],
      user_role: ["student", "employer", "supervisor", "admin"],
    },
  },
} as const;
