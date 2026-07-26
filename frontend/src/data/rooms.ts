export interface Room {
  code: string
  building: string
  buildingName: string
  floor: number
  roomNumber: string
  wing: 'left' | 'right'
  nearby: string[]
  facilities: string[]
}

// ICT Building Floor Plans
// Floor 4 details from actual floor plan
const FLOOR_4_ROOMS: Room[] = [
  // Left Wing
  { code: 'ICT1439', building: 'ICT', buildingName: 'อาคาร ICT', floor: 4, roomNumber: '439', wing: 'left', nearby: ['บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได', 'ใกล้ลิฟต์'] },
  { code: 'ICT1434', building: 'ICT', buildingName: 'อาคาร ICT', floor: 4, roomNumber: '434', wing: 'left', nearby: ['บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได', 'ใกล้ลิฟต์'] },
  { code: 'ICT1429', building: 'ICT', buildingName: 'อาคาร ICT', floor: 4, roomNumber: '429', wing: 'left', nearby: ['บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได'] },
  { code: 'ICT1424', building: 'ICT', buildingName: 'อาคาร ICT', floor: 4, roomNumber: '424', wing: 'left', nearby: ['บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได'] },
  // Right Wing
  { code: 'ICT1419/1', building: 'ICT', buildingName: 'อาคาร ICT', floor: 4, roomNumber: '419/1', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได'] },
  { code: 'ICT1419', building: 'ICT', buildingName: 'อาคาร ICT', floor: 4, roomNumber: '419', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้ลิฟต์'] },
  { code: 'ICT1413/1', building: 'ICT', buildingName: 'อาคาร ICT', floor: 4, roomNumber: '413/1', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['กลางตึก'] },
  { code: 'ICT1413', building: 'ICT', buildingName: 'อาคาร ICT', floor: 4, roomNumber: '413', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['กลางตึก'] },
  { code: 'ICT1407', building: 'ICT', buildingName: 'อาคาร ICT', floor: 4, roomNumber: '407', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['กลางตึก'] },
  { code: 'ICT1402', building: 'ICT', buildingName: 'อาคาร ICT', floor: 4, roomNumber: '402', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['กลางตึก'] },
]

// Floor 3 (inferred from Floor 4 layout)
const FLOOR_3_ROOMS: Room[] = [
  { code: 'ICT1339', building: 'ICT', buildingName: 'อาคาร ICT', floor: 3, roomNumber: '339', wing: 'left', nearby: ['บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได', 'ใกล้ลิฟต์'] },
  { code: 'ICT1334', building: 'ICT', buildingName: 'อาคาร ICT', floor: 3, roomNumber: '334', wing: 'left', nearby: ['บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได'] },
  { code: 'ICT1329', building: 'ICT', buildingName: 'อาคาร ICT', floor: 3, roomNumber: '329', wing: 'left', nearby: ['บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['กลางตึก'] },
  { code: 'ICT1324', building: 'ICT', buildingName: 'อาคาร ICT', floor: 3, roomNumber: '324', wing: 'left', nearby: ['บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['กลางตึก'] },
  // Right Wing
  { code: 'ICT1319', building: 'ICT', buildingName: 'อาคาร ICT', floor: 3, roomNumber: '319', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได'] },
  { code: 'ICT1313', building: 'ICT', buildingName: 'อาคาร ICT', floor: 3, roomNumber: '313', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได'] },
  { code: 'ICT1307', building: 'ICT', buildingName: 'อาคาร ICT', floor: 3, roomNumber: '307', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['กลางตึก'] },
  { code: 'ICT1302', building: 'ICT', buildingName: 'อาคาร ICT', floor: 3, roomNumber: '302', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['กลางตึก'] },
]

// Floor 2
const FLOOR_2_ROOMS: Room[] = [
  { code: 'ICT1239', building: 'ICT', buildingName: 'อาคาร ICT', floor: 2, roomNumber: '239', wing: 'left', nearby: ['บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได', 'ใกล้ลิฟต์'] },
  { code: 'ICT1234', building: 'ICT', buildingName: 'อาคาร ICT', floor: 2, roomNumber: '234', wing: 'left', nearby: ['บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได'] },
  { code: 'ICT1229', building: 'ICT', buildingName: 'อาคาร ICT', floor: 2, roomNumber: '229', wing: 'left', nearby: ['บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['กลางตึก'] },
  { code: 'ICT1224', building: 'ICT', buildingName: 'อาคาร ICT', floor: 2, roomNumber: '224', wing: 'left', nearby: ['บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['กลางตึก'] },
  // Right Wing
  { code: 'ICT1219', building: 'ICT', buildingName: 'อาคาร ICT', floor: 2, roomNumber: '219', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได'] },
  { code: 'ICT1213', building: 'ICT', buildingName: 'อาคาร ICT', floor: 2, roomNumber: '213', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้บันได'] },
  { code: 'ICT1207', building: 'ICT', buildingName: 'อาคาร ICT', floor: 2, roomNumber: '207', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['กลางตึก'] },
  { code: 'ICT1203', building: 'ICT', buildingName: 'อาคาร ICT', floor: 2, roomNumber: '203', wing: 'right', nearby: ['บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['กลางตึก'] },
]

// Floor 1 (Ground Floor - different layout, has main entrance)
const FLOOR_1_ROOMS: Room[] = [
  { code: 'ICT1107', building: 'ICT', buildingName: 'อาคาร ICT', floor: 1, roomNumber: '107', wing: 'left', nearby: ['ทางเข้าหลัก', 'บันไดซ้าย', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้ทางเข้า', 'ใกล้ลิฟต์'] },
  { code: 'ICT1104', building: 'ICT', buildingName: 'อาคาร ICT', floor: 1, roomNumber: '104', wing: 'left', nearby: ['ทางเข้าหลัก', 'บันไดซ้าย', 'ลิฟต์'], facilities: ['ใกล้ทางเข้า'] },
  // Right Wing
  { code: 'ICT1101', building: 'ICT', buildingName: 'อาคาร ICT', floor: 1, roomNumber: '101', wing: 'right', nearby: ['ทางเข้าหลัก', 'บันไดขวา', 'ลิฟต์', 'ห้องน้ำ'], facilities: ['ใกล้ทางเข้า', 'ใกล้บันได'] },
  { code: 'ICT1102', building: 'ICT', buildingName: 'อาคาร ICT', floor: 1, roomNumber: '102', wing: 'right', nearby: ['ทางเข้าหลัก', 'บันไดขวา', 'ลิฟต์'], facilities: ['กลางตึก'] },
  { code: 'ICT1103', building: 'ICT', buildingName: 'อาคาร ICT', floor: 1, roomNumber: '103', wing: 'right', nearby: ['ทางเข้าหลัก', 'บันไดขวา'], facilities: ['ใกล้ทางเข้า'] },
]

// General facilities
const FLOOR_FACILITIES: Record<number, { stairs: number; elevators: number; restrooms: string }> = {
  1: { stairs: 2, elevators: 2, restrooms: 'ข้างบันไดซ้ายและขวา' },
  2: { stairs: 2, elevators: 2, restrooms: 'ข้างบันไดซ้ายและขวา' },
  3: { stairs: 2, elevators: 2, restrooms: 'ข้างบันไดซ้ายและขวา' },
  4: { stairs: 2, elevators: 2, restrooms: 'ข้างบันไดซ้ายและขวา' },
}

export const ALL_ROOMS: Room[] = [
  ...FLOOR_1_ROOMS,
  ...FLOOR_2_ROOMS,
  ...FLOOR_3_ROOMS,
  ...FLOOR_4_ROOMS,
]

export function findRoom(code: string): Room | undefined {
  const normalized = code.toUpperCase().replace(/[\s-]/g, '')
  return ALL_ROOMS.find(r => r.code === normalized)
}

export function getRoomsByFloor(floor: number): Room[] {
  return ALL_ROOMS.filter(r => r.floor === floor)
}

export function getFloorFacilities(floor: number) {
  return FLOOR_FACILITIES[floor] || FLOOR_FACILITIES[1]
}
