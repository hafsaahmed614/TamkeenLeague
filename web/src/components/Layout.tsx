import { BottomNav } from './BottomNav'

interface LayoutProps {
  children: React.ReactNode
  hideNav?: boolean
}

export function Layout({ children, hideNav }: LayoutProps) {
  return (
    <div className="min-h-screen bg-tamkeen-secondary dark:bg-black">
      <main className={`max-w-lg mx-auto ${hideNav ? '' : 'pb-20'}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
