import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const [referrerCode, setReferrerCode] = useState('')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('ifl_referrer_code')
      if (stored) {
        setReferrerCode(stored)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  return (
    <main className="mainContent">
      <h2 className="pageTitle">Member Dashboard</h2>
      <p className="pageIntro">
        Welcome to your Income For Life member area. From here you can see your referrer code and jump into the main resources.
      </p>

      <section className="dashboardSection">
        <h3 className="dashboardSectionTitle">Your referrer code</h3>
        {referrerCode ? (
          <>
            <p className="dashboardText">
              Share this code with new members so they can register under you.
            </p>
            <div className="dashboardCodeBox">
              <span className="dashboardCode">{referrerCode}</span>
            </div>
          </>
        ) : (
          <p className="dashboardText">
            We couldn&apos;t find your referrer code in this browser. If you just registered, please try refreshing this page.
          </p>
        )}
      </section>

      <section className="dashboardSection">
        <h3 className="dashboardSectionTitle">Quick links</h3>
        <ul className="dashboardLinks">
          <li><Link to="/qa">Q &amp; A</Link></li>
          <li><Link to="/trading">Trading guide</Link></li>
          <li><Link to="/calculator">Income calculator</Link></li>
        </ul>
      </section>
    </main>
  )
}

