import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { suggestionId, userSession, userName } = await request.json()
    const { roomId } = await params
    
    if (!suggestionId || !userSession) {
      return NextResponse.json({ error: 'Suggestion ID and user session are required' }, { status: 400 })
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Check if user already voted for this suggestion (by IP + room + suggestion)
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('room_id', roomId)
      .eq('suggestion_id', suggestionId)
      .eq('user_ip', ip)
      .single()

    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      console.error('Error checking existing vote:', voteCheckError)
      return NextResponse.json({ error: 'Failed to check existing vote' }, { status: 500 })
    }

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted for this suggestion from this device/network' }, { status: 409 })
    }

    // Create vote
    const { data, error } = await supabase
      .from('votes')
      .insert({
        room_id: roomId,
        suggestion_id: suggestionId,
        user_session: userSession,
        user_ip: ip,
        user_name: userName || 'Anonymous'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating vote:', error)
      return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in POST /api/rooms/[roomId]/votes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { suggestionId, userSession } = await request.json()
    const { roomId } = await params
    
    if (!suggestionId || !userSession) {
      return NextResponse.json({ error: 'Suggestion ID and user session are required' }, { status: 400 })
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Remove vote (by IP + room + suggestion)
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('room_id', roomId)
      .eq('suggestion_id', suggestionId)
      .eq('user_ip', ip)

    if (error) {
      console.error('Error removing vote:', error)
      return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/rooms/[roomId]/votes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params

    // Get vote counts for all suggestions in the room
    const { data, error } = await supabase
      .from('votes')
      .select('suggestion_id')
      .eq('room_id', roomId)

    if (error) {
      console.error('Error fetching votes:', error)
      return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 })
    }

    // Count votes per suggestion
    const voteCounts = data.reduce((acc, vote) => {
      acc[vote.suggestion_id] = (acc[vote.suggestion_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({ data: voteCounts })
  } catch (error) {
    console.error('Error in GET /api/rooms/[roomId]/votes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}