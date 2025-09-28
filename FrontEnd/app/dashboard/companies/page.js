'use client';
import { Home, ShoppingCart, List, LogOut, Menu, Building } from "lucide-react";
import Link from "next/link";
import { useState } from 'react';

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
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Sidebar */}
      <button className="top-20 right-5 z-50 bg-gray-100 p-2 rounded-full md:hidden fixed" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      <div className={`fixed right-0 min-h-[600px] w-64 bg-gray-50 text-black shadow-lg flex flex-col m-5 mt-20 rounded-3xl p-6 transition-transform duration-300 ease-in-out transform ${
        isSidebarOpen ? 'translate-x-0 top-20' : 'translate-x-full top-10'
      } md:translate-x-0 z-50`}>
        <h2 className="text-xl font-semibold text-center text-black mb-8">لوحة تحكم السائقين</h2>
        <nav className="flex flex-col space-y-4">
          <Link href="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition text-black">
            <Home className="w-5 h-5 text-gray-700 m-2" /> <span>الرئيسية</span>
          </Link>
          <Link href="/dashboard/new_orders" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition text-black">
            <ShoppingCart className="w-5 h-5 text-gray-700 m-2" /> <span>الطلبات الجارية</span>
          </Link>
          <Link href="/dashboard/orders" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition text-black">
            <List className="w-5 h-5 text-gray-700 m-2" /> <span>الطلبات المكتملة</span>
          </Link>
          <Link href="/dashboard/companies" className="flex items-center space-x-3 p-3 rounded-lg bg-gray-200 transition text-black">
            <Building className="w-5 h-5 text-gray-700 m-2" /> <span>الشركات</span>
          </Link>
          <button
            onClick={() => alert("تسجيل خروج")}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-300 transition mt-auto text-black"
          >
            <LogOut className="w-5 h-5 text-gray-700 m-2" /> <span>تسجيل خروج</span>
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
