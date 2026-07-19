export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          country: string | null;
          degree: string | null;
          major: string | null;
          cgpa: number | null;
          preferred_country: string | null;
          university: string | null;
          research_experience: string | null;
          ielts: number | null;
          gre: number | null;
          preferred_countries: string[] | null;
          budget: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name?: string | null;
          country?: string | null;
          degree?: string | null;
          major?: string | null;
          cgpa?: number | null;
          preferred_country?: string | null;
          university?: string | null;
          research_experience?: string | null;
          ielts?: number | null;
          gre?: number | null;
          preferred_countries?: string[] | null;
          budget?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      scholarships: {
        Row: {
          id: string;
          title: string;
          university: string;
          country: string;
          degree: string | null;
          funding: string;
          deadline: string;
          description: string;
          requirements: string | null;
          official_link: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          university: string;
          country: string;
          degree?: string | null;
          funding?: string;
          deadline: string;
          description: string;
          requirements?: string | null;
          official_link: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['scholarships']['Row']>;
        Relationships: [];
      };
      saved_scholarships: {
        Row: {
          id: string;
          user_id: string;
          scholarship_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          scholarship_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['saved_scholarships']['Row']>;
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          scholarship_id: string;
          status: string;
          notes: string | null;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          scholarship_id: string;
          status?: string;
          notes?: string | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['applications']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Scholarship = Database['public']['Tables']['scholarships']['Row'];
export type SavedScholarship =
  Database['public']['Tables']['saved_scholarships']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];

export const APPLICATION_STATUSES = [
  'not_started',
  'researching',
  'drafting',
  'submitted',
  'awarded',
  'rejected',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type ProfileInput = {
  full_name?: string | null;
  country?: string | null;
  degree?: string | null;
  major?: string | null;
  cgpa?: number | null;
  preferred_country?: string | null;
  university?: string | null;
  research_experience?: string | null;
  ielts?: number | null;
  gre?: number | null;
  preferred_countries?: string[] | null;
  budget?: string | null;
};

export type ApplicationInput = {
  scholarship_id: string;
  status?: string;
  notes?: string | null;
  progress?: number;
};

export type ApplicationUpdate = {
  status?: string;
  notes?: string | null;
  progress?: number;
};
