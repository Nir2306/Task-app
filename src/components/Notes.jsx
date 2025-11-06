import React, { useState, useMemo } from 'react'
import './Notes.css'

const NOTE_CATEGORIES = [
  { id: 'reminder', label: '⏰ Reminder', color: '#f97316' },
  { id: 'code', label: '💻 Code', color: '#3b82f6' },
  { id: 'todo', label: '✅ To-Do', color: '#10b981' },
  { id: 'links', label: '🔗 Links', color: '#8b5cf6' },
  { id: 'important', label: '⭐ Important', color: '#f59e0b' }
]

function Notes({ taskId, notes = [], onAddNote, onEditNote, onDeleteNote }) {
  const [newNote, setNewNote] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('reminder')
  const [customCategory, setCustomCategory] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editNoteText, setEditNoteText] = useState('')
  const [showAddNote, setShowAddNote] = useState(false)

  const filteredNotes = useMemo(() => {
    let filtered = [...notes]
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(note => 
        note.text.toLowerCase().includes(query) ||
        note.category?.toLowerCase().includes(query) ||
        note.tag?.toLowerCase().includes(query)
      )
    }
    
    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(note => note.tag === selectedTag)
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [notes, searchQuery, selectedTag])

  const allTags = useMemo(() => {
    const tags = new Set()
    notes.forEach(note => {
      if (note.tag) tags.add(note.tag)
    })
    return Array.from(tags).sort()
  }, [notes])

  const handleAddNote = () => {
    if (newNote.trim()) {
      const finalCategory = selectedCategory === 'custom' && customCategory.trim() 
        ? customCategory.trim() 
        : selectedCategory
      
      const note = {
        id: Date.now(),
        text: newNote.trim(),
        category: finalCategory,
        tag: selectedTag || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      onAddNote(taskId, note)
      setNewNote('')
      setSelectedCategory('reminder')
      setCustomCategory('')
      setSelectedTag('')
      setShowAddNote(false)
    }
  }

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id)
    setEditNoteText(note.text)
    const categoryExists = NOTE_CATEGORIES.find(cat => cat.id === note.category)
    if (categoryExists) {
      setSelectedCategory(note.category)
      setCustomCategory('')
    } else {
      setSelectedCategory('custom')
      setCustomCategory(note.category || '')
    }
  }

  const handleSaveEdit = () => {
    if (editNoteText.trim()) {
      const finalCategory = selectedCategory === 'custom' && customCategory.trim() 
        ? customCategory.trim() 
        : selectedCategory
      
      onEditNote(taskId, editingNoteId, {
        text: editNoteText.trim(),
        category: finalCategory,
        updatedAt: new Date().toISOString()
      })
      setEditingNoteId(null)
      setEditNoteText('')
      setSelectedCategory('reminder')
      setCustomCategory('')
    }
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditNoteText('')
    setSelectedCategory('reminder')
    setCustomCategory('')
  }

  const formatNoteText = (text) => {
    // Basic markdown-like formatting
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
    return { id: categoryId, label: categoryId, color: '#6c757d' }
  }

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h3>Notes ({notes.length})</h3>
        <div className="notes-header-actions">
          {!showAddNote && (
            <button 
              onClick={() => setShowAddNote(true)} 
              className="add-note-btn"
            >
              Add Note
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      {(notes.length > 0 || searchQuery) && (
        <div className="notes-filters">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="notes-search"
          />
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="notes-tag-filter"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Add Note Form */}
      {showAddNote && (
        <div className="add-note-form">
          <div className="note-form-header">
            <h4>Add New Note</h4>
            <button onClick={() => setShowAddNote(false)} className="close-btn">✕</button>
          </div>
          
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
                Custom
              </button>
            </div>
            {selectedCategory === 'custom' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category name..."
                className="custom-category-input"
              />
            )}
          </div>

          <div className="note-tag-input">
            <label>Tag (optional):</label>
            <input
              type="text"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              placeholder="e.g., project-name, urgent, follow-up"
              className="form-input"
            />
          </div>

          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write your note here... Use **bold**, *italic*, or `code` formatting"
            className="note-textarea"
            rows="6"
          />
          <div className="note-meta">
            <span className="word-count">{getWordCount(newNote)} words</span>
            <span className="formatting-hint">
              💡 Tip: Use **bold**, *italic*, `code`, or new lines for formatting
            </span>
          </div>
          
          <div className="note-form-actions">
            <button onClick={handleAddNote} className="save-note-btn" disabled={!newNote.trim()}>
              Save Note
            </button>
            <button onClick={() => {
              setShowAddNote(false)
              setNewNote('')
              setSelectedCategory('reminder')
              setCustomCategory('')
              setSelectedTag('')
            }} className="cancel-note-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="empty-notes">
          {notes.length === 0 ? (
            <p>No notes yet. Click "Add Note" to get started!</p>
          ) : (
            <p>No notes match your search criteria.</p>
          )}
        </div>
      ) : (
        <div className="notes-list">
          {filteredNotes.map(note => {
            const categoryInfo = getCategoryInfo(note.category)
            
            return (
              <div key={note.id} className="note-card">
                {editingNoteId === note.id ? (
                  <div className="note-edit-form">
                    <div className="note-category-selector">
                      <label>Category:</label>
                      <div className="category-buttons">
                        {NOTE_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            style={{ '--category-color': cat.color }}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      className="note-textarea"
                      rows="4"
                    />
                    <div className="note-edit-actions">
                      <button onClick={handleSaveEdit} className="save-note-btn">
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-note-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="note-header">
                      <div className="note-category-badge" style={{ backgroundColor: categoryInfo.color }}>
                        {categoryInfo.label}
                      </div>
                      {note.tag && (
                        <span className="note-tag-badge">🏷️ {note.tag}</span>
                      )}
                      <div className="note-actions">
                        <button onClick={() => handleStartEdit(note)} className="edit-note-btn" title="Edit">
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this note?')) {
                              onDeleteNote(taskId, note.id)
                            }
                          }} 
                          className="delete-note-btn"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div 
                      className="note-content"
                      dangerouslySetInnerHTML={{ __html: formatNoteText(note.text) }}
                    />
                    <div className="note-footer">
                      <span className="note-date">
                        {new Date(note.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {note.updatedAt !== note.createdAt && (
                        <span className="note-updated">
                          (Updated: {new Date(note.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })})
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Notes

