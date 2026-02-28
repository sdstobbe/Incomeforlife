export default function AppointmentPage() {
  return (
    <div className="landingPage">
      <div className="landingCard">
        <h1 className="landingTitle">Schedule an Appointment</h1>
        <p className="landingSubtitle">
          Choose a date and time that works for you. In a future version, this page will check Google Calendar for live availability.
        </p>

        <form className="landingForm" onSubmit={(e) => e.preventDefault()}>
          <div className="landingField">
            <label htmlFor="appt-date" className="landingLabel">Preferred date</label>
            <input
              id="appt-date"
              type="date"
              className="landingInput"
            />
          </div>

          <div className="landingField">
            <label htmlFor="appt-time" className="landingLabel">Preferred time</label>
            <select id="appt-time" className="landingInput">
              <option value="">Select a time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
            </select>
          </div>

          <div className="landingField">
            <label htmlFor="appt-notes" className="landingLabel">Notes (optional)</label>
            <textarea
              id="appt-notes"
              className="landingInput"
              rows={3}
            />
          </div>

          <button type="submit" className="landingSubmit">Request appointment</button>
        </form>
      </div>
    </div>
  )
}

