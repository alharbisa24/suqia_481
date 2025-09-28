"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../navbar";

export default function OrderPage() {
  const router = useRouter();
 
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-8 drtl">
      <Navbar/>
      <div className="bg-white p-10 rounded-lg shadow-md w-full border border-gray-200">
        <h1 className="text-3xl font-bold text-center  text-green-600">
          ✅ تم إنشاء الطلب بنجاح!
        </h1>
        <p className="text-gray-700 mt-4 text-center text-lg">
          شكراً لطلبك! يمكنك تتبع طلبك الان .
        </p>
       

          <div className="mt-8 w-full text-right">            
          </div>

      
        

        <div className="mt-8 flex justify-center">
          <Link href="/myDonations" className="px-8 py-3 rounded-lg inline-block shadow-lg text-lg  bg-sky-400 hover:bg-sky-400 text-white">
           الذهاب الى صفحة طلباتي
          </Link>
        </div>
      </div>
    </div>
  );
}