import { defineStore } from 'pinia'
import { generateRoute, parseRoomCode } from '@/engine/route-parser'
import type { RouteResult } from '@/engine/route-parser'

export interface HistoryItem {
  code: string
  timestamp: number
  result: RouteResult
}

export const useRouteStore = defineStore('route', () => {
  const currentResult = ref<RouteResult | null>(null)
  const searchHistory = ref<HistoryItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function search(code: string): RouteResult | null {
    isLoading.value = true
    error.value = null
    currentResult.value = null

    const parsed = parseRoomCode(code)
    if (!parsed.valid) {
      error.value = parsed.error || 'รูปแบบรหัสห้องไม่ถูกต้อง'
      isLoading.value = false
      return null
    }

    const result = generateRoute(code)
    if (!result) {
      error.value = 'ไม่พบข้อมูลห้องนี้ในระบบ'
      isLoading.value = false
      return null
    }

    currentResult.value = result

    // Add to history
    searchHistory.value.unshift({
      code: result.room.code,
      timestamp: Date.now(),
      result,
    })
    // Keep only last 20
    if (searchHistory.value.length > 20) {
      searchHistory.value = searchHistory.value.slice(0, 20)
    }
    // Save to localStorage
    try {
      localStorage.setItem('longtang-history', JSON.stringify(searchHistory.value))
    } catch {}

    isLoading.value = false
    return result
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem('longtang-history')
      if (saved) {
        searchHistory.value = JSON.parse(saved)
      }
    } catch {}
  }

  function clearHistory() {
    searchHistory.value = []
    localStorage.removeItem('longtang-history')
  }

  return {
    currentResult,
    searchHistory,
    isLoading,
    error,
    search,
    loadHistory,
    clearHistory,
  }
})
