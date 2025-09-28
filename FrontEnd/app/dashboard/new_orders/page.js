'use client';
import Link from "next/link";
import { Home, ShoppingCart, List, LogOut, Menu } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useRouter } from "next/navigation";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
export default function DashboardNewOrdersPage() {



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
  const [myOrders, setMyOrders] = useState([]);
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
      fetchMyOrders();
    }
  }, [user]); 
  
  const fetchMyOrders = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/distributer_orders?distributer_id=${user.id}`;
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        setMyOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  

  // UI Control States
  const [activeTab, setActiveTab] = useState('new');     
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [deliveryImage, setDeliveryImage] = useState(null);  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  // DOM Refs for camera elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ========== CAMERA FUNCTIONALITY ========== //
  // Initialize camera when upload modal opens
  useEffect(() => {
    if (isUploadModalOpen) {
      startCamera();
    }
    return () => stopCamera(); // Cleanup on component unmount
  }, [isUploadModalOpen]);

  // Start camera stream
  const startCamera = async () => {
    try {
      // Stop existing tracks if any
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      
      // Request camera access and start stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Use rear-facing camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('الرجاء السماح بالوصول إلى الكاميرا');
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  // Capture image from video stream
 // Capture image from video stream
const captureImage = () => {
  const canvas = canvasRef.current;
  const video = videoRef.current;
  if (!canvas || !video) return;

  // تأكد من وجود أبعاد صحيحة للفيديو
  if (!video.videoWidth || !video.videoHeight) {
    alert('الكاميرا ما عطت إشارة');
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  const imageDataURL = canvas.toDataURL('image/jpeg');
  console.log('Captured image:', imageDataURL);  // تأكد هنا إن الصورة مش فارغة
  setDeliveryImage(imageDataURL);
};


  // Handle photo retake
  const handleRetake = () => {
    setDeliveryImage(null);
    startCamera();
  };

  
  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([uintArray], { type: mimeString });
  };


 

  const assignOrder = async (orderId) => {
    setLoading(true);

    if (myOrders.length > 0) {
      alert('لديك طلب مخصص لم يتم تسليمه بعد. الرجاء إكمال التسليم الحالي أولاً');
      setLoading(false);
      return;
    }
  
    try {
      const apiUrl = `${process.env.API_URL}/assignOrder`;        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId,
          distributer_id: user?.id, 
        }),
      });
  
      if (response.status === 200) {
        setLoading(false);
            fetchOrders();
            fetchMyOrders();
            window.notyf.success('تم تعيين الطلب لك بنجاح !');

    
      } else {
        setLoading(false);

      }

      if(response.status === 500){
        window.notyf.error('عذرا ! الطلب استلمه سائق اخر ، يمكنك استلام طلب اخر.');
        fetchOrders();
        fetchMyOrders();
      }

    } catch (error) {
      alert(error.message);
      setLoading(false);

    }
  };

  const setCancelDelivery = async (orderId) => {
    setLoading2(true);

    try {
      const apiUrl = `${process.env.API_URL}/cancelDelivery`;        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId,
          distributer_id: user?.id, 
        }),
      });
  
      if (response.status === 200) {
        setLoading2(false);
            fetchOrders();
            fetchMyOrders();
    
      } else {
        alert('حدث خطأ أثناء تعيين الطلب. الرجاء المحاولة مرة أخرى.');
        setLoading2(false);

      }
    } catch (error) {
      alert(error.message);
      setLoading2(false);

    }

  };
  const handleDeliveryConfirmation = async () => {
    if (!deliveryImage) {
      alert('الرجاء التقاط صورة للتأكيد');
      return;
    }
  
    try {
      const apiUrl = `${process.env.API_URL}/order_completed`;
      const formData = new FormData();
  
      const imageBlob = await fetch(deliveryImage).then(res => res.blob());
      formData.append("id", selectedOrder._id); 
      formData.append('image', imageBlob, `${selectedOrder._id}.jpeg`);
  
      const orderCompletionResponse = await axios.post(apiUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (orderCompletionResponse.status === 200) {
        alert('تم تأكيد التسليم بنجاح!');
        fetchMyOrders();
        fetchOrders();
      } else {
        alert('فشل في تأكيد التسليم. الرجاء المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Error during delivery confirmation:', error);
      alert('حدث خطأ أثناء تأكيد التسليم. الرجاء المحاولة لاحقاً.');
    } finally {
      setIsUploadModalOpen(false);
      setDeliveryImage(null);
      stopCamera();
    }
  };
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
        <Link href="/dashboard/new_orders" className="flex items-center space-x-3 p-3 rounded-lg bg-gray-200 transition text-black">
          <ShoppingCart className="w-5 h-5 text-gray-700 m-2" /> <span>الطلبات الجارية</span>
        </Link>
        <Link href="/dashboard/orders" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition text-black">
          <List className="w-5 h-5 text-gray-700 m-2" /> <span>الطلبات المكتملة</span>
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
          <LogOut className="w-5 h-5 text-gray-700 m-2" /> <span>تسجيل خروج</span>
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
        <h1 className="text-2xl font-bold text-right mb-8">الطلبات الجارية</h1>


        <div className="relative flex flex-col my-12 bg-white rounded-3xl p-6 overflow-x-auto">
          <div className="flex justify-end mb-4">
            
          </div>
          <div className="flex gap-4 mb-6">
            {/* New Orders Tab */}
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'new' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('new')}
            >
              الطلبات الجديدة ({orders.length})
            </button>

            {/* Assigned Orders Tab */}
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'assigned' 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('assigned')}
            >
              الطلبات المخصصة ({myOrders.length})
            </button>
            </div>
            {activeTab === 'new' && (
            /* New Orders Table */
            <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm md:text-base">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2">رقم الطلب</th>
                    <th className="px-4 py-2">الطلب</th>
                    <th className="px-4 py-2">الشركة</th>
                    <th className="px-4 py-2">الكمية</th>
                    <th className="px-4 py-2">المبلغ</th>
                    <th className="px-4 py-2">العنوان</th>
                    <th className="px-4 py-2">المسجد</th>
                    <th className="px-4 py-2">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order,index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-3">#{order.order_id}</td>
                      <td className="px-4 py-3">كرتون ماء {order.selectedSize}</td>
                      <td className="px-4 py-3">{order.company}</td>
                      <td className="px-4 py-3">{order.quantity}</td>
                      <td className="px-4 py-3"><div className="space-y-2">
                    
                    
                        <span className="flex items-center gap-1">
                          {order.totalPrice}
                          <img
                            className="h-4 md:h-5 w-auto inline-block"
                            src='/images/Saudi_Riyal_Symbol.svg'
                            alt="ريال سعودي"
                          />
                        </span>
                      
                   
                    </div>
                    </td>
                      <td className="px-4 py-3">{order.city} - {order.district} - {order.street}

                      <button
  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`, "_blank")}
  className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
  الاتجاهات للموقع
</button>
                      </td>
                      <td className="px-4 py-3">{order.mosque}</td>
                      <td className="px-4 py-3">
                        
                      <button
                          onClick={() => assignOrder(order._id)}
                          className={`px-4 py-2 rounded-lg flex items-center justify-center ${
        myOrders.length > 0 
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-sky-500 text-white hover:bg-sky-600"
      }`}
      disabled={myOrders.length > 0 || loading}
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
        myOrders.length > 0 ? "مشغول بتسليم طلب آخر" : "تعيين لي"
      )}
    </button>

                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                        لا توجد طلبات جديدة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'assigned' && (
            /* Assigned Orders Table */
            <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm md:text-base">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2">رقم الطلب</th>
                    <th className="px-4 py-2">الطلب</th>
                    <th className="px-4 py-2">الشركة</th>
                    <th className="px-4 py-2">الكمية</th>
                    <th className="px-4 py-2">العنوان</th>
                    <th className="px-4 py-2">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.map((order,index) => (
                        <tr key={index} className="border-t">
                        <td className="px-4 py-3">#{order.order_id}</td>
                        <td className="px-4 py-3">كرتون ماء {order.selectedSize}</td>
                        <td className="px-4 py-3">{order.company}</td>
                        <td className="px-4 py-3">{order.quantity}</td>
                        <td className="px-4 py-3">{order.city} - {order.district} - {order.street}</td>
                        <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsUploadModalOpen(true);
                          }}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                          تاكيد التسليم
                        </button>
                        <br/>  <br/>
                        <button
  onClick={() => {
  
     setCancelDelivery(order._id);
 
  }}
  className={`px-2 py-2  rounded-lg transition text-white ${
    loading2 ? 'bg-red-400 cursor-not-allowed' : 'bg-red-300 hover:bg-red-600'
  }`}
  disabled={loading2} // Disable button while loading
>

  {loading2 ? (
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
    'التنازل عن الطلب'
  )}
</button>
                      </td>
                    </tr>
                  ))}
                  {myOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                        لا توجد طلبات مخصصة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        
        </div>
      </div>

        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] relative">
              <img
                src={selectedImage}
                alt="صورة التسليم المعينة"
                className="max-w-full max-h-[80vh] object-contain"
              />
              <button
                className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 text-2xl"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Camera Capture Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
              <h3 className="text-lg font-semibold text-right mb-4">
                تأكيد التسليم للطلب #{selectedOrder?.order_id}
              </h3>

              <div className="relative aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {!deliveryImage ? (
                  <video 
                    ref={videoRef} 
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={deliveryImage}
                    alt="معاينة صورة التسليم"
                    className="w-full h-full object-cover"
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-2 justify-end">
                {!deliveryImage ? (
                  <>
                    <button
                      onClick={captureImage}
                      className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                    >
                      التقاط صورة
                    </button>
                    <button
                      onClick={() => {
                        setIsUploadModalOpen(false);
                        stopCamera();
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      إلغاء
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleDeliveryConfirmation}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      تأكيد التسليم
                    </button>
                    <button
                      onClick={handleRetake}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      إعادة التقاط
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
   
      </div>
  

  );
}