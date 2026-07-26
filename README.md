# 🧭 หลงทาง (Longtang)

**AI Agent แปลงรหัสห้องเรียนตึกICT UP เป็นวิธีเดินทาง Step-by-Step ถึงหน้าห้องใน 3 วินาที**

เว็บแอปสำหรับนิสิตมหาวิทยาลัยพะเยา — แค่พิมพ์รหัสห้อง (เช่น ICT1107) ก็รู้ทันทีว่ารถเมล์สายไหนผ่าน ลงป้ายไหน ขึ้นบันไดฝั่งไหน และมีจุดสังเกตอะไรบ้าง

---

## 🚀 Demo เร็ว

| URL | |
|-----|---|
| **เว็บ**: | https://longtang-i1x.pages.dev |
| **GitHub**: | https://github.com/Thepmakecodthai/longtang |
| **ลองพิมพ์**: | `ICT1107`, `ICT1402`, `ICT1203` |

---

## 📋 ฟีเจอร์หลัก (MVP)

- [x] **🔍 ค้นหารหัสห้อง** — พิมพ์รหัสห้องย่อ (เช่น ICT1107) → แสดงเส้นทางทันที
- [x] **🚌 บอกสายรถเมล์ มพ.** — สายรถเมล์ที่ผ่านอาคาร ICT + ป้ายที่ต้องลง
- [x] **🚶 Step-by-Step** — ทางเข้า → บันได/ลิฟต์ฝั่งไหน → จุดสังเกต → หน้าห้อง
- [x] **⏱️ ประมาณเวลาเดินทาง** — จากป้ายรถเมล์ + จากล็อบบี้ตึก
- [x] **📍 จุดสังเกต (Text Landmark)** — ลิฟต์ บันได ห้องน้ำ จุดสังเกตใกล้ห้อง
- [x] **🔄 Manual Override** — เลือกตึก/ชั้น/ห้องเองผ่าน Dropdown (กัน AI Hallucination)
- [x] **🖼️ แผนที่ 2D โต้ตอบ** — ผังตึก ICT ทุกชั้น (1-4) คลิกดูห้อง + รายละเอียด
- [x] **📋 ประวัติค้นหา** — จำรายการค้นหาล่าสุด (localStorage)
- [x] **⚠️ แจ้งเส้นทางผิด** — Crowdsourced Reporting
- [x] **🔗 แชร์เส้นทาง** — ส่งลิงก์ให้เพื่อน

---

## 🛠️ Tech Stack

| ชั้น | เทคโนโลยี |
|------|-----------|
| **Frontend** | Vue 3 + Vite + TypeScript |
| **Styling** | Tailwind CSS v4 |
| **State** | Pinia |
| **Routing** | Vue Router |
| **Mapping** | Leaflet.js (แผนที่ 2D โต้ตอบ) |
| **Deploy** | Cloudflare Pages (Static) |

> **Design Decision:** ไม่มี backend สำหรับ MVP — ข้อมูลห้องทั้งหมดเป็น mock data ฝั่ง frontend ทำให้ deploy เป็น static site บน Cloudflare Pages ได้ทันที ไม่ต้องจัดการ database

---

## 🏗️ โครงสร้างโปรเจกต์

```
longtang/frontend/
├── src/
│   ├── pages/
│   │   ├── Home.vue          # 🔍 หน้าค้นหา + Hero
│   │   ├── RouteResult.vue   # 🚶 หน้าแสดงเส้นทาง Step-by-Step
│   │   ├── FloorMap.vue      # 🗺️ แผนที่ 2D โต้ตอบ (ICT ทุกชั้น)
│   │   └── About.vue         # 📋 เกี่ยวกับโปรเจกต์
│   ├── data/
│   │   ├── rooms.ts          # 📐 ฐานข้อมูลห้อง ICT ทั้ง 4 ชั้น
│   │   └── bus.ts            # 🚌 ข้อมูลสายรถเมล์ มพ.
│   ├── engine/
│   │   └── route-parser.ts   # 🤖 AI Engine: แยกวิเคราะห์รหัสห้อง → เส้นทาง
│   ├── stores/
│   │   └── route.ts          # 📦 Pinia store + ประวัติการค้นหา
│   ├── router/
│   │   └── index.ts          # 🧭 Vue Router
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── public/
    └── favicon.svg
```

---

## 🧠 Room Code Parser Engine

ห้องเรียนที่ มพ. ใช้รหัสย่อในรูปแบบ: **`ICT[ชั้น][เลขห้อง]`**
- ตัวอย่าง: `ICT1107` = อาคาร ICT, **ชั้น 1**, ห้อง **107**
- ตัวอย่าง: `ICT1402` = อาคาร ICT, **ชั้น 4**, ห้อง **402**

Engine (`route-parser.ts`) แยกวิเคราะห์:
1. **parseRoomCode()** — ตรวจสอบรูปแบบรหัสห้อง (regex validation)
2. **generateRoute()** — สร้างเส้นทางแบบ Step-by-Step:
   - 🚌 บอกสายรถเมล์ที่ผ่าน ICT
   - 🚪 ทางเข้าอาคาร
   - 🛗 บันได/ลิฟต์ฝั่งซ้ายหรือขวา
   - ⬅️/➡️ เดินไปปีกซ้ายหรือขวา
   - 📍 จุดสังเกตใกล้ห้อง
   - ✅ ถึงหน้าห้อง

---

## 🏫 ข้อมูลห้อง ICT

### ชั้น 1 (Ground Floor)
| ห้อง | ปีก |
|------|-----|
| ICT1101, ICT1102, ICT1103 | ขวา |
| ICT1104, ICT1107 | ซ้าย |

### ชั้น 2
| ห้อง | ปีก |
|------|-----|
| ICT1203, ICT1207, ICT1213, ICT1219 | ขวา |
| ICT1224, ICT1229, ICT1234, ICT1239 | ซ้าย |

### ชั้น 3
| ห้อง | ปีก |
|------|-----|
| ICT1302, ICT1307, ICT1313, ICT1319 | ขวา |
| ICT1324, ICT1329, ICT1334, ICT1339 | ซ้าย |

### ชั้น 4
| ห้อง | ปีก |
|------|-----|
| ICT1402, ICT1407, ICT1413, ICT1413/1, ICT1419, ICT1419/1 | ขวา |
| ICT1424, ICT1429, ICT1434, ICT1439 | ซ้าย |

> **แต่ละชั้นมี:** บันได 2 จุด · ลิฟต์ 2 ตัว · ห้องน้ำข้างบันไดซ้ายและขวา

---

## 🚌 รถเมล์ มพ. ที่ผ่านอาคาร ICT

| สาย | เส้นทาง |
|-----|---------|
| **สาย 1 (สายใน)** | ประตูทางเข้า → โรงพยาบาล → ตึกเรียนรวม → ICT → โรงอาหารกลาง → หอพัก → กลับ |
| **สาย 2 (สายนอก)** | ประตูทางเข้า → คณะวิศวกรรมศาสตร์ → ICT → คณะบริหาร → กลับ |
| **สาย 3 (หอพัก)** | หอพักใน → หอพักนอก → ICT → ตึกเรียนรวม → กลับ |
| **สาย 4 (ด่วน)** | หน้า มพ. → ICT → โรงพยาบาล → กลับ |

---

## 🚀 วิธีรัน Local

```bash
cd frontend
npm install --include=dev
npm run dev
# → http://localhost:5173
```

### Build for Production

```bash
npm run build
# → dist/ folder
```

### Preview Build

```bash
npm run preview
```

---

## 🌐 วิธี Deploy

### Deploy ไป Cloudflare Pages (อัตโนมัติ)

```bash
cd frontend
npx wrangler pages project create longtang --production-branch=main
npx wrangler pages deploy dist --project-name=longtang --branch=main
```

### หรือ Deploy ด้วย GitHub Actions (แนะนำ)

เพิ่ม secret ใน GitHub:
- `CLOUDFLARE_API_TOKEN` — CF API token
- `CLOUDFLARE_ACCOUNT_ID` — Account ID

แล้วใช้ workflow ตัวอย่าง:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install --include=dev
      - run: npm run build
      - run: npx wrangler pages deploy dist --project-name=longtang --branch=main
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

---

## 📐 ข้อมูลผังอาคาร (จาก Floor Plan)

ผังตึก ICT อ้างอิงจากเอกสาร Floor Plan จริง:
- **ชั้น 4:** ICT1402 → ICT1439 (10 ห้อง, 2 ปีก)
- **ชั้น 3:** ICT1302 → ICT1339 (8 ห้อง, 2 ปีก)
- **ชั้น 2:** ICT1203 → ICT1239 (8 ห้อง, 2 ปีก)
- **ชั้น 1:** ICT1101 → ICT1107 (5 ห้อง + ทางเข้าหลัก)

> กำลังขยายข้อมูลไปยังอาคารอื่นๆ (PKY, CE, วิศวกรรม, บริหาร)

---

## 🎯 Hackathon Demo Flow

1. เปิด https://longtang-i1x.pages.dev
2. พิมพ์ `ICT1107` ในช่องค้นหา
3. กด Enter → ดูผล Step-by-Step ที่ละเอียด
4. กด "ดูแผนที่ชั้น 1" → แผนที่ 2D โต้ตอบพร้อมปักหมุด
5. คลิกที่ห้องอื่นบนแผนที่ → ดูรายละเอียด
6. กด "แจ้งเส้นทางผิด" → Crowdsourced Report

**โมเมนต์เดโม:** พิมพ์รหัสห้องขึ้นจอ → AI Agent แปลงเป็นแผนการเดินทางละเอียดยันหน้าห้องภายใน 3 วินาที

---

## 📝 Roadmap

- [ ] ขยายข้อมูลไปยังอาคาร PKY, CE, วิศวกรรม, บริหาร
- [ ] ระบบ Login + บันทึกประวัติข้ามเครื่อง
- [ ] ภาษาไทย / อังกฤษ
- [ ] Campus Event Navigator (ปักหมุดกิจกรรม)
- [ ] Emergency Panic Button
- [ ] Crowdsourced Landmark Updater
- [ ] ระบบ B2B / ร้านค้าปักหมุดแนะนำ

---

## 🙏 ร่วมพัฒนา

เป้าหมายของโปรเจกต์นี้คือ **"ขอเชิญชวนกรรมการและนิสิต มพ. ร่วมทดสอบใช้งานแผนที่ 2D นำทางตึกเรียนนำร่อง พร้อมเปิดรับข้อมูลผังอาคารเพิ่มเติมเพื่อยกระดับเป็นระบบแผนที่สาธารณูปโภคประจำมหาวิทยาลัย"**

ถ้าคุณมีข้อมูลผังอาคารเพิ่มเติม หรืออยากช่วยพัฒนา — ยินดีครับ!

---

**🧭 หลงทาง (Longtang)** — สำหรับนิสิต มหาวิทยาลัยพะเยา
