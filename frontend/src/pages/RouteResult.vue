<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useRouteStore } from '@/stores/route'
import { ALL_ROOMS, getFloorFacilities } from '@/data/rooms'
import { parseRoomCode } from '@/engine/route-parser'

const route = useRoute()
const router = useRouter()
const store = useRouteStore()
const code = ref((route.params.code as string) || '')
const showReportDialog = ref(false)
const reportText = ref('')
const showManualOverride = ref(false)
const manualBuilding = ref('ICT')
const manualFloor = ref(1)
const manualRoom = ref('')

onMounted(() => {
  if (code.value) {
    store.search(code.value)
  }
})

const { currentResult, isLoading, error } = storeToRefs(store)

// Manual override rooms
const manualSuggestions = computed(() => {
  return ALL_ROOMS
    .filter(r => r.building === manualBuilding.value && r.floor === manualFloor.value)
    .map(r => r.code)
})

function applyManualOverride() {
  if (manualRoom.value) {
    router.push(`/route/${manualRoom.value}`)
  }
}

function shareRoute() {
  const url = window.location.href
  if (navigator.share) {
    navigator.share({ title: 'หลงทาง - เส้นทาง', url })
  } else {
    navigator.clipboard.writeText(url)
    alert('คัดลอกลิงก์แล้ว!')
  }
}

function submitReport() {
  alert('ได้รับรายงานแล้ว ขอบคุณที่ช่วยปรับปรุงระบบ! 🙏')
  showReportDialog.value = false
  reportText.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Bar -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
        <button @click="router.push('/')" class="text-gray-500 hover:text-orange-600 transition p-1">
          ← กลับ
        </button>
        <div class="flex-1" />
        <button @click="shareRoute" class="text-gray-400 hover:text-orange-600 transition text-sm flex items-center gap-1 px-2 py-1">
          <span>🔗</span> แชร์
        </button>
        <button @click="showManualOverride = !showManualOverride" class="text-gray-400 hover:text-orange-600 transition text-sm flex items-center gap-1 px-2 py-1">
          <span>⚙️</span> เลือกเอง
        </button>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 py-6">
      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-16">
        <div class="text-4xl mb-4 animate-pulse">🔍</div>
        <p class="text-gray-500">กำลังค้นหาเส้นทาง...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-16">
        <div class="text-5xl mb-4">🤔</div>
        <h2 class="text-xl font-semibold mb-2">ไม่พบห้องนี้</h2>
        <p class="text-gray-500 mb-6">{{ error }}</p>

        <!-- Manual Override -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-sm mx-auto">
          <h3 class="font-semibold text-sm mb-3">ลองเลือกเอง</h3>
          <div class="space-y-3">
            <select v-model="manualBuilding" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none">
              <option value="ICT">อาคาร ICT</option>
            </select>
            <select v-model="manualFloor" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none">
              <option v-for="f in 4" :key="f" :value="f">ชั้น {{ f }}</option>
            </select>
            <select v-model="manualRoom" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none">
              <option value="" disabled>เลือกห้อง</option>
              <option v-for="r in manualSuggestions" :key="r" :value="r">{{ r }}</option>
            </select>
            <button @click="applyManualOverride" class="w-full py-2.5 bg-orange-600 text-white rounded-xl font-medium text-sm hover:bg-orange-700 transition">
              ดูเส้นทาง
            </button>
          </div>
        </div>
      </div>

      <!-- Route Result -->
      <div v-else-if="currentResult" class="space-y-4">
        <!-- Room Header -->
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-3xl font-bold font-mono">{{ currentResult.room.code }}</div>
              <div class="text-orange-100 text-sm mt-1">
                {{ currentResult.room.buildingName }} · ชั้น {{ currentResult.room.floor }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-3xl">🧭</div>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-2 text-sm text-orange-100">
            <span>⏱️</span>
            <span>{{ currentResult.estimatedTime }}</span>
          </div>
        </div>

        <!-- Bus Info -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">🚌</span>
            <h3 class="font-semibold">รถเมล์ มพ.</h3>
          </div>
          <div v-for="bus in currentResult.busInfo" :key="bus" class="text-sm text-gray-600 mb-1 flex items-start gap-2">
            <span class="text-green-500 mt-0.5">✓</span>
            <span>{{ bus }}</span>
          </div>
          <div class="mt-2 text-xs text-gray-400">🅿️ ป้ายลง: {{ currentResult.busStop }}</div>
        </div>

        <!-- Step-by-Step -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">🚶</span>
            <h3 class="font-semibold">วิธีเดิน</h3>
          </div>
          <div class="space-y-0">
            <div
              v-for="(step, i) in currentResult.steps"
              :key="i"
              class="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0"
            >
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm shrink-0">
                  {{ step.icon }}
                </div>
                <div v-if="i < currentResult.steps.length - 1" class="w-0.5 h-full min-h-[20px] bg-orange-200 mt-1" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium">{{ step.text }}</div>
                <div v-if="step.detail" class="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{{ step.detail }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Facilities -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">🏗️</span>
            <h3 class="font-semibold">สิ่งอำนวยความสะดวกชั้น {{ currentResult.room.floor }}</h3>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="f in currentResult.facilities"
              :key="f"
              class="px-3 py-1.5 bg-gray-50 rounded-xl text-xs text-gray-600"
            >
              {{ f }}
            </span>
          </div>
        </div>

        <!-- Landmarks -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">📍</span>
            <h3 class="font-semibold">จุดสังเกตใกล้ห้อง</h3>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="l in currentResult.nearbyLandmarks"
              :key="l"
              class="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-xl text-xs font-medium"
            >
              {{ l }}
            </span>
          </div>
        </div>

        <!-- Report Button -->
        <div class="text-center py-4">
          <button
            @click="showReportDialog = true"
            class="text-sm text-gray-400 hover:text-red-500 transition"
          >
            ⚠️ แจ้งเส้นทางผิด
          </button>
        </div>

        <!-- View Map -->
        <div class="text-center pb-6">
          <RouterLink
            :to="'/map?floor=' + currentResult.room.floor + '&room=' + currentResult.room.code"
            class="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition shadow-sm"
          >
            🗺️ ดูแผนที่ชั้น {{ currentResult.room.floor }}
          </RouterLink>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <div class="text-4xl mb-4">🔍</div>
        <p class="text-gray-500">พิมพ์รหัสห้องเพื่อดูเส้นทาง</p>
      </div>
    </main>

    <!-- Report Dialog -->
    <Teleport to="body">
      <div v-if="showReportDialog" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="showReportDialog = false">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
          <h3 class="font-semibold mb-1">แจ้งเส้นทางผิด</h3>
          <p class="text-xs text-gray-500 mb-4">บอกเราว่าผิดตรงไหน เพื่อให้เราปรับปรุง</p>
          <textarea
            v-model="reportText"
            placeholder="เช่น ทางเข้าชั้น 1 อยู่คนละฝั่ง..."
            class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none h-24 focus:border-orange-500 focus:outline-none"
          />
          <div class="flex gap-2 mt-4">
            <button @click="showReportDialog = false" class="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
              ยกเลิก
            </button>
            <button @click="submitReport" class="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm hover:bg-orange-700 transition">
              ส่งรายงาน
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Manual Override Panel -->
    <Teleport to="body">
      <div v-if="showManualOverride" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="showManualOverride = false">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
          <h3 class="font-semibold mb-4">เลือกเอง (Manual Override)</h3>
          <div class="space-y-3">
            <select v-model="manualBuilding" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none">
              <option value="ICT">อาคาร ICT</option>
            </select>
            <select v-model="manualFloor" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none">
              <option v-for="f in 4" :key="f" :value="f">ชั้น {{ f }}</option>
            </select>
            <select v-model="manualRoom" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:outline-none">
              <option value="" disabled>เลือกห้อง</option>
              <option v-for="r in manualSuggestions" :key="r" :value="r">{{ r }}</option>
            </select>
            <button @click="applyManualOverride" class="w-full py-2.5 bg-orange-600 text-white rounded-xl font-medium text-sm hover:bg-orange-700 transition">
              ดูเส้นทาง
            </button>
          </div>
          <button @click="showManualOverride = false" class="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition">
            ปิด
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
