'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plane, Users, Shield, Star } from 'lucide-react'
import { generateRoomId } from '@/lib/utils'

export default function HomePage() {
  const [roomCode, setRoomCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const router = useRouter()

  const handleCreateRoom = async () => {
    setIsCreating(true)
    const newRoomId = generateRoomId()
    
    try {
      // Create room in Supabase
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: newRoomId })
      })
      const result = await response.json()

      if (result.error) throw new Error(result.error)
      
      router.push(`/${newRoomId}`)
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Failed to create room. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = () => {
    if (!roomCode.trim()) return
    
    setIsJoining(true)
    router.push(`/${roomCode.toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Plane className="w-16 h-16 text-yellow-400" />
              <Star className="w-6 h-6 text-yellow-300 absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Charlie Flight
          </h1>
          <h2 className="text-xl text-blue-200 mb-4">
            Mascot Voting
          </h2>
          <p className="text-blue-100">
            Vote for your favorite mascot name!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <div className="space-y-6">
            {/* Create Room Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-yellow-400" />
                Create New Room
              </h3>
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Voting Room'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-blue-900 text-blue-200">OR</span>
              </div>
            </div>

            {/* Join Room Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Join Existing Room
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!roomCode.trim() || isJoining}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {isJoining ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 text-blue-200 text-sm"
        >
          <p>Built for USAF Charlie Flight</p>
        </motion.div>
      </div>
    </div>
  )
}