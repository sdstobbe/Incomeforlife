import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main className="mainContent">
      <div className="homeHero">
        <h2 className="homeTitle">Welcome to Income For Life</h2>
        <p className="homeTagline">BG Wealth Sharing & DSJ Exchange</p>
        <p className="homeIntro">
          Get started with setup guides, trading resources, and answers to common questions. Use the menu above to explore.
        </p>
        <div className="homeActions">
          <Link to="/qa" className="homeCta">
            Go to Q & A
          </Link>
        </div>
      </div>
    </main>
  )
}
