import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// If env is not provided (local dev), provide a small mock supabase client
// so pages (especially admin login) continue to work without crashing.
export function createMockClient() {
	const STORAGE_KEY = 'mock_supabase_session'

	function getStored() {
		try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
	}
	function setStored(s:any) { try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) }catch(e){} }

	// simple persistence for mock tables
	function getTable(key: string) {
		try { return JSON.parse(localStorage.getItem(key) || 'null') || [] } catch { return [] }
	}
	function setTable(key: string, value: any) { try { localStorage.setItem(key, JSON.stringify(value)) } catch(e) {} }

	function makeFrom(tableName: string) {
		const storageKey = `mock_table_${tableName}`
		return {
			select: (cols?: any, opts?: any) => {
				const arr = getTable(storageKey)
				const p: any = Promise.resolve({ data: arr, error: null, count: arr.length })
				p.order = (col: string, o?: any) => {
					const exec = (n?: number) => new Promise((resolve) => {
						let a = getTable(storageKey)
						if (col) {
							a = a.slice().sort((x:any,y:any)=>{
								const av = x[col] || ''
								const bv = y[col] || ''
								if (o && o.ascending === false) return (av < bv) ? 1 : -1
								return (av > bv) ? 1 : -1
							})
						}
						const out = (typeof n === 'number') ? a.slice(0, n) : a
						resolve({ data: out, error: null, count: a.length })
					})
					const q: any = exec()
					q.limit = (n?: number) => exec(n)
					return q
				}
				p.limit = (n?: number) => new Promise((resolve) => {
					const out = (typeof n === 'number') ? arr.slice(0, n) : arr
					resolve({ data: out, error: null, count: arr.length })
				})
				return p
			},
			insert: async (items: any[]) => {
				const arr = getTable(storageKey)
				const nextId = (arr.length ? Math.max(...arr.map((x:any)=>x.id||0)) : 0) + 1
				const toInsert = items.map((it:any, i:number)=> ({ id: nextId + i, ...it, created_at: new Date().toISOString() }))
				const newArr = toInsert.concat(arr)
				setTable(storageKey, newArr)
				return { data: toInsert, error: null }
			},
			update: (payload: any) => ({
				eq: async (col: string, val: any) => {
					const arr = getTable(storageKey)
					let updated: any[] = []
					const newArr = arr.map((it:any)=>{
						if (it[col] == val) { const merged = { ...it, ...payload, updated_at: new Date().toISOString() }; updated.push(merged); return merged }
						return it
					})
					setTable(storageKey, newArr)
					return { data: updated, error: null }
				}
			}),
			delete: () => ({
				eq: async (col: string, val: any) => {
					const arr = getTable(storageKey)
					const removed = arr.filter((it:any)=> it[col] == val)
					const newArr = arr.filter((it:any)=> it[col] != val)
					setTable(storageKey, newArr)
					return { data: removed, error: null }
				}
			})
		}
	}

	return {
		auth: {
			async signInWithPassword({ email, password }: any) {
				// accept only the seeded admin account for mock
				const okEmail = 'apotekadmin@local'
				const okPass = 'admin12321'
						// accept either the longer seeded password or the short one the admin uses
						if (email === okEmail && (password === okPass || password === '12321')) {
					const user = { id: '00000000-0000-0000-0000-000000000001', email, user_metadata: { username: 'apotekadmin', role: 'admin' } }
					const session = { access_token: 'mock-token', user }
					setStored({ session })
					return { data: { user, session }, error: null }
				}
				return { data: null, error: { message: 'Invalid login credentials' } }
			},

			async getSession() {
				const stored = getStored()
				return { data: { session: stored?.session || null }, error: null }
			},

			async signOut() {
				setStored(null)
				return { error: null }
			}
		},
		from: (tableName: string) => makeFrom(tableName)
	}
}

// Create a real Supabase client from environment variables when available.
// Fall back to an in-browser mock client when `NEXT_PUBLIC_SUPABASE_URL` or
// `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not provided so public pages still work
// in local/dev without crashing and stats won't silently remain zero.
export const supabase = (url && key) ? createClient(url, key) : createMockClient()

export default supabase
