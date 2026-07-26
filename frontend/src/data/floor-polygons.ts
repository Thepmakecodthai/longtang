// Floor plan room polygons (SVG coordinates, viewBox 1200x840)
// Source: Mapped from actual floor plan images

export interface RoomPolygon {
  code: string
  points: string // SVG points string "x1,y1 x2,y2 ..."
}

export interface FloorPolygons {
  image: string  // floor plan image filename
  rooms: RoomPolygon[]
}

export const FLOOR_POLYGONS: Record<number, FloorPolygons> = {
  1: {
    image: '1_4.jpg',
    rooms: [
      // Left wing
      { code: 'ICT1112', points: '70,345 125,365 75,520 15,495' },
      { code: 'ICT1111', points: '125,365 175,385 135,545 75,520' },
      { code: 'ICT1110', points: '175,385 235,410 205,570 135,545' },
      { code: 'ICT1109', points: '235,410 300,440 275,600 205,570' },
      { code: 'ICT1108', points: '300,440 440,440 440,600 275,600' },
      { code: 'ICT1107', points: '440,440 555,440 555,600 440,600' },
      // Right wing
      { code: 'ICT1106', points: '620,380 680,380 680,600 620,600' },
      { code: 'ICT1105', points: '680,380 740,380 740,600 680,600' },
      { code: 'ICT1104/1', points: '740,380 810,380 810,600 740,600' },
      { code: 'ICT1104', points: '810,380 875,380 910,600 810,600' },
      { code: 'ICT1103/1', points: '875,380 940,350 990,555 910,600' },
      { code: 'ICT1103', points: '940,350 1000,325 1060,515 990,555' },
      { code: 'ICT1102/1', points: '1000,325 1060,300 1125,480 1060,515' },
      { code: 'ICT1102', points: '1060,300 1100,280 1175,455 1125,480' },
      // Elevator / stair zones (approximate from left/right cores)
    ]
  },
  2: {
    image: '2_3.jpg',
    rooms: [
      { code: 'ICT1247', points: '260,315 390,365 330,510 225,450' },
      { code: 'ICT1241/1', points: '125,675 165,650 180,740 125,715' },
      { code: 'ICT1241', points: '165,650 225,620 260,705 180,740' },
      { code: 'ICT1235/1', points: '225,620 270,600 305,685 260,705' },
      { code: 'ICT1235', points: '270,600 325,585 365,670 305,685' },
      { code: 'ICT1229', points: '325,585 450,580 470,670 365,670' },
      { code: 'ICT1224', points: '450,580 565,580 565,670 470,670' },
      { code: 'ICT1219', points: '620,580 720,580 720,680 620,680' },
      { code: 'ICT1213', points: '720,580 840,570 860,670 720,680' },
      { code: 'ICT1207', points: '840,570 960,520 1020,600 860,670' },
      { code: 'ICT1202', points: '960,520 1060,470 1120,560 1020,600' },
    ]
  },
  3: {
    image: '3_3.jpg',
    rooms: [
      { code: 'ICT1352', points: '395,275 505,310 475,385 370,350' },
      { code: 'ICT1355', points: '605,320 640,320 640,355 605,355' },
      { code: 'ICT1356', points: '640,320 675,320 675,355 640,355' },
      { code: 'ICT1357', points: '675,320 705,320 705,355 675,355' },
      { code: 'ICT1359', points: '565,375 735,375 745,395 650,445 555,395' },
      { code: 'ICT1340', points: '255,605 345,635 300,765 210,725' },
      { code: 'ICT1334', points: '345,635 430,665 405,795 300,765' },
      { code: 'ICT1328', points: '430,665 535,670 535,800 405,795' },
      { code: 'ICT1323', points: '535,670 635,670 635,800 535,800' },
      { code: 'ICT1318', points: '685,625 780,625 795,800 685,800' },
      { code: 'ICT1312', points: '780,625 880,615 915,795 795,800' },
      { code: 'ICT1307', points: '880,615 990,575 1050,745 915,795' },
      { code: 'ICT1302', points: '990,575 1100,535 1165,695 1050,745' },
    ]
  },
  4: {
    image: '4_3.jpg',
    rooms: [
      { code: 'ICT1439', points: '125,455 225,495 180,620 75,570' },
      { code: 'ICT1434', points: '225,495 335,535 315,670 180,620' },
      { code: 'ICT1429', points: '335,535 455,540 455,670 315,670' },
      { code: 'ICT1424', points: '455,540 570,540 570,670 455,670' },
      { code: 'ICT1419/1', points: '630,485 690,485 690,690 630,690' },
      { code: 'ICT1419', points: '690,485 745,485 745,690 690,690' },
      { code: 'ICT1413/1', points: '745,485 805,485 805,690 745,690' },
      { code: 'ICT1413', points: '805,485 860,475 905,690 805,690' },
      { code: 'ICT1407', points: '860,475 970,440 1050,630 905,690' },
      { code: 'ICT1402', points: '970,440 1080,400 1150,600 1050,630' },
    ]
  }
}

// Compute centroid of a polygon for label/text placement
export function polygonCentroid(points: string): { x: number; y: number } {
  const coords = points.split(' ').map(p => {
    const [x, y] = p.split(',').map(Number)
    return { x, y }
  })
  const n = coords.length
  const cx = coords.reduce((s, c) => s + c.x, 0) / n
  const cy = coords.reduce((s, c) => s + c.y, 0) / n
  return { x: cx, y: cy }
}
