import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { roomId } = await request.json()
    
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Create room in Supabase
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        id: roomId,
        created_by: 'anonymous', // In a real app, you'd use authenticated user ID
        is_locked: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating room:', error)
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in POST /api/rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Get room from Supabase
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }
      console.error('Error fetching room:', error)
      return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}