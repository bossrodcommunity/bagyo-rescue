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
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      barangays: {
        Row: {
          area_name: string | null
          created_at: string
          id: string
          lgu_id: string
          name: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          updated_at: string
        }
        Insert: {
          area_name?: string | null
          created_at?: string
          id?: string
          lgu_id: string
          name: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          updated_at?: string
        }
        Update: {
          area_name?: string | null
          created_at?: string
          id?: string
          lgu_id?: string
          name?: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "barangays_lgu_id_fkey"
            columns: ["lgu_id"]
            isOneToOne: false
            referencedRelation: "lgus"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_persons: {
        Row: {
          alternate_contact_number: string | null
          contact_number: string
          created_at: string
          email: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["contact_entity_type"]
          full_name: string
          id: string
          is_primary: boolean
          notes: string | null
          role: Database["public"]["Enums"]["contact_role"]
          updated_at: string
        }
        Insert: {
          alternate_contact_number?: string | null
          contact_number: string
          created_at?: string
          email?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["contact_entity_type"]
          full_name: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          role: Database["public"]["Enums"]["contact_role"]
          updated_at?: string
        }
        Update: {
          alternate_contact_number?: string | null
          contact_number?: string
          created_at?: string
          email?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["contact_entity_type"]
          full_name?: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          role?: Database["public"]["Enums"]["contact_role"]
          updated_at?: string
        }
        Relationships: []
      }
      evacuation_center_assignments: {
        Row: {
          arrived_at: string | null
          created_at: string
          evacuation_center_id: string
          family_id: string
          house_id: string
          id: string
          left_at: string | null
          notes: string | null
          number_of_people: number
          status: Database["public"]["Enums"]["evacuation_assignment_status"]
          updated_at: string
        }
        Insert: {
          arrived_at?: string | null
          created_at?: string
          evacuation_center_id: string
          family_id: string
          house_id: string
          id?: string
          left_at?: string | null
          notes?: string | null
          number_of_people?: number
          status?: Database["public"]["Enums"]["evacuation_assignment_status"]
          updated_at?: string
        }
        Update: {
          arrived_at?: string | null
          created_at?: string
          evacuation_center_id?: string
          family_id?: string
          house_id?: string
          id?: string
          left_at?: string | null
          notes?: string | null
          number_of_people?: number
          status?: Database["public"]["Enums"]["evacuation_assignment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evacuation_center_assignments_evacuation_center_id_fkey"
            columns: ["evacuation_center_id"]
            isOneToOne: false
            referencedRelation: "evacuation_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evacuation_center_assignments_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evacuation_center_assignments_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      evacuation_centers: {
        Row: {
          address: string
          barangay_id: string | null
          capacity: number
          created_at: string
          current_occupancy: number
          has_food_supply: boolean
          has_medical_support: boolean
          has_power: boolean
          has_water_supply: boolean
          id: string
          landmark: string | null
          latitude: number | null
          lgu_id: string
          longitude: number | null
          name: string
          notes: string | null
          status: Database["public"]["Enums"]["evacuation_center_status"]
          type: Database["public"]["Enums"]["evacuation_center_type"]
          updated_at: string
        }
        Insert: {
          address: string
          barangay_id?: string | null
          capacity?: number
          created_at?: string
          current_occupancy?: number
          has_food_supply?: boolean
          has_medical_support?: boolean
          has_power?: boolean
          has_water_supply?: boolean
          id?: string
          landmark?: string | null
          latitude?: number | null
          lgu_id: string
          longitude?: number | null
          name: string
          notes?: string | null
          status?: Database["public"]["Enums"]["evacuation_center_status"]
          type?: Database["public"]["Enums"]["evacuation_center_type"]
          updated_at?: string
        }
        Update: {
          address?: string
          barangay_id?: string | null
          capacity?: number
          created_at?: string
          current_occupancy?: number
          has_food_supply?: boolean
          has_medical_support?: boolean
          has_power?: boolean
          has_water_supply?: boolean
          id?: string
          landmark?: string | null
          latitude?: number | null
          lgu_id?: string
          longitude?: number | null
          name?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["evacuation_center_status"]
          type?: Database["public"]["Enums"]["evacuation_center_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evacuation_centers_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evacuation_centers_lgu_id_fkey"
            columns: ["lgu_id"]
            isOneToOne: false
            referencedRelation: "lgus"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          current_inside_count: number
          evacuated_count: number
          family_name: string
          head_of_family: string
          house_id: string
          id: string
          missing_or_unconfirmed_count: number
          needs_assistance: boolean
          notes: string | null
          total_members: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_inside_count?: number
          evacuated_count?: number
          family_name: string
          head_of_family: string
          house_id: string
          id?: string
          missing_or_unconfirmed_count?: number
          needs_assistance?: boolean
          notes?: string | null
          total_members?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_inside_count?: number
          evacuated_count?: number
          family_name?: string
          head_of_family?: string
          house_id?: string
          id?: string
          missing_or_unconfirmed_count?: number
          needs_assistance?: boolean
          notes?: string | null
          total_members?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "families_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      flood_reports: {
        Row: {
          accuracy: number | null
          barangay: string | null
          client_report_id: string
          confidence: string
          created_at: string
          expires_at: string
          id: string
          latitude: number | null
          longitude: number | null
          reported_at: string
          risk_level: string
          status: string
          updated_at: string
        }
        Insert: {
          accuracy?: number | null
          barangay?: string | null
          client_report_id: string
          confidence: string
          created_at?: string
          expires_at: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          reported_at: string
          risk_level: string
          status: string
          updated_at?: string
        }
        Update: {
          accuracy?: number | null
          barangay?: string | null
          client_report_id?: string
          confidence?: string
          created_at?: string
          expires_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          reported_at?: string
          risk_level?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      houses: {
        Row: {
          address: string
          barangay_id: string
          created_at: string
          current_status: Database["public"]["Enums"]["house_status"]
          house_code: string
          id: string
          landmark: string | null
          last_checked_at: string | null
          last_checked_by: string | null
          latitude: number | null
          longitude: number | null
          updated_at: string
          water_level: Database["public"]["Enums"]["water_level"]
        }
        Insert: {
          address: string
          barangay_id: string
          created_at?: string
          current_status?: Database["public"]["Enums"]["house_status"]
          house_code: string
          id?: string
          landmark?: string | null
          last_checked_at?: string | null
          last_checked_by?: string | null
          latitude?: number | null
          longitude?: number | null
          updated_at?: string
          water_level?: Database["public"]["Enums"]["water_level"]
        }
        Update: {
          address?: string
          barangay_id?: string
          created_at?: string
          current_status?: Database["public"]["Enums"]["house_status"]
          house_code?: string
          id?: string
          landmark?: string | null
          last_checked_at?: string | null
          last_checked_by?: string | null
          latitude?: number | null
          longitude?: number | null
          updated_at?: string
          water_level?: Database["public"]["Enums"]["water_level"]
        }
        Relationships: [
          {
            foreignKeyName: "houses_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["id"]
          },
        ]
      }
      lgus: {
        Row: {
          city_or_municipality: string
          created_at: string
          id: string
          name: string
          province: string
          updated_at: string
        }
        Insert: {
          city_or_municipality: string
          created_at?: string
          id?: string
          name: string
          province: string
          updated_at?: string
        }
        Update: {
          city_or_municipality?: string
          created_at?: string
          id?: string
          name?: string
          province?: string
          updated_at?: string
        }
        Relationships: []
      }
      residents: {
        Row: {
          age: number | null
          created_at: string
          current_status: Database["public"]["Enums"]["resident_status"]
          family_id: string
          first_name: string
          id: string
          is_child: boolean
          is_pregnant: boolean
          is_pwd: boolean
          is_senior: boolean
          last_name: string
          sex: Database["public"]["Enums"]["sex"]
          updated_at: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          current_status?: Database["public"]["Enums"]["resident_status"]
          family_id: string
          first_name: string
          id?: string
          is_child?: boolean
          is_pregnant?: boolean
          is_pwd?: boolean
          is_senior?: boolean
          last_name: string
          sex: Database["public"]["Enums"]["sex"]
          updated_at?: string
        }
        Update: {
          age?: number | null
          created_at?: string
          current_status?: Database["public"]["Enums"]["resident_status"]
          family_id?: string
          first_name?: string
          id?: string
          is_child?: boolean
          is_pregnant?: boolean
          is_pwd?: boolean
          is_senior?: boolean
          last_name?: string
          sex?: Database["public"]["Enums"]["sex"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "residents_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
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
      contact_entity_type:
        | "LGU"
        | "Barangay"
        | "Area"
        | "House"
        | "Family"
        | "Evacuation Center"
      contact_role:
        | "LGU Admin"
        | "MDRRMO Officer"
        | "Barangay Captain"
        | "Barangay Secretary"
        | "Responder"
        | "Purok Leader"
        | "Household Representative"
        | "Family Head"
        | "Relative"
        | "Volunteer"
      evacuation_assignment_status:
        | "Assigned"
        | "Checked In"
        | "Transferred"
        | "Left"
        | "Missing / Unconfirmed"
      evacuation_center_status:
        | "Open"
        | "Near Capacity"
        | "Full"
        | "Closed"
        | "Unavailable"
      evacuation_center_type:
        | "School"
        | "Covered Court"
        | "Gymnasium"
        | "Barangay Hall"
        | "Church"
        | "Community Center"
        | "Other"
      house_status:
        | "Not Checked"
        | "Safe"
        | "Needs Assistance"
        | "Needs Rescue"
        | "Evacuated"
      resident_status:
        | "Inside House"
        | "Evacuated"
        | "Missing / Unconfirmed"
        | "Needs Rescue"
        | "Safe"
      risk_level: "Low" | "Medium" | "High" | "Critical"
      sex: "Male" | "Female" | "Other" | "Prefer Not To Say"
      water_level:
        | "None"
        | "Ankle"
        | "Knee"
        | "Waist"
        | "Chest"
        | "Roof"
        | "Unknown"
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
      contact_entity_type: [
        "LGU",
        "Barangay",
        "Area",
        "House",
        "Family",
        "Evacuation Center",
      ],
      contact_role: [
        "LGU Admin",
        "MDRRMO Officer",
        "Barangay Captain",
        "Barangay Secretary",
        "Responder",
        "Purok Leader",
        "Household Representative",
        "Family Head",
        "Relative",
        "Volunteer",
      ],
      evacuation_assignment_status: [
        "Assigned",
        "Checked In",
        "Transferred",
        "Left",
        "Missing / Unconfirmed",
      ],
      evacuation_center_status: [
        "Open",
        "Near Capacity",
        "Full",
        "Closed",
        "Unavailable",
      ],
      evacuation_center_type: [
        "School",
        "Covered Court",
        "Gymnasium",
        "Barangay Hall",
        "Church",
        "Community Center",
        "Other",
      ],
      house_status: [
        "Not Checked",
        "Safe",
        "Needs Assistance",
        "Needs Rescue",
        "Evacuated",
      ],
      resident_status: [
        "Inside House",
        "Evacuated",
        "Missing / Unconfirmed",
        "Needs Rescue",
        "Safe",
      ],
      risk_level: ["Low", "Medium", "High", "Critical"],
      sex: ["Male", "Female", "Other", "Prefer Not To Say"],
      water_level: [
        "None",
        "Ankle",
        "Knee",
        "Waist",
        "Chest",
        "Roof",
        "Unknown",
      ],
    },
  },
} as const
