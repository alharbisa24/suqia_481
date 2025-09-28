"use client";
import Link from "next/link"; 
import { useState } from "react";
export default function LoginButton() {
    const [isLoggedin, setIsLoggedin] = useState(true);
    return (
       <Link
            href="/login"
         className="bg-white text-blue-500 px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold hover:bg-gray-200 text-sm md:text-base"
        >تسجيل الدخول
         </Link>
    );
}
