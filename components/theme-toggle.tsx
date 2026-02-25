'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 font-mono text-xs"
      >
        ...
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed top-4 right-4 z-50 font-mono text-xs"
    >
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </Button>
  )
}
