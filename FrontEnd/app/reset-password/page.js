"use client";

import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import Navbar from "../navbar";

// This is the key - using dynamic import with ssr:false
const ClientResetForm = dynamic(() => import("./client-form"), {
  ssr: false, // This is crucial - disables server-side rendering for this component
  loading: () => <LoadingSkeleton />
});

// Loading component
function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        <svg
          className="animate-spin h-12 w-12 mx-auto text-blue-500"
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
        <p className="mt-3 text-lg">جاري تحميل الصفحة...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  useEffect(() => {
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

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Navbar />
      <div className="relative w-full max-w-5xl min-h-[600px] md:h-[600px] bg-white shadow-lg rounded-lg overflow-hidden">
        <ClientResetForm />
      </div>
    </div>
  );
}