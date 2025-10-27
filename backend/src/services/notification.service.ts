/**
 * Notification Service
 * บริการแจ้งเตือน
 */

export interface NotificationOptions {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  userId?: string;
  jobId?: string;
  partId?: string;
}

export class NotificationService {
  /**
   * สร้างการแจ้งเตือนใหม่
   */
  static async createNotification(options: NotificationOptions): Promise<void> {
    try {
      // TODO: Implement notification creation logic
      // สามารถเก็บใน database หรือส่งผ่าน WebSocket
      
      console.log('🔔 Notification created:', {
        type: options.type,
        title: options.title,
        message: options.message,
      });
    } catch (error) {
      console.error('❌ Notification creation failed:', error);
    }
  }

  /**
   * แจ้งเตือนงานใหม่
   */
  static async notifyNewJob(jobNumber: string, technicianId?: string): Promise<void> {
    await this.createNotification({
      type: 'info',
      title: 'งานใหม่',
      message: `งานซ่อม ${jobNumber} ถูกสร้างใหม่`,
      jobId: jobNumber,
      userId: technicianId,
    });
  }

  /**
   * แจ้งเตือนอะไหล่หมดสต๊อก
   */
  static async notifyLowStock(partName: string, currentStock: number): Promise<void> {
    await this.createNotification({
      type: 'warning',
      title: 'อะไหล่หมดสต๊อก',
      message: `${partName} เหลือเพียง ${currentStock} ชิ้น`,
    });
  }

  /**
   * แจ้งเตือนงานเสร็จ
   */
  static async notifyJobCompleted(jobNumber: string): Promise<void> {
    await this.createNotification({
      type: 'success',
      title: 'งานเสร็จสิ้น',
      message: `งานซ่อม ${jobNumber} เสร็จสิ้นแล้ว`,
      jobId: jobNumber,
    });
  }
}
