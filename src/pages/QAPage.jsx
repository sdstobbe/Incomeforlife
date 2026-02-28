import { useState } from 'react'
import { qaSections } from '../qaData.js'

function QABlock({ item, isOpen, onToggle }) {
  return (
    <div className="qaBlock">
      <button
        type="button"
        className="qaQuestion"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="qaQuestionText">{item.q}</span>
        <span className="qaChevron" aria-hidden>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="qaAnswer">
          <p>{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function QAPage() {
  const [openId, setOpenId] = useState(null)

  const toggle = (sectionIndex, itemIndex) => {
    const id = `${sectionIndex}-${itemIndex}`
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <main className="mainContent">
      <p className="pageIntro">
        Below you'll find answers to common questions about BG Wealth Sharing and DSJ Exchange, organized by topic. Tap or click a question to expand the answer.
      </p>

      {qaSections.map((section, sectionIndex) => (
        <section key={sectionIndex} className="qaSection">
          <h2 className="sectionTitle">{section.title}</h2>
          {section.intro && (
            <p className="sectionIntro">{section.intro}</p>
          )}
          <div className="qaList">
            {section.items.map((item, itemIndex) => (
              <QABlock
                key={itemIndex}
                item={item}
                isOpen={openId === `${sectionIndex}-${itemIndex}`}
                onToggle={() => toggle(sectionIndex, itemIndex)}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
