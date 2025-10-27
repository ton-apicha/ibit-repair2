/**
 * Settings Controller
 * จัดการการตั้งค่าระบบ (System Settings)
 */

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * GET /api/settings
 * ดึงการตั้งค่าระบบ
 */
export const getSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // ดึงการตั้งค่าแรกที่เจอ (ควรมีแค่ 1 record)
    let settings = await prisma.systemSettings.findFirst();
    
    // ถ้ายังไม่มีให้สร้างใหม่
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          shopName: 'IBIT Repair',
        },
      });
    }

    res.status(200).json({
      message: 'ดึงการตั้งค่าสำเร็จ',
      data: settings,
    });
  } catch (error) {
    console.error('❌ Get settings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงการตั้งค่า',
    });
  }
};

/**
 * PUT /api/settings
 * อัพเดทการตั้งค่าระบบ
 */
export const updateSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { shopName, address, phone, email, taxId } = req.body;

    // หา settings ที่มีอยู่
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      // ถ้ายังไม่มีให้สร้างใหม่
      settings = await prisma.systemSettings.create({
        data: {
          shopName: shopName || 'IBIT Repair',
          address,
          phone,
          email,
          taxId,
        },
      });
    } else {
      // อัพเดท
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          shopName,
          address,
          phone,
          email,
          taxId,
        },
      });
    }

    res.status(200).json({
      message: 'อัพเดทการตั้งค่าสำเร็จ',
      data: settings,
    });
  } catch (error) {
    console.error('❌ Update settings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการอัพเดทการตั้งค่า',
    });
  }
};

/**
 * Configure multer สำหรับอัปโหลดโลโก้
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/logos');
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // สร้างชื่อไฟล์ใหม่: logo-timestamp.ext
    const ext = path.extname(file.originalname);
    const filename = `logo-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// กรอง file type (รับเฉพาะรูปภาพ)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('ไฟล์ต้องเป็นรูปภาพเท่านั้น (JPEG, PNG, GIF, WebP)'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // จำกัด 5MB
  },
});

/**
 * POST /api/settings/logo
 * อัปโหลดโลโก้ร้าน
 */
export const uploadLogo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณาอัปโหลดไฟล์รูปภาพ',
      });
      return;
    }

    // สร้าง URL สำหรับเข้าถึงรูปภาพ
    const logoUrl = `/uploads/logos/${req.file.filename}`;

    // อัพเดท settings
    let settings = await prisma.systemSettings.findFirst();

    // ลบโลโก้เก่า (ถ้ามี)
    if (settings?.logoUrl) {
      const oldLogoPath = path.join(__dirname, '../../', settings.logoUrl);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    if (!settings) {
      // สร้างใหม่
      settings = await prisma.systemSettings.create({
        data: {
          shopName: 'IBIT Repair',
          logoUrl,
        },
      });
    } else {
      // อัพเดท
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: { logoUrl },
      });
    }

    res.status(200).json({
      message: 'อัปโหลดโลโก้สำเร็จ',
      data: {
        logoUrl,
        settings,
      },
    });
  } catch (error) {
    console.error('❌ Upload logo error:', error);
    
    // ลบไฟล์ที่อัปโหลดถ้ามี error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการอัปโหลดโลโก้',
    });
  }
};

