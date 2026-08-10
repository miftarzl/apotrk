const supabase = require('../config/supabase')

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      console.error('uploadImage: no file in request')
      return res.status(400).json({ error: 'File required' })
    }
    const file = req.file
    console.log('uploadImage: received file', { originalname: file.originalname, mimetype: file.mimetype, size: file.size })
    console.log('REQ.FILE:', req.file)
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp']
    if (!allowed.includes(file.mimetype)) {
      console.error('uploadImage: unsupported file type', file.mimetype)
      return res.status(400).json({ error: 'Unsupported file type' })
    }

    const bucket = 'medicine-images'
    const ext = (file.originalname || '').split('.').pop() || 'jpg'
    const filename = `medicine-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = filename

    // upload buffer to Supabase storage
    let { data, error } = await supabase.storage.from(bucket).upload(path, file.buffer, { contentType: file.mimetype, upsert: false })
    console.log('uploadImage: upload result', { data, error })
    // If bucket not found (possible), try to create it and retry
    if (error && (error?.message?.toLowerCase?.().includes('not found') || String(error?.status) === '404' || String(error?.message).toLowerCase().includes('bucket'))) {
      console.log('uploadImage: bucket may be missing, attempting to create bucket', bucket)
      try {
        const cb = await supabase.storage.createBucket(bucket, { public: true })
        console.log('createBucket result', cb)
      } catch (e) {
        console.error('createBucket failed', e)
      }
      // retry upload
      const retry = await supabase.storage.from(bucket).upload(path, file.buffer, { contentType: file.mimetype, upsert: false })
      data = retry.data
      error = retry.error
      console.log('uploadImage: retry upload result', { data, error })
    }
    if (error) {
      console.error('Storage upload error', error)
      console.log(error)
      console.log(error?.message)
      console.log(error?.details)
      return res.status(500).json({ error: error.message, details: error })
    }

    // get public url
    const urlRes = await supabase.storage.from(bucket).getPublicUrl(path)
    console.log('uploadImage: getPublicUrl result', urlRes)
    const publicUrl = urlRes?.data?.publicUrl || urlRes?.publicUrl || ''
    console.log('PUBLIC URL:', publicUrl)
    return res.json({ success: true, publicUrl })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { uploadImage }
