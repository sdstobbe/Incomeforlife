import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [referrerCode, setReferrerCode] = useState('')
  const [referrerError, setReferrerError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const rawCode = referrerCode.trim().toUpperCase()
    if (!rawCode) {
      setReferrerError('A referrer code is required. Please enter the code from the Income For Life member who invited you.')
      return
    }

    setReferrerError('')
    setSubmitError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          referrerCode: rawCode,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (data.field === 'referrerCode') {
          setReferrerError(
            data.message ||
            'Referrer code not recognized. You must have a valid code from an existing Income For Life member to proceed.',
          )
        } else {
          const msg = data.message || 'We could not create your account. Please try again or contact support.'
          const detail = data.detail ? ` (${data.detail})` : ''
          setSubmitError(msg + detail)
        }
        return
      }

      if (data.referrerCode) {
        try {
          window.localStorage.setItem('ifl_referrer_code', data.referrerCode)
        } catch {
          // ignore storage errors
        }
      }

      navigate('/appointment')
    } catch (err) {
      setSubmitError('Network error while creating your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="landingPage">
      <header className="landingHeader" aria-label="Income For Life">
        <img
          src="/income-for-life-logo.png"
          alt="Income For Life"
          className="landingLogo"
        />
      </header>
      <div className="landingCard">
        <h1 className="landingTitle">Create Your Account</h1>
        <p className="landingSubtitle">
          Start your Income For Life journey. This simple form is for demonstration only and does not create a real account.
        </p>

        <form className="landingForm" onSubmit={handleSubmit}>
          <div className="landingFieldRow">
            <div className="landingField">
              <label htmlFor="landing-first-name" className="landingLabel">First name</label>
              <input
                id="landing-first-name"
                type="text"
                className="landingInput"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="landingField">
              <label htmlFor="landing-last-name" className="landingLabel">Last name</label>
              <input
                id="landing-last-name"
                type="text"
                className="landingInput"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="landingField">
            <label htmlFor="landing-email" className="landingLabel">Email</label>
            <input
              id="landing-email"
              type="email"
              className="landingInput"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="landingField">
            <label htmlFor="landing-phone" className="landingLabel">Phone</label>
            <input
              id="landing-phone"
              type="tel"
              className="landingInput"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="landingField">
            <label htmlFor="landing-referrer" className="landingLabel">Referrer&apos;s code</label>
            <input
              id="landing-referrer"
              type="text"
              className="landingInput"
              value={referrerCode}
              onChange={(e) => setReferrerCode(e.target.value)}
              aria-describedby={referrerError ? 'landing-referrer-error' : undefined}
            />
            {referrerError && (
              <p id="landing-referrer-error" className="landingError">
                {referrerError}
              </p>
            )}
          </div>

          <div className="landingField">
            <label htmlFor="landing-password" className="landingLabel">Password</label>
            <input
              id="landing-password"
              type="password"
              className="landingInput"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {submitError && (
            <p className="landingError">
              {submitError}
            </p>
          )}

          <button type="submit" className="landingSubmit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

