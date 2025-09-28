"use client";
import { User } from "lucide-react";
import Link from "next/link"; 
import { useState } from "react";
export default function UserLogo() {
    const [isLoggedin, setIsLoggedin] = useState(false);
    return (
        isLoggedin ?
     <Link href='/profile' className="text-white hover:text-gray-200"><User/></Link>:
     <>
     </>

    );

}