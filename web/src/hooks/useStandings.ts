import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { TeamStanding, Team, ScoreLog, Game } from '../types'

export function useStandings() {
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStandings = async () => {
    try {
      setLoading(true)

      // Fetch teams
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')

      if (teamsError) throw teamsError

      // Fetch all score logs
      const { data: scoreLogs, error: logsError } = await supabase
        .from('score_logs')
        .select('*')

      if (logsError) throw logsError

      // Fetch all final games
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'final')

      if (gamesError) throw gamesError

      // Calculate points for and against for each team
      const teamStats = new Map<string, { pf: number; pa: number }>()

      for (const team of (teams || []) as Team[]) {
        teamStats.set(team.name, { pf: 0, pa: 0 })
      }

      // Process each final game
      for (const game of (games || []) as Game[]) {
        const homeScores = (scoreLogs || [])
          .filter((log: ScoreLog) => log.game_id === game.id && log.team_name === game.home_team_name)
          .reduce((sum: number, log: ScoreLog) => sum + log.points, 0)

        const awayScores = (scoreLogs || [])
          .filter((log: ScoreLog) => log.game_id === game.id && log.team_name === game.away_team_name)
          .reduce((sum: number, log: ScoreLog) => sum + log.points, 0)

        const homeStats = teamStats.get(game.home_team_name)
        const awayStats = teamStats.get(game.away_team_name)

        if (homeStats) {
          homeStats.pf += homeScores
          homeStats.pa += awayScores
        }

        if (awayStats) {
          awayStats.pf += awayScores
          awayStats.pa += homeScores
        }
      }

      // Build standings array
      const standingsData: TeamStanding[] = ((teams || []) as Team[])
        .map(team => {
          const stats = teamStats.get(team.name) || { pf: 0, pa: 0 }
          return {
            ...team,
            rank: 0,
            points_for: stats.pf,
            points_against: stats.pa,
            point_diff: stats.pf - stats.pa
          }
        })
        .sort((a, b) => {
          // Sort by wins first, then by point differential
          if (b.wins !== a.wins) return b.wins - a.wins
          return b.point_diff - a.point_diff
        })
        .map((team, index) => ({
          ...team,
          rank: index + 1
        }))

      setStandings(standingsData)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStandings()
  }, [])

  return { standings, loading, error, refetch: fetchStandings }
}
