import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Header } from '../components/Header'
import { PlayerRowSkeleton } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'
import { EmptyState } from '../components/EmptyState'
import { ShareButton } from '../components/ShareButton'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { sharePlayerStats } from '../lib/share'

export function Leaderboard() {
  const { players, loading, error, refetch } = useLeaderboard(15)

  if (error) {
    return (
      <Layout>
        <Header title="Leaderboard" />
        <ErrorState message={error} onRetry={refetch} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header title="Top Scorers" />

      {loading ? (
        <div className="p-4">
          <div className="card overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <PlayerRowSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : players.length === 0 ? (
        <EmptyState
          title="No stats yet"
          description="Player leaderboard will appear after games are played"
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
      ) : (
        <div className="p-4">
          {/* Top 3 showcase */}
          {players.length >= 3 && (
            <div className="flex justify-center items-end gap-2 mb-6 px-4">
              {/* 2nd place */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-gray-400">2</span>
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm truncate max-w-[80px]">{players[1].player_name}</div>
                  <div className="text-xs text-gray-500">{players[1].total_points} PTS</div>
                </div>
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center -mt-4">
                <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center mb-2 ring-4 ring-yellow-200">
                  <span className="text-3xl font-bold text-yellow-800">1</span>
                </div>
                <div className="text-center">
                  <div className="font-bold truncate max-w-[100px]">{players[0].player_name}</div>
                  <div className="text-sm text-tamkeen-primary font-semibold">{players[0].total_points} PTS</div>
                </div>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-300">3</span>
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm truncate max-w-[80px]">{players[2].player_name}</div>
                  <div className="text-xs text-gray-500">{players[2].total_points} PTS</div>
                </div>
              </div>
            </div>
          )}

          {/* Full list */}
          <div className="card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_repeat(3,minmax(0,1fr))] gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <span className="w-8">#</span>
              <span>Player</span>
              <span className="text-center">GP</span>
              <span className="text-center">PTS</span>
              <span className="text-center">PPG</span>
            </div>

            {players.map((player, index) => (
              <div
                key={player.player_name}
                className={`grid grid-cols-[auto_1fr_repeat(3,minmax(0,1fr))] gap-2 px-4 py-3 items-center ${
                  index < players.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                }`}
              >
                <span className={`w-8 font-bold ${
                  index === 0 ? 'text-yellow-500' :
                  index === 1 ? 'text-gray-400' :
                  index === 2 ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <Link to={`/team/${player.team_name}`} className="block">
                    <div className="font-medium truncate">{player.player_name}</div>
                    <div className="text-xs text-gray-500 truncate">{player.team_name}</div>
                  </Link>
                </div>
                <span className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {player.games_played}
                </span>
                <span className="text-center font-bold">{player.total_points}</span>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {player.ppg.toFixed(1)}
                  </span>
                  <ShareButton
                    size="sm"
                    onShare={() => sharePlayerStats(
                      player.player_name,
                      player.team_name,
                      player.total_points,
                      player.ppg
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            GP = Games Played • PTS = Total Points • PPG = Points Per Game
          </div>
        </div>
      )}
    </Layout>
  )
}
