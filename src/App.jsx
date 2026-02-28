import { BrowserRouter, Routes, Route, Link, useLocation, Outlet } from 'react-router-dom'
import HomePage from './pages/HomePage'
import QAPage from './pages/QAPage'
import CoinbasePage from './pages/CoinbasePage'
import LandingPage from './pages/LandingPage'
import AppointmentPage from './pages/AppointmentPage'
import DashboardPage from './pages/DashboardPage'
import TradingPage from './pages/TradingPage'
import CalculatorPage from './pages/CalculatorPage'
import './index.css'

function Nav() {
  const location = useLocation()

  return (
    <nav className="siteNav" aria-label="Main">
      <ul className="navList">
        <li className="navItem navItemDropdown">
          <span className="navLink" aria-haspopup="true">
            Set Up
            <span className="navChevron" aria-hidden>▾</span>
          </span>
          <ul className="navDropdown" role="menu">
            <li role="none">
              <Link to="/setup/coinbase" className="navDropdownLink" role="menuitem">Coin Base</Link>
            </li>
            <li role="none">
              <Link to="/setup/dsj-exchange" className="navDropdownLink" role="menuitem">DSJ Exchange</Link>
            </li>
            <li role="none">
              <Link to="/setup/bonchat" className="navDropdownLink" role="menuitem">BonChat</Link>
            </li>
          </ul>
        </li>
        <li className="navItem">
          <Link to="/trading" className="navLink">Trading</Link>
        </li>
        <li className="navItem">
          <Link to="/qa" className={`navLink ${location.pathname === '/qa' ? 'active' : ''}`}>Q & A</Link>
        </li>
        <li className="navItem">
          <Link to="/calculator" className="navLink">Calculator</Link>
        </li>
        <li className="navItem">
          <Link to="/dashboard" className="navLink">Dashboard</Link>
        </li>
      </ul>
    </nav>
  )
}

function Layout() {
  return (
    <div className="app">
      <header className="siteHeader">
        <Link to="/" className="siteHeaderBrand">
          <img
            src="/income-for-life-logo.png"
            alt=""
            className="siteLogo"
          />
          <div className="siteHeaderTitles">
            <h1 className="siteTitle">Income For Life</h1>
            <p className="siteTagline">BG Wealth Sharing & DSJ Exchange</p>
          </div>
        </Link>
        <Nav />
      </header>

      <Outlet />

      <footer className="siteFooter">
        <p>Income For Life – Q&A for informational purposes. Always confirm details through official BG group channels and your sponsor.</p>
      </footer>
    </div>
  )
}

function PlaceholderPage({ title }) {
  return (
    <main className="mainContent">
      <h2 className="pagePlaceholderTitle">{title}</h2>
      <p className="pagePlaceholderText">This page is coming soon.</p>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="qa" element={<QAPage />} />
          <Route path="setup/coinbase" element={<CoinbasePage />} />
          <Route path="setup/dsj-exchange" element={<PlaceholderPage title="DSJ Exchange" />} />
          <Route path="setup/bonchat" element={<PlaceholderPage title="BonChat" />} />
          <Route path="trading" element={<TradingPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
