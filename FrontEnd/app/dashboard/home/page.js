'use client';
import Link from "next/link";
import { Home, ShoppingCart, List, LogOut, Menu } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useRouter } from "next/navigation";
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, BarElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement,LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

export default function DashboardHomePage() {
  const [price, setPrice] = useState(0); // Initialize with 0
  const [totalOrdersCompleted, setTotalOrdersCompleted] = useState(0); // Initialize with 0
  const [totalOrderswating, settotalOrderswating] = useState(0); // Initialize with 0
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chartData, setChartData] = useState(null); 
  const [barChartData, setBarChartData] = useState(null); 

  const fetchBarChartData = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/distributer_orders_by_company?distributer_id=${user.id}`;
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        const labels = response.data.map(item => item.company_name); // Use "company_name" for labels
        const data = response.data.map(item => item.total); // Use "total" for data
        setBarChartData({
          labels,
          datasets: [
            {
              label: 'عدد الطلبات لكل شركة',
              data,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    }
  };

  const fetchPrics = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/distributer_total_price`;        
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
    fetchPrics();
  }, []); 

  useEffect(() => {
    if (user?.id) {
      if (user.rank == 'user') {
        router.push("/");
      }
      fetchMyprice();
      fetchMycompleteorder();
      fetchMywatinigorder();
      fetchOrdersChart(); 
      fetchBarChartData();
        }
  }, [user]); 
  const fetchMyprice = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/distributer_total_price?distributer_id=${user.id}`;        
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        setPrice(response.data.Price || 0); // Set price from the response data
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  const fetchMycompleteorder = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/distributer_completed_count?distributer_id=${user.id}`;        
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        setTotalOrdersCompleted(response.data.completedOrdersCount); // Set price from the response data
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  const fetchMywatinigorder = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/distributer_waiting_count?distributer_id=${user.id}`;        
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        settotalOrderswating(response.data.waitingOrdersCount);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  const fetchOrdersChart = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/distributer_completed_orders_chart?distributer_id=${user.id}`;        
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        const labels = response.data.map(item => item.date); 
        const data = response.data.map(item => item.total);
        setChartData({
          labels,
          datasets: [
            {
              label: 'عدد الطلبات المكتملة',
              data,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 2,
              tension: 0.4, 
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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
          <Link href="/dashboard/home" className="flex items-center space-x-3 p-3 rounded-lg bg-gray-200 transition text-black">
            <Home className="w-5 h-5 text-gray-700 m-2" /> <span>الرئيسية</span>
          </Link>
          <Link href="/dashboard/new_orders" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition text-black">
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
          className="top-20 right-5 z-50 bg-gray-100 p-2 rounded-full md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-right mb-8">الصفحة الرئيسية</h1>

        <div className="space-y-6">
          {/* Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card for الرصيد */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-2 text-blue-700">اجمالي الدخل</h2>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  <p className="text-3xl font-bold text-gray-800">{price}   <img
                            className="h-4 md:h-5 w-auto inline-block"
                            src='/images/Saudi_Riyal_Symbol.svg'
                            alt="ريال سعودي"
                          /></p>
                </div>
              </div>
            </div>

            {/* Card for الطلبات الجديدة */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-2 text-blue-700">الطلبات الجديدة</h2>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  <p className="text-3xl font-bold text-gray-800">{totalOrderswating}</p>
                </div>
              </div>
            </div>

            {/* Card for اجمالي الطلبات المكتملة */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-2 text-blue-700">اجمالي الطلبات المكتملة</h2>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3"></div>
                  <p className="text-3xl font-bold text-gray-800">{totalOrdersCompleted}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Large Card for Line Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
  {/* Card for Line Chart */}
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-lg font-semibold mb-4 text-blue-700">معدل الطلبات</h2>
    <div className="border-t border-gray-200 pt-4">
      {chartData ? (
        <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">Loading chart...</p>
        </div>
      )}
    </div>
  </div>

  {/* Card for Bar Chart */}
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-lg font-semibold mb-4 text-blue-700">عدد الطلبات لكل شركة</h2>
    <div className="border-t border-gray-200 pt-4">
      {barChartData ? (
        <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">Loading chart...</p>
        </div>
      )}
    </div>
  </div>
</div>
</div>
</div>

  );
}