'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, 
  Plus, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Users, 
  Plane, 
  Star,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { generateUserSession } from '@/lib/utils'
import { Room, MascotSuggestion } from '@/types'

export default function VotingPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  
  const [room, setRoom] = useState<Room | null>(null)
  const [suggestions, setSuggestions] = useState<MascotSuggestion[]>([])
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({})
  const [userSession] = useState(() => generateUserSession())
  const [newSuggestion, setNewSuggestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // Fetch all data in parallel
      const [roomResponse, suggestionsResponse, votesResponse] = await Promise.all([
        fetch(`/api/rooms?roomId=${roomId}`),
        fetch(`/api/rooms/${roomId}/suggestions`),
        fetch(`/api/rooms/${roomId}/votes`)
      ])

      // Process room data
      const roomData = await roomResponse.json()
      if (roomData.error) {
        setError(roomData.error)
      } else {
        setRoom(roomData.data)
      }

      // Process suggestions data
      const suggestionsData = await suggestionsResponse.json()
      if (suggestionsData.error) {
        console.error('Error fetching suggestions:', suggestionsData.error)
      } else {
        setSuggestions(suggestionsData.data || [])
      }

      // Process votes data
      const votesData = await votesResponse.json()
      if (votesData.error) {
        console.error('Error fetching vote counts:', votesData.error)
      } else {
        setVoteCounts(votesData.data || {})
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    }
    
    setIsLoading(false)
    setLastUpdated(new Date())
  }, [roomId])

  useEffect(() => {
    loadData()
    
    // Poll for updates every 10 seconds (less aggressive)
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleAddSuggestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSuggestion.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/rooms/${roomId}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSuggestion.trim(),
          userSession
        })
      })

      const data = await response.json()
      
      if (data.error) {
        alert(data.error)
        return
      }

      setNewSuggestion('')
      await loadData()
    } catch (err) {
      console.error('Error adding suggestion:', err)
      alert('Failed to add suggestion')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (suggestionId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestionId,
          userSession
        })
      })

      const data = await response.json()
      
      if (data.error) {
        if (data.error.includes('already voted')) {
          // Try to remove the vote instead
          await fetch(`/api/rooms/${roomId}/votes`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              suggestionId,
              userSession
            })
          })
        } else {
          alert(data.error)
          return
        }
      }

      await loadData()
    } catch (err) {
      console.error('Error voting:', err)
      alert('Failed to vote')
    }
  }

  const handleToggleLock = async () => {
    if (!room) return

    try {
      const response = await fetch(`/api/rooms/${roomId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isLocked: !room.is_locked
        })
      })

      const data = await response.json()
      
      if (data.error) {
        alert(data.error)
        return
      }

      setRoom(data.data)
    } catch (err) {
      console.error('Error toggling lock:', err)
      alert('Failed to toggle lock')
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all votes and suggestions?')) return

    try {
      const response = await fetch(`/api/rooms/${roomId}/reset`, {
        method: 'POST'
      })

      const data = await response.json()
      
      if (data.error) {
        alert(data.error)
        return
      }

      await loadData()
    } catch (err) {
      console.error('Error resetting:', err)
      alert('Failed to reset')
    }
  }

  const getTotalVotes = () => {
    return Object.values(voteCounts).reduce((sum, count) => sum + count, 0)
  }

  const getLeader = () => {
    let maxVotes = 0
    let leaderId = ''
    
    Object.entries(voteCounts).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count
        leaderId = id
      }
    })
    
    return leaderId
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Room Not Found</h1>
          <p className="text-blue-200 mb-4">{error || 'This room does not exist'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const leaderId = getLeader()
  const totalVotes = getTotalVotes()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center items-center mb-4">
            <Plane className="w-8 h-8 text-yellow-400 mr-2" />
            <h1 className="text-3xl font-bold text-white">Charlie Flight Mascot Voting</h1>
            <Star className="w-6 h-6 text-yellow-300 ml-2" />
          </div>
          <div className="flex justify-center items-center space-x-4 text-blue-200">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Room: {roomId}
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              {totalVotes} total votes
            </div>
            {lastUpdated && (
              <div className="flex items-center text-sm">
                <RefreshCw className="w-3 h-3 mr-1" />
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleToggleLock}
                className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-all ${
                  room.is_locked
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {room.is_locked ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                {room.is_locked ? 'Unlock' : 'Lock'} Submissions
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All
              </button>
              
              <button
                onClick={loadData}
                className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all"
            >
              Back to Home
            </button>
          </div>
        </motion.div>

        {/* Add Suggestion Form */}
        {!room.is_locked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Add Mascot Suggestion</h2>
            <form onSubmit={handleAddSuggestion} className="flex gap-4">
              <input
                type="text"
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                placeholder="Enter mascot name..."
                className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                maxLength={50}
              />
              <button
                type="submit"
                disabled={!newSuggestion.trim() || isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Adding...' : 'Add'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Suggestions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Mascot Suggestions</h2>
          
          <AnimatePresence>
            {suggestions.map((suggestion, index) => {
              const voteCount = voteCounts[suggestion.id] || 0
              const isLeader = leaderId === suggestion.id && voteCount > 0
              const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0

              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 ${
                    isLeader 
                      ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' 
                      : 'border-white/20 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {isLeader && <Crown className="w-6 h-6 text-yellow-400 mr-2" />}
                      <h3 className="text-xl font-semibold text-white">{suggestion.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-400">{voteCount}</div>
                      <div className="text-sm text-blue-200">votes</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                      <motion.div
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                    <div className="text-sm text-blue-200">
                      {percentage.toFixed(1)}% of total votes
                    </div>
                  </div>

                  <button
                    onClick={() => handleVote(suggestion.id)}
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Vote for {suggestion.name}
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {suggestions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Plane className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No suggestions yet</h3>
              <p className="text-blue-200">
                {room.is_locked 
                  ? 'Submissions are locked. Contact the room owner to unlock.' 
                  : 'Be the first to suggest a mascot name!'
                }
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}