'use client';
import Link from "next/link";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import {
  Home, ShoppingCart, List, LogOut, Menu,
  Users, Truck, GitPullRequestArrow, X,Building
} from "lucide-react";

export default function DistributersRequestsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  useEffect(() => {
    if (user?.id && user.rank === 'user') {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    window.notyf = new Notyf({
      duration: 4000,
      position: { x: 'left', y: 'top' },
      types: [
        {
          type: 'success',
          background: 'green',
          icon: { className: 'notyf__icon--success', tagName: 'i' }
        },
        {
          type: 'error',
          background: '#ff5e5e',
          icon: { className: 'notyf__icon--error', tagName: 'i' }
        }
      ]
    });
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/distributer-requests`;        

      const res = await axios.get(apiUrl);
      setRequests(res.data);
    } catch {
      window.notyf.error('فشل تحميل الطلبات');
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const apiUrl = `${process.env.API_URL}/admin/approve_distributer_request`;        

      await axios.post(apiUrl, { requestId });
      window.notyf.success('تم قبول الطلب');
      setRequests(prev => prev.filter(req => req._id !== requestId));
    } catch {
      window.notyf.error('فشل في قبول الطلب');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out overflow-y-auto ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold text-blue-600">لوحة تحكم</h2>
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
            <Link href="/admin/home" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100">
              <Home className="w-5 h-5" /> <span>الرئيسية</span>
            </Link>
            <Link href="/admin/new_orders" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100">
              <ShoppingCart className="w-5 h-5" /> <span>الطلبات الجديدة</span>
            </Link>
            <Link href="/admin/orders" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100">
              <List className="w-5 h-5" /> <span>الطلبات المكتملة</span>
            </Link>
            <Link href="/admin/distributers" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100">
              <Truck className="w-5 h-5" /> <span>السائقون</span>
            </Link>
            <Link href="/admin/customers" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100">
              <Users className="w-5 h-5" /> <span>العملاء</span>
            </Link>
            <Link href="/admin/distributers_requests" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
              <GitPullRequestArrow className="w-5 h-5" /> <span>طلبات السائقين</span>
            </Link>
            <Link href="/admin/companies" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100">
              <Building className="w-5 h-5" /> <span>الشركات</span>
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
            className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut className="w-5 h-5" /> <span>تسجيل خروج</span>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-grow transition-all duration-300 md:mr-72">
        <button className="p-2 rounded-lg hover:bg-gray-100 md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        <main className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">طلبات السائقين</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <div className="overflow-hidden border border-gray-200 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                      <th className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">الاسم الكامل</th>
                      <th className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">رقم الجوال</th>
                      <th className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">المدينة</th>
                      <th className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">الحي</th>
                        <th className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">رقم الرخصة</th>
                        <th className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requests.length > 0 ? (
                        requests.map((req) => (
                          <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-900">{req.user_id.fullname}</td>
                            <td className="px-4 py-3 text-gray-900">{req.user_id.phoneNumber}</td>
                            <td className="px-4 py-3 text-gray-900">{req.city}</td>
                            <td className="px-4 py-3 text-gray-900">{req.district}</td>
                            <td className="px-4 py-3 text-gray-900">{req.drive_licence_number}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleApprove(req._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-full shadow"
                              >
                                قبول
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-12 text-center text-gray-500">
                            لا توجد طلبات حالياً
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
