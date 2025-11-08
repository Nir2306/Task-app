import React, { useState, useMemo } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useTheme } from '../contexts/ThemeContext'
import './CalendarView.css'

// Color palette for tasks (Google Calendar style)
const TASK_COLORS = [
  { bg: '#1a73e8', border: '#1557b0', text: 'white' }, // Blue
  { bg: '#34a853', border: '#2d8f47', text: 'white' }, // Green
  { bg: '#ea4335', border: '#d33b2c', text: 'white' }, // Red
  { bg: '#fbbc04', border: '#e6a003', text: '#202124' }, // Yellow
  { bg: '#9aa0a6', border: '#80868b', text: 'white' }, // Gray
  { bg: '#5f6368', border: '#4e5256', text: 'white' }, // Dark Gray
  { bg: '#9334e6', border: '#7a2bc2', text: 'white' }, // Purple
  { bg: '#ff6d01', border: '#e55d00', text: 'white' }, // Orange
]

// Generate consistent color for a task based on its name
const getTaskColor = (taskName) => {
  if (!taskName) return TASK_COLORS[0]
  // Use task name hash to get consistent color
  let hash = 0
  for (let i = 0; i < taskName.length; i++) {
    hash = taskName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % TASK_COLORS.length
  return TASK_COLORS[index]
}

function CalendarView({ tasks = [], onAddTask, onEditTask, onDeleteTask }) {
  const { darkMode } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('day') // 'day', 'month', 'list'
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null) // Track which task is being edited
  const [formData, setFormData] = useState({
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(Date.now() + 60 * 60 * 1000),
    taskName: '',
    comment: '',
    duration: ''
  })
  const [selectedPrefix, setSelectedPrefix] = useState(null)

  // Generate time slots (24 hours, every 30 minutes)
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }, [])

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter(task => {
      if (!task.date) return false
      const taskDate = new Date(task.date).toISOString().split('T')[0]
      return taskDate === dateStr
    })
  }

  // Get tasks that should be displayed in a time slot (tasks that start at or span across this slot)
  const getTasksForTimeSlot = (date, timeSlot) => {
    const tasksForDate = getTasksForDate(date)
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number)
    const slotTime = new Date(date)
    slotTime.setHours(slotHour, slotMinute, 0, 0)
    const nextSlotTime = new Date(slotTime.getTime() + 30 * 60 * 1000) // Next 30 min slot
    
    return tasksForDate.filter(task => {
      if (!task.startTime || !task.endTime) return false
      const taskStart = new Date(task.startTime)
      const taskEnd = new Date(task.endTime)
      
      // Task overlaps with this time slot if it starts before slot ends and ends after slot starts
      return taskStart < nextSlotTime && taskEnd > slotTime
    })
  }
  
  // Get task position and height for display
  const getTaskPosition = (task, date, timeSlot) => {
    const taskStart = new Date(task.startTime)
    const taskEnd = new Date(task.endTime)
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number)
    const slotTime = new Date(date)
    slotTime.setHours(slotHour, slotMinute, 0, 0)
    
    const taskStartMinutes = taskStart.getHours() * 60 + taskStart.getMinutes()
    const taskEndMinutes = taskEnd.getHours() * 60 + taskEnd.getMinutes()
    const slotMinutes = slotHour * 60 + slotMinute
    
    // Check if task starts in this slot
    const taskStartsInSlot = taskStartMinutes >= slotMinutes && taskStartMinutes < slotMinutes + 30
    
    // Calculate how many 30-min slots this task spans
    const totalDurationMinutes = taskEndMinutes - taskStartMinutes
    const totalSlots = Math.max(1, Math.ceil(totalDurationMinutes / 30))
    
    // Calculate top position within the slot (for tasks that don't start exactly on the hour)
    const minutesOffset = taskStartMinutes - slotMinutes
    const topOffset = (minutesOffset / 30) * 48 // 48px per 30-min slot
    
    return {
      top: `${Math.max(0, topOffset)}px`,
      height: `${Math.max(totalSlots * 48, 32)}px`, // Minimum 32px height
      isStart: taskStartsInSlot
    }
  }

  // Handle time slot click
  const handleTimeSlotClick = (date, timeSlot) => {
    const [hour, minute] = timeSlot.split(':').map(Number)
    const startTime = new Date(date)
    startTime.setHours(hour, minute, 0, 0)
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // Default 1 hour
    
    setFormData({
      date: new Date(date),
      startTime,
      endTime,
      taskName: '',
      comment: '',
      duration: ''
    })
    setSelectedTimeSlot({ date, timeSlot })
    setEditingTask(null) // Reset editing state
    setSelectedPrefix(null)
    setShowTaskForm(true)
  }

  // Handle task click for editing
  const handleTaskClick = (task, e) => {
    e.stopPropagation()
    const taskDate = new Date(task.date)
    const startTime = new Date(task.startTime)
    const endTime = new Date(task.endTime)
    
    // Check if task has prefix
    let prefix = null
    let taskName = task.taskName
    if (taskName.startsWith('NFX-')) {
      prefix = 'NFX'
      taskName = taskName.replace('NFX-', '')
    } else if (taskName.startsWith('NEX-')) {
      prefix = 'NEX'
      taskName = taskName.replace('NEX-', '')
    }
    
    setFormData({
      date: taskDate,
      startTime,
      endTime,
      taskName,
      comment: task.comment || '',
      duration: task.duration || ''
    })
    setEditingTask(task)
    setSelectedPrefix(prefix)
    setShowTaskForm(true)
  }

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.taskName.trim()) return

    const task = {
      date: formData.date.toISOString(),
      startTime: formData.startTime.toISOString(),
      endTime: formData.endTime.toISOString(),
      taskName: formData.taskName.trim(),
      duration: formData.duration || calculateDuration(),
      comment: formData.comment.trim(),
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString()
    }

    if (editingTask) {
      // Update existing task
      onEditTask(editingTask.id, task)
    } else {
      // Add new task
      onAddTask(task)
    }
    
    setShowTaskForm(false)
    setSelectedTimeSlot(null)
    setEditingTask(null)
    setSelectedPrefix(null)
    setFormData({
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      taskName: '',
      comment: '',
      duration: ''
    })
  }

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime && formData.endTime > formData.startTime) {
      const diffMs = formData.endTime - formData.startTime
      const diffHours = diffMs / (1000 * 60 * 60)
      const hours = Math.floor(diffHours)
      const minutes = Math.floor((diffHours - hours) * 60)
      return `${hours}h ${minutes}m`
    }
    return ''
  }

  const handlePrefixClick = (prefix) => {
    if (selectedPrefix === prefix) {
      setSelectedPrefix(null)
      if (formData.taskName.startsWith(`${prefix}-`)) {
        setFormData({ ...formData, taskName: formData.taskName.replace(`${prefix}-`, '') })
      }
    } else {
      setSelectedPrefix(prefix)
      let newTaskName = formData.taskName
      if (newTaskName.startsWith('NFX-') || newTaskName.startsWith('NEX-')) {
        newTaskName = newTaskName.replace(/^(NFX|NEX)-/, '')
      }
      setFormData({ ...formData, taskName: `${prefix}-${newTaskName}` })
    }
  }

  // Navigate dates
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction)
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction)
    }
    setCurrentDate(newDate)
  }
  
  // Get today's date in short format
  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Render Day View
  const renderDayView = () => {
    return (
      <div className="calendar-day-view">
        <div className="calendar-time-column">
          {timeSlots.map((slot, index) => (
            <div key={index} className="time-slot-label">
              {index % 2 === 0 && <span>{slot}</span>}
            </div>
          ))}
        </div>
        <div className="calendar-day-column">
              {timeSlots.map((slot, index) => {
                const tasksAtSlot = getTasksForTimeSlot(currentDate, slot)
                return (
                  <div
                    key={index}
                    className={`time-slot ${index % 2 === 0 ? 'hour-mark' : ''}`}
                    onClick={() => handleTimeSlotClick(currentDate, slot)}
                  >
                    {tasksAtSlot.map((task, taskIndex) => {
                      const position = getTaskPosition(task, currentDate, slot)
                      // Only show task at its start slot to avoid duplicates
                      if (!position.isStart) return null
                      const taskColor = getTaskColor(task.taskName)
                      return (
                        <div
                          key={taskIndex}
                          className="calendar-task-block"
                          style={{
                            top: position.top,
                            height: position.height,
                            backgroundColor: taskColor.bg,
                            borderLeft: `3px solid ${taskColor.border}`,
                            color: taskColor.text
                          }}
                          onClick={(e) => handleTaskClick(task, e)}
                        >
                          <div className="task-block-time">
                            {new Date(task.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </div>
                          <div className="task-block-name">{task.taskName}</div>
                          {task.duration && (
                            <div className="task-block-duration">{task.duration}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
        </div>
      </div>
    )
  }


  // Render Month View
  const renderMonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return (
      <div className="calendar-month-view">
        <div className="month-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="month-day-header">{day}</div>
          ))}
          {days.map((date, index) => {
            const tasksForDate = getTasksForDate(date)
            return (
              <div
                key={index}
                className={`month-day-cell ${date ? '' : 'empty'} ${date && date.toDateString() === new Date().toDateString() ? 'today' : ''}`}
                onClick={() => {
                  if (date) {
                    setCurrentDate(date)
                    setViewMode('day')
                  }
                }}
              >
                {date && (
                  <>
                    <div className="month-day-number">{date.getDate()}</div>
                    <div className="month-day-tasks">
                      {tasksForDate.slice(0, 5).map((task, taskIndex) => {
                        const taskColor = getTaskColor(task.taskName)
                        return (
                          <div
                            key={taskIndex}
                            className="month-task-item"
                            style={{ backgroundColor: taskColor.bg }}
                            title={`${new Date(task.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${task.taskName}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTaskClick(task, e)
                            }}
                          >
                            {task.taskName}
                          </div>
                        )
                      })}
                      {tasksForDate.length > 5 && (
                        <div className="month-task-more">+{tasksForDate.length - 5} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Render List View
  const renderListView = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const dateA = new Date(a.date || a.startTime)
      const dateB = new Date(b.date || b.startTime)
      return dateB - dateA
    })

    return (
      <div className="calendar-list-view">
        {sortedTasks.length === 0 ? (
          <div className="empty-list">No tasks found</div>
        ) : (
          sortedTasks.map((task, index) => (
            <div 
              key={index} 
              className="list-task-item"
              onClick={(e) => handleTaskClick(task, e)}
            >
              <div className="list-task-date">
                {new Date(task.date || task.startTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="list-task-content">
                <div className="list-task-name">{task.taskName}</div>
                <div className="list-task-time">
                  {new Date(task.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - 
                  {new Date(task.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  {task.duration && ` • ${task.duration}`}
                </div>
                {task.comment && <div className="list-task-comment">{task.comment}</div>}
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  return (
    <div className={`calendar-view-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Today's Date Display */}
      <div className="calendar-today-display">
        {getTodayDate()}
      </div>
      
      {/* Header with Navigation */}
      <div className="calendar-header">
        <div className="calendar-nav-left">
          <button className="calendar-nav-btn" onClick={goToToday}>Today</button>
          <div className="calendar-nav-arrows">
            <button className="calendar-nav-arrow" onClick={() => navigateDate(-1)}>‹</button>
            <button className="calendar-nav-arrow" onClick={() => navigateDate(1)}>›</button>
          </div>
          <div className="calendar-date-display">
            {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {viewMode === 'list' && 'All Tasks'}
          </div>
        </div>
        <div className="calendar-view-switcher">
          <button
            className={`view-switch-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
          <button
            className={`view-switch-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button
            className={`view-switch-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="calendar-content">
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'list' && renderListView()}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="calendar-task-modal-overlay" onClick={() => setShowTaskForm(false)}>
          <div className="calendar-task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTask ? 'Edit Task' : 'Add Task'}</h3>
              <button className="modal-close" onClick={() => {
                setShowTaskForm(false)
                setEditingTask(null)
                setSelectedPrefix(null)
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="calendar-task-form">
              <div className="form-group">
                <label>Date</label>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => setFormData({ ...formData, date })}
                  dateFormat="MMM d, yyyy"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={formData.startTime.toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number)
                    const newTime = new Date(formData.startTime)
                    newTime.setHours(hours, minutes, 0, 0)
                    setFormData({ ...formData, startTime: newTime })
                  }}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={formData.endTime.toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number)
                    const newTime = new Date(formData.endTime)
                    newTime.setHours(hours, minutes, 0, 0)
                    setFormData({ ...formData, endTime: newTime })
                  }}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Task Name *</label>
                <div className="prefix-buttons">
                  <button
                    type="button"
                    onClick={() => handlePrefixClick('NFX')}
                    className={`prefix-btn ${selectedPrefix === 'NFX' ? 'active' : ''}`}
                  >
                    NFX
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrefixClick('NEX')}
                    className={`prefix-btn ${selectedPrefix === 'NEX' ? 'active' : ''}`}
                  >
                    NEX
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.taskName}
                  onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                  placeholder="Enter task name"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Comment (Optional)</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Add notes..."
                  className="form-textarea"
                />
              </div>
              <div className="form-actions">
                {editingTask && (
                  <button 
                    type="button" 
                    className="btn-delete" 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this task?')) {
                        onDeleteTask(editingTask.id)
                        setShowTaskForm(false)
                        setEditingTask(null)
                        setSelectedPrefix(null)
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => {
                    setShowTaskForm(false)
                    setEditingTask(null)
                    setSelectedPrefix(null)
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingTask ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView

