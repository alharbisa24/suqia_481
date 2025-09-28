"use client";
import { useEffect } from "react";
import Link from "next/link";
import Navbar from "../navbar";

export default function AboutUs() {
  useEffect(() => {
    // Animación de entrada para elementos
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 fade-in">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-400">من نحن</span>
          </h1>
          <div className="w-28 h-1 bg-gradient-to-r from-blue-600 to-sky-400 mx-auto mb-12 rounded-full fade-in"></div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16 max-w-3xl mx-auto fade-in">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                <img src="/images/SuqiaLogo.PNG" alt="سقيا" className="w-16 h-16 object-contain" />
              </div>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              نحن فريق سقيا، نهدف إلى تقديم حلول مبتكرة للمياه لضمان حياة أفضل. نسعى دائمًا للريادة في التكنولوجيا
              والاستدامة، ونعمل جاهدين لخدمة المجتمع بأفضل الطرق الممكنة.
            </p>
          </div>
        </div>
      </section>

   
      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-sky-400 rounded-2xl shadow-xl p-8 md:p-12 text-center fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">كن جزءًا من مبادرتنا</h2>
            <p className="text-white text-lg mb-8 opacity-90">
              ساهم معنا في نشر الخير وتوفير المياه للمساجد والمحتاجين
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/order" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition duration-300 transform hover:scale-105">
                تبرع الآن
              </Link>
              <Link href="/contact" className="bg-transparent text-white border border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:bg-opacity-20 transition duration-300 transform hover:scale-105">
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Add global styles for animations */}
      <style jsx global>{`
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in.show {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}