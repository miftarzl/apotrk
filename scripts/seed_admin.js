require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE

if (!URL || !KEY) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE in env')
  process.exit(1)
}

const supabase = createClient(URL, KEY)

async function seed() {
  const email = 'apotekadmin@example.com'
  const password = 'admin12321'
  const hash = await bcrypt.hash(password, 10)

  // upsert admin
  const { data, error } = await supabase.from('profiles').upsert([{ email, password_hash: hash, role: 'admin' }], { onConflict: ['email'] }).select()
  if (error) { console.error('Seed error', error); process.exit(1) }
  console.log('Seeded admin:', data)
}

seed().catch(err => { console.error(err); process.exit(1) })
