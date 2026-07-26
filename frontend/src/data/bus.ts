export interface BusRoute {
  name: string
  direction: string
  stops: string[]
  note: string
}

export const BUS_ROUTES: BusRoute[] = [
  {
    name: 'สาย 1 (สายใน)',
    direction: 'ประตูทางเข้า → โรงพยาบาล → ตึกเรียนรวม → ICT → โรงอาหารกลาง → หอพัก → กลับ',
    stops: ['หน้า มพ.', 'ตึกเรียนรวม PKY', 'อาคาร ICT', 'โรงอาหารกลาง', 'หอพักใน'],
    note: 'วิ่งทุก 15 นาที 06:00-20:00 น.',
  },
  {
    name: 'สาย 2 (สายนอก)',
    direction: 'ประตูทางเข้า → คณะวิศวกรรมศาสตร์ → ICT → คณะบริหาร → กลับ',
    stops: ['หน้า มพ.', 'คณะวิศวกรรม', 'อาคาร ICT', 'คณะบริหาร'],
    note: 'วิ่งทุก 20 นาที 06:30-18:00 น.',
  },
  {
    name: 'สาย 3 (หอพัก)',
    direction: 'หอพักใน → หอพักนอก → ICT → ตึกเรียนรวม → กลับ',
    stops: ['หอพักนอก', 'หอพักใน', 'อาคาร ICT', 'ตึกเรียนรวม PKY'],
    note: 'วิ่งทุก 10 นาที ช่วงเช้า 07:00-09:00 น.',
  },
]

export function getBusToICT(buildingName: string): BusRoute[] {
  return BUS_ROUTES.filter(r => r.stops.includes('อาคาร ICT'))
}
