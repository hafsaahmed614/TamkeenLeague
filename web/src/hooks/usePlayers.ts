import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Player } from '../types'

export function usePlayers(teamName?: string) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      // Fetch all players and filter client-side to handle team names with spaces
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('jersey_number', { ascending: true })

      if (error) throw error

      // Filter by team name client-side
      let filteredPlayers = data || []
      if (teamName) {
        filteredPlayers = filteredPlayers.filter(p => p.team_name === teamName)
      }

      setPlayers(filteredPlayers)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()
  }, [teamName])

  return { players, loading, error, refetch: fetchPlayers }
}
