import { findRoom, getFloorFacilities } from '@/data/rooms'
import { BUS_ROUTES } from '@/data/bus'
import type { Room } from '@/data/rooms'

export interface DirectionStep {
  icon: string
  text: string
  detail?: string
}

export interface RouteResult {
  room: Room
  steps: DirectionStep[]
  busInfo: string[]
  busStop: string
  estimatedTime: string
  facilities: string[]
  nearbyLandmarks: string[]
}

export function generateRoute(code: string): RouteResult | null {
  const room = findRoom(code)
  if (!room) return null

  const steps: DirectionStep[] = []
  const busInfo: string[] = []
  const landmarks: string[] = []

  // Step 1: Bus info
  if (room.floor >= 1) {
    const buses = BUS_ROUTES.filter((r: { stops: string[] }) => r.stops.includes('อาคาร ICT'))
    buses.forEach((b: { name: string; note: string }) => {
      busInfo.push(`${b.name}: ${b.note}`)
    })
    steps.push({
      icon: '🚌',
      text: 'นั่งรถเมล์ มพ. สายที่ผ่านอาคาร ICT',
      detail: buses.map((b: { name: string; direction: string }) => `• ${b.name} — ${b.direction}`).join('\n'),
    })
  }

  // Step 2: Entrance
  if (room.floor === 1) {
    steps.push({
      icon: '🚪',
      text: 'เข้าทางประตูหลักอาคาร ICT',
      detail: 'ประตูทางเข้าด้านหน้าติดถนนหลัก',
    })
  } else {
    steps.push({
      icon: '🚪',
      text: 'เข้าทางประตูหลักอาคาร ICT',
      detail: 'ประตูทางเข้าด้านหน้าติดถนนหลัก',
    })
  }

  // Step 3: Floor navigation
  if (room.floor > 1) {
    const useStairs = room.wing === 'left' ? 'บันได/ลิฟต์ฝั่งซ้าย' : 'บันได/ลิฟต์ฝั่งขวา'
    steps.push({
      icon: '🛗',
      text: `ขึ้นไปชั้น ${room.floor} ทาง${useStairs}`,
      detail: `ใช้บันไดหรือลิฟต์ฝั่ง${room.wing === 'left' ? 'ซ้าย' : 'ขวา'}ของอาคาร`,
    })
  }

  // Step 4: Wing direction
  steps.push({
    icon: room.wing === 'left' ? '⬅️' : '➡️',
    text: `เดินไปปีก${room.wing === 'left' ? 'ซ้าย' : 'ขวา'}ของอาคาร`,
    detail: `เมื่อถึงชั้น ${room.floor} ให้เดินไป${room.wing === 'left' ? 'ซ้าย' : 'ขวา'}ตามทางเดินหลัก`,
  })

  // Step 5: Room landmarks
  if (room.nearby.length > 0) {
    landmarks.push(...room.nearby)
    steps.push({
      icon: '📍',
      text: `มองหาห้อง ${room.code}`,
      detail: `อยู่ถัดจาก${room.nearby.join(' และ ')}`,
    })
  }

  // Step 6: Final step
  steps.push({
    icon: '✅',
    text: `ถึงหน้าห้อง ${room.code} แล้ว!`,
    detail: `ชั้น ${room.floor} ปีก${room.wing === 'left' ? 'ซ้าย' : 'ขวา'}`,
  })

  // Estimated time
  const timeFromMainGate = room.floor <= 2 ? '8-10' : '10-12'
  const timeFromInside = room.floor <= 2 ? '3-5' : '5-7'

  const facilities = getFloorFacilities(room.floor)
  const facilityList = [
    `บันได ${facilities.stairs} จุด`,
    `ลิฟต์ ${facilities.elevators} ตัว`,
    `ห้องน้ำ: ${facilities.restrooms}`,
  ]

  return {
    room,
    steps,
    busInfo,
    busStop: 'ป้ายหน้า มพ. (ตรงข้ามประตูทางเข้า)',
    estimatedTime: `จากป้ายรถเมล์ ~${timeFromMainGate} นาที · จากล็อบบี้ตึก ~${timeFromInside} นาที`,
    facilities: facilityList,
    nearbyLandmarks: landmarks,
  }
}

export function parseRoomCode(input: string): { valid: boolean; building?: string; floor?: number; number?: string; error?: string } {
  const normalized = input.toUpperCase().replace(/[\s-]/g, '')

  // Match patterns like ICT1107, ICT 1107, ict1107
  const match = normalized.match(/^([A-Z]+)(\d)(\d{2,3})$/)
  if (!match) {
    return { valid: false, error: 'รูปแบบรหัสห้องไม่ถูกต้อง (เช่น ICT1107)' }
  }

  const building = match[1]
  const floor = parseInt(match[2])
  const number = match[3]

  if (!['ICT'].includes(building)) {
    return { valid: false, error: `ไม่พบอาคาร "${building}" ในระบบ` }
  }

  if (floor < 1 || floor > 4) {
    return { valid: false, error: 'ชั้นต้องอยู่ระหว่าง 1-4' }
  }

  return { valid: true, building, floor, number }
}
