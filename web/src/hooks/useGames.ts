import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Game, GameWithScores, ScoreLog } from '../types'

export function useGames(teamName?: string | null, status?: Game['status']) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGames = async () => {
    try {
      setLoading(true)
      let query = supabase.from('games').select('*')

      if (teamName) {
        query = query.or(`home_team_name.eq.${teamName},away_team_name.eq.${teamName}`)
      }

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query.order('start_time', { ascending: true })

      if (error) throw error
      setGames(data || [])
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [teamName, status])

  return { games, loading, error, refetch: fetchGames }
}

export function useGameWithScores(gameId: number | null) {
  const [game, setGame] = useState<GameWithScores | null>(null)
  const [scoreLogs, setScoreLogs] = useState<ScoreLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGame = async () => {
    if (!gameId) {
      setGame(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Fetch game details
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

      if (gameError) throw gameError

      // Fetch score logs for this game
      const { data: logsData, error: logsError } = await supabase
        .from('score_logs')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })

      if (logsError) throw logsError

      // Calculate scores
      const homeScore = (logsData || [])
        .filter((log: ScoreLog) => log.team_name === gameData.home_team_name)
        .reduce((sum: number, log: ScoreLog) => sum + log.points, 0)

      const awayScore = (logsData || [])
        .filter((log: ScoreLog) => log.team_name === gameData.away_team_name)
        .reduce((sum: number, log: ScoreLog) => sum + log.points, 0)

      setGame({
        ...gameData,
        home_score: homeScore,
        away_score: awayScore
      })
      setScoreLogs(logsData || [])
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to realtime updates
  useEffect(() => {
    if (!gameId) return

    fetchGame()

    // Subscribe to score_logs changes for this game
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'score_logs',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          fetchGame()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        () => {
          fetchGame()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])

  return { game, scoreLogs, loading, error, refetch: fetchGame }
}

export function useLiveGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLiveGames = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'live')
        .order('start_time', { ascending: true })

      if (error) throw error
      setGames(data || [])
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveGames()

    // Subscribe to game status changes
    const channel = supabase
      .channel('live-games')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games'
        },
        () => {
          fetchLiveGames()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { games, loading, error, refetch: fetchLiveGames }
}
