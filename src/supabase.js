import { createClient } from '@supabase/supabase-js'

// These are safe to ship in the bundle: the publishable key only grants access
// through row-level-security policies, which restrict every row to the user who
// owns it. The secret key is never used here.
const SUPABASE_URL = 'https://cmwelpfjgmkfvzymoozl.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_9q2MtA2sOO86b1tvR7Zbwg_Gmq2hxxs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

// Where the magic-link email should send the user back to. On GitHub Pages the
// app lives under /lifestyle-app/, so origin alone is not enough.
export function redirectUrl() {
  return `${window.location.origin}${import.meta.env.BASE_URL}`
}
