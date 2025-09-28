'use client';
import { Mail, Phone, MapPin, Menu } from "lucide-react";
import Link from "next/link";
import { Home, ShoppingCart, List, LogOut } from "lucide-react";
import { useState, useEffect } from 'react';
import axios from "axios";
import { useRouter } from 'next/navigation';

export default function DashboardOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  useEffect(() => {
    if (user?.id) {
      if (user.rank == 'user') {
        router.push("/");
      }
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/distributer_completed_orders?distributer_id=${user.id}`;
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const filteredOrders = orders.filter(order => order?.order_id?.toString().includes(searchTerm));

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Menu Button for Mobile */}

      {/* Sidebar */}
      <div
        className={`fixed right-0 min-h-[600px] w-64 bg-gray-50 text-black shadow-lg flex flex-col m-5 mt-20 rounded-3xl p-6 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0 top-20' : 'translate-x-full top-10'
        } md:translate-x-0 z-50`}
      >
        <h2 className="text-xl font-semibold text-center text-black mb-8">لوحة تحكم السائقين</h2>
        <nav className="flex flex-col space-y-4">
          <Link href="/dashboard/home" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition text-black">
            <Home className="w-5 h-5 text-gray-700 m-2" /> <span>الرئيسية</span>
          </Link>
          <Link href="/dashboard/new_orders" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition text-black">
            <ShoppingCart className="w-5 h-5 text-gray-700  m-2" /> <span>الطلبات الجارية</span>
          </Link>
          <Link href="/dashboard/orders" className="flex items-center space-x-3 p-3 rounded-lg bg-gray-200 transition text-black">
            <List className="w-5 h-5 text-gray-700  m-2" /> <span>الطلبات المكتملة</span>
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              router.push('/login');
            }}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-300 transition mt-auto text-black"
          >
            <LogOut className="w-5 h-5 text-gray-700 m-2 " /> <span>تسجيل خروج</span>
          </button>
        </nav>
      </div>

      {/* Page Content */}
      <div
        className={`flex-grow p-6 text-black relative z-10 transition-padding duration-300 ${
          isSidebarOpen || true ? 'md:pr-80 ' : ''
        }`}
      >
             <button
        className=" top-20 right-5 z-50 bg-gray-100 p-2 rounded-full  md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>
        <h1 className="text-2xl font-bold text-right mb-8">الطلبات المكتملة</h1>

        <div className="relative flex flex-col my-12 bg-white rounded-3xl p-6 overflow-x-auto">
          <div className="flex justify-end mb-4">
            <input
              type="text"
              placeholder="ابحث برقم الطلب"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border rounded-lg text-right"
            />
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm md:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">رقم الطلب</th>
                  <th className="px-4 py-2">محتوى الطلب</th>
                  <th className="px-4 py-2">صورة التسليم</th>
                  <th className="px-4 py-2">المبلغ</th>
                  <th className="px-4 py-2">الحالة</th>
                  <th className="px-4 py-2">تاريخ التسليم</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3">#{order.order_id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium"> كرتون ماء {order.selectedSize}</p>
                      <p className="text-xs text-gray-500">{order.company}</p>
                      <p className="text-xs">الكمية: {order.quantity}</p>
                      <p className="text-xs">العنوان: {order.city} - {order.district} - {order.street}</p>
                      <p className="text-xs">المسجد: {order.mosque}</p>
                    </td>
                    <td className="px-4 py-3 ">
                      <img src={`${order.image}`} alt="صورة التسليم" className="h-20 w-20 object-cover rounded-lg border" />
                    </td>
                    <td className="px-4 py-3">{order.totalPrice} ريال</td>
                    <td className="px-4 py-3 text-green-700">مكتمل</td>
                    <td className="px-4 py-3">{order.created_at}</td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-gray-500">لا توجد طلبات مكتملة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}