import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './TimesheetForm.css'

function TimesheetForm({ onAddTask }) {
  const [date, setDate] = useState(new Date())
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000))
  const [taskName, setTaskName] = useState('')
  const [comment, setComment] = useState('')
  const [duration, setDuration] = useState('')
  const [selectedPrefix, setSelectedPrefix] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const calculateDuration = () => {
    if (startTime && endTime && endTime > startTime) {
      const diffMs = endTime - startTime
      const diffHours = diffMs / (1000 * 60 * 60)
      const hours = Math.floor(diffHours)
      const minutes = Math.floor((diffHours - hours) * 60)
      return `${hours}h ${minutes}m`
    }
    return ''
  }

  const handleDurationChange = (value) => {
    setDuration(value)
    // Auto-update end time based on duration
    if (value && startTime) {
      const [hours = 0, minutes = 0] = value.split(/[hms\s]+/).filter(Boolean).map(Number)
      const totalMinutes = hours * 60 + minutes
      const newEndTime = new Date(startTime.getTime() + totalMinutes * 60 * 1000)
      setEndTime(newEndTime)
    }
  }

  const handlePrefixClick = (prefix) => {
    if (selectedPrefix === prefix) {
      // If already selected, remove prefix
      setSelectedPrefix(null)
      if (taskName.startsWith(`${prefix}-`)) {
        setTaskName(taskName.replace(`${prefix}-`, ''))
      }
    } else {
      // Set new prefix
      setSelectedPrefix(prefix)
      let newTaskName = taskName
      // Remove existing prefix if any
      if (taskName.startsWith('NFX-') || taskName.startsWith('NEX-')) {
        newTaskName = taskName.replace(/^(NFX|NEX)-/, '')
      }
      setTaskName(`${prefix}-${newTaskName}`)
    }
  }

  const handleTaskNameChange = (e) => {
    let value = e.target.value
    // If a prefix is selected, ensure it stays
    if (selectedPrefix && !value.startsWith(`${selectedPrefix}-`)) {
      // Remove any existing prefix
      if (value.startsWith('NFX-') || value.startsWith('NEX-')) {
        value = value.replace(/^(NFX|NEX)-/, '')
      }
      value = `${selectedPrefix}-${value}`
    }
    setTaskName(value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!taskName.trim()) {
      setErrorMessage('Please enter a task name')
      setTimeout(() => setErrorMessage(null), 3000)
      return
    }

    const finalDuration = duration || calculateDuration()
    
    const task = {
      date: date.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      taskName: taskName.trim(),
      duration: finalDuration,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    }

    onAddTask(task)
    
    // Reset form
    setTaskName('')
    setComment('')
    setDuration('')
    setSelectedPrefix(null)
    setStartTime(new Date())
    setEndTime(new Date(Date.now() + 60 * 60 * 1000))
    
    // Show success message
    setSuccessMessage('Task added successfully!')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  return (
    <div className="timesheet-form-container">
      <h2>Add Time Entry</h2>
      {successMessage && (
        <div className="success-message-toast">
          <span className="success-icon">✓</span>
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="error-message-toast">
          <span className="error-icon">!</span>
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="timesheet-form">
        {/* Compact Calendar Section with Time */}
        <div className="calendar-section">
          <div className="calendar-wrapper">
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              inline
              calendarClassName="big-calendar"
            />
          </div>
          
          {/* Right Column: Time Selection + Task Name + Comment */}
          <div className="right-column">
            {/* Time Selection - Compact inline */}
            <div className="time-selection-panel">
              <div className="time-inputs-grid">
                <div className="form-group compact">
                  <label htmlFor="start-time">Start Time</label>
                  {/* Mobile: Use native time input, Desktop: Use DatePicker */}
                  <div className="time-input-wrapper">
                    <input
                      id="start-time-mobile"
                      type="time"
                      value={startTime.toTimeString().slice(0, 5)}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number)
                        const newTime = new Date(startTime)
                        newTime.setHours(hours, minutes, 0, 0)
                        setStartTime(newTime)
                        if (duration && newTime) {
                          const [durHours = 0, durMinutes = 0] = duration.split(/[hms\s]+/).filter(Boolean).map(Number)
                          const totalMinutes = durHours * 60 + durMinutes
                          const newEndTime = new Date(newTime.getTime() + totalMinutes * 60 * 1000)
                          setEndTime(newEndTime)
                        }
                      }}
                      className="form-input time-input time-input-mobile"
                    />
                    <DatePicker
                      id="start-time"
                      selected={startTime}
                      onChange={(time) => {
                        setStartTime(time)
                        if (duration && time) {
                          const [hours = 0, minutes = 0] = duration.split(/[hms\s]+/).filter(Boolean).map(Number)
                          const totalMinutes = hours * 60 + minutes
                          const newEndTime = new Date(time.getTime() + totalMinutes * 60 * 1000)
                          setEndTime(newEndTime)
                        }
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="form-input time-input time-input-desktop"
                      portalId="root"
                    />
                  </div>
                </div>

                <div className="form-group compact">
                  <label htmlFor="end-time">End Time</label>
                  <div className="time-input-wrapper">
                    <input
                      id="end-time-mobile"
                      type="time"
                      value={endTime.toTimeString().slice(0, 5)}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number)
                        const newTime = new Date(endTime)
                        newTime.setHours(hours, minutes, 0, 0)
                        setEndTime(newTime)
                        if (newTime && startTime && newTime > startTime) {
                          const diffMs = newTime - startTime
                          const diffHours = diffMs / (1000 * 60 * 60)
                          const hours = Math.floor(diffHours)
                          const minutes = Math.floor((diffHours - hours) * 60)
                          setDuration(`${hours}h ${minutes}m`)
                        }
                      }}
                      className="form-input time-input time-input-mobile"
                    />
                    <DatePicker
                      id="end-time"
                      selected={endTime}
                      onChange={(time) => {
                        setEndTime(time)
                        if (time && startTime && time > startTime) {
                          const diffMs = time - startTime
                          const diffHours = diffMs / (1000 * 60 * 60)
                          const hours = Math.floor(diffHours)
                          const minutes = Math.floor((diffHours - hours) * 60)
                          setDuration(`${hours}h ${minutes}m`)
                        }
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="form-input time-input time-input-desktop"
                      portalId="root"
                    />
                  </div>
                </div>

                <div className="form-group compact">
                  <label htmlFor="duration">Duration</label>
                  <input
                    id="duration"
                    type="text"
                    value={duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    placeholder="Auto or 2h 30m"
                    className="form-input duration-input"
                  />
                  {!duration && startTime && endTime && endTime > startTime && (
                    <span className="duration-hint" role="status">{calculateDuration()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Task Name with NFX/NEX buttons */}
            <div className="form-group task-name-group">
              <label htmlFor="task-name">Task Name *</label>
              <div className="task-name-input-wrapper">
                <div className="prefix-buttons" role="group" aria-label="Task prefix">
                  <button
                    type="button"
                    onClick={() => handlePrefixClick('NFX')}
                    className={`prefix-btn ${selectedPrefix === 'NFX' ? 'active' : ''}`}
                    aria-pressed={selectedPrefix === 'NFX'}
                    aria-label="Add NFX prefix"
                  >
                    NFX
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrefixClick('NEX')}
                    className={`prefix-btn ${selectedPrefix === 'NEX' ? 'active' : ''}`}
                    aria-pressed={selectedPrefix === 'NEX'}
                    aria-label="Add NEX prefix"
                  >
                    NEX
                  </button>
                </div>
                <input
                  id="task-name"
                  type="text"
                  value={taskName}
                  onChange={handleTaskNameChange}
                  placeholder="Enter task name..."
                  className="form-input task-name-input"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="comment-section">
              <div className="form-group comment-group">
                <label htmlFor="comment">Comment (Optional)</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add any notes or comments..."
                  className="form-textarea comment-textarea"
                />
              </div>
              <button type="submit" className="submit-btn">
                Add Entry
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default TimesheetForm

