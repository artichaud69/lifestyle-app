import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase, redirectUrl } from './supabase.js'
import { reconcile, startAutoPush, lastSyncedAt } from './sync.js'

export function useSync() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState(null)
  const [syncedAt, setSyncedAt] = useState(() => lastSyncedAt())
  const stopAutoPush = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id

  useEffect(() => {
    if (!userId) {
      stopAutoPush.current?.()
      stopAutoPush.current = null
      setStatus('idle')
      return
    }

    let cancelled = false
    setStatus('syncing')
    reconcile(userId)
      .then(({ at }) => {
        if (cancelled) return
        setStatus('synced')
        setSyncedAt(at)
      })
      .catch((error) => {
        if (cancelled) return
        setStatus('error')
        setMessage(error.message)
      })

    stopAutoPush.current = startAutoPush(userId, {
      onStateChange: ({ status: next, at, message: nextMessage }) => {
        if (cancelled) return
        setStatus(next)
        if (at) setSyncedAt(at)
        if (nextMessage) setMessage(nextMessage)
      },
    })

    return () => {
      cancelled = true
      stopAutoPush.current?.()
      stopAutoPush.current = null
    }
  }, [userId])

  // Password sign-in keeps the whole exchange inside the app, which matters on
  // iOS where an installed home-screen app has its own storage and email links
  // always open in Safari instead.
  const signIn = useCallback(async (email, password) => {
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
      return false
    }
    return true
  }, [])

  const signUp = useCallback(async (email, password) => {
    setMessage(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl() },
    })
    if (error) {
      setMessage(error.message)
      return false
    }
    if (!data.session) {
      setMessage(`Account created. Confirm ${email} from your inbox, then sign in here.`)
    }
    return true
  }, [])

  // Lets an account created through the old magic-link flow gain a password
  // without losing the data already backed up under it.
  const setPassword = useCallback(async (password) => {
    setMessage(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage(error.message)
      return false
    }
    setMessage('Password saved. You can now sign in with it anywhere.')
    return true
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setMessage(null)
  }, [])

  return {
    session,
    ready,
    status,
    message,
    syncedAt,
    signIn,
    signUp,
    setPassword,
    signOut,
  }
}
