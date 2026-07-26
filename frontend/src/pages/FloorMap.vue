<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ALL_ROOMS, type Room } from '@/data/rooms'

const route = useRoute()
const router = useRouter()

// ============ STATE ============
const currentFloor = ref(parseInt((route.query.floor as string) || '1'))
const searchStart = ref('')
const searchEnd = ref('')
const startRoom = ref('')
const endRoom = ref('')
const showRoute = ref(false)
const showSuggestions = ref(false)
const suggestionMode = ref<'start' | 'end'>('start')
const selectedIdx = ref(-1)

// ============ ROOM POSITIONS (% on 2048x1448 images) ============
interface Pos { x: number; y: number }
interface Layout { rooms: Record<string, Pos>; elevators: { id:string; x:number; y:number; label:string }[]; elevator2: { id:string; x:number; y:number; label:string }; corridor: Pos[] }

const LAYOUTS: Record<number, Layout> = {
  1: {
    rooms: { "ICT1112":{x:5.5,y:28}, "ICT1111":{x:5.5,y:40}, "ICT1110":{x:5.5,y:52}, "ICT1109":{x:5.5,y:64}, "ICT1108":{x:5.5,y:76}, "ICT1107":{x:9,y:47}, "ICT1106":{x:88,y:20}, "ICT1105":{x:88,y:32}, "ICT1104":{x:88,y:44}, "ICT1104/1":{x:83,y:44}, "ICT1103":{x:88,y:56}, "ICT1103/1":{x:83,y:56}, "ICT1102":{x:88,y:68}, "ICT1102/1":{x:83,y:68} },
    elevators: [{id:"e1",x:27,y:22,label:"ลิฟต์ซ้าย"}], elevator2: {id:"e2",x:67,y:22,label:"ลิฟต์ขวา"},
    corridor: [{x:10,y:46},{x:27,y:24},{x:50,y:24},{x:67,y:24},{x:83,y:24}]
  },
  2: {
    rooms: { "ICT1247":{x:10,y:18}, "ICT1241":{x:8,y:40}, "ICT1241/1":{x:5,y:40}, "ICT1235":{x:8,y:52}, "ICT1235/1":{x:5,y:52}, "ICT1229":{x:8,y:64}, "ICT1224":{x:8,y:76}, "ICT1219":{x:90,y:72}, "ICT1213":{x:90,y:58}, "ICT1207":{x:90,y:44}, "ICT1202":{x:90,y:30} },
    elevators: [{id:"e1",x:18,y:30,label:"ลิฟต์ซ้าย"}], elevator2: {id:"e2",x:78,y:30,label:"ลิฟต์ขวา"},
    corridor: [{x:12,y:55},{x:18,y:32},{x:50,y:26},{x:78,y:32},{x:86,y:55}]
  },
  3: {
    rooms: { "ICT1352":{x:12,y:18}, "ICT1355":{x:32,y:10}, "ICT1356":{x:50,y:10}, "ICT1357":{x:68,y:10}, "ICT1359":{x:50,y:24}, "ICT1340":{x:10,y:52}, "ICT1334":{x:10,y:64}, "ICT1328":{x:22,y:75}, "ICT1323":{x:38,y:75}, "ICT1318":{x:55,y:75}, "ICT1312":{x:72,y:75}, "ICT1307":{x:85,y:65}, "ICT1302":{x:85,y:52} },
    elevators: [{id:"e1",x:35,y:28,label:"ลิฟต์ซ้าย"}], elevator2: {id:"e2",x:78,y:28,label:"ลิฟต์ขวา"},
    corridor: [{x:14,y:40},{x:22,y:30},{x:35,y:30},{x:50,y:28},{x:78,y:30},{x:82,y:55}]
  },
  4: {
    rooms: { "ICT1439":{x:8,y:22}, "ICT1434":{x:8,y:36}, "ICT1429":{x:8,y:50}, "ICT1424":{x:8,y:64}, "ICT1419":{x:88,y:22}, "ICT1419/1":{x:83,y:22}, "ICT1413":{x:88,y:36}, "ICT1413/1":{x:83,y:36}, "ICT1407":{x:88,y:50}, "ICT1402":{x:88,y:64} },
    elevators: [{id:"e1",x:22,y:20,label:"ลิฟต์ซ้าย"}], elevator2: {id:"e2",x:75,y:20,label:"ลิฟต์ขวา"},
    corridor: [{x:12,y:42},{x:22,y:22},{x:50,y:18},{x:75,y:22},{x:82,y:42}]
  }
}

// ============ ROUTE ENGINE ============
function dist(a: Pos, b: Pos) { return Math.hypot(a.x - b.x, a.y - b.y) }

function nearestElev(l: Layout, key: string) {
  const p = l.rooms[key]; if (!p) return l.elevators[0]
  return dist(p, l.elevators[0]) <= dist(p, l.elevator2) ? l.elevators[0] : l.elevator2
}

function pathOnFloor(l: Layout, from: string, to: string): Pos[] {
  const f = l.rooms[from], t = l.rooms[to]; if (!f || !t) return []
  const c = l.corridor; if (!c.length) return [f, t]
  let ci=0, cid=Infinity; for(let i=0;i<c.length;i++){const d=dist(f,c[i]);if(d<cid){cid=d;ci=i}}
  let cj=0, cjd=Infinity; for(let i=0;i<c.length;i++){const d=dist(t,c[i]);if(d<cjd){cjd=d;cj=i}}
  const p: Pos[] = [f]; const step = ci<=cj?1:-1
  for(let i=ci;(step>0?i<=cj:i>=cj);i+=step) p.push(c[i])
  if(p.length<2||dist(p[p.length-1],t)>2) p.push(t)
  return p
}

function wingOf(key: string): 'left' | 'right' {
  const room = ALL_ROOMS.find(r => r.code === key)
  return room?.wing || (parseInt(key.replace(/[^\d]/g,'')) % 2 === 0 ? 'left' : 'right')
}

function directionWords(fromX: number, toX: number, fromKey: string, toKey: string): string {
  if (fromKey === 'elevator') return 'ตรงไป'
  const diff = toX - fromX
  if (Math.abs(diff) < 5) return 'ตรงไป'
  return diff > 0 ? 'เลี้ยวขวา' : 'เลี้ยวซ้าย'
}

function roomSide(key: string): string {
  return wingOf(key) === 'left' ? 'ปีกซ้าย' : 'ปีกขวา'
}

function describeDetailed(s: string, e: string, steps: {type:string;text:string;floor?:number;path?:Pos[];fromF?:number;toF?:number}[]): string[] {
  const details: string[] = []
  const sf = parseInt(s.charAt(3)), ef = parseInt(e.charAt(3))
  const sw = roomSide(s), ew = roomSide(e)

  if (sf === ef) {
    const dir = wingOf(s) === wingOf(e) ? 'ตรงไปตามทางเดิน' : `เดินข้ามไป${ew}`
    details.push(`🚶 จากห้อง <strong>${s}</strong> (${sw}) ออกมาทางเดินกลาง`)
    details.push(`➡️ ${dir}`)
    details.push(`📍 ถึงห้อง <strong>${e}</strong> (${ew}) ทางเดินฝั่ง${wingOf(e) === 'left' ? 'ซ้ายมือ' : 'ขวามือ'}`)
  } else {
    const dir = sf < ef ? 'ขึ้น' : 'ลง'
    const floorDiff = Math.abs(ef - sf)
    const elev = nearestElev(LAYOUTS[sf], s)
    const eSide = elev.id === 'e1' ? 'ซ้าย' : 'ขวา'
    const destElev = nearestElev(LAYOUTS[ef], e)
    const dSide = destElev.id === 'e1' ? 'ซ้าย' : 'ขวา'

    details.push(`🚶 ออกจาก <strong>${s}</strong> (${sw}, ชั้น ${sf})`)
    details.push(`➡️ เดินไปลิฟต์ฝั่ง${eSide}ของชั้น ${sf}`)
    details.push(`🛗 ขึ้นลิฟต์${dir}ไป <strong>ชั้น ${ef}</strong> (${floorDiff} ชั้น)`)

    if (ef !== sf) {
      const dirWord = dSide === eSide ? 'ตรงไปตามทางเดิน' : `เดินข้ามไปฝั่ง${dSide}`
      details.push(`🚶 เมื่อถึงชั้น ${ef} ออกจากลิฟต์ฝั่ง${dSide}`)
      details.push(`➡️ ${dirWord} `)
      details.push(`📍 เลี้ยวเข้าทางเดิน${ew} — จะพบ <strong>${e}</strong> ${wingOf(e) === 'left' ? 'อยู่ทางซ้ายมือ' : 'อยู่ทางขวามือ'}`)
    }
  }
  return details
}

interface Step { type: 'walk'|'lift'|'arrive'; text: string; floor?: number; path?: Pos[]; fromFloor?: number; toFloor?: number }

function calc(s: string, e: string) {
  const sf = parseInt(s.charAt(3)), ef = parseInt(e.charAt(3))
  const steps: Step[] = []; const floors: Set<number> = new Set()
  if (sf === ef) {
    const l = LAYOUTS[sf]; const p = pathOnFloor(l, s, e)
    steps.push({ type:'walk', text:`เดินจาก ${s} ไป ${e} ภายในชั้น ${sf}`, floor:sf, path:p }); floors.add(sf)
  } else {
    const dir = sf<ef?'ขึ้น':'ลง'; const sL=LAYOUTS[sf], eL=LAYOUTS[ef]
    const e1=nearestElev(sL,s), e2=nearestElev(eL,e); const d=Math.abs(ef-sf)
    steps.push({ type:'walk', text:`เดินจาก ${s} ไป ${e1.label} (ชั้น ${sf})`, floor:sf, path:[sL.rooms[s],e1] }); floors.add(sf)
    steps.push({ type:'lift', text:`🛗 ขึ้นลิฟต์${dir}ไปชั้น ${ef} (${d} ชั้น)`, fromFloor:sf, toFloor:ef })
    for(let m=Math.min(sf,ef)+1;m<Math.max(sf,ef);m++) floors.add(m)
    steps.push({ type:'walk', text:`เมื่อถึงชั้น ${ef} เดินจากลิฟต์ไป ${e}`, floor:ef, path:[e2,eL.rooms[e]] }); floors.add(ef)
  }
  steps.push({ type:'arrive', text:`📍 ถึง ${e} ชั้น ${ef} แล้ว` })
  return { steps, floors:[...floors].sort() }
}

// ============ COMPUTED ============
const suggestions = computed(() => {
  const q = (suggestionMode.value === 'start' ? searchStart.value : searchEnd.value).toUpperCase()
  if (!q) return []
  return ALL_ROOMS.filter(r => r.code.includes(q)).slice(0, 8).map(r => r.code)
})

const routeSteps = ref<Step[]>([])
const floorsUsed = ref<number[]>([])
const detailedDirs = ref<string[]>([])

// ============ METHODS ============
function switchFloor(f: number) { currentFloor.value = f; router.replace({ query:{...route.query,floor:String(f)} }) }
function onFocus(mode: 'start' | 'end') { suggestionMode.value = mode; showSuggestions.value = true; selectedIdx.value = -1 }
function onBlur() { setTimeout(() => showSuggestions.value = false, 200) }

function selectSuggestion(code: string) {
  if (suggestionMode.value === 'start') { searchStart.value = code; startRoom.value = code }
  else { searchEnd.value = code; endRoom.value = code }
  showSuggestions.value = false
  if (startRoom.value && endRoom.value) doRoute()
}

function handleKeydown(e: KeyboardEvent) {
  const s = suggestions.value
  if (e.key === 'Enter') {
    if (selectedIdx.value >= 0 && selectedIdx.value < s.length) {
      selectSuggestion(s[selectedIdx.value])
    } else if (s.length > 0) {
      selectSuggestion(s[0])
    }
  } else if (e.key === 'ArrowDown') { selectedIdx.value = Math.min(selectedIdx.value+1, s.length-1); e.preventDefault() }
  else if (e.key === 'ArrowUp') { selectedIdx.value = Math.max(selectedIdx.value-1, -1); e.preventDefault() }
  else if (e.key === 'Escape') { showSuggestions.value = false }
}

function doRoute() {
  if (!startRoom.value || !endRoom.value) return
  if (startRoom.value === endRoom.value) { alert('⛔ จุดเริ่มต้นและจุดหมายต้องเป็นคนละห้องกัน'); return }
  const r = calc(startRoom.value, endRoom.value)
  routeSteps.value = r.steps; floorsUsed.value = r.floors; showRoute.value = true
  detailedDirs.value = describeDetailed(startRoom.value, endRoom.value, r.steps)
  currentFloor.value = r.floors[0]
}

function clearRoute() {
  showRoute.value = false; routeSteps.value = []; floorsUsed.value = []; detailedDirs.value = []
}

const overlayKey = ref(0)
watch([currentFloor, showRoute, routeSteps], async () => { await nextTick(); overlayKey.value++ })
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <button @click="router.push('/')" class="text-gray-500 hover:text-orange-600 transition p-1 text-sm">← กลับ</button>
        <h1 class="font-semibold text-sm flex-1">🗺️ แผนที่อาคาร ICT</h1>
        <div v-if="showRoute" class="hidden sm:flex items-center gap-1.5 mr-2">
          <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-mono font-bold">🟢 {{ startRoom }}</span>
          <span class="text-xs text-gray-300">→</span>
          <span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-mono font-bold">🔴 {{ endRoom }}</span>
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
              <input v-model="searchStart" @focus="onFocus('start')" @blur="onBlur" @keydown="handleKeydown"
                placeholder="ค้นหาจุดเริ่มต้น เช่น ICT1107"
                class="w-full pl-8 pr-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition text-base" />
            </div>
            <span class="text-center text-gray-300 hidden sm:block">→</span>
            <div class="relative flex-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs">🔴</span>
              <input v-model="searchEnd" @focus="onFocus('end')" @blur="onBlur" @keydown="handleKeydown"
                placeholder="ค้นหาจุดหมาย เช่น ICT1439"
                class="w-full pl-8 pr-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition text-base" />
            </div>
            <button @click="doRoute" class="px-5 py-2.5 bg-gradient-to-r from-green-600 to-orange-600 text-white rounded-xl font-medium text-sm hover:from-green-700 hover:to-orange-700 transition shadow-sm whitespace-nowrap"
              :disabled="!searchStart || !searchEnd">
              🔎 นำทาง
            </button>
          </div>

          <!-- Suggestions dropdown -->
          <div v-if="showSuggestions && suggestions.length > 0" class="relative mt-1">
            <div class="absolute top-0 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-30">
              <button v-for="(code, i) in suggestions" :key="code" @mousedown.prevent="selectSuggestion(code)"
                class="w-full px-4 py-2.5 text-left hover:bg-orange-50 flex items-center gap-3 transition-colors"
                :class="{ 'bg-orange-100': i === selectedIdx }">
                <span class="font-mono font-medium text-sm text-orange-600">{{ code }}</span>
                <span class="text-xs text-gray-400">ชั้น {{ ALL_ROOMS.find(r => r.code === code)?.floor }} · {{ ALL_ROOMS.find(r => r.code === code)?.wing === 'left' ? 'ปีกซ้าย' : 'ปีกขวา' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Floor plan -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 relative">
          <div class="relative bg-gray-100" style="min-height:450px">
            <img :src="`/ict/floor${currentFloor}.png`" :alt="`ชั้น ${currentFloor}`" class="w-full h-auto block"
              :class="{ 'opacity-85': showRoute }" @load="overlayKey++" />

            <!-- SVG route overlay -->
            <svg v-if="showRoute" :key="overlayKey" class="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 100">
              <defs><filter id="g"><feGaussianBlur stdDeviation="0.3" result="b"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
              <!-- Elevator markers -->
              <g v-for="e in LAYOUTS[currentFloor]?.elevators" :key="e.id">
                <rect :x="e.x-2.5" :y="e.y-2.5" width="5" height="5" rx="1" fill="#1565c0" opacity="0.8" stroke="white" stroke-width="0.3"/>
                <text :x="e.x" :y="e.y+0.3" text-anchor="middle" font-size="2.5" fill="white">🛗</text>
                <text :x="e.x" :y="e.y+2.3" text-anchor="middle" font-size="1.5" fill="#1565c0" opacity="0.7" font-weight="bold">{{ e.label }}</text>
              </g>
              <g v-for="e in [LAYOUTS[currentFloor]?.elevator2]" :key="e?.id">
                <rect :x="(e?.x||0)-2.5" :y="(e?.y||0)-2.5" width="5" height="5" rx="1" fill="#1565c0" opacity="0.8" stroke="white" stroke-width="0.3"/>
                <text :x="e?.x||0" :y="(e?.y||0)+0.3" text-anchor="middle" font-size="2.5" fill="white">🛗</text>
              </g>
              <!-- Route paths on this floor -->
              <g v-for="(step, si) in routeSteps" :key="'s'+si">
                <g v-if="step.type === 'walk' && step.floor === currentFloor && step.path && step.path.length >= 2">
                  <polyline :points="step.path.map(p=>`${p.x},${p.y}`).join(' ')" fill="none" stroke="#1565c0" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.25" filter="url(#g)"/>
                  <polyline :points="step.path.map(p=>`${p.x},${p.y}`).join(' ')" fill="none" stroke="#1565c0" stroke-width="0.55" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
                  <template v-for="(p, pi) in step.path" :key="'a'+pi">
                    <polygon v-if="pi > 0"
                      :points="(()=>{const a=step.path![pi-1],b=step.path![pi];const ang=Math.atan2(b.y-a.y,b.x-a.x);const s=0.45;return `${b.x},${b.y} ${b.x-s*Math.cos(ang-0.5)},${b.y-s*Math.sin(ang-0.5)} ${b.x-s*Math.cos(ang+0.5)},${b.y-s*Math.sin(ang+0.5)}`})()"
                      fill="#1565c0" opacity="0.85"/>
                  </template>
                </g>
              </g>
              <!-- Start/end circles -->
              <circle v-if="showRoute && routeSteps.find(s=>s.type==='walk')?.path?.[0]"
                :cx="routeSteps.find(s=>s.type==='walk')!.path![0].x" :cy="routeSteps.find(s=>s.type==='walk')!.path![0].y"
                r="1.1" fill="#2e7d32" stroke="white" stroke-width="0.35" opacity="0.95"/>
              <circle v-if="showRoute"
                :cx="routeSteps.filter(s=>s.type==='walk').slice(-1)[0]?.path?.slice(-1)[0]?.x||0"
                :cy="routeSteps.filter(s=>s.type==='walk').slice(-1)[0]?.path?.slice(-1)[0]?.y||0"
                r="1.1" fill="#d32f2f" stroke="white" stroke-width="0.35" opacity="0.95"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- RIGHT: Directions panel -->
      <div class="w-full lg:w-96 flex-shrink-0 flex flex-col gap-3">
        <!-- Route steps -->
        <div v-if="showRoute" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 bg-gradient-to-r from-green-700 via-orange-600 to-red-700 text-white">
            <div class="font-bold text-sm flex items-center gap-2">
              <span>🧭</span> เส้นทาง <span class="font-mono text-xs bg-white/20 px-2 py-0.5 rounded">🟢 {{ startRoom }}</span> → <span class="font-mono text-xs bg-white/20 px-2 py-0.5 rounded">🔴 {{ endRoom }}</span>
            </div>
          </div>

          <!-- Detailed directions -->
          <div class="p-3 bg-green-50 border-b border-gray-100">
            <div class="text-xs font-semibold text-green-700 mb-2">📋 รายละเอียดการเดินทาง</div>
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
              <div class="text-sm leading-relaxed" v-html="step.text"></div>
            </div>
          </div>
          <div class="p-3 text-center border-t border-gray-50">
            <button @click="clearRoute" class="text-xs text-gray-400 hover:text-gray-600 transition">✕ ล้างเส้นทาง</button>
          </div>
        </div>

        <!-- Empty state or room info -->
        <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center text-gray-400">
          <div class="text-4xl mb-3">🔍</div>
          <p class="text-sm">พิมพ์ชื่อห้องที่ต้องการ<br/>ค้นหาในช่องด้านบน</p>
          <div class="mt-4 flex flex-wrap justify-center gap-1.5">
            <button v-for="ex in ['ICT1107','ICT1402','ICT1439','ICT1207']" :key="ex"
              @click="searchStart=ex;startRoom=ex;onFocus('end')"
              class="px-2.5 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-mono hover:bg-orange-100 transition">
              {{ ex }}
            </button>
          </div>
          <p class="text-xs mt-3 text-gray-300">คลิกเพื่อลอง — แล้วพิมพ์จุดหมาย</p>
        </div>

        <!-- Nearby rooms on current floor -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div class="text-xs font-semibold text-gray-500 mb-2">🏠 ห้องชั้น {{ currentFloor }}</div>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="r in ALL_ROOMS.filter(r=>r.floor===currentFloor).slice(0,10)" :key="r.code" @click="searchStart = r.code; startRoom = r.code; onFocus('end')"
              class="px-2.5 py-1.5 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition">
              {{ r.code }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
