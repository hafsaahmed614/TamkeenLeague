import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { Header } from '../components/Header'
import { GameCard } from '../components/GameCard'
import { LoadingSpinner, GameCardSkeleton } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'
import { EmptyState } from '../components/EmptyState'
import { useTeam } from '../hooks/useTeams'
import { useLiveGames, useGames } from '../hooks/useGames'
import { useStandings } from '../hooks/useStandings'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { getSelectedTeam } from '../lib/storage'
import { supabase } from '../lib/supabase'
import type { ScoreLog } from '../types'

export function Home() {
  const selectedTeamName = getSelectedTeam()
  const { team } = useTeam(selectedTeamName)
  const { games: liveGames, loading: liveLoading } = useLiveGames()
  const { games: upcomingGames, loading: upcomingLoading } = useGames(selectedTeamName, 'scheduled')
  const { standings, loading: standingsLoading } = useStandings()
  const { players: topPlayers, loading: playersLoading } = useLeaderboard(3)

  // Scores for live games
  const [gameScores, setGameScores] = useState<Record<number, { home: number; away: number }>>({})

  useEffect(() => {
    const fetchScores = async () => {
      if (liveGames.length === 0) return

      const { data } = await supabase
        .from('score_logs')
        .select('*')
        .in('game_id', liveGames.map(g => g.id))

      if (data) {
        const scores: Record<number, { home: number; away: number }> = {}
        for (const game of liveGames) {
          const gameLogs = data.filter((l: ScoreLog) => l.game_id === game.id)
          scores[game.id] = {
            home: gameLogs.filter((l: ScoreLog) => l.team_name === game.home_team_name).reduce((s: number, l: ScoreLog) => s + l.points, 0),
            away: gameLogs.filter((l: ScoreLog) => l.team_name === game.away_team_name).reduce((s: number, l: ScoreLog) => s + l.points, 0)
          }
        }
        setGameScores(scores)
      }
    }

    fetchScores()
  }, [liveGames])

  const myTeamLiveGames = selectedTeamName
    ? liveGames.filter(g => g.home_team_name === selectedTeamName || g.away_team_name === selectedTeamName)
    : liveGames

  const nextGame = upcomingGames[0]
  const myTeamStanding = standings.find(s => s.name === selectedTeamName)

  return (
    <Layout>
      <Header
        title={selectedTeamName ? `${selectedTeamName}` : 'Tamkeen League'}
        rightAction={
          <Link
            to="/select-team"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            aria-label="Change team"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </Link>
        }
      />

      <div className="p-4 space-y-6">
        {/* Team Stats Card (if team selected) */}
        {selectedTeamName && myTeamStanding && (
          <Link to={`/team/${selectedTeamName}`} className="block">
            <div className="card p-4 bg-tamkeen-primary text-white">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm opacity-80">Your Team</span>
                <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                  #{myTeamStanding.rank}
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{selectedTeamName}</div>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="opacity-80">Record:</span>{' '}
                  <span className="font-semibold">{team?.wins}-{team?.losses}</span>
                </div>
                <div>
                  <span className="opacity-80">Diff:</span>{' '}
                  <span className="font-semibold">
                    {myTeamStanding.point_diff > 0 ? '+' : ''}{myTeamStanding.point_diff}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Live Games */}
        {myTeamLiveGames.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Now
            </h2>
            <div className="space-y-3">
              {myTeamLiveGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  homeScore={gameScores[game.id]?.home || 0}
                  awayScore={gameScores[game.id]?.away || 0}
                />
              ))}
            </div>
          </section>
        )}

        {/* Next Game */}
        {nextGame && (
          <section>
            <h2 className="text-lg font-semibold mb-3">
              {selectedTeamName ? 'Next Game' : 'Upcoming'}
            </h2>
            {upcomingLoading ? (
              <GameCardSkeleton />
            ) : (
              <GameCard game={nextGame} />
            )}
          </section>
        )}

        {/* Quick Standings */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Standings</h2>
            <Link to="/standings" className="text-sm text-tamkeen-primary font-medium">
              See All
            </Link>
          </div>
          {standingsLoading ? (
            <div className="card p-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="card overflow-hidden">
              {standings.slice(0, 5).map((team, index) => (
                <Link
                  key={team.id}
                  to={`/team/${team.name}`}
                  className={`flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    team.name === selectedTeamName ? 'bg-tamkeen-primary/5' : ''
                  } ${index < 4 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-medium text-gray-500">
                      {team.rank}
                    </span>
                    <span className={`font-medium ${team.name === selectedTeamName ? 'text-tamkeen-primary' : ''}`}>
                      {team.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {team.wins}-{team.losses}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Top Scorers */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Top Scorers</h2>
            <Link to="/leaderboard" className="text-sm text-tamkeen-primary font-medium">
              See All
            </Link>
          </div>
          {playersLoading ? (
            <div className="card p-4">
              <LoadingSpinner />
            </div>
          ) : topPlayers.length > 0 ? (
            <div className="card overflow-hidden">
              {topPlayers.map((player, index) => (
                <div
                  key={player.player_name}
                  className={`flex items-center justify-between p-3 ${
                    index < 2 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-tamkeen-primary/10 text-tamkeen-primary text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium">{player.player_name}</div>
                      <div className="text-xs text-gray-500">{player.team_name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{player.total_points}</div>
                    <div className="text-xs text-gray-500">{player.ppg.toFixed(1)} PPG</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No stats yet" description="Player stats will appear after games are played" />
          )}
        </section>
      </div>
    </Layout>
  )
}
