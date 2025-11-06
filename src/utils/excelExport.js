import * as XLSX from 'xlsx'

export const exportToExcel = (tasks) => {
  if (!tasks || tasks.length === 0) {
    alert('No data to export')
    return
  }

  // Prepare data for Excel
  const excelData = tasks.map(task => {
    const notesText = task.notes && task.notes.length > 0
      ? task.notes.map(note => {
          const categoryLabel = note.category || 'work'
          const tagText = note.tag ? `[${note.tag}]` : ''
          return `${tagText} ${note.text} (${new Date(note.createdAt).toLocaleDateString()})`
        }).join(' | ')
      : ''
    
    return {
      'Date': new Date(task.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      }),
      'Task Name': task.taskName,
      'Start Time': new Date(task.startTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      'End Time': new Date(task.endTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      'Duration': task.duration || '',
      'Comment': task.comment || '',
      'Notes': notesText,
      'Notes Count': task.notes ? task.notes.length : 0
    }
  })

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(excelData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Timesheet')

  // Auto-size columns
  const colWidths = [
    { wch: 15 }, // Date
    { wch: 30 }, // Task Name
    { wch: 12 }, // Start Time
    { wch: 12 }, // End Time
    { wch: 12 }, // Duration
    { wch: 50 }, // Comment
    { wch: 80 }, // Notes
    { wch: 12 }  // Notes Count
  ]
  ws['!cols'] = colWidths

  // Generate filename with current date
  const today = new Date().toISOString().split('T')[0]
  const filename = `Timesheet_Export_${today}.xlsx`

  // Export file
  XLSX.writeFile(wb, filename)
  
  console.log(`Exported ${tasks.length} entries to ${filename}`)
}

