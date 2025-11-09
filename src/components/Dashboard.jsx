import React, { useState, useMemo, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'
import { useTheme } from '../contexts/ThemeContext'
import './Dashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function Dashboard({ tasks = [] }) {
  const [viewMode, setViewMode] = useState('week') // day, week, month
  const [chartTab, setChartTab] = useState('pie') // pie, line, bar
  const { darkMode } = useTheme()


  const parseDuration = (duration) => {
    if (!duration) return 0
    const match = duration.match(/(\d+)h\s*(\d+)m/)
    if (match) {
      const hours = parseInt(match[1]) || 0
      const minutes = parseInt(match[2]) || 0
      return hours + minutes / 60
    }
    return 0
  }

  const getWeekKey = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust to Monday
    const monday = new Date(d.setDate(diff))
    return `Week of ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  const getDataByPeriod = useMemo(() => {
    const safeTasks = tasks || []
    if (!safeTasks || safeTasks.length === 0) return { byTask: {}, byDay: {}, byWeek: {}, byMonth: {} }

    const byTask = {}
    const byDay = {}
    const byWeek = {}
    const byMonth = {}

    safeTasks.forEach((task, index) => {
      try {
        if (!task.date) {
          console.warn(`Task ${index} has no date:`, task)
          return
        }
        
        const date = new Date(task.date)
        if (isNaN(date.getTime())) {
          console.warn(`Task ${index} has invalid date:`, task.date)
          return // Skip invalid dates
        }
        
        const dayKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        const weekKey = getWeekKey(date)
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        
        const hours = parseDuration(task.duration || '')
        if (hours <= 0) {
          console.warn(`Task ${index} has no valid duration:`, task.duration)
          return // Skip tasks with no duration
        }

        if (!task.taskName) {
          console.warn(`Task ${index} has no task name`)
          return
        }

        // By task
        byTask[task.taskName] = (byTask[task.taskName] || 0) + hours

        // By day
        byDay[dayKey] = (byDay[dayKey] || 0) + hours

        // By week
        byWeek[weekKey] = (byWeek[weekKey] || 0) + hours

        // By month
        byMonth[monthKey] = (byMonth[monthKey] || 0) + hours
      } catch (error) {
        console.error(`Error processing task ${index}:`, task, error)
      }
    })
    

    return { byTask, byDay, byWeek, byMonth }
  }, [tasks])

  const taskData = useMemo(() => {
    try {
      const byTask = getDataByPeriod.byTask || {}
      const data = Object.entries(byTask)
        .filter(([, hours]) => hours > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)

      if (data.length === 0) {
        return {
          labels: ['No data'],
          datasets: [{
            label: 'Hours',
            data: [0],
            backgroundColor: ['rgba(200, 200, 200, 0.8)'],
            borderColor: ['rgba(200, 200, 200, 1)'],
            borderWidth: 2
          }]
        }
      }

      const colors = [
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(37, 99, 235, 0.8)',     // Darker Blue
        'rgba(96, 165, 250, 0.8)',    // Light Blue
        'rgba(29, 78, 216, 0.8)',     // Navy
        'rgba(147, 197, 253, 0.8)',   // Lighter Blue
        'rgba(59, 130, 246, 0.6)',    // Blue with opacity
        'rgba(37, 99, 235, 0.6)',
        'rgba(96, 165, 250, 0.6)',
        'rgba(29, 78, 216, 0.6)',
        'rgba(147, 197, 253, 0.6)'
      ]

      const borderColors = colors.map(c => c.replace('0.8', '1').replace('0.6', '1'))

      return {
        labels: data.map(([name]) => name.length > 20 ? name.substring(0, 20) + '...' : name),
        datasets: [{
          label: 'Hours',
          data: data.map(([, hours]) => Number(hours.toFixed(2))),
          backgroundColor: colors.slice(0, data.length),
          borderColor: borderColors.slice(0, data.length),
          borderWidth: 2
        }]
      }
    } catch (error) {
      console.error('Error processing task data:', error)
      return {
        labels: ['Error'],
        datasets: [{
          label: 'Hours',
          data: [0],
          backgroundColor: ['rgba(200, 200, 200, 0.8)'],
          borderColor: ['rgba(200, 200, 200, 1)'],
          borderWidth: 2
        }]
      }
    }
  }, [getDataByPeriod.byTask])

  const timeSeriesData = useMemo(() => {
    try {
      let dataMap = {}
      switch (viewMode) {
        case 'day':
          dataMap = getDataByPeriod.byDay || {}
          break
        case 'week':
          dataMap = getDataByPeriod.byWeek || {}
          break
        case 'month':
          dataMap = getDataByPeriod.byMonth || {}
          break
        default:
          dataMap = getDataByPeriod.byWeek || {}
      }

      const entries = Object.entries(dataMap).filter(([, hours]) => hours > 0)
      
      if (entries.length === 0) {
        return {
          labels: ['No data'],
          datasets: [{
            label: 'Hours Worked',
            data: [0],
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        }
      }

      // Sort by date for proper timeline
      const sortedEntries = entries.sort((a, b) => {
        try {
          // Try to parse dates, if not parseable, keep original order
          const dateA = new Date(a[0])
          const dateB = new Date(b[0])
          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            return dateA - dateB
          }
          return a[0].localeCompare(b[0])
        } catch {
          return a[0].localeCompare(b[0])
        }
      })

      return {
        labels: sortedEntries.map(([key]) => key),
        datasets: [{
          label: 'Hours Worked',
          data: sortedEntries.map(([, hours]) => Number(hours.toFixed(2))),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      }
    } catch (error) {
      console.error('Error processing time series data:', error)
      return {
        labels: ['Error'],
        datasets: [{
          label: 'Hours Worked',
          data: [0],
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      }
    }
  }, [viewMode, getDataByPeriod])

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: darkMode ? '#e0e0e0' : '#333',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: darkMode ? '#e0e0e0' : '#333',
        bodyColor: darkMode ? '#e0e0e0' : '#333',
        borderColor: darkMode ? '#3b82f6' : '#3b82f6',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const hours = context.parsed.y !== undefined ? context.parsed.y : context.parsed
            const h = Math.floor(hours)
            const m = Math.round((hours - h) * 60)
            return `${context.dataset.label}: ${h}h ${m}m`
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? '#94a3b8' : '#666',
          font: {
            size: 11
          }
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#94a3b8' : '#666',
          font: {
            size: 11
          },
          callback: function(value) {
            return value + 'h'
          }
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  }), [darkMode])

  const pieOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: '#000000',
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: 15,
          usePointStyle: true,
          boxWidth: 12,
          boxHeight: 12
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: darkMode ? '#e0e0e0' : '#333',
        bodyColor: darkMode ? '#e0e0e0' : '#333',
        borderColor: darkMode ? '#3b82f6' : '#3b82f6',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            const h = Math.floor(value)
            const m = Math.round((value - h) * 60)
            return `${label}: ${h}h ${m}m (${percentage}%)`
          }
        }
      }
    }
  }), [darkMode])


  // Ensure tasks is always an array
  const safeTasks = tasks || []
  
  const totalHours = safeTasks.reduce((sum, task) => {
    try {
      return sum + parseDuration(task.duration || '')
    } catch {
      return sum
    }
  }, 0)
  const totalTasks = safeTasks.length
  const uniqueTaskNames = new Set(safeTasks.filter(t => t.taskName).map(t => t.taskName)).size
  
  // Calculate unique days more safely
  const uniqueDays = new Set()
  safeTasks.forEach(task => {
    try {
      if (task.date) {
        const dateStr = typeof task.date === 'string' ? task.date.split('T')[0] : new Date(task.date).toISOString().split('T')[0]
        if (dateStr) uniqueDays.add(dateStr)
      }
    } catch (e) {
      // Skip invalid dates
    }
  })
  const avgHoursPerDay = safeTasks.length > 0 && uniqueDays.size > 0 ? totalHours / uniqueDays.size : 0

  if (safeTasks.length === 0) {
    return (
      <div className="dashboard-container" style={{ background: 'transparent', minHeight: '100%', position: 'relative', zIndex: 1 }}>
        <div className="empty-dashboard" style={{ background: darkMode ? '#16213e' : '#f8f9fa', color: darkMode ? '#94a3b8' : '#6c757d', padding: '60px 20px', borderRadius: '12px', textAlign: 'center' }}>
          <h2 style={{ color: darkMode ? '#e0e0e0' : '#333', marginBottom: '30px', fontSize: '1.8rem', fontWeight: '700' }}>Dashboard</h2>
          <p style={{ color: darkMode ? '#94a3b8' : '#6c757d', fontSize: '1.1rem', marginTop: '15px' }}>No data available yet. Start adding time entries to see your dashboard!</p>
        </div>
      </div>
    )
  }

  
  return (
    <div className="dashboard-container" style={{ background: darkMode ? 'transparent' : 'transparent', minHeight: '100%', position: 'relative', zIndex: 1000, width: '100%' }}>
      <h2 style={{ color: darkMode ? '#e0e0e0' : '#333', marginBottom: '30px', fontSize: '1.8rem', fontWeight: '700', display: 'block' }}>Dashboard</h2>

      {/* Stats grid - compact horizontal on mobile */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-value">{totalHours.toFixed(2)}</div>
            <div className="stat-label">Total Hours</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-label">Total Entries</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-value">{uniqueTaskNames}</div>
            <div className="stat-label">Unique Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-value">{avgHoursPerDay.toFixed(2)}</div>
            <div className="stat-label">Avg Hours/Day</div>
          </div>
        </div>
      </div>

      {/* Chart section */}
      <div className="chart-section">
        <div className="chart-header">
          <h3 style={{ color: darkMode ? '#000000' : '#333', fontWeight: '700', fontSize: '1.5rem' }}>Data Visualization</h3>
          <div className="chart-tabs">
            <button
              className={`chart-tab ${chartTab === 'pie' ? 'active' : ''}`}
              onClick={() => setChartTab('pie')}
            >
              Time by Task
            </button>
            <button
              className={`chart-tab ${chartTab === 'line' ? 'active' : ''}`}
              onClick={() => setChartTab('line')}
            >
              Time Series
            </button>
            <button
              className={`chart-tab ${chartTab === 'bar' ? 'active' : ''}`}
              onClick={() => setChartTab('bar')}
            >
              Top Tasks
            </button>
          </div>
        </div>
        
        {chartTab === 'line' && (
          <div className="view-mode-buttons" style={{ marginBottom: '20px' }}>
            <button
              className={viewMode === 'day' ? 'active' : ''}
              onClick={() => setViewMode('day')}
            >
              Daily
            </button>
            <button
              className={viewMode === 'week' ? 'active' : ''}
              onClick={() => setViewMode('week')}
            >
              Weekly
            </button>
            <button
              className={viewMode === 'month' ? 'active' : ''}
              onClick={() => setViewMode('month')}
            >
              Monthly
            </button>
          </div>
        )}

        <div className="chart-container">
          {chartTab === 'pie' && (() => {
            try {
              if (taskData && taskData.labels && taskData.labels.length > 0 && taskData.labels[0] !== 'No data' && taskData.labels[0] !== 'Error' && taskData.datasets && taskData.datasets[0] && taskData.datasets[0].data && taskData.datasets[0].data.length > 0) {
                return <Pie data={taskData} options={pieOptions} />
              } else {
                return (
                  <div style={{ padding: '40px', textAlign: 'center', color: darkMode ? '#94a3b8' : '#6c757d' }}>
                    <p>No task data available for visualization</p>
                    <small>Debug: {JSON.stringify(taskData?.labels)}</small>
                  </div>
                )
              }
            } catch (error) {
              console.error('Error rendering Pie chart:', error)
              return (
                <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                  <p>Error rendering chart: {error.message}</p>
                </div>
              )
            }
          })()}

          {chartTab === 'line' && (() => {
            try {
              if (timeSeriesData && timeSeriesData.labels && timeSeriesData.labels.length > 0 && timeSeriesData.labels[0] !== 'No data' && timeSeriesData.labels[0] !== 'Error' && timeSeriesData.datasets && timeSeriesData.datasets[0] && timeSeriesData.datasets[0].data && timeSeriesData.datasets[0].data.length > 0) {
                return <Line data={timeSeriesData} options={chartOptions} />
              } else {
                return (
                  <div style={{ padding: '40px', textAlign: 'center', color: darkMode ? '#94a3b8' : '#6c757d' }}>
                    <p>No time series data available for visualization</p>
                    <small>Debug: {JSON.stringify(timeSeriesData?.labels)}</small>
                  </div>
                )
              }
            } catch (error) {
              console.error('Error rendering Line chart:', error)
              return (
                <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                  <p>Error rendering chart: {error.message}</p>
                </div>
              )
            }
          })()}

          {chartTab === 'bar' && (() => {
            try {
              if (taskData && taskData.labels && taskData.labels.length > 0 && taskData.labels[0] !== 'No data' && taskData.labels[0] !== 'Error' && taskData.datasets && taskData.datasets[0] && taskData.datasets[0].data && taskData.datasets[0].data.length > 0) {
                return <Bar data={taskData} options={chartOptions} />
              } else {
                return (
                  <div style={{ padding: '40px', textAlign: 'center', color: darkMode ? '#94a3b8' : '#6c757d' }}>
                    <p>No task data available for visualization</p>
                    <small>Debug: {JSON.stringify(taskData?.labels)}</small>
                  </div>
                )
              }
            } catch (error) {
              console.error('Error rendering Bar chart:', error)
              return (
                <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                  <p>Error rendering chart: {error.message}</p>
                </div>
              )
            }
          })()}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

