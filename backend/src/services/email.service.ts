/**
 * Email Service
 * บริการส่งอีเมล
 */

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  /**
   * ส่งอีเมลแจ้งเตือน
   */
  static async sendNotification(options: EmailOptions): Promise<boolean> {
    try {
      // TODO: Implement email sending logic
      // สามารถใช้ nodemailer, sendgrid, หรือ email service อื่นๆ
      
      console.log('📧 Email sent:', {
        to: options.to,
        subject: options.subject,
      });
      
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }

  /**
   * ส่งอีเมลแจ้งเตือนงานเสร็จ
   */
  static async sendJobCompletedNotification(
    customerEmail: string,
    jobNumber: string,
    customerName: string
  ): Promise<boolean> {
    return this.sendNotification({
      to: customerEmail,
      subject: `งานซ่อม ${jobNumber} เสร็จสิ้น`,
      html: `
        <h2>งานซ่อมเสร็จสิ้น</h2>
        <p>เรียน คุณ ${customerName}</p>
        <p>งานซ่อมหมายเลข <strong>${jobNumber}</strong> เสร็จสิ้นแล้ว</p>
        <p>กรุณาติดต่อร้านเพื่อมารับเครื่อง</p>
      `,
    });
  }

  /**
   * ส่งอีเมลแจ้งเตือนอะไหล่หมด
   */
  static async sendLowStockNotification(
    adminEmail: string,
    partName: string,
    currentStock: number
  ): Promise<boolean> {
    return this.sendNotification({
      to: adminEmail,
      subject: `แจ้งเตือนอะไหล่หมดสต๊อก`,
      html: `
        <h2>แจ้งเตือนอะไหล่หมดสต๊อก</h2>
        <p>อะไหล่ <strong>${partName}</strong> เหลือเพียง ${currentStock} ชิ้น</p>
        <p>กรุณาเพิ่มสต๊อกอะไหล่</p>
      `,
    });
  }
}
