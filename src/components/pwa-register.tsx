import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (!import.meta.env.PROD) return
    if (!('serviceWorker' in navigator)) return
    void navigator.serviceWorker.register('/sw.js', { scope: '/' })
  }, [])

  return null
}
