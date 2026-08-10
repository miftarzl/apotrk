const supabase = require('../config/supabase')
const fs = require('fs')
const path = require('path')

function loadKnowledge() {
  try {
    const candidates = [
      path.resolve(__dirname, '..', '..', 'data', 'knowledge.json'),
      path.resolve(__dirname, '..', '..', 'backend', 'data', 'knowledge.json')
    ]
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'))
      }
    }
    return {}
  } catch (err) {
    console.warn('Failed loading knowledge.json', err)
    return {}
  }
}

const KNOWLEDGE = loadKnowledge()

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeBase(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const normalizations = [
  ['pusing', 'sakit kepala'],
  ['sakit kepala', 'sakit kepala'],
  ['panas', 'demam'],
  ['pilek', 'flu'],
  ['flu', 'flu'],
  ['batuk berdahak', 'batuk'],
  ['asam lambung', 'maag'],
  ['maag', 'maag'],
  ['gimana', 'bagaimana'],
  ['gmn', 'bagaimana'],
  ['mau', 'ingin'],
  ['hendak', 'ingin'],
  ['resep dokter', 'upload resep'],
  ['obat', 'produk'],
  ['produk', 'produk'],
  ['beli', 'pesan'],
  ['checkout', 'bayar'],
  ['upload', 'unggah'],
  ['keranjang', 'cart'],
  ['pesanan', 'order'],
  ['bayar', 'pembayaran'],
  ['suplemen', 'vitamin'],
  ['demam', 'demam'],
  ['diare', 'diare'],
  ['nyeri', 'nyeri'],
  ['antiseptik', 'antiseptik'],
  ['anak', 'anak'],
  ['hipertensi', 'hipertensi'],
  ['diabetes', 'diabetes'],
  ['kolesterol', 'kolesterol'],
  ['pembayaran', 'pembayaran'],
  ['ongkir', 'ongkir'],
  ['alamat', 'alamat'],
  ['kelurahan', 'kelurahan'],
  ['kecamatan', 'kecamatan'],
  ['bebelan', 'babelan'],
  ['babelan', 'babelan']
]

function normalize(text) {
  let normalized = normalizeBase(text)
  for (const [from, to] of normalizations) {
    normalized = normalized.replace(new RegExp(escapeRegex(from), 'g'), to)
  }
  return normalized.replace(/\s+/g, ' ').trim()
}

const intentDefinitions = {
  greeting: {
    keywords: ['halo', 'hai', 'hallo', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'assalamualaikum', 'siapa kamu', 'apa kabar'],
    synonyms: ['selamat']
  },
  goodbye: {
    keywords: ['dadah', 'bye', 'sampai jumpa', 'sampai nanti', 'selamat tinggal', 'terima kasih'],
    synonyms: []
  }
}

const faqIntentDefinitions = {
  upload_prescription: {
    keywords: ['upload resep', 'unggah resep', 'cara upload resep', 'resep dokter', 'bagaimana upload resep', 'cara unggah resep', 'status resep', 'melihat resep', 'ditolak kenapa', 'diproses berapa lama'],
    synonyms: ['upload', 'unggah', 'resep']
  },
  payment: {
    keywords: ['cara pembayaran', 'pembayaran', 'metode pembayaran', 'midtrans', 'transfer', 'virtual account', 'va', 'qris', 'e-wallet', 'ewallet', 'cara bayar', 'bayar', 'status pembayaran'],
    synonyms: ['pembayaran', 'bayar', 'transfer', 'virtual account', 'qris', 'e-wallet']
  },
  order: {
    keywords: ['cara melihat pesanan', 'status pesanan', 'riwayat pesanan', 'pesanan', 'lacak pesanan', 'pesanan saya', 'order saya', 'riwayat order'],
    synonyms: ['order', 'pesanan']
  },
  shipping: {
    keywords: ['pengiriman', 'ongkir', 'resi', 'tracking', 'alamat pengiriman', 'kelurahan', 'kecamatan', 'babelan', 'luar babelan', 'luar area', 'area layanan', 'daerah layanan'],
    synonyms: ['delivery', 'pengantaran', 'ongkir', 'alamat']
  },
  contact: {
    keywords: ['kontak', 'telepon', 'nomor telepon', 'email', 'customer service', 'cs', 'hubungi', 'media sosial'],
    synonyms: ['nomor telepon', 'email']
  },
  store_information: {
    keywords: ['jam operasional', 'jam buka', 'hari operasional', 'alamat apotek', 'alamat', 'tentang apotek', 'nama apotek', 'siapa pemilik apotek', 'siapa apoteker', 'lokasi apotek', 'nama pemilik', 'pemilik apotek'],
    synonyms: ['jam buka', 'alamat', 'nama apotek', 'pemilik', 'apoteker', 'lokasi']
  },
  checkout: {
    keywords: ['cara checkout', 'cara membeli', 'cara memesan', 'checkout', 'keranjang', 'belanja', 'cara pesan', 'cara beli', 'beli obat'],
    synonyms: ['checkout', 'cart', 'pesan', 'beli']
  },
  account: {
    keywords: ['cara daftar', 'daftar', 'register', 'cara register', 'login', 'masuk', 'cara login', 'lupa password', 'reset password', 'ubah profil', 'ubah profile', 'ubah password', 'ubah alamat'],
    synonyms: ['daftar', 'register', 'login', 'password', 'profil', 'alamat']
  },
  medicine_category: {
    keywords: ['kategori obat', 'jenis obat', 'kategori', 'obat kategori', 'obat apa saja', 'ada obat apa saja', 'daftar obat', 'vitamin', 'suplemen', 'antiseptik', 'obat anak', 'obat hipertensi', 'obat diabetes', 'obat kolesterol', 'obat flu', 'obat demam', 'obat batuk', 'obat maag', 'obat diare', 'obat sakit kepala'],
    synonyms: ['vitamin', 'suplemen', 'antiseptik', 'anak', 'hipertensi', 'diabetes', 'kolesterol', 'flu', 'demam', 'batuk', 'maag', 'diare', 'sakit kepala']
  },
  medicine_price: {
    keywords: ['harga obat', 'berapa harga', 'harga', 'harga sanmol'],
    synonyms: ['harga']
  },
  medicine_dose: {
    keywords: ['dosis obat', 'dosis', 'aturan pakai', 'dosis sanmol'],
    synonyms: ['dosis']
  },
  medicine_side_effect: {
    keywords: ['efek samping', 'efek', 'reaksi obat', 'efek samping sanmol'],
    synonyms: ['efek']
  }
}

function termMatches(normalized, term) {
  const phrase = normalizeBase(term)
  if (!phrase) return false
  return new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'i').test(normalized)
}

function matchIntent(normalized, definitions = intentDefinitions) {
  let bestIntent = null
  let bestScore = 0

  for (const [intent, definition] of Object.entries(definitions)) {
    const matchedTerms = new Set([...definition.keywords, ...definition.synonyms])
    let score = 0
    for (const term of matchedTerms) {
      if (!term) continue
      if (termMatches(normalized, term)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent
    }
  }

  return bestScore > 0 ? bestIntent : null
}

async function findMedicineByName(name) {
  if (!name || name.length < 2) return null
  try {
    const q = `%${name}%`
    const { data, error } = await supabase
      .from('medicines')
      .select('id,nama_obat,kategori,harga,deskripsi,kandungan,kemasan,manfaat,dosis,efek_samping,foto_url,categories:kategori (id,nama_kategori)')
      .ilike('nama_obat', q)
      .limit(1)

    if (error) {
      console.error('supabase error', error)
      return null
    }
    return data && data[0] ? data[0] : null
  } catch (err) {
    console.error('findMedicine err', err)
    return null
  }
}

async function findMedicinesByQuery(query, limit = 5) {
  if (!query || query.length < 2) return []
  try {
    const q = `%${query}%`
    const categorySearch = await supabase
      .from('categories')
      .select('id')
      .ilike('nama_kategori', q)
      .limit(10)

    const categoryIds = categorySearch.data?.map(item => item.id).filter(Boolean) || []

    let searchConditions = [`manfaat.ilike.${q}`, `deskripsi.ilike.${q}`, `nama_obat.ilike.${q}`]
    if (categoryIds.length > 0) {
      searchConditions.push(`kategori.in.(${categoryIds.join(',')})`)
    }

    const { data, error } = await supabase
      .from('medicines')
      .select('id,nama_obat,kategori,harga,manfaat,deskripsi,dosis,efek_samping,categories:kategori (id,nama_kategori)')
      .or(searchConditions.join(','))
      .limit(limit)

    if (error) {
      console.error('supabase error', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('findMedicinesByQuery err', err)
    return []
  }
}

function formatMedicineDetail(medicine) {
  const kategoriNama = medicine.categories?.nama_kategori || medicine.kategori || 'tidak tersedia'
  const detailLines = [
    `Nama Obat: ${medicine.nama_obat || 'tidak tersedia'}`,
    `Kategori: ${kategoriNama}`,
    `Harga: ${medicine.harga || 'tidak tersedia'}`,
    `Manfaat: ${medicine.manfaat || 'tidak tersedia'}`,
    `Dosis: ${medicine.dosis || 'tidak tersedia'}`,
    `Efek Samping: ${medicine.efek_samping || 'tidak tersedia'}`,
    `Kemasan: ${medicine.kemasan || 'tidak tersedia'}`,
    `Lihat Detail: /produk/${medicine.id}`
  ]
  return detailLines.join('\n')
}

function formatMedicineList(list) {
  const items = list.map((medicine, index) => {
    const kategoriNama = medicine.categories?.nama_kategori || medicine.kategori || 'tidak tersedia'
    return `${index + 1}. ${medicine.nama_obat || 'Obat'}\nKategori: ${kategoriNama}\nHarga: ${medicine.harga || 'tidak tersedia'}\nManfaat: ${medicine.manfaat || 'tidak tersedia'}\nDosis: ${medicine.dosis || 'tidak tersedia'}\nLihat Detail: /produk/${medicine.id}`
  }).join('\n\n')
  return `Saya menemukan beberapa obat yang sesuai:\n\n${items}\n\nSilakan klik Detail Produk untuk informasi lengkap.`
}

function extractMedicineQuery(normalized) {
  const patterns = [
    /(?:produk|obat|pil|tablet|sirup)\s+(?:untuk\s+)?(.+)/,
    /(?:produk\s+)?(?:yang\s+bagus\s+untuk|produk\s+untuk|obat\s+untuk)\s+(.+)/,
    /(?:saya|aku)\s+(?:sedang\s+|lagi\s+)?(sakit kepala|flu|demam|maag|batuk|alergi|diabetes|hipertensi|kolesterol|diare|pilek|batuk berdahak|asam lambung)/,
    /\b(sakit kepala|flu|demam|maag|batuk|alergi|diabetes|hipertensi|kolesterol|diare|pilek|batuk berdahak|asam lambung|vitamin|suplemen|antiseptik)\b/
  ]

  for (const pattern of patterns) {
    const match = normalized.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  if (normalized.startsWith('produk ') || normalized.startsWith('obat ')) {
    return normalized.replace(/^(produk|obat)\s+/, '').trim()
  }

  return null
}

function extractMedicineName(normalized) {
  const stopWords = ['apa', 'apakah', 'itu', 'produk', 'obat', 'pil', 'tablet', 'sirup', 'untuk', 'yang', 'adalah', 'saya', 'aku', 'mau', 'ingin', 'tolong', 'bisa', 'cari', 'cek', 'lihat', 'informasi', 'detail', 'data', 'info', 'harga', 'dosis', 'manfaat', 'khasiat', 'efek', 'samping', 'kandungan', 'kemasan', 'deskripsi', 'komposisi']
  const cleaned = normalizeBase(normalized)
    .replace(/^(informasi|detail|info|data)\s+/, '')
    .replace(/^(produk|obat|pil|tablet|sirup)\s+/, '')
    .replace(/^(harga|dosis|manfaat|khasiat|efek samping|efek|kandungan|kemasan|deskripsi)\s+/, '')
    .replace(/\b(untuk|apa|apakah|itu|yang|adalah|saya|aku|mau|ingin|tolong|bisa|cari|cek|lihat)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) return null

  const tokens = cleaned.split(' ').filter(token => token.length > 1 && !stopWords.includes(token))
  if (tokens.length === 0) {
    return cleaned
  }

  return tokens.join(' ').trim()
}

function isMedicineDetailRequest(normalized) {
  return /\b(manfaat|khasiat|dosis|efek samping|efek|harga|detail|informasi lengkap|keterangan|komposisi|kategori|kandungan|kemasan|deskripsi)\b/.test(normalized)
}

async function processMessage(message) {
  const rawNormalized = normalizeBase(message)
  const normalized = normalize(message)
  const intent = matchIntent(normalized)
  const faqIntent = matchIntent(normalized, faqIntentDefinitions)
  const medicineName = extractMedicineName(normalized)
  const directMedicine = medicineName ? await findMedicineByName(medicineName) : null
  const medicineQuery = extractMedicineQuery(normalized)

  if (intent === 'greeting' && !medicineQuery && !faqIntent) {
    return KNOWLEDGE.greeting || 'Halo! Saya Asisten Apotek. Silakan tanyakan sesuatu tentang obat atau layanan apotek.'
  }

  if (intent === 'goodbye') {
    return KNOWLEDGE.goodbye || 'Sampai jumpa! Jika butuh bantuan lagi, hubungi kami.'
  }

  if (directMedicine) {
    if (isMedicineDetailRequest(normalized)) {
      if (normalized.includes('manfaat') || normalized.includes('khasiat')) {
        return directMedicine.manfaat || 'Maaf, informasi manfaat tidak tersedia untuk obat ini.'
      }
      if (normalized.includes('dosis')) {
        return directMedicine.dosis || 'Maaf, informasi dosis tidak tersedia untuk obat ini.'
      }
      if (normalized.includes('efek samping') || normalized.includes('efek')) {
        return directMedicine.efek_samping || 'Maaf, informasi efek samping tidak tersedia untuk obat ini.'
      }
      if (normalized.includes('harga')) {
        return `Harga ${directMedicine.nama_obat}: ${directMedicine.harga || 'tidak tersedia'}`
      }
    }
    return formatMedicineDetail(directMedicine)
  }

  if (medicineQuery) {
    const list = await findMedicinesByQuery(medicineQuery, 5)
    if (list.length > 0) {
      return formatMedicineList(list)
    }
  }

  if (faqIntent) {
    if (faqIntent === 'upload_prescription') {
      return KNOWLEDGE.cara_upload_resep || KNOWLEDGE.upload_prescription || 'Untuk upload resep, buka halaman Upload Resep dan pilih file.'
    }
    if (faqIntent === 'payment') {
      return KNOWLEDGE.cara_pembayaran || KNOWLEDGE.payment || 'Pembayaran dilakukan melalui Midtrans. Ikuti instruksi pada halaman checkout.'
    }
    if (faqIntent === 'order') {
      return KNOWLEDGE.cara_melihat_pesanan || KNOWLEDGE.order || 'Anda dapat melihat pesanan di halaman Profil → Pesanan.'
    }
    if (faqIntent === 'shipping') {
      const shippingText = normalized
      if (/\b(ubah alamat|mengubah alamat|alamat baru|perbarui alamat)\b/.test(shippingText)) {
        return KNOWLEDGE.ubah_alamat || KNOWLEDGE.alamat_pengiriman || KNOWLEDGE.shipping || KNOWLEDGE.ongkir || 'Perbarui alamat pengiriman di bagian Alamat pada halaman Profil.'
      }
      if (/\b(luar\s+babelan|luar\s+area|area\s+layanan|daerah\s+layanan|luar\s+daerah)\b/.test(shippingText)) {
        return KNOWLEDGE.luar_babelan_bisa || KNOWLEDGE.shipping || KNOWLEDGE.ongkir || 'Pengiriman saat ini melayani Kecamatan Babelan saja. Hubungi admin untuk informasi lebih lanjut.'
      }
      if (/\bbahagia\b/.test(shippingText)) {
        return KNOWLEDGE.ongkir_bahagia || KNOWLEDGE.ongkir || 'Ongkir wilayah Bahagia akan ditampilkan saat checkout.'
      }
      if (/\bkedung\s+jaya\b/.test(shippingText)) {
        return KNOWLEDGE.ongkir_kedung_jaya || KNOWLEDGE.ongkir || 'Ongkir wilayah Kedung Jaya akan ditampilkan saat checkout.'
      }
      if (/\bkedung\s+pengawas\b/.test(shippingText)) {
        return KNOWLEDGE.ongkir_kedung_pengawas || KNOWLEDGE.ongkir || 'Ongkir wilayah Kedung Pengawas akan ditampilkan saat checkout.'
      }
      if (/\bbuni\s+bakti\b/.test(shippingText)) {
        return KNOWLEDGE.ongkir_buni_bakti || KNOWLEDGE.ongkir || 'Ongkir wilayah Buni Bakti akan ditampilkan saat checkout.'
      }
      if (/\bmuara\s+bakti\b/.test(shippingText)) {
        return KNOWLEDGE.ongkir_muara_bakti || KNOWLEDGE.ongkir || 'Ongkir wilayah Muara Bakti akan ditampilkan saat checkout.'
      }
      if (/\bpantai\s+hurip\b/.test(shippingText)) {
        return KNOWLEDGE.ongkir_pantai_hurip || KNOWLEDGE.ongkir || 'Ongkir wilayah Pantai Hurip akan ditampilkan saat checkout.'
      }
      if (/\bhurip\s+jaya\b/.test(shippingText)) {
        return KNOWLEDGE.ongkir_hurip_jaya || KNOWLEDGE.ongkir || 'Ongkir wilayah Hurip Jaya akan ditampilkan saat checkout.'
      }
      if (/\bkebalen\b/.test(shippingText)) {
        return KNOWLEDGE.ongkir_kebalen || KNOWLEDGE.ongkir || 'Ongkir wilayah Kebalen akan ditampilkan saat checkout.'
      }
      return KNOWLEDGE.shipping || KNOWLEDGE.ongkir || 'Informasi pengiriman dan ongkir tersedia saat checkout.'
    }
    if (faqIntent === 'contact') {
      return KNOWLEDGE.contact || KNOWLEDGE.kontak || KNOWLEDGE.store_information || 'Silakan lihat halaman Kontak untuk nomor telepon dan alamat.'
    }
    if (faqIntent === 'store_information') {
      const storeText = normalized
      if (/\b(jam|operasional|buka|hari)\b/.test(storeText)) {
        return KNOWLEDGE.jam_operasional || KNOWLEDGE.hari_operasional || KNOWLEDGE.store_information || 'Apotek Sehati Jaya Farma buka setiap hari kerja dan beralamat di Jalan Contoh No.123.'
      }
      if (/\b(alamat|lokasi|tempat)\b/.test(storeText)) {
        return KNOWLEDGE.alamat || KNOWLEDGE.lokasi_apotek || KNOWLEDGE.store_information || 'Alamat Apotek Sehati Jaya Farma tersedia di halaman kontak.'
      }
      if (/\b(telepon|nomor|hp)\b/.test(storeText)) {
        return KNOWLEDGE.nomor_telepon || KNOWLEDGE.kontak || KNOWLEDGE.store_information || 'Nomor telepon kami tersedia di halaman kontak.'
      }
      if (/\b(email)\b/.test(storeText)) {
        return KNOWLEDGE.email || KNOWLEDGE.kontak || KNOWLEDGE.store_information || 'Email kami tersedia di halaman kontak.'
      }
      if (/\b(pemilik|owner|siapa pemilik|siapa apoteker|apoteker)\b/.test(storeText)) {
        return KNOWLEDGE.pemilik_apotek || KNOWLEDGE.apoteker || KNOWLEDGE.store_information || 'Tim kami siap membantu pelanggan dengan layanan apotek.'
      }
      if (/\b(media sosial|instagram|facebook|tiktok)\b/.test(storeText)) {
        return KNOWLEDGE.media_sosial || KNOWLEDGE.store_information || 'Informasi media sosial tersedia di footer website.'
      }
      if (/\b(nama apotek|apotek ini|siapa nama)\b/.test(storeText)) {
        return KNOWLEDGE.nama_apotek || KNOWLEDGE.store_information || 'Nama apotek ini adalah Apotek Sehati Jaya Farma.'
      }
      return KNOWLEDGE.store_information || KNOWLEDGE.jam_operasional || KNOWLEDGE.alamat || 'Apotek Sehati Jaya Farma buka setiap hari kerja dan beralamat di Jalan Contoh No.123.'
    }
    if (faqIntent === 'checkout') {
      return KNOWLEDGE.cara_checkout || KNOWLEDGE.cara_beli || 'Untuk memesan obat, tambahkan produk ke keranjang lalu lanjutkan ke checkout.'
    }
    if (faqIntent === 'account') {
      const accountText = normalized
      if (/\b(daftar|register)\b/.test(accountText)) {
        return KNOWLEDGE.cara_daftar || KNOWLEDGE.cara_register_website || KNOWLEDGE.register || 'Untuk mendaftar, buka halaman Register, isi data lengkap, lalu kirim formulir pendaftaran.'
      }
      if (/\b(login|masuk)\b/.test(accountText)) {
        return KNOWLEDGE.cara_login || KNOWLEDGE.login || 'Untuk login, buka halaman Login lalu masuk menggunakan email dan password Anda.'
      }
      if (/\b(lupa password|reset password|lupa kata sandi)\b/.test(accountText)) {
        return KNOWLEDGE.lupa_password || 'Jika lupa password, gunakan fitur reset password pada halaman Login jika tersedia.'
      }
      if (/\b(ubah profil|ubah profile|ganti profil|edit profil)\b/.test(accountText)) {
        return KNOWLEDGE.cara_mengubah_profil || KNOWLEDGE.ubah_profil || KNOWLEDGE.ubah_profile || 'Perbarui profil melalui halaman Profil dengan memilih menu Edit Profil.'
      }
      if (/\b(ubah password|ganti password)\b/.test(accountText)) {
        return KNOWLEDGE.cara_mengganti_password || KNOWLEDGE.ubah_password || KNOWLEDGE.password || 'Ubah password melalui halaman Profil pada menu Ubah Password.'
      }
      if (/\b(ubah alamat|mengubah alamat|alamat baru)\b/.test(accountText)) {
        return KNOWLEDGE.ubah_alamat || KNOWLEDGE.alamat_pengiriman || 'Perbarui alamat pengiriman di bagian Alamat pada halaman Profil.'
      }
      return KNOWLEDGE.faq_akun || KNOWLEDGE.akun || 'Kelola akun Anda melalui halaman Profil termasuk login, register, dan alamat.'
    }
    if (faqIntent === 'medicine_category') {
      return KNOWLEDGE.kategori_obat || KNOWLEDGE.faq_kategori || 'Kami menjual obat demam, batuk, maag, flu, alergi, vitamin, dan obat penyakit kronis seperti diabetes atau hipertensi.'
    }
    if (faqIntent === 'medicine_price') {
      return KNOWLEDGE.harga_obat || KNOWLEDGE.harga || 'Harga obat ditampilkan di halaman produk dan saat kamu memilih produk.'
    }
    if (faqIntent === 'medicine_dose') {
      return KNOWLEDGE.dosis_obat || KNOWLEDGE.dosis || 'Dosis obat biasanya tercantum pada detail produk dan label kemasan.'
    }
    if (faqIntent === 'medicine_side_effect') {
      return KNOWLEDGE.efek_samping_obat || KNOWLEDGE.efek_samping || 'Efek samping tercantum pada detail produk jika tersedia.'
    }
  }

  for (const key of Object.keys(KNOWLEDGE)) {
    const phrase = key.replace(/_/g, ' ')
    const normalizedPhrase = normalizeBase(phrase)
    if (!normalizedPhrase) continue
    const pattern = new RegExp(`\\b${escapeRegex(normalizedPhrase)}\\b`, 'i')
    if (pattern.test(normalized) || pattern.test(rawNormalized)) {
      return KNOWLEDGE[key]
    }
  }

  return `Maaf, saya belum memahami pertanyaan tersebut.\n\nSilakan coba salah satu pertanyaan berikut:\n\n• Obat untuk sakit kepala\n• Obat demam\n• Harga Sanmol\n• Cara upload resep\n• Cara checkout\n• Status pesanan\n• Jam operasional\n• Alamat apotek\n• Nomor telepon\n• Kategori obat`
}

module.exports = { processMessage }
