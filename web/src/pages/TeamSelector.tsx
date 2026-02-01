import { useNavigate } from 'react-router-dom'
import { useTeams } from '../hooks/useTeams'
import { setSelectedTeam } from '../lib/storage'
import { Layout } from '../components/Layout'
import { LoadingSpinner } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'

export function TeamSelector() {
  const navigate = useNavigate()
  const { teams, loading, error, refetch } = useTeams()

  const handleSelectTeam = (teamName: string) => {
    setSelectedTeam(teamName)
    navigate('/')
  }

  if (loading) {
    return (
      <Layout hideNav>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <LoadingSpinner />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout hideNav>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout hideNav>
      <div className="min-h-screen flex flex-col p-6">
        {/* Logo area */}
        <div className="flex-1 flex flex-col items-center justify-center mb-8">
          <img
            src="https://tamkeensports.org/wp-content/uploads/2025/07/Maroon-transparent-logo-scaled-100x100.png"
            alt="Tamkeen League"
            className="w-24 h-24 mb-6"
          />
          <h1 className="text-2xl font-bold font-heading text-tamkeen-primary dark:text-white mb-2">
            Tamkeen League
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center font-body">
            Select Your Team
          </p>
        </div>

        {/* Team list */}
        <div className="space-y-3">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => handleSelectTeam(team.name)}
              className="w-full card p-4 flex items-center justify-between hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tamkeen-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {team.name.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {team.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {team.wins}-{team.losses} Record
                  </div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* View all option */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setSelectedTeam(null)
              navigate('/')
            }}
            className="text-tamkeen-primary font-medium hover:underline"
          >
            View all teams instead
          </button>
        </div>
      </div>
    </Layout>
  )
}
