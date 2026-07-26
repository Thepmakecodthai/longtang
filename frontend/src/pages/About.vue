<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-100">
      <div class="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
        <button @click="router.push('/')" class="text-gray-500 hover:text-orange-600 transition p-1">
          ← กลับ
        </button>
        <h1 class="font-semibold">เกี่ยวกับโปรเจกต์</h1>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <!-- Logo -->
      <div class="text-center py-8">
        <div class="text-6xl mb-4">🧭</div>
        <h1 class="text-2xl font-bold text-gray-900">หลงทาง (Longtang)</h1>
        <p class="text-gray-500 mt-1">AI Agent แปลงรหัสห้องเรียนตึกICT UP</p>
      </div>

      <!-- What -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-semibold mb-2">คืออะไร?</h2>
        <p class="text-sm text-gray-600 leading-relaxed">
          เว็บแอปช่วยนำทางภายในอาคาร ICT มหาวิทยาลัยพะเยา เพียงพิมพ์รหัสห้องจากตารางเรียน
          ระบบจะแปลงเป็นวิธีเดินทางแบบ Step-by-Step ตั้งแต่รถเมล์ที่ต้องนั่ง
          ป้ายที่ต้องลง บันไดที่ต้องขึ้น ไปจนถึงจุดสังเกตหน้าห้อง
        </p>
      </div>

      <!-- For Who -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-semibold mb-2">เพื่อใคร?</h2>
        <ul class="text-sm text-gray-600 space-y-2">
          <li class="flex items-start gap-2">
            <span>🎓</span>
            <span>นิสิตปี 1 ที่เพิ่งเข้ามาเรียน ไม่คุ้นเคยกับผังมหาวิทยาลัย</span>
          </li>
          <li class="flex items-start gap-2">
            <span>🏃</span>
            <span>นักศึกษาที่ต้องเรียนข้ามคณะและกลัวเข้าเรียนสาย</span>
          </li>
          <li class="flex items-start gap-2">
            <span>👨‍🏫</span>
            <span>อาจารย์ผู้สอนที่อยากให้คลาสเริ่มตรงเวลา</span>
          </li>
          <li class="flex items-start gap-2">
            <span>📝</span>
            <span>ทุกคนที่กลัวไปสอบผิดตึก</span>
          </li>
        </ul>
      </div>

      <!-- Current Coverage -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 class="font-semibold mb-2">📍 ความครอบคลุมปัจจุบัน</h2>
        <div class="flex items-center gap-2 mb-3">
          <div class="w-3 h-3 rounded-full bg-green-500" />
          <span class="text-sm font-medium"><strong>อาคาร ICT</strong> ชั้น 1-4</span>
        </div>
        <p class="text-sm text-gray-500">
          กำลังขยายไปยังตึกอื่นๆ ในมหาวิทยาลัยพะเยา
          <br />อาคารที่กำลังพัฒนา: PKY, CE, วิศวกรรมศาสตร์, บริหาร
        </p>
      </div>

      <!-- Contribute -->
      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <h2 class="font-semibold mb-2">🙏 ร่วมพัฒนา</h2>
        <p class="text-sm text-orange-100 leading-relaxed mb-4">
          เป้าหมายของเราคือการสร้างแผนที่นำทางสาธารณูปโภคประจำมหาวิทยาลัย
          ที่ช่วยให้นิสิตทุกคนหาห้องเรียนเจอโดยไม่ต้องหลงทางอีกต่อไป
        </p>
        <p class="text-sm text-orange-100 mb-4">
          ถ้าคุณมีข้อมูลผังอาคารเพิ่มเติม หรืออยากช่วยพัฒนา
          สามารถส่งข้อมูลมาได้เลย!
        </p>
        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-1.5 bg-white/20 rounded-xl text-xs">📐 ส่งผังอาคาร</span>
          <span class="px-3 py-1.5 bg-white/20 rounded-xl text-xs">🐛 รายงานบั๊ก</span>
          <span class="px-3 py-1.5 bg-white/20 rounded-xl text-xs">💡 เสนอไอเดีย</span>
        </div>
      </div>

      <!-- Footer note -->
      <div class="text-center text-xs text-gray-400 py-6">
        โปรเจกต์นี้เป็นส่วนหนึ่งของการพัฒนาเพื่อการศึกษา<br />
        มหาวิทยาลัยพะเยา
      </div>
    </main>
  </div>
</template>
