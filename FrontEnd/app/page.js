"use client";

import "./globals.css";
import Link from "next/link";
import { useEffect } from "react";
import Navbar from "./navbar";

export default function HomePage() {
  // Añadir efectos de scroll para elementos que aparecen
  useEffect(() => {
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
    <>
    <Navbar/>
      {/* Hero Section - Diseño moderno y limpio */}
      <div className="max-w-4xl mx-auto p-4 min-h-screen">
      {/* Hero Section */}
      <section className="w-full mb-6 md:mb-10">

        <div className="text-center mt-24 mb-20">
          <img
            src="images/SuqiaLogo.PNG"
            alt="سقيا Logo"
            style={{ width: 200 }}
            className="mx-auto" />
          <br /><br />
          <h1 className="text-4xl font-bold text-black mb-4 ">سُقـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــيا</h1>

          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            سقيا منصة تسهل عليك التبرع بسقيا الماء للمساجد، حيث يمكنك اختيار المسجد الذي تريد دعمه وتحديد كمية الماء التي ترغب في التبرع بها. يساهم الموقع في توفير مياه الشرب لمرتادي المساجد بطريقة سهلة وسريعة. بادر بالمساهمة واجعل عطائك مستمرًا في الأجر.
          </p>

          <div className=" space-x-4 rtl:space-x-reverse">
          <Link href="/order"
              className="bg-[#38B6FF] text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-[#29A5F2]">
                التبرع الان ـ
            </Link>

            <a
  href="#aboutus"
  className="bg-gray-200 text-black font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-gray-300"
  onClick={(e) => {
    e.preventDefault();
    document.querySelector('#aboutus').scrollIntoView({
      behavior: 'smooth'
    });
  }}
>
  اعرف المزيد
</a>

          </div>
</div>

          </section>
          </div>
        
      {/* Header Image - Full width as requested */}
      <div className="w-full relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
        <img
          src="images/header.png"
          alt="Suqia initiative"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      {/* About & Goals Section - Modern card design */}
      <section className="py-20 px-4" id="aboutus">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-400">من نحن</span>
            <span className="block w-24 h-1 bg-blue-500 mx-auto mt-4"></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 fade-in">
            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-blue-500 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="flex justify-center mb-6">
                <img className="w-24 h-24" src="/images/SuqiaLogo.PNG" alt="لما سقيا؟" />
              </div>
              <h3 className="text-xl font-bold text-center text-blue-500 mb-4">لما سقيا؟</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                سقيا تتيح لك التبرع الامن والسريع مع سهولة الاستخدام، لأن سقيا تتيح لك فرصة سهلة وموثوقة لاختيار مسجد والتبرع بالمياه له، لتكسب الأجر وتسهم في توفير الماء للمصلين.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-blue-500 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
    <img  className="block mx-auto mb-2" src="data:image/png;base64,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" alt="goal--v1"/>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-blue-500 mb-4">أهدافنا</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                أن نكون المنصة الرائدة في تسهيل أعمال السقيا، بربط المتبرعين بالمساجد المحتاجة، لننشر الخير ونوفر المياه لكل مصلٍّ بيسر وسهولة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern cards with hover effects */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              مميزاتنا
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              سقيا توفر لك مميزات عديدة تجعل التبرع بالماء للمساجد سهلاً وآمناً، مع ضمان وصول تبرعاتك إلى مستحقيها بسرعة وفعالية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto transform transition-all duration-500 group-hover:bg-blue-600 group-hover:rotate-6">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA/klEQVR4nO2WzQ2CMBiGn0Rv4gRu4gX1pjKDa6jEbVzAqBNI4u8A3tURvGqNyWdCiEBb6EV5k+/Qvrw8tKUFqFTJsYbADVAWdQX6tuCrJfRTF1uwKqFKAy8AH2hIdYCla/A45h2AXawdGs7EU/KtPPAixYtrZbEU8zywrwHuasLaJlPtpXgjoC59zbJeOJUBjmLe1iW4k/BqMtozsJG+ngvwUuP6tQuwki2TplnBg0ZlgZVsma6suSfTqzvSQmDlsP4UHKWYY/k4TCxvnpWPssCe4WFhkt/wRXsxpxIOE6dWnqzzAfBIPOG7PdAEF8oHwAm4A0f5JzNR0XylH9ALONF4nCWMPqEAAAAASUVORK5CYII=" alt="delivery--v1" className="transition-all duration-500 group-hover:scale-110" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">
                سرعة التوصيل
              </h4>
              <p className="text-gray-500 text-center">
                منصة سقيا تضمن لك وصول الماء للمسجد المطلوب باقل وقت ممكن.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="bg-pink-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto transform transition-all duration-500 group-hover:bg-pink-600 group-hover:rotate-6">
                <svg className="stroke-pink-600 transition-all duration-500 group-hover:stroke-white" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path className="clr-i-outline clr-i-outline-path-1" d="M30.4,17.6c-1.8-1.9-4.2-3.2-6.7-3.7c-1.1-0.3-2.2-0.5-3.3-0.6c2.8-3.3,2.3-8.3-1-11.1s-8.3-2.3-11.1,1s-2.3,8.3,1,11.1 c0.6,0.5,1.2,0.9,1.8,1.1v2.2l-1.6-1.5c-1.4-1.4-3.7-1.4-5.2,0c-1.4,1.4-1.5,3.6-0.1,5l4.6,5.4c0.2,1.4,0.7,2.7,1.4,3.9 c0.5,0.9,1.2,1.8,1.9,2.5v1.9c0,0.6,0.4,1,1,1h13.6c0.5,0,1-0.5,1-1v-2.6c1.9-2.3,2.9-5.2,2.9-8.1v-5.8 C30.7,17.9,30.6,17.7,30.4,17.6z M8.4,8.2c0-3.3,2.7-5.9,6-5.8c3.3,0,5.9,2.7,5.8,6c0,1.8-0.8,3.4-2.2,4.5V7.9 c-0.1-1.8-1.6-3.2-3.4-3.2c-1.8-0.1-3.4,1.4-3.4,3.2v5.2C9.5,12.1,8.5,10.2,8.4,8.2L8.4,8.2z M28.7,24c0.1,2.6-0.8,5.1-2.5,7.1 c-0.2,0.2-0.4,0.4-0.4,0.7v2.1H14.2v-1.4c0-0.3-0.2-0.6-0.4-0.8c-0.7-0.6-1.3-1.3-1.8-2.2c-0.6-1-1-2.2-1.2-3.4 c0-0.2-0.1-0.4-0.2-0.6l-4.8-5.7c-0.3-0.3-0.5-0.7-0.5-1.2c0-0.4,0.2-0.9,0.5-1.2c0.7-0.6,1.7-0.6,2.4,0l2.9,2.9v3l1.9-1V7.9 c0.1-0.7,0.7-1.3,1.5-1.2c0.7,0,1.4,0.5,1.4,1.2v11.5l2,0.4v-4.6c0.1-0.1,0.2-0.1,0.3-0.2c0.7,0,1.4,0.1,2.1,0.2v5.1l1.6,0.3v-5.2 l1.2,0.3c0.5,0.1,1,0.3,1.5,0.5v5l1.6,0.3v-4.6c0.9,0.4,1.7,1,2.4,1.7L28.7,24z"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">
                سهولة الاستخدام
              </h4>
              <p className="text-gray-500 text-center">
                منصة سقيا تتيح لك التبرع بالمياه للمساجد في اي وقت وفي اي مكان بسهولة تامة.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 md:col-span-2 lg:col-span-1">
              <div className="bg-teal-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto transform transition-all duration-500 group-hover:bg-teal-600 group-hover:rotate-6">
                <svg className="stroke-teal-600 transition-all duration-500 group-hover:stroke-white" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 27.5L15 25M15 25V21.25M15 25L20 27.5M8.75 14.375L12.5998 11.0064C13.1943 10.4862 14.1163 10.6411 14.5083 11.327L15.4917 13.048C15.8837 13.7339 16.8057 13.8888 17.4002 13.3686L21.25 10M2.5 2.5H27.5M26.25 2.5V13.25C26.25 17.0212 26.25 18.9069 25.0784 20.0784C23.9069 21.25 22.0212 21.25 18.25 21.25H11.75C7.97876 21.25 6.09315 21.25 4.92157 20.0784C3.75 18.9069 3.75 17.0212 3.75 13.25V2.5" stroke="" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">
                شفافية التبرع
              </h4>
              <p className="text-gray-500 text-center">
                منصة سقيا توفر لك شفافية تامة في عملية التبرع بالماء للمساجد، حيث يمكنك متابعة تبرعاتك بكل سهولة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Modern gradient card */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-sky-400 rounded-3xl shadow-xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 fade-in">
            <div className="text-center md:text-right md:flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">التبرع بالماء</h2>
              <p className="text-white text-lg mb-8 leading-relaxed opacity-90">
                صدقة جارية يدوم نفعها ويتضاعف أجرها.
              </p>
              <Link 
                href='/order' 
                className="inline-block bg-white text-blue-600 px-6 py-3 text-lg font-semibold rounded-full hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
              >
                ساهم بعطائك
              </Link>
            </div>
            <div className="flex-shrink-0 transform transition-all duration-500 hover:scale-105 hover:rotate-2">
              <img
                src="/images/handwater.webp"
                alt="Hand holding water"
                className="w-full max-w-xs md:max-w-sm lg:max-w-md h-auto rounded-2xl "
              />
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
    </>
  );
}