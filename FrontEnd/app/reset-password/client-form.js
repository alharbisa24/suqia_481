"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from 'axios';

export default function ClientResetForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  
  const checkPasswordStrength = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasNumber: /[0-9]/.test(password)
    };
    
    if (checks.length) strength++;
    if (checks.hasSymbol) strength++;
    if (checks.hasNumber) strength++;
    
    return { strength, checks };
  };

  useEffect(() => {
    const urlToken = searchParams.get('token');
    
    if (urlToken) {
      setToken(urlToken);
      validateToken(urlToken);
    } else {
      setTokenChecked(true);
      setTokenValid(false);
    }
  }, [searchParams]);

  const validateToken = async (urlToken) => {
    setLoading(true);
    try {
      const apiUrl = `${process.env.API_URL}/checkToken`;
      const res = await axios.post(apiUrl, {
        token: urlToken
      });

      if (res.data && res.data.valid) {
        setTokenValid(true);
        setEmail(res.data.email || '');
      } else {
        setTokenValid(false);
        setError("رمز استعادة كلمة المرور غير صالح أو منتهي الصلاحية");
      }
    } catch (err) {
      setTokenValid(false);
      setError(err.response?.data?.message || "حدث خطأ أثناء التحقق من صلاحية الرمز");
    } finally {
      setTokenChecked(true);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }
  
    const { strength, checks } = checkPasswordStrength(password);
    
    if (!checks.length) {
      setError("يجب أن تكون كلمة المرور 8 أحرف على الأقل");
      return;
    }
    
    if (!checks.hasSymbol) {
      setError("يجب أن تحتوي كلمة المرور على رمز واحد على الأقل");
      return;
    }
    
    if (!checks.hasNumber) {
      setError("يجب أن تحتوي كلمة المرور على رقم واحد على الأقل");
      return;
    }
    setLoading(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password`;
      const res = await axios.post(apiUrl, {
        email,
        password,
        token
      });

      window.notyf.success('تم تغيير كلمة المرور بنجاح!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تحديث كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  // Loader mientras se verifica el token
  if (!tokenChecked) {
    return (
      <div className="text-center">
        <svg
          className="animate-spin h-12 w-12 mx-auto text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        <p className="mt-3 text-lg">جاري التحقق من صلاحية الرابط...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row-reverse h-full">
      {/* Right Section */}
      <div
        className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10 transition-all duration-500 bg-blue-900 text-white"
      >
        <h2 className="text-xl md:text-2xl font-semibold text-center">
          {tokenValid ? "إنشاء كلمة مرور جديدة" : "تذكرت كلمة المرور؟"}
        </h2>
        <a
          href="/login"
          className="mt-4 md:mt-6 px-4 py-2 md:px-5 md:py-2 border rounded-full text-sm md:text-base border-white text-white transition hover:bg-white hover:text-blue-500"
        >
          العودة لتسجيل الدخول
        </a>
      </div>

      {/* Left Section - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-4 md:p-12 text-right">
        {tokenValid ? (
          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold text-blue-500">تعيين كلمة مرور جديدة</h2>
            <p className="text-gray-600 mt-2 mb-4">الرجاء إدخال كلمة المرور الجديدة</p>
            
            <div className="mb-4">
              <input
                type="password"
                placeholder="كلمة المرور الجديدة"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-3 p-3 w-full border rounded text-right text-sm md:text-base text-black"
                required
              />
              
              {/* Password Strength Indicator */}
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <div className="text-xs text-gray-500">
                    قوة كلمة المرور
                  </div>
                </div>
                <div className="flex space-x-1 rtl:space-x-reverse">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        password.length === 0
                          ? "bg-gray-200"
                          : i < checkPasswordStrength(password).strength
                          ? ["bg-red-500", "bg-yellow-500", "bg-green-500"][checkPasswordStrength(password).strength - 1]
                          : "bg-gray-200"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Password Requirements */}
              <div className="mt-2 text-xs space-y-1">
                <div className={`flex items-center ${password.length >= 8 ? "text-green-500" : "text-gray-400"}`}>
                  <span className="ml-1">
                    {password.length >= 8 ? "✓" : "○"}
                  </span>
                  8 أحرف على الأقل
                </div>
                <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-500" : "text-gray-400"}`}>
                  <span className="ml-1">
                    {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "✓" : "○"}
                  </span>
                  رمز واحد على الأقل (مثل !@#$%)
                </div>
                <div className={`flex items-center ${/[0-9]/.test(password) ? "text-green-500" : "text-gray-400"}`}>
                  <span className="ml-1">
                    {/[0-9]/.test(password) ? "✓" : "○"}
                  </span>
                  رقم واحد على الأقل
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <input
                type="password"
                placeholder="تأكيد كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-3 p-3 w-full border rounded text-right text-sm md:text-base text-black"
                required
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            
            <button
              type="submit"
              className={`mt-4 md:mt-5 px-4 py-2 md:px-5 md:py-3 w-full bg-blue-500 text-white rounded text-sm md:text-base transition hover:bg-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  جاري التحميل...
                </span>
              ) : (
                'حفظ كلمة المرور الجديدة'
              )}
            </button>
          </form>
        ) : (
          <form className="w-full max-w-md mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold text-blue-500">استعادة كلمة المرور</h2>
            {token && (
              <p className="text-red-500 text-sm mt-2 mb-4">
                رابط استعادة كلمة المرور غير صالح أو منتهي الصلاحية. الرجاء طلب رابط جديد.
              </p>
            )}
          
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            
            <a href="/forgot-password" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded text-sm md:text-base hover:bg-blue-600">
              طلب رابط جديد
            </a>
          </form>
        )}
      </div>
    </div>
  );
}