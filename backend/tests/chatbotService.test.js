const test = require('node:test')
const assert = require('node:assert/strict')

function loadServiceWithStub() {
  const medicine = {
    nama_obat: 'Sanmol',
    kategori: 'Obat Demam',
    harga: 'Rp 5000',
    manfaat: 'Meredakan sakit kepala',
    dosis: '1 tablet 3x sehari'
  }

  const stub = {
    from(table) {
      return {
        select() {
          return {
            ilike(column, value) {
              return {
                limit(limit) {
                  if (column === 'nama_obat' && String(value).toLowerCase().includes('sanmol')) {
                    return Promise.resolve({ data: [medicine], error: null })
                  }
                  return Promise.resolve({ data: [], error: null })
                }
              }
            },
            or(query) {
              return {
                limit(limit) {
                  if (String(query).includes('sakit kepala')) {
                    return Promise.resolve({ data: [medicine], error: null })
                  }
                  return Promise.resolve({ data: [], error: null })
                }
              }
            }
          }
        }
      }
    }
  }

  const cacheKey = require.resolve('../src/config/supabase')
  const original = require.cache[cacheKey]
  require.cache[cacheKey] = { exports: stub }
  delete require.cache[require.resolve('../src/services/chatbotService')]

  const service = require('../src/services/chatbotService')
  if (original) {
    require.cache[cacheKey] = original
  }
  return service
}

test('menangani sinonim manfaat seperti pusing ke sakit kepala', async () => {
  const { processMessage } = loadServiceWithStub()
  const result = await processMessage('obat pusing')
  assert.match(result, /Sanmol/i)
  assert.match(result, /Saya menemukan beberapa obat/i)
})

test('menangani pertanyaan normalisasi seperti apa obat sakit kepala', async () => {
  const { processMessage } = loadServiceWithStub()
  const result = await processMessage('Apa obat sakit kepala?')
  assert.match(result, /Saya menemukan beberapa obat/i)
  assert.match(result, /Sanmol/i)
})

test('menangani pertanyaan informasi obat yang diawali kata umum', async () => {
  const { processMessage } = loadServiceWithStub()
  const result = await processMessage('Informasi Sanmol')
  assert.match(result, /Nama Obat: Sanmol/i)
  assert.match(result, /Harga:/i)
})

test('menjawab pertanyaan umum tentang jam operasional apotek', async () => {
  const { processMessage } = loadServiceWithStub()
  const result = await processMessage('jam buka')
  assert.match(result, /Jam operasional/i)
  assert.match(result, /Apotek Sehati Jaya Farma/i)
})

test('fallback mengembalikan pesan yang sesuai', async () => {
  const { processMessage } = loadServiceWithStub()
  const result = await processMessage('pertanyaan yang tidak dikenal')
  assert.match(result, /Maaf, saya belum memahami pertanyaan tersebut\./i)
  assert.match(result, /Obat untuk sakit kepala/i)
  assert.match(result, /Cara upload resep/i)
})
