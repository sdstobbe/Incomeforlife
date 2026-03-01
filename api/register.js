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

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default {
  async fetch(request) {
    try {
      if (request.method !== 'POST') {
        return jsonResponse({ message: 'Method not allowed' }, 405)
      }

      let body = {}
      try {
        body = await request.json()
      } catch {
        body = {}
      }

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
        return jsonResponse({
          field: 'referrerCode',
          message: 'A referrer code is required. Please enter the code from the Income For Life member who invited you.',
        }, 400)
      }

      const supabase = getSupabase()
      if (!supabase) {
        const VALID_REFERRER_CODES = ['ABC123', 'BG001', 'DSJ100']
        if (!VALID_REFERRER_CODES.includes(code)) {
          return jsonResponse({
            field: 'referrerCode',
            message: 'Referrer code not recognized. You must have a valid code from an existing Income For Life member to proceed.',
          }, 400)
        }
        return jsonResponse({
          ok: true,
          note: 'Supabase is not configured yet. No data has been saved.',
          referrerCode: code,
        }, 201)
      }

      if (!firstName || !lastName || !email || !password) {
        return jsonResponse({
          message: 'First name, last name, email, and password are required.',
        }, 400)
      }

      const { data: referrer, error: referrerError } = await supabase
        .from('members')
        .select('id, referrer_code')
        .eq('referrer_code', code)
        .maybeSingle()

      if (referrerError) {
        console.error('Supabase referrer lookup error', referrerError)
        return jsonResponse({
          message: 'Error checking referrer code. Please try again.',
          detail: referrerError.message,
          code: referrerError.code,
        }, 500)
      }

      if (!referrer) {
        return jsonResponse({
          field: 'referrerCode',
          message: 'Referrer code not recognized. You must have a valid code from an existing Income For Life member to proceed.',
        }, 400)
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
        return jsonResponse({
          message: msg,
          detail: insertError.message,
          code: insertError.code,
        }, 400)
      }

      return jsonResponse({ ok: true, referrerCode: newReferrerCode }, 201)
    } catch (err) {
      console.error('Register API error', err)
      return jsonResponse({
        message: 'A server error occurred.',
        detail: (err && err.message) ? err.message : String(err),
        code: err && err.code,
      }, 500)
    }
  },
}
