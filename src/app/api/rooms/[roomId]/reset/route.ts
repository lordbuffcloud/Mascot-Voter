import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params

    // Delete all votes for the room
    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .eq('room_id', roomId)

    if (votesError) {
      console.error('Error deleting votes:', votesError)
      return NextResponse.json({ error: 'Failed to reset votes' }, { status: 500 })
    }

    // Optionally delete all suggestions as well
    const { error: suggestionsError } = await supabase
      .from('mascot_suggestions')
      .delete()
      .eq('room_id', roomId)

    if (suggestionsError) {
      console.error('Error deleting suggestions:', suggestionsError)
      return NextResponse.json({ error: 'Failed to reset suggestions' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/rooms/[roomId]/reset:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}