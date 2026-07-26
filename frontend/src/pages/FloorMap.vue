<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ALL_ROOMS } from '@/data/rooms'

const route = useRoute()
const router = useRouter()

// ============ STATE ============
const currentFloor = ref(parseInt((route.query.floor as string) || '1'))
const highlightRoom = ref((route.query.room as string) || '')
const startRoom = ref('')
const endRoom = ref('')
const showRoute = ref(false)

interface RouteStep {
  type: 'walk' | 'lift' | 'arrive'
  text: string
  floor?: number
  path?: { x: number; y: number }[]
  fromFloor?: number
  toFloor?: number
}

const routeSteps = ref<RouteStep[]>([])
const floorsUsed = ref<number[]>([])

// ============ ROOM DATA WITH COORDINATES (% on 2048x1448) ============
interface RoomPos { x: number; y: number }
interface FloorLayout {
  rooms: Record<string, RoomPos>
  elevators: { id: string; x: number; y: number; label: string }[]
  corridor: RoomPos[]
}

const FLOOR_LAYOUTS: Record<number, FloorLayout> = {
  1: {
    rooms: {
      "ICT1112": { x: 5.5, y: 28 }, "ICT1111": { x: 5.5, y: 40 },
      "ICT1110": { x: 5.5, y: 52 }, "ICT1109": { x: 5.5, y: 64 },
      "ICT1108": { x: 5.5, y: 76 }, "ICT1107": { x: 9, y: 47 },
      "ICT1106": { x: 88, y: 20 }, "ICT1105": { x: 88, y: 32 },
      "ICT1104": { x: 88, y: 44 }, "ICT1104/1": { x: 83, y: 44 },
      "ICT1103": { x: 88, y: 56 }, "ICT1103/1": { x: 83, y: 56 },
      "ICT1102": { x: 88, y: 68 }, "ICT1102/1": { x: 83, y: 68 }
    },
    elevators: [
      { id: "e1", x: 27, y: 22, label: "ลิฟต์ซ้าย" },
      { id: "e2", x: 67, y: 22, label: "ลิฟต์ขวา" }
    ],
    corridor: [{ x: 10, y: 46 }, { x: 27, y: 24 }, { x: 50, y: 24 }, { x: 67, y: 24 }, { x: 83, y: 24 }]
  },
  2: {
    rooms: {
      "ICT1247": { x: 10, y: 18 }, "ICT1241": { x: 8, y: 40 },
      "ICT1241/1": { x: 5, y: 40 }, "ICT1235": { x: 8, y: 52 },
      "ICT1235/1": { x: 5, y: 52 }, "ICT1229": { x: 8, y: 64 },
      "ICT1224": { x: 8, y: 76 }, "ICT1219": { x: 90, y: 72 },
      "ICT1213": { x: 90, y: 58 }, "ICT1207": { x: 90, y: 44 },
      "ICT1202": { x: 90, y: 30 }
    },
    elevators: [
      { id: "e1", x: 18, y: 30, label: "ลิฟต์ซ้าย" },
      { id: "e2", x: 78, y: 30, label: "ลิฟต์ขวา" }
    ],
    corridor: [{ x: 12, y: 55 }, { x: 18, y: 32 }, { x: 50, y: 26 }, { x: 78, y: 32 }, { x: 86, y: 55 }]
  },
  3: {
    rooms: {
      "ICT1352": { x: 12, y: 18 }, "ICT1355": { x: 32, y: 10 },
      "ICT1356": { x: 50, y: 10 }, "ICT1357": { x: 68, y: 10 },
      "ICT1359": { x: 50, y: 24 }, "ICT1340": { x: 10, y: 52 },
      "ICT1334": { x: 10, y: 64 }, "ICT1328": { x: 22, y: 75 },
      "ICT1323": { x: 38, y: 75 }, "ICT1318": { x: 55, y: 75 },
      "ICT1312": { x: 72, y: 75 }, "ICT1307": { x: 85, y: 65 },
      "ICT1302": { x: 85, y: 52 }
    },
    elevators: [
      { id: "e1", x: 35, y: 28, label: "ลิฟต์ซ้าย" },
      { id: "e2", x: 78, y: 28, label: "ลิฟต์ขวา" }
    ],
    corridor: [{ x: 14, y: 40 }, { x: 22, y: 30 }, { x: 35, y: 30 }, { x: 50, y: 28 }, { x: 78, y: 30 }, { x: 82, y: 55 }]
  },
  4: {
    rooms: {
      "ICT1439": { x: 8, y: 22 }, "ICT1434": { x: 8, y: 36 },
      "ICT1429": { x: 8, y: 50 }, "ICT1424": { x: 8, y: 64 },
      "ICT1419": { x: 88, y: 22 }, "ICT1419/1": { x: 83, y: 22 },
      "ICT1413": { x: 88, y: 36 }, "ICT1413/1": { x: 83, y: 36 },
      "ICT1407": { x: 88, y: 50 }, "ICT1402": { x: 88, y: 64 }
    },
    elevators: [
      { id: "e1", x: 22, y: 20, label: "ลิฟต์ซ้าย" },
      { id: "e2", x: 75, y: 20, label: "ลิฟต์ขวา" }
    ],
    corridor: [{ x: 12, y: 42 }, { x: 22, y: 22 }, { x: 50, y: 18 }, { x: 75, y: 22 }, { x: 82, y: 42 }]
  }
}

// ============ HELPERS ============
function dist(a: RoomPos, b: RoomPos) { return Math.hypot(a.x - b.x, a.y - b.y) }

function nearestElev(floorLayout: FloorLayout, roomKey: string) {
  const pos = floorLayout.rooms[roomKey]
  if (!pos) return floorLayout.elevators[0]
  const d0 = dist(pos, floorLayout.elevators[0])
  const d1 = dist(pos, floorLayout.elevators[1])
  return d0 <= d1 ? floorLayout.elevators[0] : floorLayout.elevators[1]
}

function buildWalkPath(floorLayout: FloorLayout, fromKey: string, toKey: string): RoomPos[] {
  const from = floorLayout.rooms[fromKey]
  const to = floorLayout.rooms[toKey]
  if (!from || !to) return []
  const corr = floorLayout.corridor
  if (!corr.length) return [from, to]
  let ci = 0, cid = Infinity
  for (let i = 0; i < corr.length; i++) { const d = dist(from, corr[i]); if (d < cid) { cid = d; ci = i } }
  let cj = 0, cjd = Infinity
  for (let i = 0; i < corr.length; i++) { const d = dist(to, corr[i]); if (d < cjd) { cjd = d; cj = i } }
  const path: RoomPos[] = [from]
  const step = ci <= cj ? 1 : -1
  for (let i = ci; (step > 0 ? i <= cj : i >= cj); i += step) path.push(corr[i])
  if (path.length < 2 || dist(path[path.length-1], to) > 2) path.push(to)
  return path
}

function calculateRoute(s: string, e: string) {
  const sf = parseInt(s.charAt(3)), ef = parseInt(e.charAt(3))
  const steps: RouteStep[] = []
  const floors: Set<number> = new Set()

  if (sf === ef) {
    const fd = FLOOR_LAYOUTS[sf]
    const path = buildWalkPath(fd, s, e)
    steps.push({ type: 'walk', text: `เดินจาก ${s} ไป ${e} ภายในชั้น ${sf} ตามทางเดินกลาง`, floor: sf, path })
    floors.add(sf)
  } else {
    const dir = sf < ef ? 'ขึ้น' : 'ลง'
    const sFd = FLOOR_LAYOUTS[sf], eFd = FLOOR_LAYOUTS[ef]
    const e1 = nearestElev(sFd, s), e2 = nearestElev(eFd, e)
    const diff = Math.abs(ef - sf)
    steps.push({ type: 'walk', text: `เดินจาก ${s} ไปยัง ${e1.label} (ชั้น ${sf})`, floor: sf, path: [sFd.rooms[s], e1] })
    floors.add(sf)
    steps.push({ type: 'lift', text: `🛗 ขึ้นลิฟต์${dir}ไปชั้น ${ef} (${diff} ชั้น)`, fromFloor: sf, toFloor: ef })
    for (let m = Math.min(sf, ef)+1; m < Math.max(sf, ef); m++) floors.add(m)
    steps.push({ type: 'walk', text: `เมื่อถึงชั้น ${ef} เดินจากลิฟต์ไปยัง ${e}`, floor: ef, path: [e2, eFd.rooms[e]] })
    floors.add(ef)
  }
  steps.push({ type: 'arrive', text: `📍 ถึง ${e} ชั้น ${ef} แล้ว` })
  return { steps, floors: [...floors].sort() }
}

// ============ COMPUTED ============
const roomsOnFloor = computed(() => ALL_ROOMS.filter(r => r.floor === currentFloor.value))

const roomOptions = computed(() => {
  return ALL_ROOMS.map(r => ({ value: r.code, label: `${r.code} (ชั้น ${r.floor})` })).sort((a, b) => a.value.localeCompare(b.value))
})

// ============ METHODS ============
function switchFloor(f: number) {
  currentFloor.value = f
  router.replace({ query: { ...route.query, floor: String(f) } })
}

function selectRoom(code: string) {
  highlightRoom.value = code
  router.replace({ query: { ...route.query, room: code } })
}

function goRoute() {
  if (!startRoom.value || !endRoom.value) {
    alert('⛔ กรุณาเลือกทั้งจุดเริ่มต้นและจุดหมาย')
    return
  }
  if (startRoom.value === endRoom.value) {
    alert('⛔ จุดเริ่มต้นและจุดหมายต้องเป็นคนละห้องกัน')
    return
  }
  const result = calculateRoute(startRoom.value, endRoom.value)
  routeSteps.value = result.steps
  floorsUsed.value = result.floors
  showRoute.value = true
  // Switch to first floor in route
  currentFloor.value = result.floors[0]
}

function clearRoute() {
  showRoute.value = false
  routeSteps.value = []
  floorsUsed.value = []
  startRoom.value = ''
  endRoom.value = ''
}

function goToFloor(f: number) {
  currentFloor.value = f
}

// Watch query params
watch(() => route.query.floor, (f) => { if (f) currentFloor.value = parseInt(f as string) })
watch(() => route.query.room, (r) => { if (r) highlightRoom.value = r as string })

// SVG overlay rendering (called after DOM update)
const svgViewBox = ref('0 0 1000 707')
const overlayKey = ref(0)

watch([currentFloor, showRoute, routeSteps], async () => {
  await nextTick()
  overlayKey.value++
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Top Bar -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <button @click="router.push('/')" class="text-gray-500 hover:text-orange-600 transition p-1 text-sm">
          ← กลับ
        </button>
        <h1 class="font-semibold text-sm flex-1">🗺️ แผนที่อาคาร ICT</h1>
        <div v-if="showRoute" class="hidden sm:flex items-center gap-2 mr-2">
          <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">🟢 {{ startRoom }}</span>
          <span class="text-xs text-gray-400">→</span>
          <span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">🔴 {{ endRoom }}</span>
        </div>
        <div class="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button v-for="f in 4" :key="f" @click="switchFloor(f)"
            class="px-3 py-1.5 text-xs rounded-lg font-medium transition"
            :class="currentFloor === f ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
            ชั้น {{ f }}
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-7xl mx-auto w-full px-4 py-4 flex flex-col lg:flex-row gap-4">
      <!-- Left: Map -->
      <div class="flex-1 min-w-0">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Start/Dest selectors -->
          <div class="p-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-2">
            <select v-model="startRoom" class="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-[140px] focus:border-orange-500 focus:outline-none">
              <option value="">🟢 จุดเริ่มต้น</option>
              <option v-for="r in roomOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
            <span class="text-gray-300 text-xs">→</span>
            <select v-model="endRoom" class="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-[140px] focus:border-orange-500 focus:outline-none">
              <option value="">🔴 จุดหมาย</option>
              <option v-for="r in roomOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
            <button @click="goRoute" class="text-xs px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition">
              🔎 ค้นหา
            </button>
            <button v-if="showRoute" @click="clearRoute" class="text-xs px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg">
              ✕ ล้าง
            </button>
            <button v-if="highlightRoom && !showRoute" @click="startRoom = highlightRoom" class="text-xs px-2 py-1.5 text-green-700 bg-green-50 rounded-lg hover:bg-green-100">
              📌 ตั้ง {{ highlightRoom }} เป็นจุดเริ่มต้น
            </button>
            <button v-if="highlightRoom && !showRoute" @click="endRoom = highlightRoom" class="text-xs px-2 py-1.5 text-red-700 bg-red-50 rounded-lg hover:bg-red-100">
              📌 ตั้ง {{ highlightRoom }} เป็นจุดหมาย
            </button>
          </div>

          <!-- Floor Plan Image + Overlay -->
          <div class="relative bg-gray-100" style="min-height: 400px;">
            <img :src="`/ict/floor${currentFloor}.png`" :alt="`ชั้น ${currentFloor}`"
              class="w-full h-auto block" :class="{ 'opacity-90': showRoute }"
              @load="overlayKey++" />

            <!-- SVG Route Overlay -->
            <svg v-if="showRoute" :key="overlayKey"
              class="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 100 100">
              <!-- Glow filter -->
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="0.3" result="b"/>
                  <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              <!-- Elevator markers on this floor -->
              <template v-for="e in FLOOR_LAYOUTS[currentFloor]?.elevators" :key="e.id">
                <rect :x="e.x - 2.5" :y="e.y - 2.5" width="5" height="5" rx="1" fill="#1565c0" opacity="0.7" stroke="white" stroke-width="0.5"/>
                <text :x="e.x" :y="e.y + 0.3" text-anchor="middle" font-size="3" fill="white" font-weight="bold">🛗</text>
              </template>

              <!-- Route lines on this floor -->
              <template v-for="(step, si) in routeSteps" :key="'s'+si">
                <g v-if="step.type === 'walk' && step.floor === currentFloor && step.path && step.path.length >= 2">
                  <!-- Glow -->
                  <polyline :points="step.path.map(p => `${p.x},${p.y}`).join(' ')" fill="none"
                    stroke="#1565c0" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"
                    opacity="0.3" filter="url(#glow)"/>
                  <!-- Main line -->
                  <polyline :points="step.path.map(p => `${p.x},${p.y}`).join(' ')" fill="none"
                    stroke="#1565c0" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
                  <!-- Arrow heads -->
                  <template v-for="(p, pi) in step.path" :key="'a'+pi">
                    <polygon v-if="pi > 0"
                      :points="(() => {
                        const a = step.path![pi-1], b = step.path![pi];
                        const ang = Math.atan2(b.y - a.y, b.x - a.x);
                        const s = 0.5;
                        return `${b.x},${b.y} ${b.x - s * Math.cos(ang-0.5)},${b.y - s * Math.sin(ang-0.5)} ${b.x - s * Math.cos(ang+0.5)},${b.y - s * Math.sin(ang+0.5)}`;
                      })()"
                      fill="#1565c0" opacity="0.85"/>
                  </template>
                </g>
              </template>

              <!-- Start marker -->
              <template v-if="showRoute">
                <circle v-if="routeSteps.find(s => s.type === 'walk')?.path?.[0]"
                  :cx="routeSteps.find(s => s.type === 'walk')!.path![0].x"
                  :cy="routeSteps.find(s => s.type === 'walk')!.path![0].y"
                  r="1" fill="#2e7d32" stroke="white" stroke-width="0.4" opacity="0.95"/>
                <!-- End marker -->
                <circle v-if="routeSteps.filter(s => s.type === 'walk').slice(-1)[0]?.path?.slice(-1)[0]"
                  :cx="routeSteps.filter(s => s.type === 'walk').slice(-1)[0]!.path!.slice(-1)[0]!.x"
                  :cy="routeSteps.filter(s => s.type === 'walk').slice(-1)[0]!.path!.slice(-1)[0]!.y"
                  r="1" fill="#d32f2f" stroke="white" stroke-width="0.4" opacity="0.95"/>
              </template>
            </svg>
          </div>
        </div>
      </div>

      <!-- Right: Room Detail / Directions -->
      <div class="w-full lg:w-80 xl:w-96 flex-shrink-0">
        <!-- Route Directions -->
        <div v-if="showRoute" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div class="font-semibold text-sm">🧭 เส้นทาง</div>
            <div class="flex items-center gap-2 mt-1 text-xs text-orange-100">
              <span class="bg-white/20 px-2 py-0.5 rounded font-mono">🟢 {{ startRoom }}</span>
              <span>→</span>
              <span class="bg-white/20 px-2 py-0.5 rounded font-mono">🔴 {{ endRoom }}</span>
            </div>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-for="(step, i) in routeSteps" :key="i"
              class="flex items-start gap-3 p-3.5 cursor-pointer hover:bg-gray-50 transition"
              @click="step.floor ? goToFloor(step.floor) : null">
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-bold text-white"
                :class="step.type === 'walk' ? 'bg-green-600' : step.type === 'lift' ? 'bg-blue-600' : 'bg-orange-500'">
                {{ i + 1 }}
              </div>
              <div class="text-sm leading-relaxed" v-html="step.text"></div>
            </div>
          </div>
          <div class="p-3 text-center">
            <button @click="clearRoute" class="text-xs text-gray-400 hover:text-gray-600 transition">✕ ล้างเส้นทาง</button>
          </div>
        </div>

        <!-- Room Detail -->
        <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 class="font-semibold text-sm mb-3">📍 รายละเอียดห้อง</h3>
          <div v-if="highlightRoom" class="space-y-3">
            <div class="bg-orange-50 rounded-xl p-3">
              <div class="text-lg font-bold font-mono text-orange-700">{{ highlightRoom }}</div>
              <div class="text-xs text-gray-500 mt-1">อาคาร ICT · ชั้น {{ currentFloor }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-400 mb-1">จุดสังเกต</div>
              <div class="text-xs text-gray-600">
                {{ ALL_ROOMS.find(r => r.code === highlightRoom)?.nearby?.join(' · ') || 'ไม่มีข้อมูล' }}
              </div>
            </div>
            <RouterLink :to="'/route/' + highlightRoom" class="block w-full text-center py-2.5 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 transition">
              🧭 ดูเส้นทาง
            </RouterLink>
          </div>
          <div v-else class="text-center py-8 text-gray-400 text-sm">
            <div class="text-3xl mb-2">👆</div>
            <p>คลิกห้องบนแผนที่<br />เพื่อดูรายละเอียด<br /><span class="text-xs">หรือเลือกห้องด้านบน</span></p>
          </div>
          <hr class="my-4 border-gray-100" />
          <div class="text-xs text-gray-400 text-center">🏫 อาคาร ICT · ชั้น 1-4<br/>มหาวิทยาลัยพะเยา</div>
        </div>
      </div>
    </main>
  </div>
</template>
