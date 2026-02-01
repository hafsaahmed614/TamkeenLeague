import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Team } from '../types'

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('wins', { ascending: false })

      if (error) throw error
      setTeams(data || [])
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  return { teams, loading, error, refetch: fetchTeams }
}

export function useTeam(teamName: string | null) {
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!teamName) {
      setTeam(null)
      setLoading(false)
      return
    }

    const fetchTeam = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('name', teamName)
          .single()

        if (error) throw error
        setTeam(data)
        setError(null)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [teamName])

  return { team, loading, error }
}
