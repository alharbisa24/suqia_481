"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import { useUser } from "../context/UserContext";
import Navbar from "../navbar";

export default function LoginPage() {
  const { setUser } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setphoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const [loginError, setLoginError] = useState(""); 
  const [registerError, setRegisterError] = useState(""); 
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const router = useRouter();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = `${process.env.API_URL}/login`;
            const res = await axios.post(apiUrl, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token); 
      const userData = {
        id: res.data.user._id,
        fullname: res.data.user.fullname,
        email: res.data.user.email,
        phoneNumber: res.data.user.phoneNumber,
        rank:res.data.user.rank,
      };
      setLoginError("");
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      router.push("/");
    } catch (err) {
      setLoginError(err.response.data.message);
    }finally{
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading2(true);

    setRegisterError("");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10}$/;
    if(!emailRegex.test(email)){
      setRegisterError('الرجاء التأكد من صحة البريد الإلكتروني');
      setLoading2(false);
      return;
    }
    if(!phoneRegex.test(phoneNumber)){
      setRegisterError('الرجاء التأكد من صحة رقم الهاتف');
      setLoading2(false);
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError("كلمات المرور غير متطابقة");
      setLoading2(false);
      return;
    }
  
    const { strength, checks } = checkPasswordStrength(password);
    
    if (!checks.length) {
      setRegisterError("عذرا كلمة المرور يجب ان لا تقل من ٨ احرف !");
      setLoading2(false);
      return;
    }
    
    if (!checks.hasSymbol) {
      setRegisterError("يجب أن تحتوي كلمة المرور على رمز واحد على الأقل");
      setLoading2(false);
      return;
    }
    
    if (!checks.hasNumber) {
      setRegisterError("يجب أن تحتوي كلمة المرور على رقم واحد على الأقل");
      setLoading2(false);
      return;
    }
    try {

      const apiUrl = `${process.env.API_URL}/register`;
      const res = await axios.post(apiUrl, {
        email,
        fullname,
        password,
        email,
        phoneNumber,
      });
      localStorage.setItem("token", res.data.token); 
      const userData = {
        fullname: res.data.user.fullname,
        email: res.data.user.email,
        phoneNumber: res.data.user.phoneNumber,
        rank:res.data.user.rank,

      };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setLoading2(false);
      setRegisterError("");
      setMessage("تم انشاء حسابك بنجاح ! سيتم تحويلك للصفحة الرئيسية خلال ٥ ثواني...");
    
      setTimeout(() => {
        router.push("/");
      }, 5000);

    } catch (err) {
      setRegisterError(err.response.data.message);
      setLoading2(false);

    }finally{
      setLoading2(false);
    }
  };

  return (
  
    <div className="flex items-center justify-center min-h-screen p-4">
        <Navbar/>
      <div className="relative w-full max-w-5xl min-h-[600px] md:h-[600px] bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row-reverse h-full">
          {/* Right Section */}
          <div
            className={`w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10 transition-all duration-500 ${
              isLogin ? "bg-blue-500 text-white" : "bg-sky-500/50 text-gray-800"
            }`}
          >
            {isLogin ? (
              <>
                <h2 className="text-xl md:text-2xl font-semibold text-center">  مرحبا بعودتك! </h2>
                <p className="text-xs md:text-sm mt-2 text-center">ليس لديك حساب ؟ قم بإنشاء حسابك بسهولة </p>
                <button
                  onClick={() => setIsLogin(false)}
                  className="mt-4 md:mt-6 px-4 py-2 md:px-5 md:py-2 border rounded-full text-sm md:text-base border-white text-white transition hover:bg-white hover:text-blue-500"
                >
                  إنشاء حساب
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl md:text-2xl font-semibold text-center"> أدخل بياناتك لبدء رحلتك </h2>
                <p className="text-xs md:text-sm mt-2 text-center">لديك حساب بالفعل ؟ قم بتسجيل الدخول </p>
                <button
                  onClick={() => setIsLogin(true)}
                  className="mt-4 md:mt-6 px-4 py-2 md:px-5 md:py-2 border rounded-full text-sm md:text-base border-blue-500 text-blue-500 transition hover:bg-blue-500 hover:text-white"
                >
                  تسجيل الدخول 
                </button>
              </>
            )}
          </div>

          {/* Left Section - Form */}
          <div className="w-full md:w-1/2 flex flex-col justify-center p-4 md:p-12 text-right">
            {isLogin ? (
              <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
                <>
                  <h2 className="text-xl md:text-2xl font-semibold text-blue-500">تسجيل الدخول</h2>
                  <input required
                    type="email"
                    name="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-3 p-3 w-full border rounded text-right text-sm md:text-base text-black"
                  />
                  <input required
                    type="password"
                    name="password"
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-3 p-3 w-full border rounded text-right text-sm md:text-base text-black"
                  />
                                      <a href='/reset_password' className="text-blue-500 text-sm mt-2">نسيت كلمة المرور ؟</a>

                     {loginError && (
                    <p className="text-red-500 text-sm mt-2">{loginError}</p>
                  )}
                  ...
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
    isLogin ? "تسجيل الدخول" : "إنشاء حساب"
  )}
</button>

                </>
              </form>
            ) : (
              <>
                <form onSubmit={handleRegister} className="w-full max-w-md mx-auto">
                  <h2 className="text-xl md:text-2xl font-semibold text-blue-500">إنشاء حساب</h2>
                  <input required
                    type="text"
                    name="fullname"
                    placeholder="الاسم الكامل"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="mt-3 p-3 w-full border rounded text-right text-sm md:text-base text-black"
                  />
                  <input required
                    type="email"
                    name="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-3 p-3 w-full border rounded text-right text-sm md:text-base text-black"
                  />
                       <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="رقم الهاتف"
                    value={phoneNumber}
                    onChange={(e) => setphoneNumber(e.target.value)}
                    className="mt-3 p-3 w-full border rounded text-right text-sm md:text-base text-black"
                    pattern="[0-9]{10}"
                    title="يجب أن يتكون رقم الهاتف من 10 أرقام"
                  />
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
                  <input required
                    type="password"
                    name="confirmPassword"
                    placeholder="تأكيد كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setconfirmPassword(e.target.value)}
                    className="mt-3 p-3 w-full border rounded text-right text-sm md:text-bas text-black"
                  />
             
             
                  {registerError && (
                    <p className="text-red-500 text-sm mt-2">{registerError}</p>
                  )}
              ...
<button
  type="submit"
  className={`mt-4 md:mt-5 px-4 py-2 md:px-5 md:py-3 w-full bg-blue-500 text-white rounded text-sm md:text-base transition hover:bg-blue-600 ${
    loading2 ? "opacity-50 cursor-not-allowed" : ""
  }`}
  disabled={loading2}
>
  {loading2 ? (
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
   "إنشاء حساب"
  )}
</button>


                </form>
              </>
            )}

            {/* Message */}
            {message && (
              <p className="text-center md:text-right text-green-500 mt-4 md:mt-3 text-sm md:text-base">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}