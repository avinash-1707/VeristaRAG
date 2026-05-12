'use client'

import React from 'react'

export function useScroll(threshold: number) {
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    window.addEventListener('scroll', onStoreChange, { passive: true })
    return () => window.removeEventListener('scroll', onStoreChange)
  }, [])

  const getSnapshot = React.useCallback(() => window.scrollY > threshold, [threshold])
  const getServerSnapshot = React.useCallback(() => false, [])

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
