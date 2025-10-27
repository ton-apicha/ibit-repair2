# 🔧 ระบบซ่อมเครื่องขุดบิทคอยน์ ASIC (ASIC Miner Repair Management System) - Version 2

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748)](https://www.prisma.io/)
[![Railway](https://img.shields.io/badge/Railway-Deployed-blue)](https://railway.com)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-green)](https://github.com)

## 📋 ภาพรวมของระบบ

ระบบจัดการซ่อมเครื่องขุดบิทคอยน์ ASIC แบบครบวงจร ครอบคลุมตั้งแต่การรับเครื่องจากลูกค้า การติดตามสถานะการซ่อม การจัดการอะไหล่ ไปจนถึงการปิดงานและส่งคืนลูกค้า พร้อม UI/UX ที่ออกแบบมาเพื่อ Mobile-First

> **📊 สถานะปัจจุบัน**: ระบบ Production Ready พร้อมใช้งานบน Railway + MySQL ✅  
> **🎯 เป้าหมาย**: พัฒนาเพื่อใช้งานจริงในร้านซ่อมเครื่องขุด ASIC ทุกขนาด  
> **📱 Mobile-First**: ออกแบบมาสำหรับใช้งานบนมือถือเป็นหลัก  
> **☁️ Cloud Ready**: Deploy บน Railway พร้อม MySQL Database

### ✨ จุดเด่น
- 📱 **Mobile-First Design** - ใช้งานบนมือถือได้คล่องแคล่ว
- 🎯 **ครบวงจร** - ครอบคลุมทุกขั้นตอนการซ่อม
- 📊 **รายงานละเอียด** - ติดตามการใช้อะไหล่และสถิติต่างๆ
- 🔒 **ระบบสิทธิ์** - แยกสิทธิ์ตามบทบาท (Admin, Manager, Technician, Receptionist)
- 💬 **คอมเมนต์ภาษาไทย** - เข้าใจง่าย แก้ไขง่าย สำหรับนักพัฒนาทุกระดับ
- ☁️ **Cloud Deploy** - พร้อมใช้งานบน Railway + MySQL

---

## 🏗️ สถาปัตยกรรม (Architecture)

```
┌──────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│                 Next.js 14 + React + Tailwind            │
│                    https://ibit-repair2.vercel.app       │
└─────────────────────┬────────────────────────────────────┘
                      │ REST API
┌─────────────────────▼────────────────────────────────────┐
│              Backend API Server                          │
│          Express + TypeScript + Prisma                   │
│              https://ibit-repair2-production.up.railway.app
└─────────────────────┬────────────────────────────────────┘
                      │ SQL
┌─────────────────────▼────────────────────────────────────┐
│                MySQL 8.0 Database                       │
│              Railway MySQL Service                       │
│                    cloud.mysql.com:3306                 │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
| เทคโนโลยี | รายละเอียด |
|-----------|-----------|
| **Next.js 14+** | React framework with App Router, Server Components |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | Re-usable components built on Radix UI |
| **React Hook Form + Zod** | Form validation with TypeScript support |
| **Zustand** | Lightweight state management |
| **Axios** | HTTP client for API calls |

### Backend
| เทคโนโลยี | รายละเอียด |
|-----------|-----------|
| **Node.js 20+** | JavaScript runtime |
| **Express** | Fast, minimal web framework |
| **TypeScript** | Type-safe development |
| **Prisma ORM** | Next-generation ORM for database |
| **JWT** | JSON Web Token authentication |
| **bcrypt** | Password hashing |
| **MySQL2** | MySQL database driver |

### Database
| เทคโนโลยี | รายละเอียด |
|-----------|-----------|
| **MySQL 8.0** | Powerful, open-source relational database |
| **Railway MySQL** | Managed MySQL service on Railway |

### Cloud & Deployment
| เทคโนโลยี | รายละเอียด |
|-----------|-----------|
| **Railway** | Backend hosting + MySQL database |
| **Vercel** | Frontend hosting |
| **GitHub** | Source code repository |

### Others
| เทคโนโลยี | รายละเอียด |
|-----------|-----------|
| **Puppeteer** | PDF generation และ automated testing |
| **MySQL Workbench** | Database management GUI |

---

## 📦 การติดตั้งและรันโปรเจค

### ข้อกำหนดเบื้องต้น (Prerequisites)

สำหรับการพัฒนาบน **Windows 11** ติดตั้งโปรแกรมต่อไปนี้:

1. ✅ **Node.js 20 LTS** - [ดาวน์โหลด](https://nodejs.org/)
2. ✅ **MySQL 8.0** - [ดาวน์โหลด](https://dev.mysql.com/downloads/mysql/)
3. ✅ **MySQL Workbench** - [ดาวน์โหลด](https://dev.mysql.com/downloads/workbench/) **(เครื่องมือหลักสำหรับจัดการ Database)**
4. ✅ **Git** - [ดาวน์โหลด](https://git-scm.com/)
5. 💡 **VS Code** - [ดาวน์โหลด](https://code.visualstudio.com/) (แนะนำ)

> **⚠️ สำคัญ**: ระบบใช้ **MySQL 8.0 + MySQL Workbench** ทั้ง Development และ Production  
> - ❌ **ไม่ใช้ PostgreSQL**  
> - ❌ **ไม่ใช้ Prisma Studio** (ใช้ MySQL Workbench แทน)

---

### 🚀 ขั้นตอนการติดตั้ง

#### 1️⃣ Clone โปรเจค

```bash
git clone https://github.com/ton-apicha/ibit-repair2.git
cd ibit-repair2
```

---

#### 2️⃣ Setup MySQL Database

**A. หลังติดตั้ง MySQL แล้ว ตรวจสอบว่า Service ทำงานอยู่:**

```powershell
# PowerShell
Get-Service | Where-Object { $_.Name -like "*mysql*" }
```

**B. สร้าง Database:**

```powershell
# เชื่อมต่อ MySQL (ใช้ password ที่ตั้งตอนติดตั้ง)
mysql -u root -p

# สร้าง database
CREATE DATABASE ibit_repair;
CREATE DATABASE ibit_repair_test;

# ออกจาก mysql
EXIT;
```

**หรือใช้ MySQL Workbench** (GUI) สร้าง database ชื่อ `ibit_repair`

---

#### 3️⃣ Setup Backend

```powershell
# เข้าไปในโฟลเดอร์ backend
cd backend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env
copy env.example .env
```

**แก้ไขไฟล์ `backend/.env`:**

```env
# Database Connection (เปลี่ยน password เป็นของคุณ)
DATABASE_URL="mysql://root:admin123@localhost:3306/ibit_repair"

# JWT Configuration
JWT_SECRET="ibit-repair-secret-key-2025-change-in-production"
JWT_EXPIRES_IN=86400

# Server Configuration
PORT=4000
NODE_ENV="development"
```

**สร้าง Database Schema และ Seed ข้อมูล:**

```powershell
# Generate Prisma Client
npx prisma generate

# Push schema ไปที่ database
npx prisma db push

# Seed ข้อมูลเริ่มต้น (Users, Brands, Models, Parts, Warranties)
npm run seed

# รัน Development Server
npm run dev
```

✅ **Backend พร้อมใช้งาน:** `http://localhost:4000`

---

#### 4️⃣ Setup Frontend (เปิด Terminal ใหม่)

```powershell
# เข้าไปในโฟลเดอร์ frontend
cd frontend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env.local
copy env.example .env.local
```

**ตรวจสอบไฟล์ `frontend/.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**รัน Development Server:**

```powershell
npm run dev
```

✅ **Frontend พร้อมใช้งาน:** `http://localhost:3000`

---

### 🎯 เข้าใช้งานระบบ

1. เปิด Browser ไปที่: **http://localhost:3000**
2. Login ด้วยบัญชีทดสอบ:

| บทบาท | Username | Password | คำอธิบาย |
|--------|----------|----------|----------|
| 👨‍💼 **Admin** | `admin` | `admin123` | เข้าถึงทุกอย่าง |
| 🔧 **Technician** | `technician1` | `tech123` | ช่างซ่อม |

---

## 📁 โครงสร้างโปรเจค

```
ibit-repair2/
├── backend/                    # Express API + Prisma
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (MySQL)
│   │   └── seed.ts            # ข้อมูลเริ่มต้น
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Authentication, etc.
│   │   ├── utils/             # Helper functions
│   │   └── server.ts          # Express server
│   ├── .env                   # Environment variables (สร้างเอง)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Next.js Application
│   ├── app/
│   │   ├── (auth)/            # Auth pages (login)
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   ├── store/                 # Zustand stores
│   ├── lib/                   # Utilities
│   ├── .env.local             # Environment variables (สร้างเอง)
│   ├── package.json
│   └── next.config.js
│
├── .gitignore                 # Git ignore patterns
├── README.md                  # เอกสารนี้
└── RAILWAY-DEPLOY-GUIDE.md   # คู่มือ Deploy บน Railway
```

---

## 🎯 ฟีเจอร์หลัก

### ✅ Phase 1: MVP (Core Features) - พัฒนาเสร็จแล้ว

| ฟีเจอร์ | สถานะ | รายละเอียด | API Endpoints |
|---------|-------|-----------|---------------|
| 🔐 **Authentication** | ✅ | Login, JWT, Role-based access control | `/api/auth/*` |
| 👥 **Customer Management** | ✅ | CRUD ข้อมูลลูกค้า, ค้นหา, ประวัติงานซ่อม | `/api/customers/*` |
| ⚙️ **Miner Models Database** | ✅ | จัดการยี่ห้อและรุ่นเครื่องขุด (29 รุ่นในระบบ) | `/api/brands/*`, `/api/models/*` |
| 👨‍🔧 **Technician Management** | ✅ | จัดการช่างและมอบหมายงาน | `/api/users/*` |
| 🔧 **Spare Parts Inventory** | ✅ | จัดการสต๊อกอะไหล่, แจ้งเตือนสต๊อกต่ำ | `/api/parts/*` |
| 🛡️ **Warranty Profiles** | ✅ | โปรไฟล์การรับประกัน (7, 30, 90 วัน) | `/api/warranties/*` |
| 📋 **Job/Ticket System** | ✅ | สร้างงาน, ติดตามสถานะ, Workflow ครบวงจร | `/api/jobs/*` |
| 💰 **Finance & Billing** | ✅ | ใบเสนอราคา, Invoice, ชำระเงิน | `/api/quotations/*`, `/api/transactions/*` |
| 📊 **Reports & Analytics** | ✅ | รายงานการใช้อะไหล่, สถิติงานซ่อม | `/api/reports/*` |
| 📄 **PDF Generation** | ✅ | สร้าง PDF ใบเสนอราคา/ใบเสร็จ | `/api/pdf/*` |

### 🔄 Phase 2: Future Enhancements

- [ ] ระบบแจ้งเตือนอัตโนมัติ (SMS/Email/LINE)
- [ ] QR Code & Barcode สำหรับ tracking
- [ ] Multi-Branch Support (หลายสาขา)
- [ ] Customer Portal (ลูกค้าเช็คสถานะเอง)
- [ ] PWA (Progressive Web App) - ใช้งานแบบ App
- [ ] Knowledge Base - คู่มือซ่อมและ troubleshooting
- [ ] Advanced Analytics & Dashboard

---

## 🔄 Workflow การซ่อม

```mermaid
graph TD
    A[1. รับเครื่อง] --> B[2. ตรวจสอบ/วินิจฉัย]
    B --> C[3. สร้างใบเสนอราคา]
    C --> D{ลูกค้าอนุมัติ?}
    D -->|ใช่| E[4. เบิกอะไหล่และซ่อม]
    D -->|ไม่| F[ยกเลิกงาน]
    E --> G[5. ทดสอบเครื่อง]
    G --> H{ผ่านการทดสอบ?}
    H -->|ใช่| I[6. พร้อมส่งมอบ]
    H -->|ไม่| E
    I --> J[7. แจ้งลูกค้า]
    J --> K[8. รับเงิน + ส่งคืน]
    K --> L[9. ปิดงาน]
```

---

## 🗄️ Database Schema (สรุป)

```
Users (Admin, Manager, Technician, Receptionist)
  ├── Roles & Permissions
  └── JWT Authentication

Customers (ข้อมูลลูกค้า)
  └── Jobs (งานซ่อม)

Brands (ยี่ห้อเครื่องขุด)
  └── MinerModels (รุ่นเครื่อง)
        └── Jobs

Parts (อะไหล่)
  ├── Stock Management
  └── JobParts (อะไหล่ที่ใช้ในงาน)

Jobs (งานซ่อม)
  ├── RepairRecords (บันทึกการซ่อม)
  ├── JobImages (รูปภาพ)
  ├── Quotations (ใบเสนอราคา)
  ├── Transactions (ชำระเงิน)
  └── WarrantyProfile

ActivityLogs (บันทึกการทำงาน)
```

---

## 🛠️ เครื่องมือจัดการ Database

### 🎨 MySQL Workbench (GUI - เครื่องมือหลัก)

MySQL Workbench เป็นเครื่องมือ GUI สำหรับจัดการ MySQL ที่เราใช้ทั้ง Development และ Production

#### การเชื่อมต่อ:
1. เปิด MySQL Workbench
2. **Add New Connection:**
   - **Connection Name**: iBit Repair 2 (Development)
   - **Hostname**: localhost
   - **Port**: 3306
   - **Username**: root
   - **Password**: admin123 (หรือรหัสผ่านที่คุณตั้งไว้)
   - **Default Schema**: ibit_repair

#### การใช้งาน:
- **ดูข้อมูล**: เลือก Database → Tables → คลิกขวาที่ Table → Select Rows
- **รัน SQL Query**: คลิกไอคอน SQL หรือกด Ctrl+Enter
- **สร้าง Backup**: Server → Data Export
- **Import/Export**: Table → Table Data Export Wizard

#### ตัวอย่าง SQL Queries:
```sql
-- ดูข้อมูล Users ทั้งหมด
SELECT * FROM users;

-- ดูจำนวน Customer
SELECT COUNT(*) FROM customers;

-- ดู Parts ที่สต๊อกต่ำ
SELECT * FROM parts WHERE stockQty < minStockQty;

-- ดู Jobs ที่กำลังซ่อม
SELECT * FROM jobs WHERE status = 'IN_REPAIR';
```

---

## 🚀 การ Deploy

### 💻 Development (Local)
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### ☁️ Production (Railway + Vercel) - Auto Deploy

#### วิธี Deploy อัตโนมัติ

1. **Railway Backend + MySQL**
   - เข้าไปที่: https://railway.com/project/9e2e3cfa-732e-4676-ae82-f049a570c587
   - ระบบจะ auto deploy เมื่อ push code ไป GitHub

2. **Vercel Frontend**
   - เข้าไปที่: https://vercel.com
   - เชื่อมต่อกับ GitHub repository
   - ระบบจะ auto deploy เมื่อ push code

3. **Environment Variables**
   - ตั้งค่าใน Railway และ Vercel
   - ดูรายละเอียด: [RAILWAY-DEPLOY-GUIDE.md](./RAILWAY-DEPLOY-GUIDE.md)

4. **Push to GitHub**
   ```bash
   git push origin master
   ```
   - Railway และ Vercel จะ auto deploy

**Production URLs:**
- **Frontend**: https://ibit-repair2.vercel.app
- **Backend**: https://ibit-repair2-production.up.railway.app
- **Railway Project**: https://railway.com/project/9e2e3cfa-732e-4676-ae82-f049a570c587
- **GitHub Repository**: https://github.com/ton-apicha/ibit-repair2

---

## 📚 คำแนะนำสำหรับผู้พัฒนา

### 📝 การเขียนโค้ด
- ✅ **Comment ภาษาไทย** - เพื่อความเข้าใจง่าย
- ✅ **ตั้งชื่อตัวแปรให้ชัดเจน** - ใช้ชื่อที่บอกจุดประสงค์
- ✅ **แบ่ง Function ย่อยๆ** - แยก logic ให้อ่านง่าย
- ✅ **Error Handling** - แสดงข้อความที่เข้าใจได้

### 🔧 การแก้ไขโค้ด
1. **Backend API** - แก้ไขใน `backend/src/`
2. **Frontend UI** - แก้ไขใน `frontend/app/`
3. **Database Schema** - แก้ไขใน `backend/prisma/schema.prisma` แล้วรัน:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

### 🧪 การทดสอบ

#### ทดสอบด้วย PowerShell Script
```powershell
# รัน Test Suite อัตโนมัติ
.\run-tests.ps1

# หรือทดสอบ API แบบ Manual
curl http://localhost:4000/health

# ทดสอบ Login
curl -X POST http://localhost:4000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

#### ทดสอบบนมือถือ
1. เชื่อมต่อมือถือกับ WiFi เดียวกันกับคอมพิวเตอร์
2. เปิด Browser ไปที่: `http://192.169.0.67:3000`
3. Login ด้วย admin/admin123
4. ทดสอบฟังก์ชั่นต่างๆ

---

## ❓ Troubleshooting

### ปัญหา: Backend ไม่ start
```powershell
# ตรวจสอบว่าพอร์ต 4000 ถูกใช้หรือไม่
netstat -ano | findstr :4000

# Stop process ที่ใช้พอร์ต
Stop-Process -Id <PID> -Force
```

### ปัญหา: Database connection error
1. ตรวจสอบ MySQL service ทำงานอยู่หรือไม่
2. ตรวจสอบ `DATABASE_URL` ใน `.env` ว่าถูกต้อง
3. ตรวจสอบ password และ port (3306)

### ปัญหา: Frontend ไม่เชื่อมต่อ Backend
- ตรวจสอบ `NEXT_PUBLIC_API_URL` ใน `frontend/.env.local`
- ตรวจสอบว่า Backend รันอยู่ที่ port 4000

### ปัญหา: Railway Deploy ล้มเหลว
- ตรวจสอบ Environment Variables ใน Railway
- ตรวจสอบ Build Logs ใน Railway Dashboard
- ตรวจสอบ MySQL connection string

---

## 📄 License

MIT License - ดู LICENSE file สำหรับรายละเอียด

---

## 👥 ผู้พัฒนา

ระบบพัฒนาโดย **[ชื่อทีมหรือองค์กร]**

- 📧 Email: [your-email@example.com]
- 🌐 Website: [your-website.com]
- 📞 Tel: [your-phone-number]

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI Components
- [Railway](https://railway.app/) - Cloud hosting platform
- [Vercel](https://vercel.com/) - Frontend hosting platform

---

<div align="center">

**Made with ❤️ for ASIC Miner Repair Shops**

⭐ Star this repo if you find it helpful!

</div>
