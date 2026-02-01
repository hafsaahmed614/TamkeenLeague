import { useState } from 'react'

interface ShareButtonProps {
  onShare: () => Promise<boolean>
  className?: string
  size?: 'sm' | 'md'
}

export function ShareButton({ onShare, className = '', size = 'md' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const success = await onShare()
    if (success && !navigator.share) {
      // Show "Copied!" feedback for clipboard fallback
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const sizeClasses = size === 'sm' ? 'p-1.5' : 'p-2'
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <button
      onClick={handleShare}
      className={`hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${sizeClasses} ${className}`}
      aria-label="Share"
    >
      {copied ? (
        <svg className={`${iconSize} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )}
    </button>
  )
}
