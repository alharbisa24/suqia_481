"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import Navbar from "../navbar";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = `${process.env.API_URL}/Requestreset_password`;
            const res = await axios.post(apiUrl, {
        email,
      });

      setResetPasswordError("");
      window.notyf.success('تم ارسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني !');

    } catch (err) {
        setResetPasswordError(err.response.data.message);
    }finally{
      setLoading(false);
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
           "bg-blue-900 text-white" 
            }`}
          >
       
                <h2 className="text-xl md:text-2xl font-semibold text-center">  تذكرت كلمة المرور ! </h2>
                <a
                 href="/login"
                  className="mt-4 md:mt-6 px-4 py-2 md:px-5 md:py-2 border rounded-full text-sm md:text-base border-white text-white transition hover:bg-white hover:text-blue-500"
                >
                  العودة لتسجيل الدخول 
                </a>
            
          </div>

          {/* Left Section - Form */}
          <div className="w-full md:w-1/2 flex flex-col justify-center p-4 md:p-12 text-right">
         
              <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
                <>
                  <h2 className="text-xl md:text-2xl font-semibold text-blue-500">استعادة كلمة المرور</h2>
                  <input required
                    type="email"
                    name="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-3 p-3 w-full border rounded text-right text-sm md:text-base text-black"
                  />
            
                     {resetPasswordError && (
                    <p className="text-red-500 text-sm mt-2">{resetPasswordError}</p>
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
   'استعادة كلمة المرور'
  )}
</button>

                </>
              </form>
            

          </div>
        </div>
      </div>
    </div>
  );
}