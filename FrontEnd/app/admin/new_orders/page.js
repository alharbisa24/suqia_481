'use client';
import Link from "next/link";
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useRouter } from "next/navigation";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { Home, ShoppingCart, List, LogOut, Menu, Activity, Users, Truck, CreditCard, TrendingUp, BarChart2, X ,GitPullRequestArrow ,Building} from "lucide-react";

export default function AdminewOrdersPage() {

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributorId, setSelectedDistributorId] = useState('');
  const [orderToAssign, setOrderToAssign] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  

    useEffect(() => {
      // تهيئة Notyf مع إعدادات مخصصة
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

  const router = useRouter();

  
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);


  const fetchOrders = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/new_orders`;        
      const response = await axios.get(apiUrl);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error.message);
    } finally {
    }
  };
  const fetchDistributors = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/distributers`;
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        setDistributors(response.data);
        // Pre-select first distributor if available
        if (response.data.length > 0) {
          setSelectedDistributorId(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching distributers:", error);
      window.notyf.error('حدث خطأ أثناء جلب بيانات السائقين');
    }
  };
  

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
    fetchOrders();
    fetchDistributors();
  }, []); 
  
  useEffect(() => {
    if (user?.id) {
      if (user.rank == 'user') {
        router.push("/");
      }
    }
  }, [user]); 
  

  

  // UI Control States
  const [activeTab, setActiveTab] = useState('new');     
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [deliveryImage, setDeliveryImage] = useState(null);  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);



  const openAssignModal = (order) => {
    setOrderToAssign(order);
    setIsAssignModalOpen(true);
  };
  
  // Assign order to specific distributor
  const assignOrderToDistributor = async () => {
    if (!selectedDistributorId || !orderToAssign) {
      window.notyf.error('الرجاء اختيار سائق');
      return;
    }
    console.log(selectedDistributorId, orderToAssign._id);
    
    setIsAssigning(true);
    try {
      const apiUrl = `${process.env.API_URL}/assignOrder`;
      const response = await axios.post(apiUrl, {
        id: orderToAssign._id,
        distributer_id: selectedDistributorId
      });
  
      if (response.status === 200) {
        window.notyf.success('تم تعيين الطلب للسائق بنجاح');
        fetchOrders();
        setIsAssignModalOpen(false);
        setOrderToAssign(null);
      }
    } catch (error) {
      console.error("Error assigning order:", error);
      console.log(error.response?.data);
      window.notyf.error(error.response?.data?.message || 'حدث خطأ أثناء تعيين الطلب');
    } finally {
      setIsAssigning(false);
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
      className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out overflow-y-auto ${
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
          <Link href="/admin/new_orders" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
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
            <Link href="/admin/companies" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">الطلبات الجديدة</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="  items-center  text-sm text-gray-600 font-medium">
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
  <table className="min-w-full text-right divide-y divide-gray-200">
    {/* Table Header */}
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3.5 text-sm font-semibold text-gray-700">رقم الطلب</th>
        <th className="px-6 py-3.5 text-sm font-semibold text-gray-700">الطلب</th>
        <th className="px-6 py-3.5 text-sm font-semibold text-gray-700">الشركة</th>
        <th className="px-6 py-3.5 text-sm font-semibold text-gray-700">الكمية</th>
        <th className="px-6 py-3.5 text-sm font-semibold text-gray-700">المبلغ</th>
        <th className="px-6 py-3.5 text-sm font-semibold text-gray-700 min-w-[250px]">العنوان</th>
        <th className="px-6 py-3.5 text-sm font-semibold text-gray-700">المسجد</th>
        <th className="px-6 py-3.5 text-sm font-semibold text-gray-700">الإجراء</th>
      </tr>
    </thead>

    {/* Table Body */}
    <tbody className="bg-white divide-y divide-gray-200">
      {orders.length > 0 ? (
        orders.map((order, index) => (
          <tr key={index} className="hover:bg-gray-50 transition-colors">
            {/* Order ID */}
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="font-medium text-gray-900">#{order.order_id}</span>
            </td>
            
            {/* Order Item */}
            <td className="px-6 py-4">
              <span className="font-medium text-gray-800">كرتون ماء {order.selectedSize}</span>
            </td>
            
            {/* Company */}
            <td className="px-6 py-4">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                {order.company}
              </span>
            </td>
            
            {/* Quantity */}
            <td className="px-4 py-4">
              <span className="px-2 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                {order.quantity} كرتون
              </span>
            </td>
            
            {/* Price */}
            <td className="px-6 py-4">
              <div className="flex items-center">
                <span className="font-medium text-green-600">{order.totalPrice}</span>
                <img
                  className="h-4 md:h-5 w-auto inline-block mr-1"
                  src='/images/Saudi_Riyal_Symbol.svg'
                  alt="ريال سعودي"
                />
              </div>
            </td>
            
            {/* Address */}
            <td className="px-6 py-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-700">{order.city} - {order.district} - {order.street}</div>
                
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`, "_blank")}
                  className="flex items-center text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors border border-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  الاتجاهات للموقع
                </button>
              </div>
            </td>
            
            {/* Mosque */}
            <td className="px-6 py-4">
              <div className="font-medium text-gray-800">{order.mosque}</div>
            </td>
            
            {/* Action Button */}
            <td className="px-6 py-4">
              <button
                onClick={() => openAssignModal(order)}
                className="flex items-center justify-center px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm whitespace-nowrap"
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    تعيين لسائق
                  </>
                )}
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="8" className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-gray-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">لا توجد طلبات جديدة</h3>
              <p className="mt-1 text-sm text-gray-500">ستظهر الطلبات الجديدة هنا عندما يتم إنشاؤها.</p>
            </div>
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
                  </div>
                  </div>
      </main>
    </div>
    {isAssignModalOpen && (
  <>
    {/* Semi-transparent backdrop */}
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setIsAssignModalOpen(false)}
    >
      {/* Modal card */}
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
          <h3 className="text-xl font-bold text-white">تعيين الطلب للسائق</h3>
        </div>
        
        {/* Modal content */}
        <div className="p-6">
          {orderToAssign && (
            <div className="mb-6 bg-blue-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-900">رقم الطلب:</p>
                  <p className="font-medium text-gray-400">#{orderToAssign.order_id}</p>
                </div>
                <div>
                  <p className="text-gray-500">الشركة:</p>
                  <p className="font-medium text-gray-400">{orderToAssign.company}</p>
                </div>
                <div>
                  <p className="text-gray-500">المسجد:</p>
                  <p className="font-medium text-gray-400">{orderToAssign.mosque}</p>
                </div>
                <div>
                  <p className="text-gray-500">المبلغ:</p>
                  <p className="font-medium flex items-center text-green-400">
                    {orderToAssign.totalPrice}
                    <img 
                      className="h-4 w-auto inline-block mr-1" 
                      src='/images/Saudi_Riyal_Symbol.svg' 
                      alt="ريال" 
                    />
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="distributorSelect" className="block text-sm font-medium text-gray-700 mb-2 text-right">
              اختر السائق <span className="text-red-500">*</span>
            </label>
            
            {distributors.length > 0 ? (
              <div className="relative">
               <select
  id="distributorSelect"
  value={selectedDistributorId}
  onChange={(e) => setSelectedDistributorId(e.target.value)}
  className="w-full p-3 pr-10 text-right rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all appearance-none text-gray-600"
  required
>
  <option value="" disabled>اختر سائق</option>
  {distributors.map((distributor, index) => (
    <option 
      key={distributor._id || distributor.id || index} 
      value={distributor._id || distributor.id}
    >
      {distributor.fullname} - {distributor.phoneNumber}
    </option>
  ))}
</select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">لا يوجد سائقين متاحين حاليًا</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal footer */}
        <div className="bg-gray-50 p-4 flex justify-between">
          <button
            onClick={() => setIsAssignModalOpen(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          
          <button
            onClick={assignOrderToDistributor}
            disabled={isAssigning || !selectedDistributorId}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center ${
              isAssigning || !selectedDistributorId ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            } transition-colors`}
          >
            {isAssigning ? (
              <>
                <svg className="animate-spin h-5 w-5 ml-2 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري التعيين...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                تعيين الطلب
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </>
)}

// Add this CSS keyframe animation to your global CSS or component style
<style jsx>{`
  @keyframes scale-in {
    0% {
      opacity: 0;
      transform: scale(0.95);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  .animate-scale-in {
    animation: scale-in 0.2s ease-out forwards;
  }
`}</style>
  </div>
  
  );
}