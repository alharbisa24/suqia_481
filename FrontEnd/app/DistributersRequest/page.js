'use client';

import { useState } from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "../context/UserContext";
import Navbar from "../navbar";

export default function DriverRegistrationPage() {
  const { setUser } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    company: '',
    city: '',
    district: '',
    license: '',
  });

  useEffect(() => {
    // تهيئة Notyf مع إعدادات مخصصة
    window.notyf = new Notyf({
      duration: 5000,
      position: {
        x: 'left', 
        y: 'top'
      },
      types: [
        {
          type: 'success',
          background: 'green',
          icon: {
            className: 'notyf__icon--success',
            tagName: 'i'
          }
        },
        {
          type: 'error',
          background: '#ff5e5e',
          icon: {
            className: 'notyf__icon--error',
            tagName: 'i'
          }
        }
      ]
    });
    
  }, []);
  const cities = ['الرياض', 'جدة', 'مكة', 'المدينة المنورة'];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }
    if (!/^\d+$/.test(formData.license)) {
      window.notyf.error('رقم الرخصة يجب أن يحتوي على أرقام فقط');
      return;
    }

    try {
      const apiUrl = `${process.env.API_URL}/distributer-request`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          company: formData.company,
          city: formData.city,
          district: formData.district,
          drive_licence_number: formData.license,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'حدث خطأ ما');
      } else {
        window.notyf.success('تم تقديم الطلب بنجاح! سنتواصل معك قريباً.');

        setFormData({
          company: '',
          city: '',
          district: '',
          license: '',
        });
        localStorage.setItem("user", JSON.stringify(data['user']));
      setUser(data['user']);
      }
    } catch (error) {
      console.error('خطأ أثناء الإرسال:', error);
      alert('حدث خطأ أثناء الإرسال');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Navbar/>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-black text-right mb-8">تسجيل السائقين</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">

        

            <div>
              <label className="block text-sm font-medium text-gray-700 text-right text-black">رقم الرخصة</label>
              <input
                type="text"
                name="license"
                value={formData.license}
                onChange={handleInputChange}
                placeholder="ادخل رقم الرخصة"
                className="w-full p-3 rounded-lg border text-black border-gray-300 bg-white text-right"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-right text-black">المدينة</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border text-black border-gray-300 bg-white text-right"
                required
              >
                <option value="">اختر المدينة</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-right text-black">اسم الحي</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="ادخل اسم الحي"
                className="w-full p-3 rounded-lg border text-black border-gray-300 bg-white text-right"
                required
              />
            </div>

          </div>

          <div className="text-right">
            <button
              type="submit"
              className="px-6 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition"
            >
              تقديم الطلب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
