'use client';
import Link from "next/link";
import { useState, useEffect } from 'react';
import axios from "axios";
import { useRouter } from "next/navigation";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { Home, ShoppingCart, List, LogOut, Menu, Users, Truck, GitPullRequestArrow } from "lucide-react";

export default function DashboardCustomersPage() {
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize Notyf
    window.notyf = new Notyf({
      duration: 5000,
      position: { x: 'left', y: 'top' },
      types: [
        { type: 'success', background: 'green' },
        { type: 'error', background: '#ff5e5e' }
      ]
    });
  }, []);



  // Filter customers by phone number
  const filteredCustomers = customers.filter(customer =>
    customer.phoneNumber.includes(searchTerm)
  );
  const fetchCustomers = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/users`;   
      const response = await axios.get(apiUrl);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      window.notyf.error('فشل في جلب بيانات العملاء');
    }
  };


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
    fetchCustomers();

  }, []);
  const handleDeleteAccount = async (userId) => {
    // Show confirmation dialog
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        const apiUrl = `${process.env.API_URL}/deleteUser`;     
        const response = await axios.post(apiUrl, { 
          userId: userId 
        });
        
        if (response.status === 200) {
          window.notyf.success('تم حذف الحساب بنجاح');
          
          fetchCustomers(); 
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('حدث خطأ أثناء محاولة حذف الحساب');
      }
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 rounded-full hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-xl font-bold text-blue-600">لوحة تحكم </h2>
        </div>
        
        <div className="p-5">
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">مرحباً بك</p>
              <p className="font-medium text-gray-400">{user?.fullname}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-5">
          <div className="text-xs font-semibold text-gray-400 mb-3 pr-3">القائمة الرئيسية</div>
          <div className="space-y-1">
            <Link href="/admin/home" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <Home className="w-5 h-5" /> <span>الرئيسية</span>
            </Link>
            <Link href="/admin/new_orders" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <ShoppingCart className="w-5 h-5" /> <span>الطلبات الجديدة</span>
            </Link>
            <Link href="/admin/orders" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <List className="w-5 h-5" /> <span>الطلبات المكتملة</span>
            </Link>
            <Link href="/admin/distributers" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <Truck className="w-5 h-5" /> <span>السائقون</span>
            </Link>
            <Link href="/admin/customers" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
              <Users className="w-5 h-5" /> <span>العملاء</span>
            </Link>
            <Link href="/admin/distributers_requests" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <GitPullRequestArrow className="w-5 h-5" /> <span>طلبات السائقين</span>
            </Link>
          </div>
          
          <div className="text-xs font-semibold text-gray-400 mt-8 mb-3 pr-3">الإعدادات</div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              router.push('/login');
            }}
            className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" /> <span>تسجيل خروج</span>
          </button>
        </nav>
      </div>

      {/* Page Content */}
      <div 
        className="flex-grow transition-all duration-300 md:mr-72"
      >
        {/* Header */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        <main className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">العملاء</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="ابحث برقم الجوال"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-lg text-right focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors text-gray-900"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto -mx-6">
                <div className="inline-block min-w-full align-middle px-6">
                  <div className="overflow-hidden border border-gray-200 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">الاسم الكامل</th>
                          <th className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">رقم الجوال</th>
                          <th className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">البريد الإلكتروني</th>
                          <th className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">عدد الطلبات</th>
                          <th className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">اجراء</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer, index) => (
                            <tr key={customer._id || index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-gray-900">{customer.fullname}</td>
                              <td className="px-4 py-3 text-gray-900">{customer.phoneNumber}</td>
                              <td className="px-4 py-3 text-gray-900">{customer.email}</td>
                              <td className="px-4 py-4">
              <span className="px-2 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                {customer.orders_count} طلبات
              </span>
            </td>
            <td className="px-4 py-3">
            <button
          onClick={() => handleDeleteAccount(customer._id)}
          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-sm font-medium transition-colors hover:bg-red-100"
        >
          حذف الحساب
        </button>
        </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-4 py-12 text-center">
                              <div className="flex flex-col items-center">
                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <p className="mt-4 text-lg font-medium text-gray-500">لا يوجد عملاء</p>
                                <p className="mt-1 text-sm text-gray-400">لم نجد عملاء بقاعدة البيانات</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}