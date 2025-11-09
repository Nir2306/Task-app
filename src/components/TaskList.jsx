import React, { useState, useMemo } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { exportToExcel } from '../utils/excelExport'
import './TaskList.css'

function TaskList({ tasks, onDeleteTask, onEditTask }) {
  const [filterDate, setFilterDate] = useState(null)
  const [filterTaskName, setFilterTaskName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [copyMessage, setCopyMessage] = useState(null)
  const [showTaskDropdown, setShowTaskDropdown] = useState(false)
  
  // Get unique task names for dropdown, sorted by most recent creation date (descending)
  const uniqueTaskNames = useMemo(() => {
    const taskMap = new Map()
    
    // Group tasks by name and track the most recent creation date for each
    tasks.forEach(task => {
      if (!task.taskName) return
      
      const existing = taskMap.get(task.taskName)
      const taskDate = new Date(task.createdAt || task.date || 0)
      
      if (!existing || taskDate > existing.latestDate) {
        taskMap.set(task.taskName, {
          name: task.taskName,
          latestDate: taskDate
        })
      }
    })
    
    // Convert to array and sort by latest date (descending - newest first)
    return Array.from(taskMap.values())
      .sort((a, b) => b.latestDate - a.latestDate)
      .map(item => item.name)
  }, [tasks])
  
  // Filter task names based on input
  const filteredTaskNames = uniqueTaskNames.filter(name =>
    name.toLowerCase().includes(filterTaskName.toLowerCase())
  )

  const filteredTasks = tasks.filter(task => {
    if (filterDate) {
      const taskDate = new Date(task.date).toDateString()
      const filterDateStr = filterDate.toDateString()
      if (taskDate !== filterDateStr) return false
    }
    if (filterTaskName) {
      if (!task.taskName.toLowerCase().includes(filterTaskName.toLowerCase())) {
        return false
      }
    }
    return true
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  const handleEdit = (task) => {
    setEditingId(task.id)
    setEditForm({
      taskName: task.taskName,
      date: new Date(task.date),
      startTime: new Date(task.startTime),
      endTime: new Date(task.endTime),
      duration: task.duration,
      comment: task.comment
    })
  }

  const handleSaveEdit = () => {
    onEditTask(editingId, {
      ...editForm,
      date: editForm.date.toISOString(),
      startTime: editForm.startTime.toISOString(),
      endTime: editForm.endTime.toISOString()
    })
    setEditingId(null)
    setEditForm({})
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleExport = () => {
    exportToExcel(filteredTasks.length > 0 ? filteredTasks : tasks)
  }

  const totalHours = filteredTasks.reduce((total, task) => {
    const duration = task.duration || '0h 0m'
    const match = duration.match(/(\d+)h\s*(\d+)m/)
    if (match) {
      const hours = parseInt(match[1]) || 0
      const minutes = parseInt(match[2]) || 0
      return total + hours + minutes / 60
    }
    return total
  }, 0)

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>Task List</h2>
        <button onClick={handleExport} className="export-btn">
          Export to Excel
        </button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Filter by Date:</label>
          <div className="date-filter-wrapper">
            <DatePicker
              selected={filterDate}
              onChange={(date) => setFilterDate(date)}
              dateFormat="MMMM d, yyyy"
              className="filter-input date-picker-input"
              isClearable
              placeholderText="Select date..."
              calendarClassName="mobile-date-picker"
            />
            {filterDate && (
              <button 
                className="clear-date-btn"
                onClick={() => setFilterDate(null)}
                aria-label="Clear date filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="filter-group">
          <label>Filter by Task:</label>
          <div className="task-filter-wrapper">
            <input
              type="text"
              value={filterTaskName}
              onChange={(e) => {
                setFilterTaskName(e.target.value)
                setShowTaskDropdown(true)
              }}
              onFocus={() => setShowTaskDropdown(true)}
              onBlur={() => {
                // Delay to allow dropdown click
                setTimeout(() => setShowTaskDropdown(false), 200)
              }}
              placeholder="Search or select task name..."
              className="filter-input task-filter-input"
            />
            {showTaskDropdown && filteredTaskNames.length > 0 && (
              <div className="task-dropdown">
                {filteredTaskNames.map((taskName, index) => (
                  <button
                    key={index}
                    type="button"
                    className="task-dropdown-item"
                    onClick={() => {
                      setFilterTaskName(taskName)
                      setShowTaskDropdown(false)
                    }}
                  >
                    {taskName}
                  </button>
                ))}
              </div>
            )}
            {filterTaskName && (
              <button 
                className="clear-task-btn"
                onClick={() => {
                  setFilterTaskName('')
                  setShowTaskDropdown(false)
                }}
                aria-label="Clear task filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="stats-bar">
        <span>Total Entries: <strong>{filteredTasks.length}</strong></span>
        <span>Total Time: <strong>{totalHours.toFixed(2)} hours</strong></span>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>No entries found. Add your first time entry to get started!</p>
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map(task => (
            <div key={task.id} className="task-card">
              {editingId === task.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editForm.taskName}
                    onChange={(e) => setEditForm({...editForm, taskName: e.target.value})}
                    className="edit-input"
                    placeholder="Task name"
                  />
                  <div className="edit-row">
                    <DatePicker
                      selected={editForm.date}
                      onChange={(date) => setEditForm({...editForm, date})}
                      dateFormat="MMM d, yyyy"
                      className="edit-input"
                    />
                    <DatePicker
                      selected={editForm.startTime}
                      onChange={(time) => setEditForm({...editForm, startTime: time})}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      dateFormat="h:mm aa"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                      className="edit-input"
                      placeholder="Duration"
                    />
                  </div>
                  <textarea
                    value={editForm.comment}
                    onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                    className="edit-textarea"
                    placeholder="Comment"
                  />
                  <div className="edit-actions">
                    <button onClick={handleSaveEdit} className="save-btn">Save</button>
                    <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="task-header">
                    <h3>{task.taskName}</h3>
                    <div className="task-actions">
                      <button onClick={() => handleEdit(task)} className="edit-btn">Edit</button>
                      <button onClick={() => {
                        if (window.confirm('Are you sure you want to delete this entry?')) {
                          onDeleteTask(task.id)
                        }
                      }} className="delete-btn">Delete</button>
                    </div>
                  </div>
                  <div className="task-details">
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span>{new Date(task.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time:</span>
                      <span>
                        {new Date(task.startTime).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })} - {new Date(task.endTime).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="duration-badge">{task.duration}</span>
                    </div>
                    {task.comment && (
                      <div className="detail-item comment-item">
                        <div className="comment-header">
                          <span className="detail-label">Comment:</span>
                          <div className="copy-button-wrapper">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(task.comment).then(() => {
                                setCopyMessage(`copied-comment-${task.id}`)
                                setTimeout(() => setCopyMessage(null), 2000)
                              }).catch(() => {
                                setCopyMessage(`error-comment-${task.id}`)
                                setTimeout(() => setCopyMessage(null), 2000)
                              })
                            }}
                            className="copy-comment-btn"
                            title="Copy comment"
                          >
                            Copy
                          </button>
                            {copyMessage === `copied-comment-${task.id}` && (
                              <span className="copy-success-message">✓ Copied!</span>
                            )}
                          </div>
                        </div>
                        <span className="comment-text">{task.comment}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskList

