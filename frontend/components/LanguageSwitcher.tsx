'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [saving, setSaving] = useState(false);

  const changeLanguage = async (lng: string) => {
    setSaving(true);
    await i18n.changeLanguage(lng);
    
    // Save to user profile
    try {
      await api.put('/api/auth/language', { language: lng });
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
    setSaving(false);
  };

  return (
    <select 
      value={i18n.language} 
      onChange={(e) => changeLanguage(e.target.value)}
      disabled={saving}
      className="input-field text-sm"
    >
      <option value="en">English</option>
      <option value="th">ภาษาไทย</option>
      <option value="zh">中文</option>
    </select>
  );
}
