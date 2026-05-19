export function createSessionStorage(key) {
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null')
    } catch {
      return null
    }
  }

  const write = (value) => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  const clear = () => {
    localStorage.removeItem(key)
  }

  return { read, write, clear }
}
