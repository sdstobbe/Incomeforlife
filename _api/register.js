import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

export default async function handler(req, res) {
  try {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      res.status(500).json({ message: 'Server misconfigured. Missing Supabase credentials.' })
      return
    }

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

    const supabase = createClient(url, key)

    const { data: referrer, error: referrerError } = await supabase
      .from('members')
      .select('id, referrer_code')
      .eq('referrer_code', code)
      .maybeSingle()

    if (referrerError) {
      res.status(500).json({
        message: 'Error checking referrer code. Please try again.',
        detail: referrerError.message || String(referrerError),
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

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: 'First name, last name, email, and password are required.' })
      return
    }

    const passwordHash = createHash('sha256').update(password).digest('hex')
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
    let newCode = ''
    for (let i = 0; i < 6; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const { error: insertError } = await supabase
      .from('members')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password_hash: passwordHash,
        referrer_code: newCode,
        referrer_id: referrer.id,
      })

    if (insertError) {
      const dup = insertError.code === '23505'
      const msg = dup
        ? 'An account with that email or referrer code already exists.'
        : 'We could not create your account. Please try again.'
      const detail = insertError.message || insertError.details || (typeof insertError === 'object' ? JSON.stringify(insertError) : String(insertError))
      res.status(400).json({ message: msg, detail: detail || 'Unknown database error', code: insertError.code })
      return
    }

    res.status(201).json({ ok: true, referrerCode: newCode })
  } catch (err) {
    res.status(500).json({
      message: 'A server error occurred.',
      detail: (err && err.message) ? err.message : String(err),
    })
  }
}
