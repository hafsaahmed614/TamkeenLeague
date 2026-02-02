import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getDarkMode, setDarkMode } from '../lib/storage'

interface HeaderProps {
  title: string
  showBack?: boolean
  backTo?: string
  rightAction?: React.ReactNode
}

export function Header({ title, showBack, backTo = '/', rightAction }: HeaderProps) {
  const [darkMode, setDarkModeState] = useState(getDarkMode())

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    const newValue = !darkMode
    setDarkModeState(newValue)
    setDarkMode(newValue)
  }

  return (
    <header className="sticky top-0 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 z-40">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link
              to={backTo}
              className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-black dark:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          <h1 className="text-lg font-semibold truncate text-black dark:text-white">{title}</h1>
        </div>

        <div className="flex items-center gap-2 text-black dark:text-white">
          {rightAction}
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
