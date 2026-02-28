import { useState, useMemo } from 'react'

function formatCurrency(value) {
  if (value == null || value === '—' || value === '') return '—'
  const n = parseFloat(value)
  if (Number.isNaN(n)) return '—'
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseCurrencyInput(str) {
  const cleaned = str.replace(/[^0-9.]/g, '')
  const parts = cleaned.split('.')
  if (parts.length === 1) return parts[0]
  return parts[0] + '.' + (parts.slice(1).join('').slice(0, 2))
}

function formatCurrencyForInput(value) {
  if (value == null || value === '') return ''
  if (value === '.') return '.'
  const parts = value.split('.')
  const intPart = parts[0].replace(/\D/g, '') || '0'
  const decPart = parts[1] !== undefined ? parts[1].slice(0, 2) : ''
  const n = intPart === '' ? 0 : parseInt(intPart, 10)
  const formatted = '$' + n.toLocaleString('en-US')
  const withDec = decPart === '' ? formatted : formatted + '.' + decPart
  return value.endsWith('.') && decPart === '' ? formatted + '.' : withDec
}

function dateToKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getDatesForThreeYears(startDateStr) {
  if (!startDateStr) return []
  const start = new Date(startDateStr + 'T12:00:00')
  if (Number.isNaN(start.getTime())) return []
  const end = new Date(start)
  end.setFullYear(end.getFullYear() + 3)
  const dates = []
  const d = new Date(start)
  while (d < end) {
    dates.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

export default function CalculatorPage() {
  const [viewMode, setViewMode] = useState('details')
  const [startingInvestment, setStartingInvestment] = useState('')
  const [estimateReturnPerTrade, setEstimateReturnPerTrade] = useState('')
  const [startingDate, setStartingDate] = useState('')

  const dateRows = useMemo(() => getDatesForThreeYears(startingDate), [startingDate])
  const returnPerTrade = useMemo(() => {
    const start = parseFloat(startingInvestment)
    const rate = parseFloat(estimateReturnPerTrade)
    if (Number.isNaN(start) || Number.isNaN(rate)) return null
    return ((rate * 0.0001) * start).toFixed(2)
  }, [startingInvestment, estimateReturnPerTrade])

  const column3Row1 = useMemo(() => {
    const start = parseFloat(startingInvestment)
    const rate = parseFloat(estimateReturnPerTrade)
    if (Number.isNaN(start) || Number.isNaN(rate)) return null
    const col2 = (rate * 0.0001) * start
    return (col2 + start).toFixed(2)
  }, [startingInvestment, estimateReturnPerTrade])

  const column4Row1 = useMemo(() => {
    const start = parseFloat(startingInvestment)
    const rate = parseFloat(estimateReturnPerTrade)
    if (Number.isNaN(start) || Number.isNaN(rate)) return null
    const col2 = (rate * 0.0001) * start
    const col3 = col2 + start
    return ((rate * 0.0001) * col3).toFixed(2)
  }, [startingInvestment, estimateReturnPerTrade])

  const column5Row1 = useMemo(() => {
    const start = parseFloat(startingInvestment)
    const rate = parseFloat(estimateReturnPerTrade)
    if (Number.isNaN(start) || Number.isNaN(rate)) return null
    const col2 = (rate * 0.0001) * start
    const col3 = col2 + start
    return (col2 + col3).toFixed(2)
  }, [startingInvestment, estimateReturnPerTrade])

  const tableRowValues = useMemo(() => {
    const start = parseFloat(startingInvestment)
    const rate = parseFloat(estimateReturnPerTrade)
    if (Number.isNaN(start) || Number.isNaN(rate)) return []
    const rows = []
    for (let i = 0; i < dateRows.length; i++) {
      let col2, col3, col4, col5
      if (i === 0) {
        col2 = (rate * 0.0001) * start
        col3 = col2 + start
        col4 = (rate * 0.0001) * col3
        col5 = col2 + col3
      } else {
        const prevCol5Num = rows[i - 1]._col5Num
        col2 = prevCol5Num * (rate * 0.0001)
        col3 = col2 + prevCol5Num
        col4 = (rate * 0.0001) * col3
        col5 = col3 + col4
      }
      rows.push({
        col2: col2.toFixed(2),
        col3: col3.toFixed(2),
        col4: col4.toFixed(2),
        col5: col5.toFixed(2),
        _col5Num: col5,
      })
    }
    return rows
  }, [startingInvestment, estimateReturnPerTrade, dateRows.length])

  const summaryRows = useMemo(() => {
    if (!startingDate || dateRows.length === 0) return []
    const start = new Date(startingDate + 'T12:00:00')
    if (Number.isNaN(start.getTime())) return []
    const lookup = new Map()
    dateRows.forEach((d, i) => {
      lookup.set(dateToKey(d), tableRowValues[i]?.col5 ?? '—')
    })
    const rows = []
    for (let n = 1; n <= 36; n++) {
      const d = new Date(start.getFullYear(), start.getMonth() + n, start.getDate())
      rows.push({
        date: d,
        newBal: lookup.get(dateToKey(d)) ?? '—',
      })
    }
    return rows
  }, [startingDate, dateRows, tableRowValues])

  return (
    <main className="mainContent">
      <h2 className="pageTitle">Calculator</h2>

      <section className="calcSection calcSectionMain" aria-label="Calculator inputs">
        <div className="calcInputs">
          <div className="calcInputRow">
            <label htmlFor="calc-starting-investment" className="calcInputLabel">Starting investment</label>
            <input
              id="calc-starting-investment"
              type="text"
              inputMode="decimal"
              placeholder="$0"
              value={formatCurrencyForInput(startingInvestment)}
              onChange={(e) => setStartingInvestment(parseCurrencyInput(e.target.value))}
              className="calcInput"
              aria-label="Starting investment amount (US currency)"
            />
          </div>

          <div className="calcInputRow">
            <label htmlFor="calc-return-per-trade" className="calcInputLabel">Enter a Return Per Trade Rate:</label>
            <span className="calcInputWithSuffix calcInputWithSuffix--narrow">
              <input
                id="calc-return-per-trade"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="0"
                value={estimateReturnPerTrade}
                onChange={(e) => setEstimateReturnPerTrade(e.target.value)}
                className="calcInput"
                aria-label="Estimate return per trade (%)"
              />
              <span className="calcInputSuffix" aria-hidden="true">%</span>
            </span>
          </div>

          <div className="calcInputRow">
            <label htmlFor="calc-starting-date" className="calcInputLabel">Starting Date</label>
            <input
              id="calc-starting-date"
              type="date"
              value={startingDate}
              onChange={(e) => setStartingDate(e.target.value)}
              className="calcInput"
              aria-label="Starting date"
            />
          </div>
        </div>

        <div className="calcViewToggleWrap">
          <button
            type="button"
            className={`calcViewToggleBtn ${viewMode === 'details' ? 'active' : ''}`}
            onClick={() => setViewMode('details')}
            aria-pressed={viewMode === 'details'}
          >
            Details
          </button>
          <button
            type="button"
            className={`calcViewToggleBtn ${viewMode === 'summary' ? 'active' : ''}`}
            onClick={() => setViewMode('summary')}
            aria-pressed={viewMode === 'summary'}
          >
            Summary
          </button>
        </div>

        {viewMode === 'details' && (
          <div className="calcTableWrap">
            <table className="calcTable" aria-label="Details table (daily)">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Trade 1</th>
                  <th scope="col">New Bal.</th>
                  <th scope="col">Trade 2</th>
                  <th scope="col">New Bal.</th>
                </tr>
              </thead>
              <tbody>
                {dateRows.length === 0 ? (
                  <tr>
                    <td>—</td>
                    <td>{returnPerTrade ?? '—'}</td>
<td>{formatCurrency(column3Row1)}</td>
                  <td>{column4Row1 ?? '—'}</td>
                  <td>{formatCurrency(column5Row1)}</td>
                  </tr>
                ) : (
                  dateRows.map((d, i) => {
                    const row = tableRowValues[i]
                    return (
                      <tr key={i}>
                        <td>{d.toLocaleDateString()}</td>
                        <td>{row ? row.col2 : '—'}</td>
                        <td>{row ? formatCurrency(row.col3) : '—'}</td>
                        <td>{row ? row.col4 : '—'}</td>
                        <td>{row ? formatCurrency(row.col5) : '—'}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'summary' && (
          <div className="calcTableWrap">
            <table className="calcTable calcTableSummary" aria-label="Summary table (monthly)">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">New Bal.</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.length === 0 ? (
                  <tr>
                    <td>—</td>
                    <td>—</td>
                  </tr>
                ) : (
                  summaryRows.map((row, i) => (
                    <tr key={i}>
                      <td>{row.date.toLocaleDateString()}</td>
                      <td>{formatCurrency(row.newBal)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      </main>
  )
}
