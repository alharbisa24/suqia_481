"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaHandHoldingHeart } from 'react-icons/fa';
import { useUser } from "../context/UserContext";
import axios from 'axios';
import { redirect } from 'next/dist/server/api-utils';
import { useRouter } from "next/navigation";
import Navbar from "../navbar";
import RoleGuard from "../components/RoleGuard";

function UserDonationsPage() {
  const { user, setUser } = useUser();
  const router = useRouter();

 
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
 
  useEffect(() => {

    if(!localStorage.getItem('user')){
      router.push("/");
        }
    
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          const apiUrl = `${process.env.API_URL}/userEmail`;
          const response = await axios.post(apiUrl, {
            email: parsedUser.email,
          });
          if (response.data && response.data._id) {
            setUserId(response.data._id);
          } else {
            console.error('User not found');
          }
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage or fetch user ID:", error);
      }
    };

    fetchUser();
  }, []);

  
  useEffect(() => {
    if (!userId) {
      console.warn("User ID not available yet. Waiting...");
      return;
    }
  
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const apiUrl = `${process.env.API_URL}/orders?userId=${userId}`;        
        const response = await axios.get(apiUrl);
        console.log("Orders Response:", response.data);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrders();
  }, [userId]); // ✅ Runs only when userId is available
  

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'مكتمل';
      case 'waiting': return 'قيد المراجعة';
      case 'canceled': return 'ملغي';
      default: return 'غير معرف';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-3 sm:px-4 lg:px-8">
      <Navbar />
      <div className="max-w-6xl mx-auto">

        {/* Header Section with Logo */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-center items-center gap-3 md:gap-4">
          {/* Donation Logo */}
          <div className="text-sky-400 p-2 md:p-3 rounded-full bg-sky-50">
            <FaHandHoldingHeart className="h-6 w-6 md:h-8 md:w-8" />
          </div>

          {/* Header Text */}
          <div className="text-center md:text-right">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">تبرعاتي</h1>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">بعطائكم يستمر الخير</p>
          </div>
        </div>

        {/* Orders List Container */}
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {orders.map((order, index) => (
            // Order Card
            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200">
              <div className="p-4 md:p-6">

                {/* Order Header Section */}
                <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 mb-3 md:mb-4">

                  {/* Right Side: Item Details */}
                  <div className="w-full md:w-auto">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">

                      {/* Item Name */}
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">
                        {"رقم الطلب" + " "+order.order_id}
                      </h3>

                    </div>

                  </div>

                  {/* Status Badge */}
                  <span className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 border-t pt-3 md:pt-4">

                  {/* First Column */}
                  <div className="space-y-2">
                  <DetailItem
                    
                    label="الشركة"
                    value={order.company}
                  />
                    <DetailItem label="الحجم" value={order.selectedSize} />
                  </div>

                  {/* Second Column */}
                  <div className="space-y-2">
                    <DetailItem label="الكمية" value={order.quantity} />
                    <DetailItem label="تاريخ الطلب" 
                    value={new Date(order.created_at).toISOString().split('T')[0].split('-').reverse().join('-')} />


                  </div>

                  {/* Third Column */}
                  <div className="space-y-2">
                    <DetailItem
                      label="الإجمالي"
                      value={
                        <span className="flex items-center gap-1">
                          {order.totalPrice}
                          <img
                            className="h-4 md:h-5 w-auto inline-block"
                            src='images/Saudi_Riyal_Symbol.svg'
                            alt="ريال سعودي"
                          />
                        </span>
                      }
                    />
                    <DetailItem label="وقت الطلب" 
                     value={new Date(order.created_at).toLocaleTimeString('ar-GB', { hour: '2-digit', minute: '2-digit' })} />

                  </div>

                  {/* Fourth Column */}
                  <div className="space-y-2">
                  <DetailItem
                    
                    label="العنوان"
                    value={`${order.city} - ${order.district} - ${order.street}`}
                  />
                    <DetailItem label="اسم المسجد" value={order.mosque} />
                  </div>
                
                {order.status == 'completed' && (
                  
                  <div className="space-y-2">
                  <p className="text-xs md:text-sm text-gray-900">صورة التسليم</p>
                  <img src={`${order.image}`} alt="صورة التسليم" className="h-20 w-20 object-cover rounded-lg border" />
 
                   </div>
                )};
                 

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <div className="mb-4 text-sky-400">
              <svg
                className="mx-auto h-10 w-10 md:h-12 md:w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>

            <h3 className="text-lg md:text-xl font-medium text-gray-900">ليس لديك أي تبرع!</h3>
            <div className="mt-3 md:mt-4">
              <Link href="/order">
                <button className="bg-[#38B6FF] text-white text-sm md:text-base font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-[#29A5F2]">
                  ابدأ رحلة الخير
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Detail Item Component
const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-xs md:text-sm text-gray-900">{label}</p>
    <p className="text-sm md:text-base font-medium text-gray-900">
      {value}
    </p>
  </div>
);


export default function OrdersPage() {
  return (
    <RoleGuard allowedRoles={['user']} redirectTo="/">
      <UserDonationsPage />
    </RoleGuard>
  );
}
