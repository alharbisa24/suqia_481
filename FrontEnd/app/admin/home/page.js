'use client';
import Link from "next/link";
import { Home, ShoppingCart, List, LogOut, Menu, Users, Truck, CreditCard, TrendingUp, BarChart2, X, GitPullRequestArrow,Building } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useRouter } from "next/navigation";
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, BarElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js';
import RoleGuard from '../../components/RoleGuard';

ChartJS.register(BarElement, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

function AdminDashboardHomePage() {
  const [price, setPrice] = useState(0); 
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chartData, setChartData] = useState(null); 
  const [barChartData, setBarChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summary,setSummary] = useState(null);
  

  const [distributorOrdersData, setDistributorOrdersData] = useState(null);

// Add this function with your other fetching functions
const fetchDistributorOrders = async () => {
  try {
    const apiUrl = `${process.env.API_URL}/distributors_order_counts`; // Adjust the endpoint as needed
    const response = await axios.get(apiUrl);
    
    if (response.status === 200) {
      const data = response.data;
      const labels = data.map(item => item.distributor_name);
      const ordersData = data.map(item => item.orders_count);
      
      // Generate colors for each bar
      const colors = data.map((_, index) => {
        const hue = 210 + (index * 25) % 150; // Generate blues with some variation
        return `hsla(${hue}, 80%, 60%, 0.8)`;
      });
      
      setDistributorOrdersData({
        labels,
        datasets: [
          {
            label: 'عدد الطلبات',
            data: ordersData,
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('0.8', '1')),
            borderWidth: 1,
            borderRadius: 6,
            maxBarThickness: 45,
          }
        ],
      });
    }
  } catch (error) {
    console.error('Error fetching distributor orders data:', error);
  }
};
const fetchBarChartData = async () => {
  try {
    const apiUrl = `${process.env.API_URL}/distributer_orders_by_company`;
    const response = await axios.get(apiUrl);
    if (response.status === 200) {
      const labels = response.data.map(item => item.company_name);
      const data = response.data.map(item => item.total);
      
      // Use consistent colors based on index instead of random
      const backgroundColor = labels.map((_, index) => {
        const hue = (200 + index * 25) % 360;
        return `hsla(${hue}, 80%, 60%, 0.7)`;
      });
      
      const borderColor = backgroundColor.map(color => color.replace('0.7', '1'));
      
      setBarChartData({
        labels,
        datasets: [
          {
            label: 'عدد الطلبات لكل شركة',
            data,
            backgroundColor,
            borderColor,
            borderWidth: 1,
            borderRadius: 6,
            maxBarThickness: 40,
          },
        ],
      });
    }
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
  }
};
  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const apiUrl = `${process.env.API_URL}/admin_summary`;        
      const response = await axios.get(apiUrl);
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []); 

  useEffect(() => {
    if (user?.id) {
      if (user.rank == 'user') {
        router.push("/");
      }
      fetchSummary();
      fetchDistributorOrders();
      fetchOrdersChart(); 
      fetchBarChartData();
    }
  }, [user]); 
  

  
  
  const fetchOrdersChart = async () => {
    try {
      const apiUrl = `${process.env.API_URL}/distributer_completed_orders_chart`;        
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
              borderColor: 'rgba(56, 189, 248, 1)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointBackgroundColor: 'white',
              pointBorderColor: 'rgba(56, 189, 248, 1)',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <RoleGuard allowedRoles={['admin']} redirectTo="/">
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
              <p className="font-medium text-gray-400">{user?.fullname}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-5">
          <div className="text-xs font-semibold text-gray-400 mb-3 pr-3">القائمة الرئيسية</div>
          <div className="space-y-1">
            <Link href="/admin/home" className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">مرحبًا بك في لوحة التحكم</h2>
            <p className="text-gray-600">نظرة عامة على أداء النظام والإحصائيات الهامة</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Card 1 - Total Orders Value */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow overflow-hidden relative">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              
              <h3 className="text-base font-semibold text-gray-500">إجمالي مبالغ الطلبات</h3>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-800">{summary?.orders.totalValue}</p>
                <img className="h-4 w-auto inline-block mr-1" src='/images/Saudi_Riyal_Symbol.svg' alt="ريال سعودي" />
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-50 rounded-full opacity-30"></div>
            </div>

            {/* Card 2 - Driver Payments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow overflow-hidden relative">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              
              <h3 className="text-base font-semibold text-gray-500">إجمالي مستحقات السائقين</h3>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-800">{summary?.orders.netRevenue}</p>
                <img className="h-4 w-auto inline-block mr-1" src='/images/Saudi_Riyal_Symbol.svg' alt="ريال سعودي" />
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-50 rounded-full opacity-30"></div>
            </div>

            {/* Card 3 - Total Profit */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow overflow-hidden relative">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              
              <h3 className="text-base font-semibold text-gray-500">إجمالي الأرباح</h3>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-800">{summary?.orders.serviceFees}</p>
                <img className="h-4 w-auto inline-block mr-1" src='/images/Saudi_Riyal_Symbol.svg' alt="ريال سعودي" />
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-green-50 rounded-full opacity-30"></div>
            </div>

            {/* Card 4 - Customer Count */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow overflow-hidden relative">
  <div className="flex justify-between items-start mb-4">
    <div className="bg-red-100 p-3 rounded-lg">
      <ShoppingCart className="h-6 w-6 text-red-600" />
    </div>
  </div>
  
  <h3 className="text-base font-semibold text-gray-500">إحصائيات الطلبات</h3>
  
  <div className="grid grid-cols-2 gap-4 mt-2">
    <div className="border-l border-gray-200 pl-4">
      <p className="text-sm text-gray-500 mb-1">إجمالي الطلبات</p>
      <div className="flex items-baseline">
        <p className="text-xl font-bold text-gray-800">{summary?.orders.count || 0}</p>
      </div>
    </div>
    
    <div>
      <p className="text-sm text-gray-500 mb-1">طلبات جديدة</p>
      <div className="flex items-baseline">
        <p className="text-xl font-bold text-blue-600">{summary?.orders.newOrders || 0}</p>
        {summary?.orders.newOrders > 0 && (
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">جديد</span>
        )}
      </div>
    </div>
  </div>
  
  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-red-50 rounded-full opacity-30"></div>
</div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow overflow-hidden relative">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              
              <h3 className="text-base font-semibold text-gray-500">عدد العملاء</h3>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-800">{summary?.users.regularUsers}</p>
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-50 rounded-full opacity-30"></div>
            </div>

            {/* Card 5 - Driver Count */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow overflow-hidden relative">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Truck className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              
              <h3 className="text-base font-semibold text-gray-500">عدد السائقين</h3>
              <div className="flex items-baseline mt-1">
              <p className="text-2xl font-bold text-gray-800">{summary?.users.distributers}</p>
                            </div>
              
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-50 rounded-full opacity-30"></div>
            </div>

            {/* Card 6 - New Orders */}
  
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Line Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">معدل الطلبات</h3>
            
              </div>
              
              <div className="h-72">
                {chartData ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-6">
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                            <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">عدد الطلبات لكل شركة</h3>
                <div className="flex items-center text-sm text-blue-600 font-medium">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  <span>تحليل الشركات</span>
                </div>
              </div>
              
              <div className="h-72">
                {barChartData ? (
                  <Bar data={barChartData} options={chartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-6">
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                            <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            
          </div>
          <br/>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">تحليل اداء السائقين</h3>
                <div className="flex items-center text-sm text-blue-600 font-medium">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  <span>تحليل السائقين</span>
                </div>
              </div>
              <div className="h-80">
    {distributorOrdersData ? (
      <Bar 
        data={distributorOrdersData} 
        options={{
          indexAxis: 'y', 
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false, 
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: {
                size: 13
              },
              bodyFont: {
                size: 12
              },
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return `${context.parsed.x} طلب`;
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
              },
              ticks: {
                precision: 0, // Show only whole numbers
                font: {
                  size: 11
                }
              }
            },
            y: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            }
          }
        }} 
      />
    ) : (
<div className="h-full flex items-center justify-center">
  <div className="animate-pulse w-full">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
    <div className="space-y-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded ml-4" style={{ 
            width: `${30 + (i * 12)}%` // Deterministic width based on index
          }}></div>
        </div>
      ))}
    </div>
  </div>
</div>
    )}
  </div>
            </div>
        </main>
      </div>
    </div>
    </RoleGuard>
  );
}

export default function DashboardHomePage() {
  return (
    <RoleGuard allowedRoles={['admin']} redirectTo="/">
      <AdminDashboardHomePage />
    </RoleGuard>
  );
}