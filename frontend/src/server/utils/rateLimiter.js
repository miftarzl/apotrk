const LRU = require('lru-cache')

const cache = new LRU({ max: 5000 })

function checkRate(headers, opts = {}) {
  const ip = headers.get ? (headers.get('x-forwarded-for') || headers.get('x-real-ip')) : (headers['x-forwarded-for'] || 'unknown')
  const key = `rate:${ip}`
  const count = cache.get(key) || 0
  const limit = opts.limit || 120
  const windowMs = opts.windowMs || 60 * 1000
  if (count >= limit) {
    return { ok: false, retryAfter: windowMs }
  }
  cache.set(key, count + 1, { ttl: windowMs })
  return { ok: true }
}

module.exports = { checkRate }
