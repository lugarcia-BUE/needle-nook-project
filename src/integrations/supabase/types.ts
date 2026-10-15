export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      calculations: {
        Row: {
          created_at: string;
          id: string;
          inputs: Json;
          kind: string;
          project_id: string;
          result: Json;
          title: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          inputs: Json;
          kind: string;
          project_id: string;
          result: Json;
          title?: string | null;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          inputs?: Json;
          kind?: string;
          project_id?: string;
          result?: Json;
          title?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "calculations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      counter_history: {
        Row: {
          action: string;
          counter_id: string;
          created_at: string;
          id: string;
          new_value: number;
          old_value: number;
          undone: boolean;
          user_id: string;
        };
        Insert: {
          action: string;
          counter_id: string;
          created_at?: string;
          id?: string;
          new_value: number;
          old_value: number;
          undone?: boolean;
          user_id?: string;
        };
        Update: {
          action?: string;
          counter_id?: string;
          created_at?: string;
          id?: string;
          new_value?: number;
          old_value?: number;
          undone?: boolean;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "counter_history_counter_id_fkey";
            columns: ["counter_id"];
            isOneToOne: false;
            referencedRelation: "counters";
            referencedColumns: ["id"];
          },
        ];
      };
      counters: {
        Row: {
          created_at: string;
          current_value: number;
          id: string;
          motif_repeats: number | null;
          name: string;
          notes: string | null;
          project_id: string;
          section_id: string | null;
          stitches_per_row: number | null;
          target_value: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_value?: number;
          id?: string;
          motif_repeats?: number | null;
          name?: string;
          notes?: string | null;
          project_id: string;
          section_id?: string | null;
          stitches_per_row?: number | null;
          target_value?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          current_value?: number;
          id?: string;
          motif_repeats?: number | null;
          name?: string;
          notes?: string | null;
          project_id?: string;
          section_id?: string | null;
          stitches_per_row?: number | null;
          target_value?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "counters_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "counters_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "sections";
            referencedColumns: ["id"];
          },
        ];
      };
      materials: {
        Row: {
          brand: string | null;
          color: string | null;
          color_code: string | null;
          composition: string | null;
          created_at: string;
          diameter_mm: number | null;
          id: string;
          kind: string;
          length_cm: number | null;
          name: string;
          needle_type: string | null;
          notes: string | null;
          quantity_available: number;
          skein_length_m: number | null;
          skein_weight_g: number | null;
          updated_at: string;
          user_id: string;
          weight_category: string | null;
        };
        Insert: {
          brand?: string | null;
          color?: string | null;
          color_code?: string | null;
          composition?: string | null;
          created_at?: string;
          diameter_mm?: number | null;
          id?: string;
          kind: string;
          length_cm?: number | null;
          name: string;
          needle_type?: string | null;
          notes?: string | null;
          quantity_available?: number;
          skein_length_m?: number | null;
          skein_weight_g?: number | null;
          updated_at?: string;
          user_id?: string;
          weight_category?: string | null;
        };
        Update: {
          brand?: string | null;
          color?: string | null;
          color_code?: string | null;
          composition?: string | null;
          created_at?: string;
          diameter_mm?: number | null;
          id?: string;
          kind?: string;
          length_cm?: number | null;
          name?: string;
          needle_type?: string | null;
          notes?: string | null;
          quantity_available?: number;
          skein_length_m?: number | null;
          skein_weight_g?: number | null;
          updated_at?: string;
          user_id?: string;
          weight_category?: string | null;
        };
        Relationships: [];
      };
      patterns: {
        Row: {
          created_at: string;
          difficulty: string | null;
          external_url: string | null;
          file_name: string | null;
          file_path: string | null;
          file_type: string | null;
          garment_type: string | null;
          id: string;
          notes: string | null;
          tags: string[];
          technique: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          difficulty?: string | null;
          external_url?: string | null;
          file_name?: string | null;
          file_path?: string | null;
          file_type?: string | null;
          garment_type?: string | null;
          id?: string;
          notes?: string | null;
          tags?: string[];
          technique?: string | null;
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          difficulty?: string | null;
          external_url?: string | null;
          file_name?: string | null;
          file_path?: string | null;
          file_type?: string | null;
          garment_type?: string | null;
          id?: string;
          notes?: string | null;
          tags?: string[];
          technique?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          city: string | null;
          country: string | null;
          created_at: string;
          display_name: string | null;
          experience_level: string | null;
          favorite_techniques: string[];
          id: string;
          region: string | null;
          updated_at: string;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          display_name?: string | null;
          experience_level?: string | null;
          favorite_techniques?: string[];
          id: string;
          region?: string | null;
          updated_at?: string;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          display_name?: string | null;
          experience_level?: string | null;
          favorite_techniques?: string[];
          id?: string;
          region?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_materials: {
        Row: {
          created_at: string;
          id: string;
          material_id: string;
          notes: string | null;
          project_id: string;
          qty_estimated: number | null;
          qty_purchased: number | null;
          qty_used: number | null;
          required_grams: number | null;
          required_meters: number | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          material_id: string;
          notes?: string | null;
          project_id: string;
          qty_estimated?: number | null;
          qty_purchased?: number | null;
          qty_used?: number | null;
          required_grams?: number | null;
          required_meters?: number | null;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          material_id?: string;
          notes?: string | null;
          project_id?: string;
          qty_estimated?: number | null;
          qty_purchased?: number | null;
          qty_used?: number | null;
          required_grams?: number | null;
          required_meters?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_materials_material_id_fkey";
            columns: ["material_id"];
            isOneToOne: false;
            referencedRelation: "materials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_materials_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          cover_path: string | null;
          created_at: string;
          description: string | null;
          difficulty: string | null;
          finished_at: string | null;
          garment_type: string | null;
          id: string;
          name: string;
          notes: string | null;
          pattern_id: string | null;
          start_date: string | null;
          status: string;
          target_end_date: string | null;
          target_measurements: string | null;
          technique: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cover_path?: string | null;
          created_at?: string;
          description?: string | null;
          difficulty?: string | null;
          finished_at?: string | null;
          garment_type?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          pattern_id?: string | null;
          start_date?: string | null;
          status?: string;
          target_end_date?: string | null;
          target_measurements?: string | null;
          technique?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          cover_path?: string | null;
          created_at?: string;
          description?: string | null;
          difficulty?: string | null;
          finished_at?: string | null;
          garment_type?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          pattern_id?: string | null;
          start_date?: string | null;
          status?: string;
          target_end_date?: string | null;
          target_measurements?: string | null;
          technique?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_pattern_id_fkey";
            columns: ["pattern_id"];
            isOneToOne: false;
            referencedRelation: "patterns";
            referencedColumns: ["id"];
          },
        ];
      };
      sections: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          notes: string | null;
          position: number;
          project_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          notes?: string | null;
          position?: number;
          project_id: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          position?: number;
          project_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sections_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_items: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          project_id: string | null;
          purchased: boolean;
          quantity: number | null;
          unit: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          project_id?: string | null;
          purchased?: boolean;
          quantity?: number | null;
          unit?: string | null;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          project_id?: string | null;
          purchased?: boolean;
          quantity?: number | null;
          unit?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      time_sessions: {
        Row: {
          created_at: string;
          duration_seconds: number | null;
          ended_at: string | null;
          id: string;
          is_manual: boolean;
          notes: string | null;
          paused_at: string | null;
          paused_seconds: number;
          project_id: string;
          started_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          duration_seconds?: number | null;
          ended_at?: string | null;
          id?: string;
          is_manual?: boolean;
          notes?: string | null;
          paused_at?: string | null;
          paused_seconds?: number;
          project_id: string;
          started_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          duration_seconds?: number | null;
          ended_at?: string | null;
          id?: string;
          is_manual?: boolean;
          notes?: string | null;
          paused_at?: string | null;
          paused_seconds?: number;
          project_id?: string;
          started_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "time_sessions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      counter_change: {
        Args: { _action: string; _counter_id: string; _value?: number };
        Returns: {
          created_at: string;
          current_value: number;
          id: string;
          motif_repeats: number | null;
          name: string;
          notes: string | null;
          project_id: string;
          section_id: string | null;
          stitches_per_row: number | null;
          target_value: number | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "counters";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      owns_material: { Args: { _id: string }; Returns: boolean };
      owns_project: { Args: { _project_id: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
