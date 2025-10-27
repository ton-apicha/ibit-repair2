/**
 * New Job Page
 * หน้าสร้างงานซ่อมใหม่
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';

// Interfaces
interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
}

interface Brand {
  id: string;
  name: string;
}

interface MinerModel {
  id: string;
  modelName: string;
  brandId: string;
  hashrate: string | null;
  powerUsage: string | null;
}

interface WarrantyProfile {
  id: string;
  name: string;
  partsWarranty: number;
  laborWarranty: number;
}

export default function NewJobPage() {
  const router = useRouter();
  const { t } = useTranslation(['jobs', 'common', 'customers', 'models', 'warranties']);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Data lists
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<MinerModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<MinerModel[]>([]);
  const [warranties, setWarranties] = useState<WarrantyProfile[]>([]);

  // Section 1: Customer
  const [useExistingCustomer, setUseExistingCustomer] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');

  // Section 2: Miner
  const [brandId, setBrandId] = useState('');
  const [minerModelId, setMinerModelId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Section 3: Problem
  const [problemDescription, setProblemDescription] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [priority, setPriority] = useState(0);

  // Section 4: Warranty
  const [warrantyProfileId, setWarrantyProfileId] = useState('');

  /**
   * Load initial data
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [customersRes, brandsRes, modelsRes, warrantiesRes] =
          await Promise.all([
            api.get('/api/customers?limit=1000'),
            api.get('/api/brands'),
            api.get('/api/models?limit=1000'),
            api.get('/api/warranties'),
          ]);

        console.log('📦 Models Response:', modelsRes.data);
        
        setCustomers(customersRes.data.data || customersRes.data);
        setBrands(brandsRes.data.data || brandsRes.data || []);
        setModels(modelsRes.data.data || modelsRes.data || []);
        setWarranties(warrantiesRes.data.data || warrantiesRes.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  /**
   * Filter models by brand
   */
  useEffect(() => {
    if (brandId && models && Array.isArray(models)) {
      const filtered = models.filter((m) => m.brandId === brandId);
      setFilteredModels(filtered);
      // Reset model selection if current model is not in filtered list
      if (minerModelId && !filtered.find((m) => m.id === minerModelId)) {
        setMinerModelId('');
      }
    } else {
      setFilteredModels([]);
      setMinerModelId('');
    }
  }, [brandId, models]);

  /**
   * Handle Submit
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validation
    if (useExistingCustomer && !selectedCustomerId) {
      setError('กรุณาเลือกลูกค้า');
      return;
    }

    if (
      !useExistingCustomer &&
      (!newCustomerName.trim() || !newCustomerPhone.trim())
    ) {
      setError('กรุณากรอกข้อมูลลูกค้าให้ครบถ้วน');
      return;
    }

    if (!minerModelId) {
      setError('กรุณาเลือกรุ่นเครื่อง');
      return;
    }

    if (!problemDescription.trim() || problemDescription.trim().length < 10) {
      setError('กรุณาอธิบายปัญหาอย่างน้อย 10 ตัวอักษร');
      return;
    }

    try {
      setLoading(true);

      let customerId = selectedCustomerId;

      // ถ้าสร้างลูกค้าใหม่
      if (!useExistingCustomer) {
        const customerRes = await api.post('/api/customers', {
          fullName: newCustomerName.trim(),
          phone: newCustomerPhone.trim(),
          email: newCustomerEmail.trim() || null,
          address: newCustomerAddress.trim() || null,
        });
        customerId = customerRes.data.data.id;
      }

      // สร้างงานซ่อม
      const jobRes = await api.post('/api/jobs', {
        customerId,
        minerModelId,
        serialNumber: serialNumber.trim() || null,
        password: password.trim() || null,
        problemDescription: problemDescription.trim(),
        customerNotes: customerNotes.trim() || null,
        priority,
        warrantyProfileId: warrantyProfileId || null,
      });

      // Redirect ไปหน้ารายละเอียดงาน
      router.push(`/jobs/${jobRes.data.data.id}`);
    } catch (err: any) {
      console.error('Error creating job:', err);
      setError(
        err.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างงาน'
      );
      setLoading(false);
    }
  };

  // Loading state
  if (loadingData) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <div className="inline-block animate-spin text-4xl mb-4">⚙️</div>
            <p className="text-gray-600">{t('common:loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/jobs"
            className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block"
          >
            ← {t('common:back')}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t('jobs:new_job')}
          </h1>
          <p className="text-gray-600 mt-1">{t('jobs:title')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Section 1: Customer Information */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">1. {t('customers:title')}</h2>

            {/* Toggle: Existing vs New Customer */}
            <div className="mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!useExistingCustomer}
                  onChange={(e) => setUseExistingCustomer(!e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  สร้างลูกค้าใหม่
                </span>
              </label>
            </div>

            {useExistingCustomer ? (
              /* เลือกลูกค้าที่มีอยู่ */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกลูกค้า <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="input-field"
                  required
                  disabled={loading}
                >
                  <option value="">-- เลือกลูกค้า --</option>
                  {customers && Array.isArray(customers) && customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName} ({customer.phone})
                    </option>
                  ))}
                </select>

                {/* Show selected customer info */}
                {selectedCustomerId && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const selected = customers.find(
                        (c) => c.id === selectedCustomerId
                      );
                      return selected ? (
                        <div className="text-sm">
                          <div className="font-medium">{selected.fullName}</div>
                          <div className="text-gray-600">
                            📞 {selected.phone}
                          </div>
                          {selected.email && (
                            <div className="text-gray-600">
                              ✉️ {selected.email}
                            </div>
                          )}
                          {selected.address && (
                            <div className="text-gray-600">
                              📍 {selected.address}
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            ) : (
              /* สร้างลูกค้าใหม่ */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="นาย สมชาย ใจดี"
                    className="input-field"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="0812345678"
                    pattern="[0-9]{10}"
                    className="input-field"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ตัวเลข 10 หลัก
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input-field"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ที่อยู่
                  </label>
                  <textarea
                    value={newCustomerAddress}
                    onChange={(e) => setNewCustomerAddress(e.target.value)}
                    placeholder="ที่อยู่ของลูกค้า"
                    rows={2}
                    className="input-field"
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Miner Information */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">2. {t('models:title')}</h2>

            <div className="space-y-4">
              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('models:brand')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="input-field"
                  required
                  disabled={loading}
                >
                  <option value="">-- เลือกยี่ห้อ --</option>
                  {brands && Array.isArray(brands) && brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('models:model_name')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={minerModelId}
                  onChange={(e) => setMinerModelId(e.target.value)}
                  className="input-field"
                  required
                  disabled={loading || !brandId}
                >
                  <option value="">
                    {brandId ? '-- เลือกรุ่น --' : '-- เลือกยี่ห้อก่อน --'}
                  </option>
                  {filteredModels && Array.isArray(filteredModels) && filteredModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.modelName}
                      {model.hashrate && ` (${model.hashrate} TH/s)`}
                    </option>
                  ))}
                </select>

                {/* Show model specs */}
                {minerModelId && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    {(() => {
                      const selected = filteredModels.find(
                        (m) => m.id === minerModelId
                      );
                      return selected ? (
                        <div className="flex gap-4">
                          {selected.hashrate && (
                            <span>⚡ {selected.hashrate} TH/s</span>
                          )}
                          {selected.powerUsage && (
                            <span>🔌 {selected.powerUsage} W</span>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="S/N บนเครื่อง"
                  className="input-field"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ไม่บังคับ แต่แนะนำให้กรอก
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสผ่านเครื่อง
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสสำหรับเข้า web interface"
                    className="input-field pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Problem Description */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">3. อาการและปัญหา</h2>

            <div className="space-y-4">
              {/* Problem Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อธิบายปัญหา <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="อธิบายอาการเสีย, ปัญหาที่พบ..."
                  rows={4}
                  className="input-field"
                  required
                  disabled={loading}
                  minLength={10}
                  maxLength={5000}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>ขั้นต่ำ 10 ตัวอักษร</span>
                  <span>
                    {problemDescription.length} / 5000
                  </span>
                </div>
              </div>

              {/* Customer Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุจากลูกค้า
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="ข้อมูลเพิ่มเติมจากลูกค้า..."
                  rows={2}
                  className="input-field"
                  disabled={loading}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ลำดับความสำคัญ
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="0"
                      checked={priority === 0}
                      onChange={() => setPriority(0)}
                      className="w-4 h-4 text-primary-600"
                      disabled={loading}
                    />
                    <span className="text-sm">ปกติ</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="1"
                      checked={priority === 1}
                      onChange={() => setPriority(1)}
                      className="w-4 h-4 text-primary-600"
                      disabled={loading}
                    />
                    <span className="text-sm text-orange-600 font-medium">
                      ⚡ ด่วน
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value="2"
                      checked={priority === 2}
                      onChange={() => setPriority(2)}
                      className="w-4 h-4 text-primary-600"
                      disabled={loading}
                    />
                    <span className="text-sm text-red-600 font-bold">
                      🔥 ด่วนมาก
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Warranty */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">4. การรับประกัน</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                โปรไฟล์การรับประกัน
              </label>
              <select
                value={warrantyProfileId}
                onChange={(e) => setWarrantyProfileId(e.target.value)}
                className="input-field"
                disabled={loading}
              >
                <option value="">-- ไม่มีรับประกัน --</option>
                {warranties && Array.isArray(warranties) && warranties.map((warranty) => (
                  <option key={warranty.id} value={warranty.id}>
                    {warranty.name} (อะไหล่: {warranty.partsWarranty} วัน,
                    ค่าแรง: {warranty.laborWarranty} วัน)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  <span>{t('common:loading')}</span>
                </span>
              ) : (
                `✅ ${t('jobs:new_job')}`
              )}
            </button>

            <Link
              href="/jobs"
              className="btn-secondary flex-1 text-center"
            >
              {t('common:cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


