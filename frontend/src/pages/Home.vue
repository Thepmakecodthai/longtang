<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRouteStore } from '@/stores/route'
import { ALL_ROOMS } from '@/data/rooms'
import { parseRoomCode } from '@/engine/route-parser'

const router = useRouter()
const store = useRouteStore()
const searchQuery = ref('')
const showSuggestions = ref(false)
const suggestions = ref<string[]>([])
const error = ref<string | null>(null)
const selectedIndex = ref(-1)

onMounted(() => {
  store.loadHistory()
})

function updateSuggestions() {
  const q = searchQuery.value.toUpperCase()
  if (!q) {
    suggestions.value = store.searchHistory.slice(0, 5).map(h => h.code)
    return
  }
  suggestions.value = ALL_ROOMS
    .filter(r => r.code.includes(q))
    .slice(0, 6)
    .map(r => r.code)
  selectedIndex.value = -1
}

function doSearch(code?: string) {
  const query = (code || searchQuery.value).trim()
  if (!query) return

  const parsed = parseRoomCode(query)
  if (!parsed.valid) {
    error.value = parsed.error || 'รูปแบบรหัสไม่ถูกต้อง — เช่น ICT1107'
    return
  }

  error.value = null
  router.push(`/route/${query.toUpperCase()}`)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (selectedIndex.value >= 0 && selectedIndex.value < suggestions.value.length) {
      searchQuery.value = suggestions.value[selectedIndex.value]
      showSuggestions.value = false
      doSearch(searchQuery.value)
    } else {
      doSearch()
    }
  } else if (e.key === 'ArrowDown') {
    selectedIndex.value = Math.min(selectedIndex.value + 1, suggestions.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
  } else if (e.key === 'Escape') {
    showSuggestions.value = false
  }
}

function selectSuggestion(code: string) {
  searchQuery.value = code
  showSuggestions.value = false
  doSearch(code)
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl font-bold text-orange-600">หลงทาง</span>
          <span class="text-xs text-gray-400 font-light">Longtang</span>
        </div>
        <nav class="flex items-center gap-4 text-sm">
          <RouterLink to="/" class="text-orange-600 font-medium">ค้นหา</RouterLink>
          <RouterLink to="/map" class="text-gray-500 hover:text-orange-600 transition">แผนที่</RouterLink>
          <RouterLink to="/about" class="text-gray-500 hover:text-orange-600 transition">เกี่ยวกับ</RouterLink>
        </nav>
      </div>
    </header>

    <!-- Hero -->
    <main class="flex-1">
      <div class="max-w-2xl mx-auto px-4 pt-16 pb-12 text-center">
        <div class="text-5xl mb-4">🧭</div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
          หาห้องเรียนไม่เจอ?
          <span class="text-orange-600">พิมพ์รหัสห้องเลย</span>
        </h1>
        <p class="text-gray-500 mb-8 text-sm md:text-base">
          แปะรหัสห้องจากตารางเรียน — AI Agent จะบอกวิธีเดินทาง Step-by-Step ถึงหน้าห้อง
        </p>

        <!-- Search Box -->
        <div class="relative max-w-lg mx-auto">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input
                v-model="searchQuery"
                @input="updateSuggestions(); showSuggestions = true; error = null"
                @focus="showSuggestions = suggestions.length > 0 || store.searchHistory.length > 0"
                @blur="setTimeout(() => showSuggestions = false, 200)"
                @keydown="handleKeydown"
                type="text"
                placeholder="พิมพ์รหัสห้อง เช่น ICT1107"
                class="w-full px-5 py-4 pr-12 bg-white border-2 border-gray-200 rounded-2xl text-base focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''; showSuggestions = false"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>
            <button
              @click="doSearch()"
              class="px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-2xl transition-colors shadow-sm shadow-orange-200 flex items-center gap-2"
            >
              <span class="hidden sm:inline">ค้นหา</span>
              <span>🔍</span>
            </button>
          </div>

          <!-- Suggestions Dropdown -->
          <div
            v-if="showSuggestions && (suggestions.length > 0 || store.searchHistory.length > 0)"
            class="absolute top-full left-0 right-16 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-40"
          >
            <!-- Recent History -->
            <div v-if="!searchQuery && store.searchHistory.length > 0" class="py-2">
              <div class="px-4 py-1 text-xs text-gray-400 font-medium uppercase tracking-wide">ประวัติล่าสุด</div>
              <button
                v-for="item in store.searchHistory.slice(0, 5)"
                :key="item.timestamp"
                @mousedown.prevent="selectSuggestion(item.code)"
                class="w-full px-4 py-2.5 text-left hover:bg-orange-50 flex items-center gap-3 transition-colors"
              >
                <span class="text-orange-500 font-mono font-medium text-sm">{{ item.code }}</span>
                <span class="text-xs text-gray-400">
                  {{ item.result.room.buildingName }} ชั้น {{ item.result.room.floor }}
                </span>
              </button>
            </div>

            <!-- Search Suggestions -->
            <div v-if="searchQuery && suggestions.length > 0" class="py-2">
              <button
                v-for="(code, i) in suggestions"
                :key="code"
                @mousedown.prevent="selectSuggestion(code)"
                class="w-full px-4 py-2.5 text-left hover:bg-orange-50 flex items-center gap-3 transition-colors"
                :class="{ 'bg-orange-50': i === selectedIndex }"
              >
                <span class="text-orange-500 font-mono font-medium text-sm">{{ code }}</span>
                <span class="text-xs text-gray-400">
                  {{ ALL_ROOMS.find(r => r.code === code)?.buildingName }}
                  ชั้น {{ ALL_ROOMS.find(r => r.code === code)?.floor }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="mt-4 text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3 inline-block">
          ⚠️ {{ error }}
        </div>

        <!-- Quick Examples -->
        <div class="mt-8">
          <p class="text-sm text-gray-400 mb-3">ลองพิมพ์:</p>
          <div class="flex flex-wrap justify-center gap-2">
            <button
              v-for="ex in ['ICT1107', 'ICT1402', 'ICT1203']"
              :key="ex"
              @click="searchQuery = ex; doSearch(ex)"
              class="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-sm font-mono transition-colors"
            >
              {{ ex }}
            </button>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="max-w-4xl mx-auto px-4 pb-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div class="text-2xl mb-2">🚌</div>
            <h3 class="font-semibold text-sm mb-1">สายรถเมล์ + ป้ายลง</h3>
            <p class="text-xs text-gray-500">รู้เลยว่ารถเมล์ มพ. สายไหนผ่านตึก ลงป้ายไหน</p>
          </div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div class="text-2xl mb-2">🚶</div>
            <h3 class="font-semibold text-sm mb-1">Step-by-Step</h3>
            <p class="text-xs text-gray-500">บันไดซ้าย/ขวา? ลิฟต์? จุดสังเกต? บอกหมด</p>
          </div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div class="text-2xl mb-2">🗺️</div>
            <h3 class="font-semibold text-sm mb-1">แผนที่ 2D โต้ตอบ</h3>
            <p class="text-xs text-gray-500">ดูผังตึก ICT แบบ Interactive ซูม-แพนได้</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
      <p>หลงทาง (Longtang) — สำหรับนิสิต มหาวิทยาลัยพะเยา 🧭</p>
      <p class="mt-1">ร่วมทดสอบและส่งข้อมูลผังอาคารเพิ่มเติม</p>
    </footer>
  </div>
</template>
