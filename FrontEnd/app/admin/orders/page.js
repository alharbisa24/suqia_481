'use client';
import Link from "next/link";
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useRouter } from "next/navigation";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { Home, ShoppingCart, List, LogOut, Menu, Activity, Users, Truck, CreditCard, TrendingUp, BarChart2, X,GitPullRequestArrow,Building } from "lucide-react";
import RoleGuard from '../../components/RoleGuard';

function AdminOrdersPage() {

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
  const [searchTerm, setSearchTerm] = useState('');


  const fetchOrders = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/distributers_all_completed_orders`;        
      const response = await axios.get(apiUrl);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error.message);
    } finally {
    }
  };
  
  

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
    fetchOrders();
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
  const filteredOrders = orders.filter(order => order?.order_id?.toString().includes(searchTerm));
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب؟')) {
      try {
        const apiUrl = `${process.env.API_URL}/deleteOrder`;
        const response = await axios.post(apiUrl, { 
          orderId: orderId 
        });
        
        if (response.status === 200) {
          window.notyf.success('تم حذف الطلب بنجاح');
          // Refresh orders after deletion
          fetchOrders();
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        window.notyf.error(error.response?.data?.message || 'حدث خطأ أثناء حذف الطلب');
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
          <Link href="/admin/new_orders" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <ShoppingCart className="w-5 h-5" /> <span>الطلبات الجديدة</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
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
        {/* Dashboard Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">الطلبات المكتملة</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
  <div className="mb-6">
    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
      
      <div className="relative w-full md:w-64">
        <input
          type="text"
          placeholder="ابحث برقم الطلب"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-lg text-right focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors"
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
                <th scope="col" className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">
                  رقم الطلب
                </th>
                <th scope="col" className="py-3.5 px-4 text-sm font-medium text-right text-gray-700 min-w-[260px]">
                  تفاصيل الطلب
                </th>
                <th scope="col" className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">
                  صورة التسليم
                </th>
                <th scope="col" className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">
                  المبلغ
                </th>
                <th scope="col" className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">
                  الحالة
                </th>
                <th scope="col" className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">
                  بيانات السائق
                </th>
                <th scope="col" className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">
                  تاريخ التسليم
                </th>
                <th scope="col" className="py-3.5 px-4 text-sm font-medium text-right text-gray-700">
      اجراء
    </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr 
                    key={order._id || index} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">#{order.order_id}</span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">كرتون ماء {order.selectedSize}</span>
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">{order.quantity} كرتون</span>
                        </div>
                        <div className="text-sm text-gray-500">{order.company}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{order.city} - {order.district} - {order.street}</div>
                        <div className="text-sm font-medium text-gray-700">{order.mosque}</div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="relative group">
                        <img 
                          src={order.image} 
                          alt="صورة التسليم" 
                          className="h-20 w-20 object-cover rounded-md border border-gray-200 transition-transform group-hover:scale-105 cursor-pointer" 
                          onClick={() => window.open(order.image, '_blank')}
                        />
                     
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <span className="font-medium text-gray-900">{order.totalPrice}</span>
                        <img className="h-4 w-auto" src='/images/Saudi_Riyal_Symbol.svg' alt="ريال سعودي" />
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                        مكتمل
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{order.distributer_id.fullname}</div>
                    <a 
  href={`https://wa.me/966${order.distributer_id.phoneNumber}`} 
  target="_blank" 
  rel="noopener noreferrer"
  className="text-sm text-green-600 hover:text-green-800 hover:underline flex items-center"
>
  <svg className="w-4 h-4 ml-1.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M20.5027 3.4863C18.2578 1.2411 15.2495 0.00291443 12.0566 0C5.46537 0 0.116463 5.34891 0.114588 11.9402C0.11365 14.0485 0.648988 16.1022 1.67608 17.9258L0 24.0026L6.2218 22.3593C7.97833 23.2887 9.9584 23.7769 11.9778 23.7778H11.9822C18.5729 23.7778 23.9226 18.4278 23.9245 11.8365C23.9262 8.65467 22.7476 5.73152 20.5027 3.4863ZM12.0566 21.7825H12.0528C10.2717 21.7816 8.52645 21.3122 6.99009 20.4332L6.62583 20.2226L2.86823 21.1706L3.83308 17.5016L3.60112 17.1239C2.63655 15.5318 2.10926 13.6743 2.10989 11.9411C2.11239 6.44531 6.56091 1.9968 12.0604 1.9968C14.7306 1.9987 17.2679 3.03639 19.1251 4.8937C20.9824 6.75102 22.019 9.28706 22.0177 12.0346C22.0133 17.5313 17.5657 21.7825 12.0566 21.7825ZM17.5256 14.4276C17.2263 14.2777 15.7581 13.5575 15.4813 13.4576C15.2057 13.3578 15.0005 13.3077 14.794 13.607C14.5889 13.9064 14.0195 14.576 13.842 14.7824C13.6644 14.9889 13.4869 15.0138 13.1876 14.864C12.8884 14.714 11.92 14.3966 10.7743 13.3703C9.87432 12.5671 9.26591 11.5747 9.08839 11.2754C8.91087 10.9761 9.06867 10.8109 9.2201 10.6582C9.35835 10.5225 9.52525 10.3037 9.67659 10.1262C9.82793 9.94869 9.87806 9.82367 9.97831 9.61716C10.0786 9.41065 10.0284 9.23313 9.9533 9.08328C9.87806 8.93342 9.27273 7.46467 9.01797 6.86637C8.76946 6.28306 8.51783 6.35673 8.33095 6.34735C8.15343 6.33859 7.94828 6.33672 7.74177 6.33672C7.53526 6.33672 7.20851 6.41195 6.93166 6.71125C6.65544 7.01054 5.88456 7.73078 5.88456 9.1995C5.88456 10.6682 6.95787 12.0871 7.10922 12.2936C7.25994 12.5001 9.25549 15.5483 12.2816 16.8415C13.0125 17.1503 13.5831 17.3363 14.0263 17.4745C14.7608 17.7036 15.4301 17.6702 15.9577 17.5932C16.5453 17.5067 17.7501 16.8664 18.0048 16.1686C18.2596 15.4707 18.2596 14.8725 18.1844 14.7824C18.1091 14.6923 17.9039 14.6424 17.5256 14.4276Z" />
  </svg>
  966{order.distributer_id.phoneNumber}
  </a>                        
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 ltr:text-left rtl:text-right">
                      {new Date(order.completed_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
  <button
    onClick={() => handleDeleteOrder(order._id)}
    className="px-3 py-1 text-xs rounded-md bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
  >
    حذف الطلب
  </button>
</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p className="mt-4 text-lg font-medium text-gray-500">لا توجد طلبات مكتملة</p>
                      <p className="mt-1 text-sm text-gray-400">ستظهر الطلبات المكتملة هنا بمجرد توفرها</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {filteredOrders.length > 10 && (
            <div className="py-4 px-6 bg-white border-t border-gray-200">
              <nav className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    السابق
                  </button>
                  <button className="ml-3 px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    التالي
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      عرض <span className="font-medium">{filteredOrders.length}</span> طلب
                    </p>
                  </div>
                  {/* Add pagination controls here if needed */}
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>   </main>
    </div>
  
 
 
  </div>
  
  );
}

export default function DashboardOrdersPage() {
  return (
    <RoleGuard allowedRoles={['admin']} redirectTo="/">
      <AdminOrdersPage />
    </RoleGuard>
  );
}