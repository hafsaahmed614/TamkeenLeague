import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Home } from './pages/Home'
import { TeamSelector } from './pages/TeamSelector'
import { Standings } from './pages/Standings'
import { Schedule } from './pages/Schedule'
import { Leaderboard } from './pages/Leaderboard'
import { TeamDetail } from './pages/TeamDetail'
import { GameDetail } from './pages/GameDetail'
import { getDarkMode } from './lib/storage'

// Check if user has made a team preference (selected team or chose "view all")
function hasTeamPreference(): boolean {
  return localStorage.getItem('tamkeen_preferences') !== null
}

// Protected route that redirects to team selector if no preference set
function HomeRoute() {
  if (!hasTeamPreference()) {
    return <Navigate to="/select-team" replace />
  }
  return <Home />
}

function App() {
  const location = useLocation()

  useEffect(() => {
    // Initialize dark mode
    if (getDarkMode()) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/select-team" element={<TeamSelector />} />
      <Route path="/standings" element={<Standings />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/team/:teamName" element={<TeamDetail />} />
      <Route path="/game/:gameId" element={<GameDetail />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
