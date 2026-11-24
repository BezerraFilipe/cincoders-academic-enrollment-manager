import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

const SEARCH_DEBOUNCE_MS = 400

export function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('busca') ?? ''
  const page = Math.max(1, Number(searchParams.get('pagina')) || 1)
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    if (searchInput.trim() === search) return

    const timeout = setTimeout(() => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        const value = searchInput.trim()
        if (value) next.set('busca', value)
        else next.delete('busca')
        next.delete('pagina')
        return next
      })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [searchInput, search, setSearchParams])

  const setPage = (nextPage: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (nextPage > 1) next.set('pagina', String(nextPage))
      else next.delete('pagina')
      return next
    })
  }

  return { search, page, searchInput, setSearchInput, setPage }
}
