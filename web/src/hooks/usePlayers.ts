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
      let query = supabase.from('players').select('*')

      if (teamName) {
        query = query.eq('team_name', teamName)
      }

      const { data, error } = await query.order('jersey_number', { ascending: true })

      if (error) throw error
      setPlayers(data || [])
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
