const { createClient } = require('@supabase/supabase-js')
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Supabase config missing in env for backend')
} else {
  console.log('Supabase URL detected in backend config')
}

console.log('Creating supabase client with URL:', SUPABASE_URL ? SUPABASE_URL.slice(0,50) + '...' : '(empty)')
if (process.env.SUPABASE_SERVICE_ROLE) console.log('Using service role')
const supabase = createClient(String(SUPABASE_URL), String(SUPABASE_KEY))

module.exports = supabase
