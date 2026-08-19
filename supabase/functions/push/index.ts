import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'
import { habitsStillDue, localParts, reminderBody, shouldSend } from './reminders.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:reminders@example.com'
// A secret of our own for the scheduled job. Comparing against the injected
// service role key looked simpler but is not portable: which key Supabase
// injects depends on the project's key generation, and pasting a long JWT
// into a SQL header is easy to break with a stray newline.
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function getCaller(req: Request) {
  const jwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  const anon = createClient(SUPABASE_URL, ANON_KEY)
  const { data, error } = await anon.auth.getUser(jwt)
  if (error || !data.user) return null
  return data.user
}

// Returns true when the subscription is gone for good and has been dropped.
async function deliver(admin: any, row: any, payload: unknown) {
  const subscription = {
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
  }
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return false
  } catch (error: any) {
    // The push service reporting a subscription the browser already threw away.
    if (error?.statusCode === 404 || error?.statusCode === 410) {
      await admin.from('push_subscriptions').delete().eq('endpoint', row.endpoint)
      return true
    }
    throw error
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { action, subscription, timezone, reminderHour, endpoint, secret } = await req.json()

    if (action === 'subscribe') {
      const user = await getCaller(req)
      if (!user) return json({ error: 'Not signed in.' }, 401)
      if (!subscription?.endpoint) return json({ error: 'Missing subscription.' }, 400)

      const { error } = await admin.from('push_subscriptions').upsert(
        {
          endpoint: subscription.endpoint,
          user_id: user.id,
          p256dh: subscription.keys?.p256dh,
          auth: subscription.keys?.auth,
          timezone: timezone ?? 'UTC',
          reminder_hour: reminderHour ?? 20,
        },
        { onConflict: 'endpoint' },
      )
      if (error) throw error
      return json({ ok: true })
    }

    if (action === 'unsubscribe') {
      const user = await getCaller(req)
      if (!user) return json({ error: 'Not signed in.' }, 401)
      const { error } = await admin
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', endpoint)
      if (error) throw error
      return json({ ok: true })
    }

    if (action === 'test') {
      const user = await getCaller(req)
      if (!user) return json({ error: 'Not signed in.' }, 401)
      const { data: rows, error } = await admin
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', user.id)
      if (error) throw error
      if (!rows?.length) return json({ error: 'No device is signed up for notifications yet.' }, 400)

      let expired = 0
      for (const row of rows) {
        const gone = await deliver(admin, row, {
          title: 'Habit Tracker',
          body: 'Notifications are working.',
          tag: 'test',
        })
        if (gone) expired++
      }
      return json({ ok: true, sent: rows.length - expired })
    }

    if (action === 'run-reminders') {
      // Called by the scheduler, not by a signed-in browser, so it is gated on
      // a shared secret rather than on a user's token. Trimmed, because the
      // value travels through hand-edited SQL.
      const provided = String(secret ?? '').trim()
      const bearer = (req.headers.get('Authorization') ?? '').replace('Bearer ', '').trim()
      const allowed =
        (CRON_SECRET && provided === CRON_SECRET) || (SERVICE_ROLE_KEY && bearer === SERVICE_ROLE_KEY)
      if (!allowed) return json({ error: 'Not allowed.' }, 401)

      const now = new Date()
      const { data: rows, error } = await admin
        .from('push_subscriptions')
        .select('endpoint, user_id, p256dh, auth, timezone, reminder_hour, last_sent_on')
      if (error) throw error

      let sent = 0
      for (const row of rows ?? []) {
        const local = localParts(row.timezone ?? 'UTC', now)
        if (!shouldSend(row, local)) continue

        const { data: appRow } = await admin
          .from('app_data')
          .select('data')
          .eq('user_id', row.user_id)
          .maybeSingle()

        const due = habitsStillDue(appRow?.data?.habits ?? [], local.date)
        if (due.length === 0) continue

        const gone = await deliver(admin, row, {
          title: 'Still time today',
          body: reminderBody(due),
          tag: 'habit-reminder',
        })
        if (gone) continue

        await admin.from('push_subscriptions').update({ last_sent_on: local.date }).eq('endpoint', row.endpoint)
        sent++
      }
      return json({ ok: true, sent })
    }

    return json({ error: 'Unknown action.' }, 400)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, 500)
  }
})
