'use client';
import Link from "next/link";
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useRouter } from "next/navigation";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { Home, ShoppingCart, List, LogOut, Menu, Activity, Users, Truck, CreditCard, TrendingUp, BarChart2, X,GitPullRequestArrow,Building } from "lucide-react";
export default function CompaniesPage() {
  const [orders, setOrders] = useState([
    { id: 1, company: "شركة مياه الرياض", type: "200مل", quantity: 10 },
    { id: 2, company: "شركة مياه جدة", type: "330مل", quantity: 20 },
    { id: 3, company: "شركة مياه مكة", type: "600~550 مل", quantity: 15 },
  ]);

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editedOrder, setEditedOrder] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleEditClick = (order) => {
    setEditingOrderId(order.id);
    setEditedOrder({ ...order });
  };

  const handleCancel = () => {
    setEditingOrderId(null);
    setEditedOrder({});
  };

  const handleSave = () => {
    setOrders(orders.map(o => o.id === editingOrderId ? editedOrder : o));
    setEditingOrderId(null);
    setEditedOrder({});
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
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
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
              <p className="font-medium text-gray-400">{/*user?.fullname*/}</p>
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
            <Link href="/admin/customers" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <Users className="w-5 h-5" /> <span>العملاء</span>
            </Link>
            <Link href="/admin/distributers_requests" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <GitPullRequestArrow className="w-5 h-5" /> <span>طلبات السائقين</span>
            </Link>
            <Link href="/admin/companies" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
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
            className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" /> <span>تسجيل خروج</span>
          </button>
        </nav>
      </div>

      {/* Page Content */}
      <div className={`flex-grow p-6 text-black relative z-10 md:pr-80`}>
        <h1 className="text-2xl font-bold text-right mb-8">قائمة الشركات</h1>

        <div className="relative flex flex-col my-12 bg-white rounded-3xl p-6 overflow-x-auto">
          <table className="min-w-full text-right text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">اسم الشركة</th>
                <th className="px-4 py-2">النوع</th>
                <th className="px-4 py-2">الكمية</th>
                <th className="px-4 py-2">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3">
                    {editingOrderId === order.id ? (
                      <input
                        className="border px-2 py-1 rounded w-full"
                        value={editedOrder.company}
                        onChange={e => setEditedOrder({ ...editedOrder, company: e.target.value })}
                      />
                    ) : order.company}
                  </td>
                  <td className="px-4 py-3">
                    {editingOrderId === order.id ? (
                      <select
                        className="border px-2 py-1 rounded w-full"
                        value={editedOrder.type}
                        onChange={e => setEditedOrder({ ...editedOrder, type: e.target.value })}
                      >
                        <option value="200مل">200مل</option>
                        <option value="330مل">330مل</option>
                        <option value="600~550 مل">600~550 مل</option>
                      </select>
                    ) : order.type}
                  </td>
                  <td className="px-4 py-3">
                    {editingOrderId === order.id ? (
                      <input
                        type="number"
                        className="border px-2 py-1 rounded w-full"
                        value={editedOrder.quantity}
                        onChange={e => setEditedOrder({ ...editedOrder, quantity: e.target.value })}
                      />
                    ) : order.quantity}
                  </td>
                  <td className="px-4 py-3">
                    {editingOrderId === order.id ? (
                      <div className="flex space-x-2 justify-end">
                        <button onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">حفظ</button>
                        <button onClick={handleCancel} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">إلغاء</button>
                      </div>
                    ) : (
                      <button onClick={() => handleEditClick(order)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">تعديل</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
