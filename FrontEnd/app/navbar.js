'use client';
import Link from 'next/link';
import { useState, useEffect,useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Bell, ChevronDown, LogOut, User, Settings, Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { UserProvider, useUser } from "./context/UserContext";

const Navbar = () => {
  const dropdownRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Add this state
  const { user, setUser } = useUser();
  const [error, setError] = useState('');

  const router = useRouter();
  const pathname = usePathname();
  const isActive = (path) => {
      return pathname === path || pathname?.startsWith(`${path}/`);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

// Toggle mobile menu function
const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
};


  return (
    <nav className="p-4 fixed top-0 left-0 w-full z-50 bg-white transition-colors duration-300">
    <div className="container mx-auto flex items-center justify-between">
      <div className="flex items-center space-x-2 space-x-reverse">
        <img
          src="/images/SuqiaLogo.PNG"
          alt="سقيا Logo"
          style={{ width: 100}}
        />
      </div>

      <ul className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 space-x-4 space-x-reverse">
      <li>
    <Link
      href="/"
      className={`text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white transition-all ${
        isActive('/') ? 'bg-white' : ''
      }`}
    >
      الرئيسية
    </Link>
  </li>
  <li>
    <Link
      href="/about"
      className={`text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white transition-all ${
        isActive('/about') ? 'bg-white' : ''
      }`}
    >
             من نحن
       </Link>
  </li>
    { (user && user.rank == 'user') && (
  <li>
    <Link
      href="/DistributersRequest"
      className={`text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white transition-all ${
        isActive('/DistributersRequest') ? 'bg-white' : ''
      }`}
    >
            تسجيل السائقين
       </Link>
  </li>
     )}
  <li>
    <Link
      href="/contact"
      className={`text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white transition-all ${
        isActive('/contact') ? 'bg-white' : ''
      }`}
    >
             فريقنا
       </Link>
  </li>
     
        <li>
          <Link href="/order" 
               className={`text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white transition-all ${
                isActive('/order') ? 'bg-white' : ''
              }`}
          >
            اطلب الان
          </Link>
        </li>
      </ul>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {user ? (
        <div className="relative hidden md:block">
          <button className="bg-[#38B6FF] text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-[#29A5F2] flex items-center" onClick={() => setDropdownOpen(!dropdownOpen)}>
           حسابك
            <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              
              {user.rank == 'user' && (
                <Link href="/myDonations" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                تبرعاتي
              </Link>
              )
              }
                {user.rank == 'distributer' && (
                <Link href="/dashboard/home" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                لوحة التحكم
              </Link>
              )
              }
                            {user.rank == 'admin' && (
                <Link href="/admin/home" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                لوحة التحكم
              </Link>
              )
              }

              <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                الملف الشخصي
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setUser(null);
                  router.push('/login');
                }}
                className="block w-full text-right px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" className="hidden md:block bg-[#38B6FF] text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-[#29A5F2]">
          تسجيل الدخول
        </Link>
      )}


<div className="md:hidden">
                    <button 
                        className="text-gray-700 focus:outline-none" 
                        onClick={toggleMobileMenu} // Add onClick handler here
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" /> // Show X when menu is open
                        ) : (
                            <Menu className="w-6 h-6" /> // Show hamburger when menu is closed
                        )}
                    </button>
                </div>
            </div>
    {/* Mobile Menu */}
    <ul className={`md:hidden flex-col items-center bg-gray-100 px-4 py-2 mt-4 space-y-4 ${mobileMenuOpen ? 'flex' : 'hidden'}`}>
    <li>
        <Link href="/" className="text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white active:bg-white transition-all">
          الرئيسية
        </Link>
      </li>
      
      {user && user.rank == 'user' && (
  <li>
    <Link
      href="/DistributersRequest"
      className={`text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white active:bg-white transition-all ${
        isActive('/DistributersRequest') ? 'bg-white' : ''
      }`}
    >
            تسجيل السائقين
       </Link>
  </li>
     )}
  
      <li>
        <Link href="/contact" className="text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white active:bg-white transition-all">
        فريقنا
        </Link>
      </li>
      <li>
        <Link href="/order" className="text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white active:bg-white transition-all">
          اطلب الان
        </Link>
      </li>
      
      {user ? (
        <>
          <hr/>
          <li>
          {user.rank == 'user' && (
                <Link href="/myDonations" className="text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white active:bg-white transition-all">
                تبرعاتي
              </Link>
              )
              }
                {user.rank == 'distributer' && (
                <Link href="/dashboard/home" className="text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white active:bg-white transition-all">
                لوحة التحكم
              </Link>
              )
              }
              
              {user.rank == 'admin' && (
                <Link href="/admin/home" className="text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white active:bg-white transition-all">
                لوحة التحكم
              </Link>
              )
              }
          </li>
          <li>
            <Link href="/profile" className="text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white active:bg-white transition-all">
              الملف الشخصي
            </Link>
          </li>
          <li>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                router.push('/login');
              }}
              className="text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white active:bg-white transition-all"
            >
              تسجيل الخروج
            </button>
          </li>
        </>
      ) : (
        <li>
          <Link href="/login" className="text-gray-700 font-medium px-4 py-1 rounded-full hover:bg-white active:bg-white transition-all">
            تسجيل الدخول
          </Link>
        </li>
      )}
    </ul>
  </nav>

  );
};

export default Navbar;