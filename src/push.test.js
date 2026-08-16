import { describe, it, expect, beforeEach, vi } from 'vitest'

const invocations = []
const invokeResult = { current: { data: { ok: true }, error: null } }

vi.mock('./supabase.js', () => ({
  supabase: {
    functions: {
      invoke: async (name, options) => {
        invocations.push({ name, options })
        return invokeResult.current
      },
    },
  },
}))

const {
  urlBase64ToUint8Array,
  pushSupported,
  isStandalone,
  isIOS,
  canSubscribeHere,
  currentTimezone,
  enablePush,
  disablePush,
  sendTestPush,
  DEFAULT_REMINDER_HOUR,
} = await import('./push.js')

const VAPID_PUBLIC_KEY =
  'BOwci6yKdViJge_twvkUut5mFSoQBfP7pNAuquZV6DDwvACps5g9ULiCxxCxmDWx3uBJzDRdPT7XHypvWji7NAA'

const fakeSubscription = {
  endpoint: 'https://push.example.com/abc',
  toJSON: () => ({
    endpoint: 'https://push.example.com/abc',
    keys: { p256dh: 'p256dh-value', auth: 'auth-value' },
  }),
  unsubscribe: vi.fn(async () => true),
}

function mockPushEnvironment({ permission = 'granted', existing = null } = {}) {
  const subscribe = vi.fn(async () => fakeSubscription)
  const registration = {
    pushManager: {
      getSubscription: vi.fn(async () => existing),
      subscribe,
    },
  }
  navigator.serviceWorker = { ready: Promise.resolve(registration) }
  window.PushManager = function PushManager() {}
  window.Notification = { requestPermission: vi.fn(async () => permission) }
  globalThis.Notification = window.Notification
  return { subscribe, registration }
}

beforeEach(() => {
  invocations.length = 0
  invokeResult.current = { data: { ok: true }, error: null }
  fakeSubscription.unsubscribe.mockClear()
})

describe('urlBase64ToUint8Array', () => {
  it('decodes the VAPID key to the 65 raw bytes the push API expects', () => {
    const bytes = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes).toHaveLength(65)
    // An uncompressed P-256 point always starts with 0x04.
    expect(bytes[0]).toBe(0x04)
  })

  it('restores padding that url-safe base64 drops', () => {
    // "aGk" is "hi" with its trailing "=" stripped.
    expect(Array.from(urlBase64ToUint8Array('aGk'))).toEqual([104, 105])
  })

  it('translates the url-safe alphabet back to standard base64', () => {
    // "-_" stand in for "+/", which decode to bytes 0xFB 0xFF.
    expect(Array.from(urlBase64ToUint8Array('-_8'))).toEqual([251, 255])
  })
})

describe('pushSupported', () => {
  it('is true when the browser has the whole push stack', () => {
    mockPushEnvironment()
    expect(pushSupported()).toBe(true)
  })

  it('is false without a PushManager', () => {
    mockPushEnvironment()
    delete window.PushManager
    expect(pushSupported()).toBe(false)
  })
})

describe('isStandalone', () => {
  it('spots an app launched from the home screen', () => {
    window.matchMedia = vi.fn(() => ({ matches: true }))
    expect(isStandalone()).toBe(true)
  })

  it('is false in a normal browser tab', () => {
    window.matchMedia = vi.fn(() => ({ matches: false }))
    window.navigator.standalone = false
    expect(isStandalone()).toBe(false)
  })

  it('accepts the older iOS flag when the media query is unavailable', () => {
    window.matchMedia = vi.fn(() => ({ matches: false }))
    window.navigator.standalone = true
    expect(isStandalone()).toBe(true)
  })
})

describe('isIOS', () => {
  function withUserAgent(userAgent, maxTouchPoints = 0) {
    Object.defineProperty(navigator, 'userAgent', { value: userAgent, configurable: true })
    Object.defineProperty(navigator, 'maxTouchPoints', { value: maxTouchPoints, configurable: true })
  }

  it('spots an iPhone', () => {
    withUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15')
    expect(isIOS()).toBe(true)
  })

  it('spots an iPad pretending to be a Mac', () => {
    withUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', 5)
    expect(isIOS()).toBe(true)
  })

  it('does not mistake a real Mac for one', () => {
    withUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120', 0)
    expect(isIOS()).toBe(false)
  })

  it('does not mistake a Windows desktop for one', () => {
    withUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120')
    expect(isIOS()).toBe(false)
  })
})

describe('canSubscribeHere', () => {
  function setPlatform(userAgent, { standalone = false, maxTouchPoints = 0 } = {}) {
    Object.defineProperty(navigator, 'userAgent', { value: userAgent, configurable: true })
    Object.defineProperty(navigator, 'maxTouchPoints', { value: maxTouchPoints, configurable: true })
    window.matchMedia = vi.fn(() => ({ matches: standalone }))
    window.navigator.standalone = standalone
  }

  it('lets a desktop browser subscribe straight from a tab', () => {
    setPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120', { standalone: false })
    expect(canSubscribeHere()).toBe(true)
  })

  it('holds an iPhone back until it is opened from the home screen', () => {
    setPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', { standalone: false })
    expect(canSubscribeHere()).toBe(false)
  })

  it('lets an installed iPhone app through', () => {
    setPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', { standalone: true })
    expect(canSubscribeHere()).toBe(true)
  })
})

describe('currentTimezone', () => {
  it('reports an IANA zone the server can do local-time maths with', () => {
    expect(currentTimezone()).toMatch(/^[A-Za-z_]+(\/[A-Za-z_+-]+)*$/)
  })
})

describe('enablePush', () => {
  it('subscribes and registers the device with its timezone and hour', async () => {
    const { subscribe } = mockPushEnvironment()

    await enablePush(19)

    expect(subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true, applicationServerKey: expect.any(Uint8Array) }),
    )
    expect(invocations).toHaveLength(1)
    expect(invocations[0].name).toBe('push')
    expect(invocations[0].options.body).toMatchObject({
      action: 'subscribe',
      reminderHour: 19,
      subscription: { endpoint: 'https://push.example.com/abc' },
    })
    expect(invocations[0].options.body.timezone).toBeTruthy()
  })

  it('reuses a subscription this device already has', async () => {
    const { subscribe } = mockPushEnvironment({ existing: fakeSubscription })

    await enablePush()

    expect(subscribe).not.toHaveBeenCalled()
    expect(invocations[0].options.body.reminderHour).toBe(DEFAULT_REMINDER_HOUR)
  })

  it('explains how to recover when notifications were blocked', async () => {
    mockPushEnvironment({ permission: 'denied' })
    await expect(enablePush()).rejects.toThrow(/blocked/i)
    expect(invocations).toHaveLength(0)
  })

  it('does not register the device when permission is merely dismissed', async () => {
    mockPushEnvironment({ permission: 'default' })
    await expect(enablePush()).rejects.toThrow(/not allowed/i)
    expect(invocations).toHaveLength(0)
  })
})

describe('disablePush', () => {
  it('tells the server to forget the device and drops the local subscription', async () => {
    mockPushEnvironment({ existing: fakeSubscription })

    await disablePush()

    expect(invocations[0].options.body).toEqual({
      action: 'unsubscribe',
      endpoint: 'https://push.example.com/abc',
    })
    expect(fakeSubscription.unsubscribe).toHaveBeenCalled()
  })

  it('is a no-op when this device was never subscribed', async () => {
    mockPushEnvironment({ existing: null })
    await disablePush()
    expect(invocations).toHaveLength(0)
  })
})

describe('sendTestPush', () => {
  it('asks the server to push straight away', async () => {
    mockPushEnvironment()
    await sendTestPush()
    expect(invocations[0].options.body).toEqual({ action: 'test' })
  })

  it('surfaces the real reason the server refused', async () => {
    mockPushEnvironment()
    invokeResult.current = {
      data: null,
      error: {
        message: 'Edge Function returned a non-2xx status code',
        context: { json: async () => ({ error: 'No device is signed up for notifications yet.' }) },
      },
    }
    await expect(sendTestPush()).rejects.toThrow('No device is signed up for notifications yet.')
  })
})
