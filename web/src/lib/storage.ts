import type { UserPreferences } from '../types'

const STORAGE_KEY = 'tamkeen_preferences'

const defaultPreferences: UserPreferences = {
  selectedTeam: null,
  darkMode: false
}

export function getPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to load preferences:', e)
  }
  return defaultPreferences
}

export function savePreferences(prefs: Partial<UserPreferences>): void {
  try {
    const current = getPreferences()
    const updated = { ...current, ...prefs }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Failed to save preferences:', e)
  }
}

export function getSelectedTeam(): string | null {
  return getPreferences().selectedTeam
}

export function setSelectedTeam(team: string | null): void {
  savePreferences({ selectedTeam: team })
}

export function getDarkMode(): boolean {
  return getPreferences().darkMode
}

export function setDarkMode(enabled: boolean): void {
  savePreferences({ darkMode: enabled })
}
