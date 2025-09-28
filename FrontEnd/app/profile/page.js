"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from "../context/UserContext";
import { useRouter } from 'next/navigation';
import Navbar from "../navbar";

export default function ProfilePage() {
  const { user, setUser } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editingUserData, setEditingUserData] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.city || '',
    district: user?.district || '',
    drive_licence_number: user?.drive_licence_number || '',
  });
  const [originalUserData, setOriginalUserData] = useState(editingUserData);
      const router = useRouter();
  
  useEffect(() => {

      if(!localStorage.getItem('user')){
        router.push("/login");
          }
    
       
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const email = user ? user.email : null;
        const apiUrl = `${process.env.API_URL}/api/profile?email=${email}`;
        const res = await axios.get(apiUrl);

        const userData = {
          fullname: res.data.fullname,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber,
          city: '',
          district: '',
          drive_licence_number: '',
        };
        
        if (user.rank === 'distributer' && res.data.distributer) {
          userData.city = res.data.distributer.city ?? '';
          userData.district = res.data.distributer.district ?? '';
          userData.drive_licence_number = res.data.distributer.drive_licence_number ?? '';
        }
        
        setOriginalUserData(userData);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    setEditingUserData({ ...originalUserData });
  }, [originalUserData]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10}$/;
    if (!emailRegex.test(editingUserData.email)) {
      setError('الرجاء التأكد من صحة البريد الإلكتروني ورقم الهاتف');
      return;
    }
    if (!phoneRegex.test(editingUserData.phoneNumber)) {
      setError('الرجاء التأكد من صحة رقم الهاتف');
      return;
    }
  
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const email = user ? user.email : null;
      const apiUrl = `${process.env.API_URL}/api/profile?email=${email}`;
      
      // إنشاء كائن البيانات الأساسية للإرسال
      const updateData = {
        newEmail: editingUserData.email,
        fullname: editingUserData.fullname,
        phoneNumber: editingUserData.phoneNumber,
      };
      
      // إضافة بيانات السائق فقط إذا كان المستخدم سائقًا
      if (user && user.rank === 'distributer') {
        updateData.city = editingUserData.city;
        updateData.district = editingUserData.district;
        updateData.drive_licence_number = editingUserData.drive_licence_number;
      }
      
      await axios.put(apiUrl, updateData);
      
      setOriginalUserData(editingUserData);
      setIsEditing(false);
      setShowSuccess(true);
      
      if (email !== editingUserData.email) {
        // تحديث بيانات المستخدم في التخزين المحلي
        const userData = { ...user, ...editingUserData };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات');
    }
  };

  const handleCancel = () => {
    setEditingUserData({ ...originalUserData });
    setIsEditing(false);
  };

  const handleChange = (e) => {

    const {name, value}= e.target;
    if(name === 'phone' && value.length > 10){
      return;
    }
    setEditingUserData({
      ...editingUserData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <Navbar/>
      <div className="max-w-3xl mx-auto transform transition-all duration-300">
        <div className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-black/5 hover:shadow-2xl transition-shadow duration-300">
      
          
          {showSuccess && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
              <div className="bg-white border-2 border-emerald-100 rounded-xl px-6 py-4 shadow-2xl flex items-center space-x-4 backdrop-blur-sm">
                <div className="bg-emerald-50 p-2 rounded-full">
                  <svg
                    className="h-6 w-6 text-emerald-600 animate-check"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700">!تم تحديث الملف الشخصي </p>
                  <p className="text-xs text-emerald-500">تم حفظ التغييرات بنجاح </p>
                </div>
              </div>
            </div>
          )}

          <div className="relative bg-gradient-to-br from-sky-700 to-sky-600 pt-20 pb-24 px-8 group">
            <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />
            <div className="absolute -bottom-14 left-8 transform transition-transform duration-300 group-hover:-translate-y-2">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl border-4 border-white bg-sky-100 shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <svg
                    className="w-full h-full text-sky-300 p-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tighter mt-8 opacity-90">{originalUserData.fullname}</h1>
          </div>

          <form onSubmit={handleSubmit} className="pt-20 px-8 pb-8">
            <div className="space-y-8">
              {['fullname', 'email', 'phoneNumber'].map((field) => (
                <div key={field} className="relative group">
                  <input
                    id={field}
                    name={field}
                    value={editingUserData[field]}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`peer w-full px-6 py-5 rounded-2xl border-2 ${
                      isEditing
                        ? 'border-gray-200 hover:border-sky-300 focus:border-sky-400 text-gray-900'
                        : 'border-gray-100 text-gray-500'
                    } 
                     bg-gray-50 focus:ring-4 focus:ring-sky-100 focus:bg-white transition-all duration-300 disabled:cursor-not-allowed placeholder-transparent`}
                    placeholder=" "
                  />
                  <label
                    htmlFor={field}
                    className={`absolute right-6 -top-3.5 bg-white px-2 text-sm font-semibold drtl  ${
                      isEditing ? 'text-sky-600' : 'text-gray-400'
                    } transition-all duration-300 transform ${
                      !isEditing && 'peer-placeholder-shown:translate-y-9 peer-placeholder-shown:text-base'
                    } peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-sky-600`}
                  >
                    {field === 'fullname' && 'الاسم الكامل'}
                    {field === 'email' && 'البريد الإلكتروني'}
                    {field === 'phoneNumber' && 'رقم الهاتف'}
                  </label>
                </div>
              ))}
            </div>
            <br/>
{user && user.rank == 'distributer' ? (
  <div>
  <h3 className='text-black'>بيانات السائق</h3>
  <br/>
  <div className="space-y-8">
    {['city', 'district', 'drive_licence_number'].map((field) => (
      <div key={field} className="relative group">
        <input
          id={field}
          name={field}
          value={editingUserData[field]}
          onChange={handleChange}
          disabled={!isEditing}
          className={`peer w-full px-6 py-5 rounded-2xl border-2 ${
            isEditing
              ? 'border-gray-200 hover:border-sky-300 focus:border-sky-400 text-gray-900'
              : 'border-gray-100 text-gray-500'
          } 
           bg-gray-50 focus:ring-4 focus:ring-sky-100 focus:bg-white transition-all duration-300 disabled:cursor-not-allowed placeholder-transparent`}
          placeholder=" "
        />
        <label
          htmlFor={field}
          className={`absolute right-6 -top-3.5 bg-white px-2 text-sm font-semibold drtl  ${
            isEditing ? 'text-sky-600' : 'text-gray-400'
          } transition-all duration-300 transform ${
            !isEditing && 'peer-placeholder-shown:translate-y-9 peer-placeholder-shown:text-base'
          } peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-sky-600`}
        >
          {field === 'city' && 'المدينة'}
          {field === 'district' && 'الحي'}
          {field === 'drive_licence_number' && 'رقم رخصة القيادة'}
        </label>
      </div>
    ))}
  </div>
  </div>
  ) : (

    <div>

    </div>
)}

       
            {error && (
                  
                  <p className="text-red-500 text-sm mt-2">{error}
                  <br/><br/><br/>
                  </p>
                )}
            <div className="mt-12 flex justify-end space-x-4">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-white font-semibold shadow-lg hover:shadow-sky-200/50 hover:scale-[1.02] transition-all duration-300 group"
                >
                  <span className="inline-block group-hover:animate-wiggle">✏️</span>
                  <span className="ml-3">تعديل الملف الشخصي </span>
                </button>
              ) : (
                <> 

               
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-8 py-4 rounded-xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 hover:scale-[1.02] transition-all duration-300 group"
                  >
                    <span className="inline-block group-hover:animate-shake">❌</span>
                    <span className="ml-3">إلغاء التغييرات </span>
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-white font-semibold shadow-lg hover:shadow-sky-200/50 hover:scale-[1.02] transition-all duration-300 group"
                  >
                    <span className="inline-block group-hover:animate-bounce">💾</span>
                    <span className="ml-3">حفظ التغييرات</span>
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}