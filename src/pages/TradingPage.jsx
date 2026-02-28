export default function TradingPage() {
  return (
    <main className="mainContent">
      <h2 className="pageTitle">Trading</h2>
      <p className="pageIntro">
        Now you are ready to start trading. You may come up with your own process, but here's one way that works pretty good.
      </p>

      <section className="tradeSection">
        <h3 className="tradeSectionTitle">How to execute a Bonus Trade</h3>
        <h4 className="tradeSubtitle">How to trade the bonus signal:</h4>

        <ol className="tradeSteps">
          <li className="tradeStep">
            Sign in to the current DSJ site
          </li>
          <li className="tradeStep">
            Tap on the “Futures” button found along the bottom of your screen.
          </li>
          <li className="tradeStep">
            Tap on the “Invited me”
            <p className="stepNote">
              <strong>Note:</strong> These first three steps are to make sure you are ready to make the trade as soon as the signal is released.
            </p>
          </li>
          <li className="tradeStep">
            Switch to BonChat and click on your “BG-15 Wealth Sharing Investment Group”. Wait for Stephen to send the message: “The signal trading invitation has been released”. Note, there is more to it than that, but that is the first line of the message. You will have 10 minutes from when it is released to complete the trade.
          </li>
          <li className="tradeStep">
            Switch back to DSJ Exchange trading platform
            <p className="stepNote">
              <strong>Note:</strong> You will not have a code to paste when you are trading on a bonus signal
            </p>
          </li>
          <li className="tradeStep">
            Move the page up until you see a yellow button “Confirm to follow the order”. (This button only appears during the 10 minute bonus trade window.). Just tap on it.
          </li>
          <li className="tradeStep">
            Under that is another yellow button “Order OK”. Tap on it
          </li>
          <li className="tradeStep">
            Now go back up and tap on “Position Order”. It is on the same line as “Invited Me” just below the bar graph.
          </li>
          <li className="tradeStep">
            You will know your trade was successful if you see the word “Pending” in red.
          </li>
        </ol>
      </section>
    </main>
  )
}
