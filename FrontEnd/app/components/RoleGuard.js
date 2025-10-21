"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';

const RoleGuard = ({ allowedRoles, children, redirectTo = "/" }) => {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    const userRole = userData.rank;

    // Check if user role is allowed
    if (!allowedRoles.includes(userRole)) {
      router.push(redirectTo);
      return;
    }

    setIsLoading(false);
  }, [user, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
