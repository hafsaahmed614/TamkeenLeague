import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { PlayerStats, ScoreLog, Game } from '../types'

export function useLeaderboard(limit: number = 15) {
  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)

      // Fetch all score logs
      const { data: scoreLogs, error: logsError } = await supabase
        .from('score_logs')
        .select('*')

      if (logsError) throw logsError

      // Fetch all final games to calculate games played
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'final')

      if (gamesError) throw gamesError

      // Aggregate player stats
      const playerMap = new Map<string, {
        team_name: string
        total_points: number
        game_ids: Set<number>
      }>()

      for (const log of (scoreLogs || []) as ScoreLog[]) {
        const existing = playerMap.get(log.player_name)
        if (existing) {
          existing.total_points += log.points
          existing.game_ids.add(log.game_id)
        } else {
          playerMap.set(log.player_name, {
            team_name: log.team_name,
            total_points: log.points,
            game_ids: new Set([log.game_id])
          })
        }
      }

      // Convert to array and calculate PPG
      const finalGamesIds = new Set((games || []).map((g: Game) => g.id))

      const stats: PlayerStats[] = Array.from(playerMap.entries())
        .map(([name, data]) => {
          // Only count final games for games played
          const gamesPlayed = Array.from(data.game_ids).filter(id => finalGamesIds.has(id)).length
          return {
            player_name: name,
            team_name: data.team_name,
            games_played: gamesPlayed || 1, // Avoid division by zero
            total_points: data.total_points,
            ppg: data.total_points / (gamesPlayed || 1)
          }
        })
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, limit)

      setPlayers(stats)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [limit])

  return { players, loading, error, refetch: fetchLeaderboard }
}
