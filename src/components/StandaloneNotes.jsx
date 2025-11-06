import React, { useState, useEffect, useMemo } from 'react'
import { hybridNotes } from '../utils/offlineStorage'
import './StandaloneNotes.css'

const NOTE_CATEGORIES = [
  { id: 'reminder', label: '⏰ Reminder', color: '#f97316', icon: '⏰' },
  { id: 'code', label: '💻 Code', color: '#3b82f6', icon: '💻' },
  { id: 'todo', label: '✅ To-Do', color: '#10b981', icon: '✅' },
  { id: 'links', label: '🔗 Links', color: '#8b5cf6', icon: '🔗' },
  { id: 'important', label: '⭐ Important', color: '#f59e0b', icon: '⭐' }
]

function StandaloneNotes({ tasks = [] }) {
  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('reminder')
  const [customCategory, setCustomCategory] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editNoteText, setEditNoteText] = useState('')
  const [editNoteTitle, setEditNoteTitle] = useState('')
  const [editSelectedTaskId, setEditSelectedTaskId] = useState('')
  const [showAddNote, setShowAddNote] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, title
  const [copyMessage, setCopyMessage] = useState(null)

  // Load notes from database on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = await hybridNotes.getAll()
        setNotes(savedNotes || [])
      } catch (error) {
        console.error('Error loading notes from database:', error)
        setNotes([])
      } finally {
        setIsLoading(false)
      }
    }
    loadNotes()
  }, [])

  // Auto-save every 2 seconds while typing
  useEffect(() => {
    if (editingNoteId && editNoteText) {
      const timer = setTimeout(() => {
        handleAutoSave(editingNoteId, editNoteText, editNoteTitle)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [editNoteText, editNoteTitle, editingNoteId])

  const saveNotes = async (updatedNotes) => {
    try {
      setNotes(updatedNotes)
      // Use hybrid storage (saves to IndexedDB always, syncs to Firestore when online)
      await hybridNotes.saveAll(updatedNotes)
    } catch (error) {
      console.error('Error saving notes to database:', error)
      // Still update state even if save fails
      setNotes(updatedNotes)
    }
  }

  const handleAutoSave = (noteId, text, title) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, text: text, title: title, updatedAt: new Date().toISOString() }
        : note
    )
    saveNotes(updatedNotes)
  }

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = [...notes]

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(note =>
        note.title?.toLowerCase().includes(query) ||
        note.text.toLowerCase().includes(query) ||
        note.category?.toLowerCase().includes(query) ||
        note.tag?.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(note => note.category === filterCategory)
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(note => note.tag === selectedTag)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt)
      } else if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '')
      }
      return 0
    })

    return filtered
  }, [notes, searchQuery, filterCategory, selectedTag, sortBy])

  const allTags = useMemo(() => {
    const tags = new Set()
    notes.forEach(note => {
      if (note.tag) tags.add(note.tag)
    })
    return Array.from(tags).sort()
  }, [notes])

  const handleAddNote = () => {
    if (newNote.trim()) {
      const linkedTask = selectedTaskId ? tasks.find(t => t.id === parseInt(selectedTaskId)) : null
      const note = {
        id: Date.now(),
        title: newNoteTitle.trim() || 'Untitled Note',
        text: newNote.trim(),
        category: selectedCategory,
        tag: selectedTag || null,
        linkedTask: linkedTask ? {
          taskId: linkedTask.id,
          taskName: linkedTask.taskName,
          taskDate: linkedTask.date
        } : null,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      saveNotes([...notes, note])
      setNewNote('')
      setNewNoteTitle('')
      setSelectedTag('')
      setSelectedTaskId('')
      setShowAddNote(false)
    }
  }

  const handleTogglePin = (noteId) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    )
    saveNotes(updatedNotes)
  }

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id)
    setEditNoteText(note.text)
    setEditNoteTitle(note.title || '')
    setSelectedCategory(note.category || 'important')
    setEditSelectedTaskId(note.linkedTask ? String(note.linkedTask.taskId) : '')
  }

  const handleSaveEdit = () => {
    if (editNoteText.trim()) {
      const finalCategory = selectedCategory === 'custom' && customCategory.trim() 
        ? customCategory.trim() 
        : selectedCategory
      
      const linkedTask = editSelectedTaskId ? tasks.find(t => t.id === parseInt(editSelectedTaskId)) : null
      
      const updatedNotes = notes.map(note =>
        note.id === editingNoteId
          ? { 
              ...note, 
              text: editNoteText.trim(), 
              title: editNoteTitle.trim() || 'Untitled Note', 
              category: finalCategory,
              linkedTask: linkedTask ? {
                taskId: linkedTask.id,
                taskName: linkedTask.taskName,
                taskDate: linkedTask.date
              } : null,
              updatedAt: new Date().toISOString() 
            }
          : note
      )
      saveNotes(updatedNotes)
      setEditingNoteId(null)
      setEditNoteText('')
      setEditNoteTitle('')
      setSelectedCategory('reminder')
      setCustomCategory('')
      setEditSelectedTaskId('')
    }
  }

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Delete this note?')) {
      saveNotes(notes.filter(note => note.id !== noteId))
    }
  }

  const formatNoteText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />')
  }

  const getCategoryInfo = (categoryId) => {
    const found = NOTE_CATEGORIES.find(cat => cat.id === categoryId)
    if (found) return found
    // For custom categories, return a default style
    return { id: categoryId, label: categoryId, color: '#6c757d', icon: '📌' }
  }

  const handleExportNotes = () => {
    const notesText = notes.map(note => {
      const categoryInfo = getCategoryInfo(note.category)
      const tagText = note.tag ? `[Tag: ${note.tag}]` : ''
      const pinnedText = note.isPinned ? '[PINNED]' : ''
      return `${pinnedText} ${categoryInfo.label} ${tagText}\nTitle: ${note.title}\nCreated: ${new Date(note.createdAt).toLocaleString()}\n\n${note.text}\n\n---\n`
    }).join('\n')

    const blob = new Blob([notesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notes_export_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const pinnedNotes = filteredAndSortedNotes.filter(n => n.isPinned)
  const unpinnedNotes = filteredAndSortedNotes.filter(n => !n.isPinned)

  return (
    <div className="standalone-notes-container">
      <div className="notes-header-section">
        <div>
          <h2>My Notes</h2>
          <p className="notes-subtitle">Write and organize your important notes</p>
        </div>
        <div className="header-actions">
          <button onClick={handleExportNotes} className="export-notes-btn">
            Export All
          </button>
          {!showAddNote && (
            <button onClick={() => setShowAddNote(true)} className="add-note-main-btn">
              New Note
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="notes-toolbar">
        <div className="search-section">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="notes-search-input"
          />
        </div>
        <div className="filters-section">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {NOTE_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
            {/* Add custom categories from existing notes */}
            {Array.from(new Set(notes.map(n => n.category).filter(cat => !NOTE_CATEGORIES.find(c => c.id === cat)))).map(customCat => (
              <option key={customCat} value={customCat}>📌 {customCat}</option>
            ))}
          </select>
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="filter-select"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <div className="add-note-card">
          <div className="note-form-header">
            <h3>Create New Note</h3>
            <button onClick={() => setShowAddNote(false)} className="close-btn">✕</button>
          </div>
          <input
            type="text"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="Note title (optional)"
            className="note-title-input"
          />
          <div className="note-category-selector">
            <label>Category:</label>
            <div className="category-buttons">
              {NOTE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    setCustomCategory('')
                  }}
                  className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  style={{ '--category-color': cat.color }}
                >
                  {cat.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('custom')
                  setCustomCategory('')
                }}
                className={`category-btn ${selectedCategory === 'custom' ? 'active' : ''}`}
                style={{ '--category-color': '#6c757d' }}
              >
                ✏️ Custom
              </button>
            </div>
            {selectedCategory === 'custom' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter category name..."
                className="custom-category-input"
              />
            )}
          </div>
          <input
            type="text"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            placeholder="Tag (optional)"
            className="note-tag-input"
          />
          {tasks.length > 0 && (
            <div className="task-link-section">
              <label htmlFor="link-task">Link to Task (optional):</label>
              <select
                id="link-task"
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="task-link-select"
              >
                <option value="">No task linked</option>
                {tasks
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map(task => (
                    <option key={task.id} value={task.id}>
                      {task.taskName} - {new Date(task.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write your note here... Use **bold**, *italic*, `code`, or new lines"
            className="note-textarea"
            rows="8"
          />
          <div className="note-form-actions">
            <button onClick={handleAddNote} className="save-btn" disabled={!newNote.trim()}>
              Save Note
            </button>
            <button onClick={() => {
              setShowAddNote(false)
              setNewNote('')
              setNewNoteTitle('')
              setSelectedCategory('reminder')
              setCustomCategory('')
              setSelectedTag('')
              setSelectedTaskId('')
            }} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {filteredAndSortedNotes.length === 0 ? (
        <div className="empty-notes">
          {notes.length === 0 ? (
            <p>No notes yet. Click "New Note" to create your first note!</p>
          ) : (
            <p>No notes match your search criteria.</p>
          )}
        </div>
      ) : (
        <div className="notes-list-container">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="notes-section">
              <h3 className="section-title">Pinned Notes</h3>
              <div className="notes-grid">
                {pinnedNotes.map(note => {
                  const categoryInfo = getCategoryInfo(note.category)
                  return <NoteCard
                    key={note.id}
                    note={note}
                    categoryInfo={categoryInfo}
                    editingNoteId={editingNoteId}
                    editNoteText={editNoteText}
                    editNoteTitle={editNoteTitle}
                    selectedCategory={selectedCategory}
                    editSelectedTaskId={editSelectedTaskId}
                    customCategory={customCategory}
                    tasks={tasks}
                    setEditNoteText={setEditNoteText}
                    setEditNoteTitle={setEditNoteTitle}
                    setSelectedCategory={setSelectedCategory}
                    setEditSelectedTaskId={setEditSelectedTaskId}
                    setCustomCategory={setCustomCategory}
                    onStartEdit={handleStartEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={() => {
                      setEditingNoteId(null)
                      setEditNoteText('')
                      setEditNoteTitle('')
                      setEditSelectedTaskId('')
                    }}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDeleteNote}
                    formatNoteText={formatNoteText}
                  />
                })}
              </div>
            </div>
          )}

          {/* Unpinned Notes */}
          {unpinnedNotes.length > 0 && (
            <div className="notes-section">
              <h3 className="section-title">All Notes ({unpinnedNotes.length})</h3>
              <div className="notes-grid">
                {unpinnedNotes.map(note => {
                  const categoryInfo = getCategoryInfo(note.category)
                  return <NoteCard
                    key={note.id}
                    note={note}
                    categoryInfo={categoryInfo}
                    editingNoteId={editingNoteId}
                    editNoteText={editNoteText}
                    editNoteTitle={editNoteTitle}
                    selectedCategory={selectedCategory}
                    editSelectedTaskId={editSelectedTaskId}
                    customCategory={customCategory}
                    tasks={tasks}
                    setEditNoteText={setEditNoteText}
                    setEditNoteTitle={setEditNoteTitle}
                    setSelectedCategory={setSelectedCategory}
                    setEditSelectedTaskId={setEditSelectedTaskId}
                    setCustomCategory={setCustomCategory}
                    onStartEdit={handleStartEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={() => {
                      setEditingNoteId(null)
                      setEditNoteText('')
                      setEditNoteTitle('')
                      setEditSelectedTaskId('')
                    }}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDeleteNote}
                    formatNoteText={formatNoteText}
                  />
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NoteCard({
  note,
  categoryInfo,
  editingNoteId,
  editNoteText,
  editNoteTitle,
  selectedCategory,
  editSelectedTaskId,
  customCategory,
  tasks,
  setEditNoteText,
  setEditNoteTitle,
  setSelectedCategory,
  setEditSelectedTaskId,
  setCustomCategory,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onTogglePin,
  onDelete,
  formatNoteText
}) {
  if (editingNoteId === note.id) {
    return (
      <div className="note-card editing">
        <input
          type="text"
          value={editNoteTitle}
          onChange={(e) => setEditNoteTitle(e.target.value)}
          className="edit-title-input"
          placeholder="Title"
        />
        <div className="note-category-selector">
          <div className="category-buttons">
            {NOTE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setCustomCategory('')
                }}
                className={`category-btn-small ${selectedCategory === cat.id ? 'active' : ''}`}
                style={{ '--category-color': cat.color }}
              >
                {cat.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('custom')
                setCustomCategory('')
              }}
              className={`category-btn-small ${selectedCategory === 'custom' ? 'active' : ''}`}
              style={{ '--category-color': '#6c757d' }}
            >
              ✏️ Custom
            </button>
          </div>
          {selectedCategory === 'custom' && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter custom category name..."
              className="custom-category-input"
              style={{ marginTop: '10px', width: '100%' }}
            />
          )}
        </div>
        {tasks && tasks.length > 0 && (
          <div className="task-link-section">
            <label htmlFor={`edit-link-task-${note.id}`}>Link to Task (optional):</label>
            <select
              id={`edit-link-task-${note.id}`}
              value={editSelectedTaskId}
              onChange={(e) => setEditSelectedTaskId(e.target.value)}
              className="task-link-select"
            >
              <option value="">No task linked</option>
              {tasks
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(task => (
                  <option key={task.id} value={task.id}>
                    {task.taskName} - {new Date(task.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </option>
                ))}
            </select>
          </div>
        )}
        <textarea
          value={editNoteText}
          onChange={(e) => setEditNoteText(e.target.value)}
          className="edit-textarea"
          rows="6"
        />
        <div className="note-edit-actions">
                      <button onClick={onSaveEdit} className="save-btn-small">Save</button>
                      <button onClick={onCancelEdit} className="cancel-btn-small">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`note-card ${note.isPinned ? 'pinned' : ''}`}>
      <div className="note-card-header">
        <div className="note-card-title-row">
          <h4>{note.title}</h4>
          <button
            onClick={() => onTogglePin(note.id)}
            className={`pin-btn ${note.isPinned ? 'pinned' : ''}`}
            title={note.isPinned ? 'Unpin' : 'Pin note'}
          >
            {note.isPinned ? 'Pin' : 'Pin'}
          </button>
        </div>
        <div className="note-meta-row">
          <div className="note-category-badge" style={{ backgroundColor: categoryInfo.color }}>
            {categoryInfo.label}
          </div>
          {note.tag && (
            <span className="note-tag-badge">🏷️ {note.tag}</span>
          )}
          {note.linkedTask && (
            <span className="note-linked-task-badge" title={`Linked to: ${note.linkedTask.taskName}`}>
              🔗 {note.linkedTask.taskName}
            </span>
          )}
        </div>
      </div>
      <div className="note-content-wrapper">
        <div
          className="note-content"
          dangerouslySetInnerHTML={{ __html: formatNoteText(note.text) }}
        />
        <div className="copy-note-wrapper">
          <button
            onClick={() => {
              navigator.clipboard.writeText(note.text).then(() => {
                setCopyMessage(`copied-note-${note.id}`)
                setTimeout(() => setCopyMessage(null), 2000)
              }).catch(() => {
                setCopyMessage(`error-note-${note.id}`)
                setTimeout(() => setCopyMessage(null), 2000)
              })
            }}
            className="copy-note-btn"
            title="Copy note content"
          >
            📋 Copy
          </button>
          {copyMessage === `copied-note-${note.id}` && (
            <span className="copy-success-message">✓ Copied!</span>
          )}
        </div>
      </div>
      <div className="note-card-footer">
        <div className="note-dates">
          <span>{new Date(note.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}</span>
          {note.updatedAt !== note.createdAt && (
            <span className="updated-text">
              (Updated: {new Date(note.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })})
            </span>
          )}
        </div>
        <div className="note-card-actions">
          <button onClick={() => onStartEdit(note)} className="edit-btn" title="Edit">Edit</button>
          <button onClick={() => onDelete(note.id)} className="delete-btn" title="Delete">Delete</button>
        </div>
      </div>
    </div>
  )
}

export default StandaloneNotes

