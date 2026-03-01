import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  try {
    return createClient(url, key)
  } catch (e) {
    console.error('Supabase client init error', e.message)
    return null
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

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ message: 'Method not allowed' })
      return
    }

    const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body) } catch { return {} } })() : (req.body || {})
    const {
      firstName = '',
      lastName = '',
      email = '',
      phone = '',
      password = '',
      referrerCode = '',
    } = body

    const code = (referrerCode || '').trim().toUpperCase()

    if (!code) {
      res.status(400).json({
        field: 'referrerCode',
        message: 'A referrer code is required. Please enter the code from the Income For Life member who invited you.',
      })
      return
    }

    const supabase = getSupabase()
    if (!supabase) {
      const VALID_REFERRER_CODES = ['ABC123', 'BG001', 'DSJ100']
      if (!VALID_REFERRER_CODES.includes(code)) {
        res.status(400).json({
          field: 'referrerCode',
          message: 'Referrer code not recognized. You must have a valid code from an existing Income For Life member to proceed.',
        })
        return
      }
      res.status(201).json({ ok: true, note: 'Supabase is not configured yet.', referrerCode: code })
      return
    }

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: 'First name, last name, email, and password are required.' })
      return
    }

    const { data: referrer, error: referrerError } = await supabase
      .from('members')
      .select('id, referrer_code')
      .eq('referrer_code', code)
      .maybeSingle()

    if (referrerError) {
      console.error('Supabase referrer lookup error', referrerError)
      res.status(500).json({
        message: 'Error checking referrer code. Please try again.',
        detail: referrerError.message,
        code: referrerError.code,
      })
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
      const detail = insertError.message || insertError.details || JSON.stringify(insertError)
      res.status(400).json({ message: msg, detail, code: insertError.code })
      return
    }

    res.status(201).json({ ok: true, referrerCode: newReferrerCode })
  } catch (err) {
    console.error('Register API error', err)
    res.status(500).json({
      message: 'A server error occurred.',
      detail: (err && err.message) ? err.message : String(err),
      code: err && err.code,
    })
  }
}
