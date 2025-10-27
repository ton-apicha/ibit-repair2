# 🚂 Railway Deployment Guide - iBit Repair 2 (MySQL)

## 📋 ภาพรวม

คู่มือการ Deploy โปรเจค iBit Repair 2 ขึ้น Railway แบบอัตโนมัติ พร้อม MySQL Database

## 🔗 Links สำคัญ

- **Railway Project**: https://railway.com/project/9e2e3cfa-732e-4676-ae82-f049a570c587
- **GitHub Repository**: https://github.com/ton-apicha/ibit-repair2
- **Frontend (Vercel)**: https://ibit-repair2.vercel.app
- **Backend (Railway)**: https://ibit-repair2-production.up.railway.app

## 🚀 ขั้นตอนการ Deploy อัตโนมัติ

### 1. เชื่อมต่อ Railway กับ GitHub

1. เข้าไปที่: https://railway.com/project/9e2e3cfa-732e-4676-ae82-f049a570c587
2. คลิก "Settings" → "Connect GitHub"
3. เลือก repository: `ton-apicha/ibit-repair2`
4. Railway จะดึง code จาก GitHub อัตโนมัติ

### 2. สร้าง MySQL Database

1. คลิก "New" → "Database" → "Add MySQL"
2. Railway จะสร้าง MySQL database ให้อัตโนมัติ
3. เก็บ `DATABASE_URL` ไว้สำหรับตั้งค่าตัวแปรสภาพแวดล้อม

### 3. ตั้งค่า Environment Variables

#### Backend Environment Variables

```env
# Database
DATABASE_URL=${{MySQL.DATABASE_URL}}

# Server
PORT=4000
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://ibit-repair2.vercel.app
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_REQUEST_SIZE=10mb
```

#### วิธีตั้งค่าใน Railway Dashboard

1. เข้าไปที่ Service (Backend)
2. คลิก "Variables" tab
3. เพิ่มตัวแปรตามรายการด้านบน
4. คลิก "Save" - Railway จะ Redeploy อัตโนมัติ

### 4. ตั้งค่า Root Directory

1. เข้าไปที่ Service → "Settings"
2. หา "Root Directory"
3. ตั้งค่าเป็น: `backend`
4. คลิก "Save"

### 5. ตั้งค่า Build และ Start Commands

1. เข้าไปที่ Service → "Settings"
2. หา "Build Command"
3. ตั้งค่าเป็น: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
4. หา "Start Command"
5. ตั้งค่าเป็น: `npm start`
6. คลิก "Save"

### 6. รอให้ Deployment เสร็จ

1. Railway จะ build และ deploy อัตโนมัติ
2. รอให้ Build เสร็จ (ประมาณ 3-5 นาที)
3. ตรวจสอบ Logs เพื่อดูว่ามี error หรือไม่

### 7. ตั้งค่า Domain (Optional)

1. คลิก "Settings" → "Domains"
2. คลิก "Generate Domain"
3. Railway จะสร้าง Public URL ให้
4. เก็บ URL นี้ไว้สำหรับเข้าถึง Backend

### 8. ทดสอบ Backend

```bash
# Health Check
curl https://ibit-repair2-production.up.railway.app/health

# Login Test
curl -X POST https://ibit-repair2-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🔧 Troubleshooting

### Build Failed

**ปัญหา**: Build ล้มเหลว

**แก้ไข**:
1. ตรวจสอบ Logs ใน Railway Dashboard
2. ตรวจสอบว่า Root Directory ถูกต้อง
3. ตรวจสอบ package.json และ dependencies
4. ตรวจสอบ MySQL connection string

### Database Connection Error

**ปัญหา**: ไม่สามารถเชื่อมต่อ MySQL Database ได้

**แก้ไข**:
1. ตรวจสอบว่า `DATABASE_URL` ถูกต้อง
2. ตรวจสอบว่า MySQL service ทำงานอยู่
3. ตรวจสอบ Network settings
4. ตรวจสอบ Prisma schema ใช้ provider = "mysql"

### Port Already in Use

**ปัญหา**: Port ถูกใช้งานแล้ว

**แก้ไข**:
1. Railway จะ set PORT ให้อัตโนมัติ
2. ตรวจสอบว่าใช้ `process.env.PORT` ใน code

### Prisma Generate Failed

**ปัญหา**: Prisma generate ล้มเหลว

**แก้ไข**:
1. ตรวจสอบ Prisma schema
2. ตรวจสอบ Binary Targets สำหรับ Railway
3. ตรวจสอบ DATABASE_URL
4. ตรวจสอบ MySQL driver (mysql2) ติดตั้งแล้ว

### MySQL Migration Failed

**ปัญหา**: Database migration ล้มเหลว

**แก้ไข**:
1. ตรวจสอบ Prisma schema ใช้ provider = "mysql"
2. ตรวจสอบ ID fields ใช้ @default(cuid()) แทน uuid()
3. ตรวจสอบ Decimal fields ใช้ @db.Decimal(10, 2)
4. รัน migration ใหม่: `npx prisma migrate deploy`

## 📊 Monitoring

### 1. ตรวจสอบ Logs

1. เข้าไปที่ Railway Dashboard
2. คลิก "Logs" tab
3. ดู real-time logs

### 2. ตรวจสอบ Metrics

1. เข้าไปที่ Railway Dashboard
2. คลิก "Metrics" tab
3. ดู CPU, Memory, Network usage

### 3. ตรวจสอบ Health Check

```bash
curl https://ibit-repair2-production.up.railway.app/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

## 🔄 Auto Deploy

### การทำงานของ Auto Deploy

1. Push code ไป GitHub
2. Railway ตรวจจับการเปลี่ยนแปลง
3. Railway build ใหม่อัตโนมัติ
4. Railway deploy ใหม่
5. Zero downtime deployment

### Disable Auto Deploy

1. เข้าไปที่ Settings
2. หา "Auto Deploy"
3. ปิด Auto Deploy

## 💰 Pricing

### Hobby Plan (Free)

- $5 credit per month
- 512 MB RAM
- 1 GB Storage
- 100 GB Bandwidth
- **MySQL Database included**

### Pro Plan ($20/month)

- $20 credit per month
- 8 GB RAM
- 100 GB Storage
- 1 TB Bandwidth
- **MySQL Database included**

## 🗄️ Database Management

### MySQL Workbench Connection

1. เปิด MySQL Workbench
2. สร้าง New Connection:
   - **Connection Name**: iBit Repair 2 (Production)
   - **Hostname**: [Railway MySQL Host]
   - **Port**: [Railway MySQL Port]
   - **Username**: [Railway MySQL User]
   - **Password**: [Railway MySQL Password]
   - **Default Schema**: [Railway MySQL Database]

### Database Backup

```bash
# Backup database
mysqldump -h [host] -u [user] -p[password] [database] > backup.sql

# Restore database
mysql -h [host] -u [user] -p[password] [database] < backup.sql
```

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio (local only)
npx prisma studio
```

## 🔐 Security Best Practices

### Environment Variables

1. **JWT Secrets**: ใช้ random string ที่ยาวและซับซ้อน
2. **Database URL**: เก็บเป็น secret ใน Railway
3. **CORS Origins**: ระบุ domain ที่แน่นอน
4. **Rate Limiting**: ตั้งค่าที่เหมาะสม

### Database Security

1. **Connection SSL**: เปิดใช้ SSL สำหรับการเชื่อมต่อ
2. **User Permissions**: ใช้ user ที่มีสิทธิ์จำกัด
3. **Backup Encryption**: เข้ารหัสไฟล์ backup
4. **Regular Updates**: อัพเดท MySQL version

## 🆘 Support

### Railway Support

- **Documentation**: https://docs.railway.app
- **Discord**: https://discord.gg/railway
- **Email**: support@railway.app

### Project Support

- **GitHub Issues**: https://github.com/ton-apicha/ibit-repair2/issues
- **Email**: [your-email@example.com]

### MySQL Support

- **MySQL Documentation**: https://dev.mysql.com/doc/
- **MySQL Workbench**: https://dev.mysql.com/downloads/workbench/
- **Prisma MySQL**: https://www.prisma.io/docs/concepts/database-connectors/mysql

---

## 📋 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:port/db` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | Allowed CORS origins | `*` |
| `LOG_LEVEL` | Logging level | `info` |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |

---

**Made with ❤️ for ASIC Miner Repair Shops**

**Last Updated**: 2024-01-01  
**Version**: 2.0.0 (MySQL Edition)
