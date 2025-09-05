import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { name, userSession } = await request.json()
    const { roomId } = await params
    
    if (!name || !userSession) {
      return NextResponse.json({ error: 'Name and user session are required' }, { status: 400 })
    }

    // Check if room exists and is not locked
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('is_locked')
      .eq('id', roomId)
      .single()

    if (roomError) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.is_locked) {
      return NextResponse.json({ error: 'Room is locked' }, { status: 403 })
    }

    // Create suggestion
    const { data, error } = await supabase
      .from('mascot_suggestions')
      .insert({
        room_id: roomId,
        name: name.trim(),
        created_by: userSession
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating suggestion:', error)
      return NextResponse.json({ error: 'Failed to create suggestion' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in POST /api/rooms/[roomId]/suggestions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params

    // Get all suggestions for the room
    const { data, error } = await supabase
      .from('mascot_suggestions')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching suggestions:', error)
      return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/rooms/[roomId]/suggestions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}