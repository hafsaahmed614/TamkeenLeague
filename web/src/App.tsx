import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Home } from './pages/Home'
import { TeamSelector } from './pages/TeamSelector'
import { Standings } from './pages/Standings'
import { Schedule } from './pages/Schedule'
import { Leaderboard } from './pages/Leaderboard'
import { TeamDetail } from './pages/TeamDetail'
import { GameDetail } from './pages/GameDetail'
import { getSelectedTeam, getDarkMode } from './lib/storage'

function App() {
  const [hasSelectedTeam, setHasSelectedTeam] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has selected a team or explicitly chose "view all"
    const selectedTeam = getSelectedTeam()
    // If selectedTeam is null but key exists, user chose "view all"
    // If key doesn't exist at all, show team selector
    const hasPreference = localStorage.getItem('tamkeen_preferences') !== null
    setHasSelectedTeam(hasPreference)

    // Initialize dark mode
    if (getDarkMode()) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Wait for preference check
  if (hasSelectedTeam === null) {
    return null
  }

  return (
    <Routes>
      {/* If no team selected yet, redirect to selector */}
      <Route
        path="/"
        element={hasSelectedTeam ? <Home /> : <Navigate to="/select-team" replace />}
      />
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
