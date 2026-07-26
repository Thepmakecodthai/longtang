<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ALL_ROOMS, getRoomsByFloor, getFloorFacilities } from '@/data/rooms'
import type { Room } from '@/data/rooms'

const route = useRoute()
const router = useRouter()

const currentFloor = ref(parseInt((route.query.floor as string) || '1'))
const highlightedRoom = ref((route.query.room as string) || '')


const rooms = computed(() => getRoomsByFloor(currentFloor.value))
const facilities = computed(() => getFloorFacilities(currentFloor.value))

const leftRooms = computed(() => rooms.value.filter((r: Room) => r.wing === 'left'))
const rightRooms = computed(() => rooms.value.filter((r: Room) => r.wing === 'right'))

function selectRoom(code: string) {
  highlightedRoom.value = code
  router.replace({ query: { ...route.query, room: code } })
}

watch(() => route.query.floor, (f) => {
  if (f) currentFloor.value = parseInt(f as string)
})


</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Top Bar -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
        <button @click="router.push('/')" class="text-gray-500 hover:text-orange-600 transition p-1">
          ← กลับ
        </button>
        <h1 class="font-semibold text-sm flex-1">แผนที่อาคาร ICT</h1>

        <!-- Floor Switcher -->
        <div class="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            v-for="f in 4"
            :key="f"
            @click="currentFloor = f"
            class="px-3 py-1.5 text-xs rounded-lg font-medium transition"
            :class="currentFloor === f ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            ชั้น {{ f }}
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Floor Plan -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold">ผังชั้น {{ currentFloor }}</h2>
              <div class="flex gap-3 text-xs text-gray-400">
                <span><span class="inline-block w-3 h-3 bg-orange-500 rounded mr-1" /> ห้อง</span>
                <span><span class="inline-block w-3 h-3 bg-yellow-300 rounded mr-1" /> บันได/ลิฟต์</span>
                <span><span class="inline-block w-3 h-3 bg-blue-200 rounded mr-1" /> ห้องน้ำ</span>
              </div>
            </div>

            <!-- Floor Plan Grid -->
            <div class="relative">
              <!-- Service Core Left -->
              <div class="absolute left-0 top-1/2 -translate-y-1/2 w-16 flex flex-col gap-1 z-10">
                <div class="bg-yellow-100 rounded-lg p-2 text-center text-xs">
                  <div class="text-base">🛗</div>
                  <div class="text-[10px] text-gray-500">ลิฟต์</div>
                </div>
                <div class="bg-yellow-100 rounded-lg p-2 text-center text-xs">
                  <div class="text-base">🧗</div>
                  <div class="text-[10px] text-gray-500">บันได</div>
                </div>
                <div class="bg-blue-100 rounded-lg p-2 text-center text-xs">
                  <div class="text-base">🚻</div>
                  <div class="text-[10px] text-gray-500">ห้องน้ำ</div>
                </div>
              </div>

              <!-- Corridor -->
              <div class="mx-20 px-6 py-4 bg-gray-50 rounded-xl min-h-[300px] flex flex-col items-center justify-center">
                <div class="text-xs text-gray-400 mb-4 font-medium">🟫 ทางเดินกลาง</div>

                <!-- Left Wing -->
                <div class="w-full space-y-2">
                  <div class="text-[10px] text-gray-400 mb-1">ปีกซ้าย</div>
                  <div
                    v-for="room in leftRooms"
                    :key="room.code"
                    @click="selectRoom(room.code)"
                    class="w-full p-2.5 rounded-xl cursor-pointer transition-all text-xs border-2 text-center"
                    :class="highlightedRoom === room.code
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-105'
                      : 'bg-orange-50 text-orange-800 border-orange-100 hover:border-orange-300'"
                  >
                    <div class="font-mono font-bold">{{ room.code }}</div>
                    <div class="text-[10px] opacity-75 mt-0.5">ห้อง {{ room.roomNumber }}</div>
                  </div>
                </div>

                <!-- Divider -->
                <div class="w-full border-t border-gray-200 my-4" />

                <!-- Right Wing -->
                <div class="w-full space-y-2">
                  <div class="text-[10px] text-gray-400 mb-1">ปีกขวา</div>
                  <div
                    v-for="room in rightRooms"
                    :key="room.code"
                    @click="selectRoom(room.code)"
                    class="w-full p-2.5 rounded-xl cursor-pointer transition-all text-xs border-2 text-center"
                    :class="highlightedRoom === room.code
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-105'
                      : 'bg-orange-50 text-orange-800 border-orange-100 hover:border-orange-300'"
                  >
                    <div class="font-mono font-bold">{{ room.code }}</div>
                    <div class="text-[10px] opacity-75 mt-0.5">ห้อง {{ room.roomNumber }}</div>
                  </div>
                </div>
              </div>

              <!-- Service Core Right -->
              <div class="absolute right-0 top-1/2 -translate-y-1/2 w-16 flex flex-col gap-1 z-10">
                <div class="bg-yellow-100 rounded-lg p-2 text-center text-xs">
                  <div class="text-base">🛗</div>
                  <div class="text-[10px] text-gray-500">ลิฟต์</div>
                </div>
                <div class="bg-yellow-100 rounded-lg p-2 text-center text-xs">
                  <div class="text-base">🧗</div>
                  <div class="text-[10px] text-gray-500">บันได</div>
                </div>
                <div class="bg-blue-100 rounded-lg p-2 text-center text-xs">
                  <div class="text-base">🚻</div>
                  <div class="text-[10px] text-gray-500">ห้องน้ำ</div>
                </div>
              </div>
            </div>

            <!-- Floor Facilities -->
            <div class="mt-4 flex flex-wrap gap-2 justify-center">
              <span class="px-3 py-1.5 bg-gray-50 rounded-xl text-xs text-gray-500 flex items-center gap-1">
                🧗 บันได {{ facilities.stairs }} จุด
              </span>
              <span class="px-3 py-1.5 bg-gray-50 rounded-xl text-xs text-gray-500 flex items-center gap-1">
                🛗 ลิฟต์ {{ facilities.elevators }} ตัว
              </span>
              <span class="px-3 py-1.5 bg-gray-50 rounded-xl text-xs text-gray-500 flex items-center gap-1">
                🚻 {{ facilities.restrooms }}
              </span>
            </div>
          </div>
        </div>

        <!-- Room Detail Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-20">
            <h3 class="font-semibold text-sm mb-3">รายละเอียดห้อง</h3>

            <div v-if="highlightedRoom" class="space-y-3">
              <div class="bg-orange-50 rounded-xl p-3">
                <div class="text-lg font-bold font-mono text-orange-700">{{ highlightedRoom }}</div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ ALL_ROOMS.find(r => r.code === highlightedRoom)?.buildingName }}
                  · ชั้น {{ currentFloor }}
                </div>
              </div>

              <div>
                <div class="text-xs text-gray-400 mb-1">จุดสังเกต</div>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="n in ALL_ROOMS.find(r => r.code === highlightedRoom)?.nearby"
                    :key="n"
                    class="px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs"
                  >
                    {{ n }}
                  </span>
                  <span v-if="!ALL_ROOMS.find(r => r.code === highlightedRoom)?.nearby?.length" class="text-xs text-gray-400">-</span>
                </div>
              </div>

              <RouterLink
                :to="'/route/' + highlightedRoom"
                class="block w-full text-center py-2.5 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 transition"
              >
                🧭 ดูเส้นทาง
              </RouterLink>
            </div>

            <div v-else class="text-center py-8 text-gray-400 text-sm">
              <div class="text-3xl mb-2">👆</div>
              <p>คลิกห้องบนแผนที่<br />เพื่อดูรายละเอียด</p>
            </div>

            <hr class="my-4 border-gray-100" />

            <div class="text-xs text-gray-400 text-center">
              🏫 อาคาร ICT · ชั้น 1-4<br />
              มหาวิทยาลัยพะเยา
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
