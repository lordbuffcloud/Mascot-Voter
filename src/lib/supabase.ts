import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          created_at: string
          is_locked: boolean
          created_by: string
        }
        Insert: {
          id: string
          created_at?: string
          is_locked?: boolean
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          is_locked?: boolean
          created_by?: string
        }
      }
      mascot_suggestions: {
        Row: {
          id: string
          room_id: string
          name: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          room_id: string
          name: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          room_id?: string
          name?: string
          created_at?: string
          created_by?: string
        }
      }
      votes: {
        Row: {
          id: string
          room_id: string
          suggestion_id: string
          user_session: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          suggestion_id: string
          user_session: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          suggestion_id?: string
          user_session?: string
          created_at?: string
        }
      }
    }
  }
}