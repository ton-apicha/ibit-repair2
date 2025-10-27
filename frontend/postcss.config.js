/**
 * PostCSS Configuration
 * ใช้สำหรับประมวลผล CSS ด้วย Tailwind CSS และ Autoprefixer
 */

module.exports = {
  plugins: {
    tailwindcss: {},      // ประมวลผล Tailwind CSS
    autoprefixer: {},     // เพิ่ม vendor prefixes อัตโนมัติ (-webkit-, -moz- ฯลฯ)
  },
};

