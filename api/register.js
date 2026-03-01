const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase = null
if (supabaseUrl && supabaseServiceRoleKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
  } catch (e) {
    console.error('Supabase client init error', e.message)
  }
}

function generateReferrerCode(length = 6) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return out
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

module.exports = async (req, res) => {
  try {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  const {
    firstName = '',
    lastName = '',
    email = '',
    phone = '',
    password = '',
    referrerCode = '',
  } = req.body || {}

  const code = (referrerCode || '').trim().toUpperCase()

  if (!code) {
    res.status(400).json({
      field: 'referrerCode',
      message: 'A referrer code is required. Please enter the code from the Income For Life member who invited you.',
    })
    return
  }

  if (!supabase) {
    // Fallback: simple in-memory validation so the flow still works
    const VALID_REFERRER_CODES = ['ABC123', 'BG001', 'DSJ100']
    if (!VALID_REFERRER_CODES.includes(code)) {
      res.status(400).json({
        field: 'referrerCode',
        message: 'Referrer code not recognized. You must have a valid code from an existing Income For Life member to proceed.',
      })
      return
    }

    res.status(201).json({
      ok: true,
      note: 'Supabase is not configured yet. No data has been saved.',
      // In this fallback we just echo the referrer code so the UI can still show something.
      referrerCode: code,
    })
    return
  }

  if (!firstName || !lastName || !email || !password) {
    res.status(400).json({
      message: 'First name, last name, email, and password are required.',
    })
    return
  }

  // Check that the referrer code exists in members table
  const { data: referrer, error: referrerError } = await supabase
    .from('members')
    .select('id, referrer_code')
    .eq('referrer_code', code)
    .maybeSingle()

  if (referrerError) {
    console.error('Supabase referrer lookup error', referrerError)
    res.status(500).json({ message: 'Error checking referrer code. Please try again.' })
    return
  }

  if (!referrer) {
    res.status(400).json({
      field: 'referrerCode',
      message: 'Referrer code not recognized. You must have a valid code from an existing Income For Life member to proceed.',
    })
    return
  }

  const passwordHash = hashPassword(password)

  const newReferrerCode = generateReferrerCode()

  const { error: insertError } = await supabase
    .from('members')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password_hash: passwordHash,
      referrer_code: newReferrerCode,
      referrer_id: referrer.id,
    })

  if (insertError) {
    console.error('Supabase insert error', insertError)
    const dup = insertError.code === '23505'
    const msg = dup
      ? 'An account with that email or referrer code already exists.'
      : 'We could not create your account. Please try again.'
    res.status(400).json({
      message: msg,
      detail: insertError.message || undefined,
      code: insertError.code || undefined,
    })
    return
  }

  res.status(201).json({ ok: true, referrerCode: newReferrerCode })
  } catch (err) {
    console.error('Register API error', err)
    res.status(500).json({
      message: 'A server error occurred.',
      detail: err && err.message ? err.message : String(err),
      code: err && err.code ? err.code : undefined,
    })
  }
}

