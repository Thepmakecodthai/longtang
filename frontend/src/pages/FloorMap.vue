<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ALL_ROOMS } from '@/data/rooms'
import { FLOOR_POLYGONS, polygonCentroid } from '@/data/floor-polygons'

const route = useRoute()
const router = useRouter()

// ============ STATE ============
const currentFloor = ref(1)
const searchStart = ref('')
const searchEnd = ref('')
const startRoom = ref('')
const endRoom = ref('')
const showRoute = ref(false)
const showSuggestions = ref(false)
const suggestionMode = ref<'start' | 'end'>('start')
const selectedIdx = ref(-1)
const hoveredRoom = ref('')
const highlightRoom = ref('')

interface Step { type: 'walk'|'lift'|'arrive'; text: string; floor?: number; fromFloor?: number; toFloor?: number }
const routeSteps = ref<Step[]>([])
const floorsUsed = ref<number[]>([])
const detailedDirs = ref<string[]>([])

// ============ LAYOUT DATA (from polygons) ============
function getCentroid(floor: number, code: string): { x: number; y: number } | null {
  const fp = FLOOR_POLYGONS[floor]
  if (!fp) return null
  const room = fp.rooms.find(r => r.code === code)
  if (!room) return null
  return polygonCentroid(room.points)
}

function dist(a: {x:number;y:number}, b: {x:number;y:number}) { return Math.hypot(a.x - b.x, a.y - b.y) }

function nearestElev(floor: number, code: string): 'left' | 'right' {
  const c = getCentroid(floor, code)
  if (!c) return 'left'
  // elevators approx at left ~180, right ~1020 in 1200-wide viewBox
  return c.x < 600 ? 'left' : 'right'
}

function calcRoute(s: string, e: string) {
  const sf = +s[3], ef = +e[3]
  const steps: Step[] = []
  const floors: Set<number> = new Set()
  const dir = sf < ef ? 'ขึ้น' : 'ลง'
  const sideS = nearestElev(sf, s), sideE = nearestElev(ef, e)
  const sLabel = sideS === 'left' ? 'ลิฟต์ซ้าย' : 'ลิฟต์ขวา'
  const eLabel = sideE === 'left' ? 'ลิฟต์ซ้าย' : 'ลิฟต์ขวา'

  if (sf === ef) {
    steps.push({ type: 'walk', text: `เดินจาก ${s} ไป ${e} ภายในชั้น ${sf} ตามทางเดินกลาง`, floor: sf })
    floors.add(sf)
  } else {
    steps.push({ type: 'walk', text: `เดินจาก ${s} ไป${sLabel} (ชั้น ${sf})`, floor: sf })
    floors.add(sf)
    steps.push({ type: 'lift', text: `🛗 ขึ้นลิฟต์${dir}ไปชั้น ${ef} (${Math.abs(ef - sf)} ชั้น)`, fromFloor: sf, toFloor: ef })
    for (let m = Math.min(sf, ef) + 1; m < Math.max(sf, ef); m++) floors.add(m)
    steps.push({ type: 'walk', text: `เมื่อถึงชั้น ${ef} เดินจาก${eLabel}ไป ${e}`, floor: ef })
    floors.add(ef)
  }
  steps.push({ type: 'arrive', text: `📍 ถึง ${e} ชั้น ${ef} แล้ว` })
  return { steps, floors: [...floors].sort() }
}

function describeDetailed(s: string, e: string) {
  const sf = +s[3], ef = +e[3]
  const wS = ALL_ROOMS.find(r => r.code === s)?.wing || 'left'
  const wE = ALL_ROOMS.find(r => r.code === e)?.wing || 'left'
  const sSide = wS === 'left' ? 'ปีกซ้าย' : 'ปีกขวา'
  const eSide = wE === 'left' ? 'ปีกซ้าย' : 'ปีกขวา'
  const d: string[] = []
  if (sf === ef) {
    const ww = wS === wE ? 'ตรงไปตามทางเดิน' : `เดินข้ามไป${eSide}`
    d.push(`🚶 ออกจาก <b>${s}</b> (${sSide})`)
    d.push(`➡️ ${ww}`)
    d.push(`📍 ถึง <b>${e}</b> (${eSide})${wE === 'left' ? ' อยู่ซ้ายมือ' : ' อยู่ขวามือ'}`)
  } else {
    const dir = sf < ef ? 'ขึ้น' : 'ลง'
    const sL = nearestElev(sf, s), eL = nearestElev(ef, e)
    const ns = sL === 'left' ? 'ซ้าย' : 'ขวา'
    const ne = eL === 'left' ? 'ซ้าย' : 'ขวา'
    d.push(`🚶 ออกจาก <b>${s}</b> (${sSide}, ชั้น ${sf})`)
    d.push(`➡️ เดินไปลิฟต์ฝั่ง${ns}`)
    d.push(`🛗 ขึ้นลิฟต์${dir}ไป <b>ชั้น ${ef}</b> (${Math.abs(ef - sf)} ชั้น)`)
    d.push(`🚶 เมื่อถึงชั้น ${ef} ออกจากลิฟต์ฝั่ง${ne}`)
    d.push(`➡️ ${ne === ns ? 'ตรงไปตามทางเดิน' : 'เดินข้ามไปฝั่ง' + ne}`)
    d.push(`📍 เลี้ยวเข้า${eSide} — จะพบ <b>${e}</b>${wE === 'left' ? ' อยู่ซ้ายมือ' : ' อยู่ขวามือ'}`)
  }
  return d
}

function doRoute() {
  const s = startRoom.value || searchStart.value
  const e = endRoom.value || searchEnd.value
  if (!s || !e) return
  if (s === e) { alert('⛔ จุดเริ่มต้นและจุดหมายต้องเป็นคนละห้องกัน'); return }
  const r = calcRoute(s, e)
  routeSteps.value = r.steps
  floorsUsed.value = r.floors
  showRoute.value = true
  detailedDirs.value = describeDetailed(s, e)
  currentFloor.value = r.floors[0]
}

function clearRoute() {
  showRoute.value = false; routeSteps.value = []; floorsUsed.value = []; detailedDirs.value = []
  startRoom.value = ''; endRoom.value = ''
}

function switchFloor(f: number) { currentFloor.value = f }

function selectRoom(code: string) {
  highlightRoom.value = code
  if (suggestionMode.value === 'start') { searchStart.value = code; startRoom.value = code }
  else { searchEnd.value = code; endRoom.value = code }
  showSuggestions.value = false
  if (startRoom.value && endRoom.value) doRoute()
}

// ============ SUGGESTIONS ============
const suggestions = computed(() => {
  const q = (suggestionMode.value === 'start' ? searchStart.value : searchEnd.value).toUpperCase()
  if (!q) return []
  return ALL_ROOMS.filter(r => r.code.includes(q)).slice(0, 8).map(r => r.code)
})

function onFocus(mode: 'start' | 'end') { suggestionMode.value = mode; showSuggestions.value = true; selectedIdx.value = -1 }
function onBlur() { setTimeout(() => showSuggestions.value = false, 200) }

function handleKeydown(e: KeyboardEvent) {
  const s = suggestions.value
  if (e.key === 'Enter') {
    if (selectedIdx.value >= 0 && selectedIdx.value < s.length) selectRoom(s[selectedIdx.value])
    else if (s.length > 0) selectRoom(s[0])
  } else if (e.key === 'ArrowDown') { selectedIdx.value = Math.min(selectedIdx.value + 1, s.length - 1); e.preventDefault() }
  else if (e.key === 'ArrowUp') { selectedIdx.value = Math.max(selectedIdx.value - 1, -1); e.preventDefault() }
  else if (e.key === 'Escape') { showSuggestions.value = false }
}

function pickRoom(code: string) { searchStart.value = code; startRoom.value = code; suggestionMode.value = 'end'; document.getElementById('endInput')?.focus() }

// ============ POLYGON CENTROIDS FOR ROUTE RENDERING ============
// Simplified routing: rooms on same side walk along corridor
// Different sides: cross corridor
function getRoutePath(floor: number, fromCode: string, toCode: string): { x: number; y: number }[] {
  const fp = FLOOR_POLYGONS[floor]
  if (!fp) return []
  const c1 = getCentroid(floor, fromCode)
  const c2 = getCentroid(floor, toCode)
  if (!c1 || !c2) return []
  const r1 = ALL_ROOMS.find(r => r.code === fromCode)
  const r2 = ALL_ROOMS.find(r => r.code === toCode)
  const sameSide = r1?.wing === r2?.wing

  // corridor mid-points (approximate in 1200x840 space)
  const leftCorridor = { x: 300, y: 490 }
  const rightCorridor = { x: 850, y: 490 }
  const midCorridor = { x: 600, y: 470 }

  if (sameSide) {
    // Walk along corridor on same side
    const midY = r1?.wing === 'left' ? 490 : 490
    return [c1, { x: (c1.x + c2.x) / 2, y: midY }, c2]
  } else {
    // Cross the corridor
    const via = r1?.wing === 'left' ? { x: 570, y: c1.y } : { x: 630, y: c1.y }
    const via2 = r2?.wing === 'left' ? { x: 570, y: c2.y } : { x: 630, y: c2.y }
    return [c1, via, midCorridor, via2, c2]
  }
}

// Also update standalone path rendering
const overlayKey = ref(0)
watch([currentFloor, showRoute, routeSteps], async () => { await nextTick(); overlayKey.value++ })
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <button @click="router.push('/')" class="text-gray-500 hover:text-orange-600 transition p-1 text-sm">← กลับ</button>
        <h1 class="font-semibold text-sm flex-1">🗺️ แผนที่อาคาร ICT</h1>
        <div v-if="showRoute" class="hidden sm:flex items-center gap-1.5 mr-2 text-xs">
          <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-mono font-bold">🟢 {{ startRoom }}</span>
          <span class="text-gray-300">→</span>
          <span class="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-mono font-bold">🔴 {{ endRoom }}</span>
        </div>
        <div class="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button v-for="f in 4" :key="f" @click="switchFloor(f)"
            class="px-3 py-1.5 text-xs rounded-lg font-medium transition"
            :class="currentFloor === f ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">ชั้น {{ f }}</button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-7xl mx-auto w-full px-4 py-4 flex flex-col lg:flex-row gap-4">
      <!-- LEFT: Map -->
      <div class="flex-1 min-w-0 flex flex-col">
        <!-- Search bar -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-3">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div class="relative flex-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs">🟢</span>
              <input id="startInput" v-model="searchStart" @focus="onFocus('start')" @blur="onBlur" @keydown="handleKeydown"
                placeholder="ค้นหาจุดเริ่มต้น เช่น ICT1107"
                class="w-full pl-8 pr-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition" />
            </div>
            <span class="text-center text-gray-300 hidden sm:block">→</span>
            <div class="relative flex-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs">🔴</span>
              <input id="endInput" v-model="searchEnd" @focus="onFocus('end')" @blur="onBlur" @keydown="handleKeydown"
                placeholder="ค้นหาจุดหมาย เช่น ICT1439"
                class="w-full pl-8 pr-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition" />
            </div>
            <button @click="doRoute" :disabled="!searchStart || !searchEnd"
              class="px-5 py-2.5 bg-gradient-to-r from-green-600 to-orange-600 text-white rounded-xl font-medium text-sm hover:from-green-700 hover:to-orange-700 transition shadow-sm whitespace-nowrap">🔎 นำทาง</button>
          </div>
          <!-- Suggestions -->
          <div v-if="showSuggestions && suggestions.length > 0" class="relative mt-1">
            <div class="absolute top-0 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-30">
              <button v-for="(code, i) in suggestions" :key="code" @mousedown.prevent="selectRoom(code)"
                class="w-full px-4 py-2.5 text-left hover:bg-orange-50 flex items-center gap-3 transition-colors"
                :class="{ 'bg-orange-100': i === selectedIdx }">
                <span class="font-mono font-medium text-sm text-orange-600">{{ code }}</span>
                <span class="text-xs text-gray-400">ชั้น {{ ALL_ROOMS.find(r => r.code === code)?.floor }} · {{ ALL_ROOMS.find(r => r.code === code)?.wing === 'left' ? 'ปีกซ้าย' : 'ปีกขวา' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Floor Plan with Interactive SVG Overlay -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1">
          <div class="relative bg-gray-100" style="min-height:450px">
            <!-- Floor plan image -->
            <img :src="`/ict/${currentFloor}_${currentFloor === 1 ? 4 : 3}.png`"
              :alt="`ชั้น ${currentFloor}`" class="w-full h-auto block" @load="overlayKey++" />

            <!-- SVG: interactive rooms + route -->
            <svg :key="overlayKey"
              viewBox="0 0 1200 840"
              style="position:absolute;top:0;left:0;width:100%;height:100%"
              class="select-none">
              <defs>
                <filter id="rg"><feGaussianBlur stdDeviation="2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>

              <!-- Room polygons (interactive) -->
              <template v-for="room in FLOOR_POLYGONS[currentFloor]?.rooms" :key="room.code">
                <polygon :points="room.points"
                  :class="`cursor-pointer transition-all duration-150`"
                  :fill="room.code === highlightRoom ? 'rgba(21,101,192,0.3)' :
                    room.code === hoveredRoom ? 'rgba(46,125,50,0.2)' :
                    'transparent'"
                  :stroke="room.code === highlightRoom ? '#1565c0' :
                    room.code === hoveredRoom ? '#2e7d32' :
                    'transparent'"
                  :stroke-width="room.code === highlightRoom ? '2' : '1'"
                  @mouseenter="hoveredRoom = room.code"
                  @mouseleave="hoveredRoom = ''"
                  @click="selectRoom(room.code)">
                  <title>{{ room.code }}</title>
                </polygon>
              </template>

              <!-- Room labels -->
              <template v-for="room in FLOOR_POLYGONS[currentFloor]?.rooms" :key="'l'+room.code">
                <text :x="polygonCentroid(room.points).x" :y="polygonCentroid(room.points).y"
                  text-anchor="middle" dominant-baseline="middle"
                  :font-size="room.code.includes('/') ? '9' : '11'"
                  :font-weight="room.code === highlightRoom ? 'bold' : '500'"
                  :fill="room.code === highlightRoom ? '#1565c0' : '#444'"
                  :class="room.code === highlightRoom ? 'font-bold' : ''"
                  style="pointer-events:none;text-shadow:0 0 3px white,0 0 6px white">
                  {{ room.code.replace('ICT', '') }}
                </text>
              </template>

              <!-- Elevator markers -->
              <g v-for="(pos, label) in { left: { cx: 180, cy: 250 }, right: { cx: 1020, cy: 250 } }" :key="label">
                <rect :x="pos.cx - 18" :y="pos.cy - 18" width="36" height="36" rx="6"
                  fill="#1565c0" opacity="0.85" stroke="white" stroke-width="2"/>
                <text :x="pos.cx" :y="pos.cy + 1" text-anchor="middle" font-size="20" fill="white">🛗</text>
                <text :x="pos.cx" :y="pos.cy + 22" text-anchor="middle" font-size="9" fill="#1565c0" font-weight="bold">
                  {{ label === 'left' ? 'ลิฟต์ซ้าย' : 'ลิฟต์ขวา' }}
                </text>
              </g>

              <!-- Route path overlay -->
              <g v-if="showRoute">
                <template v-for="(step, si) in routeSteps" :key="'r'+si">
                  <g v-if="step.type === 'walk' && step.floor === currentFloor">
                    <template v-if="step.floor === currentFloor">
                      <!-- Compute path points from route -->
                    </template>
                  </g>
                </template>

                <!-- Start dot -->
                <circle v-if="getCentroid(currentFloor, startRoom)"
                  :cx="getCentroid(currentFloor, startRoom)!.x"
                  :cy="getCentroid(currentFloor, startRoom)!.y"
                  r="8" fill="#2e7d32" stroke="white" stroke-width="3" opacity="0.95"/>
                <!-- End dot -->
                <circle v-if="getCentroid(currentFloor, endRoom)"
                  :cx="getCentroid(currentFloor, endRoom)!.x"
                  :cy="getCentroid(currentFloor, endRoom)!.y"
                  r="8" fill="#d32f2f" stroke="white" stroke-width="3" opacity="0.95"/>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <!-- RIGHT: Directions Panel -->
      <div class="w-full lg:w-96 flex-shrink-0 flex flex-col gap-3">
        <div v-if="showRoute" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 bg-gradient-to-r from-green-700 via-orange-600 to-red-700 text-white">
            <div class="font-bold text-sm flex items-center gap-2">
              🧭 เส้นทาง <span class="font-mono text-xs bg-white/20 px-2 py-0.5 rounded">🟢 {{ startRoom }}</span> → <span class="font-mono text-xs bg-white/20 px-2 py-0.5 rounded">🔴 {{ endRoom }}</span>
            </div>
          </div>
          <div class="p-3 bg-green-50 border-b border-gray-100">
            <div class="text-xs font-semibold text-green-700 mb-2">📋 รายละเอียด</div>
            <div v-for="(d, i) in detailedDirs" :key="i" class="flex items-start gap-2 py-1" :class="{'opacity-70': i === detailedDirs.length - 1}">
              <span class="text-xs mt-0.5 shrink-0">{{ d.includes('🛗') ? '🛗' : d.includes('📍') ? '📍' : d.includes('🚶') ? '🚶' : '➡️' }}</span>
              <span class="text-xs leading-relaxed" v-html="d"></span>
            </div>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-for="(step, i) in routeSteps" :key="i"
              class="flex items-start gap-3 p-3.5 cursor-pointer hover:bg-gray-50 transition"
              @click="step.floor ? switchFloor(step.floor) : null">
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-bold text-white"
                :class="step.type==='walk'?'bg-green-600':step.type==='lift'?'bg-blue-600':'bg-orange-500'">{{ i+1 }}</div>
              <div class="text-sm leading-relaxed">{{ step.text }}</div>
            </div>
          </div>
          <div class="p-3 text-center border-t border-gray-50">
            <button @click="clearRoute" class="text-xs text-gray-400 hover:text-gray-600 transition">✕ ล้างเส้นทาง</button>
          </div>
        </div>

        <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center text-gray-400">
          <div class="text-4xl mb-3">🔍</div>
          <p class="text-sm">พิมพ์ชื่อห้องที่ต้องการ<br/>หรือคลิกที่ห้องบนแผนที่</p>
          <div class="mt-4 flex flex-wrap justify-center gap-1.5">
            <button v-for="ex in ['ICT1107','ICT1402','ICT1439','ICT1207']" :key="ex"
              @click="pickRoom(ex)"
              class="px-2.5 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-mono hover:bg-orange-100 transition">
              {{ ex }}
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div class="text-xs font-semibold text-gray-500 mb-2">🏠 ห้องชั้น {{ currentFloor }}</div>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="r in ALL_ROOMS.filter(r => r.floor === currentFloor)" :key="r.code" @click="pickRoom(r.code)"
              class="px-2.5 py-1.5 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition">
              {{ r.code }}
            </span>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 text-center text-xs text-gray-400">
          💡 คลิกห้องบนแผนที่เพื่อเลือก · วางเมาส์เพื่อดูชื่อ
        </div>
      </div>
    </main>
  </div>
</template>
