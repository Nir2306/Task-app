import React, { useState, useEffect } from 'react'
import { generateFrenchName, generateMultipleFrenchNames } from '../utils/frenchNameGenerator'
import { hybridFavorites } from '../utils/offlineStorage'
import './NameGenerator.css'

function NameGenerator() {
  const [generatedNames, setGeneratedNames] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [count, setCount] = useState(1)
  const [favorites, setFavorites] = useState([])
  const [copyMessage, setCopyMessage] = useState(null)

  // Load favorites from database on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await hybridFavorites.getAll()
        // Handle both old format (strings) and new format (objects)
        const favoriteNames = savedFavorites.length > 0 && typeof savedFavorites[0] === 'object'
          ? savedFavorites.map(fav => fav.name || fav)
          : savedFavorites
        setFavorites(favoriteNames || [])
      } catch (error) {
        console.error('Error loading favorites from database:', error)
        setFavorites([])
      }
    }
    loadFavorites()
  }, [])

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      if (count === 1) {
        const name = await generateFrenchName()
        setGeneratedNames([name])
      } else {
        const names = await generateMultipleFrenchNames(count)
        setGeneratedNames(names)
      }
    } catch (error) {
      console.error('Error generating names:', error)
      // Error is handled silently or can be shown via UI state if needed
    } finally {
      setIsGenerating(false)
    }
  }

  const saveFavorites = async (newFavorites) => {
    try {
      setFavorites(newFavorites)
      // Convert to database format with IDs
      const favoritesWithIds = newFavorites.map((name, index) => ({
        id: `fav_${Date.now()}_${index}`,
        name: name
      }))
      // Use hybrid storage (saves to IndexedDB always, syncs to Firestore when online)
      await hybridFavorites.saveAll(favoritesWithIds)
    } catch (error) {
      console.error('Error saving favorites to database:', error)
      // Still update state even if save fails
      setFavorites(newFavorites)
    }
  }

  const handleAddToFavorites = async (name) => {
    if (!favorites.includes(name)) {
      const newFavorites = [...favorites, name]
      await saveFavorites(newFavorites)
    }
  }

  const handleRemoveFromFavorites = async (name) => {
    const newFavorites = favorites.filter(n => n !== name)
    await saveFavorites(newFavorites)
  }

  const handleClearFavorites = async () => {
    if (window.confirm('Clear all favorites?')) {
      await saveFavorites([])
    }
  }

  const handleCopyToClipboard = (text, id = null) => {
    navigator.clipboard.writeText(text).then(() => {
      if (id) {
        setCopyMessage(`copied-${id}`)
        setTimeout(() => setCopyMessage(null), 2000)
      } else {
        setCopyMessage('copied-all')
        setTimeout(() => setCopyMessage(null), 2000)
      }
    }).catch(() => {
      if (id) {
        setCopyMessage(`error-${id}`)
        setTimeout(() => setCopyMessage(null), 2000)
      }
    })
  }

  const handleCopyAll = () => {
    if (generatedNames.length > 0) {
      handleCopyToClipboard(generatedNames.join('\n'), null)
    }
  }

  return (
    <div className="name-generator-container">
      <h2>🎲 French Name Generator</h2>

      <div className="generator-controls">
        <div className="count-selector">
          <label>Number of names:</label>
          <input
            type="number"
            min="1"
            max="50"
            value={count}
            onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
            className="count-input"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="generate-btn"
        >
          {isGenerating ? 'Generating...' : 'Generate Names'}
        </button>
      </div>

      {generatedNames.length > 0 && (
        <div className="generated-names-section">
          <div className="names-header">
            <h3>Generated Names ({generatedNames.length})</h3>
            <div className="copy-all-wrapper">
            <button onClick={handleCopyAll} className="copy-all-btn">
              Copy All
            </button>
              {copyMessage === 'copied-all' && (
                <span className="copy-success-message">✓ Copied!</span>
              )}
            </div>
          </div>
          <div className="names-list">
            {generatedNames.map((name, index) => (
              <div key={index} className="name-card">
                <span className="name-text">{name}</span>
                <div className="name-actions">
                  <div className="copy-button-wrapper">
                    <button
                      onClick={() => handleCopyToClipboard(name, `name-${index}`)}
                      className="copy-btn"
                      title="Copy name"
                    >
                      Copy
                    </button>
                    {copyMessage === `copied-name-${index}` && (
                      <span className="copy-success-message">✓</span>
                    )}
                  </div>
                  {favorites.includes(name) ? (
                    <button
                      onClick={() => handleRemoveFromFavorites(name)}
                      className="favorite-btn active"
                      title="Remove from favorites"
                    >
                      ⭐
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToFavorites(name)}
                      className="favorite-btn"
                      title="Add to favorites"
                    >
                      ☆
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="favorites-section">
          <div className="favorites-header">
            <h3>Favorites ({favorites.length})</h3>
            <button onClick={handleClearFavorites} className="clear-favorites-btn">
              Clear All
            </button>
          </div>
          <div className="favorites-list">
            {favorites.map((name, index) => (
              <div key={index} className="favorite-card">
                <span className="name-text">{name}</span>
                <div className="name-actions">
                  <div className="copy-button-wrapper">
                    <button
                      onClick={() => handleCopyToClipboard(name, `fav-${index}`)}
                      className="copy-btn"
                      title="Copy name"
                    >
                      Copy
                    </button>
                    {copyMessage === `copied-fav-${index}` && (
                      <span className="copy-success-message">✓</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveFromFavorites(name)}
                    className="remove-favorite-btn"
                    title="Remove from favorites"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {generatedNames.length === 0 && favorites.length === 0 && (
        <div className="empty-state">
            <p>Click "Generate Names" to start generating random French names!</p>
        </div>
      )}
    </div>
  )
}

export default NameGenerator

