// A temporary diagnostic, not a feature.
//
// Getting a rest alert onto a paired Apple Watch means getting a notification
// onto the phone — the watch mirrors those when the phone is locked. But iOS
// suspends a backgrounded web app, so a locally scheduled "notify me in 90
// seconds" never fires on time; it fires whenever you next pick the phone up.
// The only thing that wakes a suspended web app on time is a push sent from a
// server, which is a real backend this app doesn't have.
//
// Before writing any of that, this answers the question that decides whether
// it's even worth building: can THIS phone subscribe to push? Apple allows it
// only for web apps installed to the Home Screen (never a plain Safari tab),
// and EU availability has been through more than one reversal. Every step is
// reported separately so a failure names itself rather than being a shrug.
//
// The key below is a throwaway used only to make subscribe() a valid call. If
// this goes ahead, a fresh pair gets generated with the private half living in
// the server's secrets.
const VAPID_PUBLIC_KEY = 'BFnuow7Ou9Wof4Cfv9PovmoBmABAHNy_0mNZsws3bU5dTA4GfjReX1SPdmuDPMVYkMhmU27XPAvErVeJNNn4YcY'

function vapidKeyBytes(base64) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded)
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)))
}

function isInstalled() {
  if (typeof window === 'undefined') return false
  // navigator.standalone is the iOS-specific one, and it's the case that
  // actually matters here.
  return window.navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true
}

export async function runPushCheck() {
  const steps = []
  const add = (label, ok, detail = '') => steps.push({ label, ok, detail })

  const installed = isInstalled()
  add('Installed to Home Screen', installed, installed ? '' : 'iOS only allows push for installed web apps, not Safari tabs')

  if (typeof Notification === 'undefined') {
    add('Notifications supported', false, 'this browser has no Notification API')
    return steps
  }
  add('Notifications supported', true)

  // Must be the first thing that yields — iOS rejects a permission request
  // that has drifted out of the tap that started it.
  let permission = Notification.permission
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission()
    } catch (error) {
      add('Permission granted', false, error?.message ?? 'request failed')
      return steps
    }
  }
  add('Permission granted', permission === 'granted', permission)
  if (permission !== 'granted') return steps

  if (!('serviceWorker' in navigator)) {
    add('Service worker ready', false, 'no service worker support')
    return steps
  }
  let registration
  try {
    registration = await navigator.serviceWorker.ready
    add('Service worker ready', true)
  } catch (error) {
    add('Service worker ready', false, error?.message ?? 'not ready')
    return steps
  }

  const hasPushManager = 'pushManager' in registration
  add('Push API available', hasPushManager, hasPushManager ? '' : 'no PushManager on this device')

  if (hasPushManager) {
    try {
      const existing = await registration.pushManager.getSubscription()
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKeyBytes(VAPID_PUBLIC_KEY),
        }))
      // The endpoint host says which push service would deliver it — Apple's
      // own for an iPhone.
      let host = ''
      try {
        host = new URL(subscription.endpoint).host
      } catch {
        host = 'unknown host'
      }
      add('Push subscription created', true, host)
    } catch (error) {
      add('Push subscription created', false, `${error?.name ?? 'Error'}: ${error?.message ?? ''}`.slice(0, 120))
    }
  }

  // iOS has no Notification constructor — notifications have to come from the
  // service worker registration, which is also how a real pushed one arrives.
  try {
    await registration.showNotification('Rest over', {
      body: 'If this reached your watch, the whole approach works.',
      tag: 'gym-tracker-test',
    })
    add('Test notification shown', true, 'lock the phone and re-run to test the watch')
  } catch (error) {
    add('Test notification shown', false, error?.message ?? 'failed')
  }

  return steps
}
