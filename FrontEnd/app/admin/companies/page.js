'use client';
import Link from "next/link";
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useRouter } from "next/navigation";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { Home, ShoppingCart, List, LogOut, Menu, Activity, Users, Truck, CreditCard, TrendingUp, BarChart2, X, GitPullRequestArrow, Building, Plus } from "lucide-react";
import RoleGuard from '../../components/RoleGuard';

function AdminCompaniesPage() {
  const [products, setProducts] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ company: '', size: '200مل', quantity: 0, price: 20 });
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editingQuantityId, setEditingQuantityId] = useState(null);
  const [editedQuantity, setEditedQuantity] = useState(0);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);

  }, []);
  const fetchProducts = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/products`;   

      const res = await axios.get(apiUrl);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      notyf.error("فشل في جلب المنتجات");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const [notyf, setNotyf] = useState(null);

  useEffect(() => {
    const instance = new Notyf({
      duration: 3000,
      position: { x: 'left', y: 'top' }
    });
    setNotyf(instance);
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = `${process.env.API_URL}/products`;   

      const res = await axios.post(apiUrl, newProduct);
      setIsModalOpen(false);
      fetchProducts();
      notyf.success('تم إضافة المنتج بنجاح');
    } catch (err) {
      console.error(err);
      notyf.error('فشل في إضافة المنتج');
    }
  };

  
  const handleDeleteProduct = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {

        const apiUrl = `${process.env.API_URL}/products/${id}`;   

        await axios.delete(apiUrl);

        fetchProducts();
        notyf.success('تم حذف المنتج بنجاح');
      } catch (err) {
        console.error(err);
        notyf.error('فشل في حذف المنتج');
      }
    }
  };

  const handleUpdateQuantity = async (id) => {
    try {
      const apiUrl = `${process.env.API_URL}/products/${id}/quantity`;   

      await axios.put(apiUrl, {
        quantity: editedQuantity
      });
      notyf.success('تم تحديث الكمية بنجاح');
      setEditingQuantityId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      notyf.error('فشل في تحديث الكمية');
    }
  };
  
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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
            <Link href="/admin/customers" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <Users className="w-5 h-5" /> <span>العملاء</span>
            </Link>
            <Link href="/admin/distributers_requests" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <GitPullRequestArrow className="w-5 h-5" /> <span>طلبات السائقين</span>
            </Link>
            <Link href="/admin/companies" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
              <Building className="w-5 h-5" /> <span>المنتجات</span>
            </Link>
          </div>
          
          <div className="text-xs font-semibold text-gray-400 mt-8 mb-3 pr-3">الإعدادات</div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" /> <span>تسجيل خروج</span>
          </button>
        </nav>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold">المنتجات</h1>
      </div>

      {/* Page Content */}
      <div className={`flex-grow p-6 text-black relative z-10 md:pr-80`}>
        <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">منتجات</h1>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>إضافة منتج جديد</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">اسم الشركة</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">الحجم</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">الكمية</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">المتبقي</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">السعر</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.company} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{product.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700">{product.size}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700">{product.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700">{product.remaining_quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700">{product.price}</div>
                    </td>
                    <td className="px-6 py-4">
  {editingQuantityId === product._id ? (
    <div className="flex gap-2 items-center">
      <input
        type="number"
        className="border border-gray-300 px-2 py-1 rounded-md w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={editedQuantity}
        onChange={e => setEditedQuantity(parseInt(e.target.value) || 0)}
      />
      <button
        onClick={() => handleUpdateQuantity(product._id)}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded-md text-sm"
      >
        حفظ
      </button>
      <button
        onClick={() => setEditingQuantityId(null)}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-md text-sm"
      >
        إلغاء
      </button>
    </div>
  ) : (
    <button
      onClick={() => {
        setEditingQuantityId(product._id);
        setEditedQuantity(product.quantity);
      }}
      className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
    >
      تعديل الكمية
    </button>
  )}

                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 z-50 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">إضافة منتج جديد</h3>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">اسم الشركة</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="أدخل اسم الشركة"
                  value={newProduct.company}
                  onChange={e => setNewProduct({...newProduct, company: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">الحجم</label>
                <select
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  value={newProduct.size}
                  onChange={e => setNewProduct({...newProduct, size: e.target.value})}
                  required
                >
                  <option value="200مل">200مل</option>
                  <option value="330مل">330مل</option>
                  <option value="600~550 مل">600~550 مل</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">الكمية</label>
                <input
                  type="number"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="أدخل الكمية"
                  value={newProduct.quantity}
                  onChange={e => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 0})}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">السعر</label>
                <input
                  type="number"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="أدخل السعر"
                  value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value) || 20})}
                  min="0"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                إضافة المنتج
              </button>
            </form>
          </div>
        </>
      )}

    </div>
  );
}

export default function CompainesPage() {
  return (
    <RoleGuard allowedRoles={['admin']} redirectTo="/">
      <AdminCompaniesPage />
    </RoleGuard>
  );
}