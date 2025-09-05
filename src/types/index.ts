export interface Room {
  id: string
  created_at: string
  is_locked: boolean
  created_by: string
}

export interface MascotSuggestion {
  id: string
  room_id: string
  name: string
  created_at: string
  created_by: string
  vote_count?: number
}

export interface MascotVote {
  id: string
  room_id: string
  suggestion_id: string
  user_session: string
  created_at: string
}

export interface VoteCount {
  suggestion_id: string
  count: number
}