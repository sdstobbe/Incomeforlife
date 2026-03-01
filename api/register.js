export default {
  async fetch(request) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      return Response.json(
        { message: 'Server misconfigured. Missing Supabase credentials.' },
        { status: 500 }
      )
    }

    if (request.method !== 'POST') {
      return Response.json({ message: 'Method not allowed' }, { status: 405 })
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
      return Response.json({
        field: 'referrerCode',
        message: 'A referrer code is required. Please enter the code from the Income For Life member who invited you.',
      }, { status: 400 })
    }

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const { default: crypto } = await import('crypto')
      const supabase = createClient(url, key)

      const { data: referrer, error: referrerError } = await supabase
        .from('members')
        .select('id, referrer_code')
        .eq('referrer_code', code)
        .maybeSingle()

      if (referrerError) {
        return Response.json({
          message: 'Error checking referrer code. Please try again.',
          detail: referrerError.message || String(referrerError),
        }, { status: 500 })
      }

      if (!referrer) {
        return Response.json({
          field: 'referrerCode',
          message: 'Referrer code not recognized. You must have a valid code from an existing Income For Life member to proceed.',
        }, { status: 400 })
      }

      if (!firstName || !lastName || !email || !password) {
        return Response.json({
          message: 'First name, last name, email, and password are required.',
        }, { status: 400 })
      }

      const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
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
        const detail = insertError.message || insertError.details || String(insertError)
        return Response.json({
          message: detail ? `${msg} (${detail})` : msg,
          detail,
          code: insertError.code,
        }, { status: 400 })
      }

      return Response.json({ ok: true, referrerCode: newCode }, { status: 201 })
    } catch (err) {
      console.error('Register API error', err)
      return Response.json({
        message: 'A server error occurred.',
        detail: (err && err.message) ? err.message : String(err),
      }, { status: 500 })
    }
  },
}
