/**
 * Generates a random French name using the RandomUser API
 * @returns {Promise<string>} A promise that resolves to a random French full name
 */
export const generateFrenchName = async () => {
  try {
    const response = await fetch('https://randomuser.me/api/?nat=fr')
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const user = data.results[0]
      const firstName = user.name.first
      const lastName = user.name.last
      return `${firstName} ${lastName}`
    }
    
    throw new Error('No results from API')
  } catch (error) {
    console.error('Error fetching French name from API:', error)
    // Fallback to a simple French name if API fails
    throw new Error('Failed to generate name. Please try again or enter manually.')
  }
}

/**
 * Generates multiple random French names
 * @param {number} count - Number of names to generate
 * @returns {Promise<string[]>} A promise that resolves to an array of French names
 */
export const generateMultipleFrenchNames = async (count = 5) => {
  try {
    const response = await fetch(`https://randomuser.me/api/?nat=fr&results=${count}`)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      return data.results.map(user => `${user.name.first} ${user.name.last}`)
    }
    
    throw new Error('No results from API')
  } catch (error) {
    console.error('Error fetching multiple French names from API:', error)
    throw error
  }
}

