import { invokeEdge } from './edgeFunction.js'

// Public half of the VAPID key pair. Safe to ship: it only lets the browser
// verify that pushes come from this app's server. The private half lives in
// the Edge Function's secrets.
const VAPID_PUBLIC_KEY = 'BOwci6yKdViJge_twvkUut5mFSoQBfP7pNAuquZV6DDwvACps5g9ULiCxxCxmDWx3uBJzDRdPT7XHypvWji7NAA'

export const DEFAULT_REMINDER_HOUR = 20

// pushManager.subscribe wants the key as raw bytes, not the url-safe base64
// the rest of the world passes VAPID keys around as.
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

export function pushSupported() {
  return (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof window !== 'undefined' &&
    'PushManager' in window &&
    'Notification' in window
  )
}

// iOS only allows a PWA to subscribe once it has been added to the home screen
// and opened from there - in Safari itself the call fails with a bare error,
// so it is worth telling the user which case they are in.
export function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export function currentTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export async function existingSubscription() {
  if (!pushSupported()) return null
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

export async function enablePush(reminderHour = DEFAULT_REMINDER_HOUR) {
  if (!pushSupported()) {
    throw new Error('This browser cannot show notifications.')
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Notifications are blocked. Turn them back on for this app in your phone settings.'
        : 'Notifications were not allowed.',
    )
  }

  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
  }

  await invokeEdge('push', {
    action: 'subscribe',
    subscription: subscription.toJSON(),
    timezone: currentTimezone(),
    reminderHour,
  })

  return subscription
}

export async function disablePush() {
  const subscription = await existingSubscription()
  if (subscription) {
    await invokeEdge('push', { action: 'unsubscribe', endpoint: subscription.endpoint })
    await subscription.unsubscribe()
  }
}

export async function updateReminderHour(reminderHour) {
  const subscription = await existingSubscription()
  if (!subscription) throw new Error('Notifications are not switched on yet.')
  await invokeEdge('push', {
    action: 'subscribe',
    subscription: subscription.toJSON(),
    timezone: currentTimezone(),
    reminderHour,
  })
}

// Asks the server to push right now, so the whole chain can be proved end to
// end without waiting until the evening.
export async function sendTestPush() {
  await invokeEdge('push', { action: 'test' })
}
