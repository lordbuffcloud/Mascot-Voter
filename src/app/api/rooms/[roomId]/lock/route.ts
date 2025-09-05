import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const { isLocked } = await request.json()

    // Update room lock status
    const { data, error } = await supabase
      .from('rooms')
      .update({ is_locked: isLocked })
      .eq('id', roomId)
      .select()
      .single()

    if (error) {
      console.error('Error updating room lock status:', error)
      return NextResponse.json({ error: 'Failed to update room lock status' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in POST /api/rooms/[roomId]/lock:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}