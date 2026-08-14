import { supabase } from './supabase.js'

// supabase-js's invoke() reports the same generic message ("Edge Function
// returned a non-2xx status code") whatever actually went wrong - the
// function's own JSON error body is only reachable through error.context, the
// raw Response. Unwrapping it here keeps every caller's failures debuggable.
export async function invokeEdge(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) {
    const parsed = await error.context?.json?.().catch(() => null)
    throw new Error(parsed?.error ?? error.message)
  }
  if (data?.error) throw new Error(data.error)
  return data
}
