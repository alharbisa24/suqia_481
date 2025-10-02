"use client";

import "./globals.css";
import Link from "next/link";
import Head from 'next/head';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserProvider, useUser } from "./context/UserContext";
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useRef } from 'react';

function Layout({ children }) {
  const { user, setUser } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'مرحبًا! كيف يمكنني مساعدتك اليوم؟' }]);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
      }
    }
  }, [setUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCustomResponse = (question) => {
    const q = question.toLowerCase();

    const donationKeywords = ["خطوات التبرع", "طريقة الطلب", "طريقة التبرع", "كيف بتبرع", "كيف اتبرع", "كيف اتصدق", "كيف اطلب", "كيفية التبرع", "كيفية الطلب"];
    for (const keyword of donationKeywords) {
      if (q.includes(keyword)) {
        const text = `طريقة التبرع\n
        اولا لابد من انشاء حساب عن طريق:\n
        ١) الضغط على زر تسجيل الدخول بالاعلى\n
        ٢) إنشاء حساب\n
        ٣) تعبئة بياناتك والضغط على زر إنشاء حساب\n
        بعد ذلك من الرئيسية:\n
        ١) ضغط زر التبرع الان\n
        ٢) اختيار شركة المياه - الحجم - الكمية\n
        ٣) تحديد المسجد من الخريطة\n
        ٤) ضغط زر ادفع الان واكمال عملية الدفع\n
        بعد ذلك ستتم عملية المراجعة وتعيين مندوب لاكمال عملية التبرع\n
        شكرا لتبرعك!`;
        return text;
      }
    }
    


    const predefinedAnswers = {
      "كيف اسجل": "للتسجيل: 1) اضغط 'تسجيل دخول' 2)  اضغط انشاء حساب 3) املأ البيانات 4) اضغط إنشاء حساب ، الان تم انشاء حسابك بنجاح !",
      "تواصل معنا": "للتواصل: البريد: info@suqia.com "
    };

    for (const [key, value] of Object.entries(predefinedAnswers)) {
      if (q.includes(key.toLowerCase())) {
        return value;
      }
    }

    return null;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newUserMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const customResponse = getCustomResponse(userInput);
      if (customResponse) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: customResponse
        }]);
        setIsLoading(false); // Important: Stop loading here
        return;
      }

      const prompt = `أنت مساعد موقع سقيا (Suqia). أجب باختصار (بحد أقصى 3 جمل) وبشكل واضح.
     
      جاوب بنفس اللغه المرسلة لك سواء بالعربيه او الانجليزيه
      answer with same language that user entered
      معلومات عن الموقع:
      - اسم الموقع: سقيا (Suqia)
      - عنوان الموقع: https://suqia.vercel.app
      - الهدف الرئيسي: تمكين الزوار من التبرع بالماء لمساجد محددة يختارونها بأنفسهم داخل المملكة العربية السعودية.
      - النطاق الجغرافي: يخدم المساجد في المملكة العربية السعودية.
      - آلية العمل:
        * يختار المستخدم المسجد المراد التبرع له.
        * يحدد كمية الماء (بحد أقصى 30 كرتون لكل عملية تبرع).
        * يقوم بالتبرع إلكترونياً عبر بوابة الدفع PayTabs.
      - آلية التحقق: يقوم السائق بتصوير كراتين الماء داخل المسجد وإرسال الصورة كإثبات للمتبرع.
      - طرق الدفع: الدفع الإلكتروني عبر بوابة PayTabs.
      - طبيعة المشروع: مشروع فردي.
      - خطوات التسجيل كسائق:
        * زر تسجيل دخول.
        * زر إانشاء حساب.
        * تعبئة المعلومات.
        * الضغط على زر إنشاء حساب.
        * بعد العودة للصفحة الرئيسية يظهر زر تسجيل السائقين بالاعلى.
        * الضغط على زر تسجيل السائقين.
        * تعبئة المعلومات.
        * الضغط على زر تقديم الطلب.
        * بعد ذلك يتم مراجعة الطلب من قبل الإدارة. وابلاغك عند تعيينك كسائق لدى سقيا
      
      يمكنك الإجابة عن الأسئلة المتعلقة بالموقع وخدماته، وأيضا الأسئلة العامة الأخرى.
      
      السؤال: ${userInput}
      الجواب:`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDwuyMt71epvO3UY-1MKPyCvo1dI7ONzjE`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              maxOutputTokens: 200, 
              temperature: 0.5 
            }
          })
        }
      );

      const data = await response.json();
      let aiResponse = 'عذرًا، لم أتمكن من الإجابة. يرجى إعادة المحاولة.';

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        aiResponse = data.candidates[0].content.parts[0].text
          .split('\n')[0]
          .substring(0, 200); 
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse
      }]);

    } catch (err) {
      console.error('Error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'حدث خطأ تقني. يرجى المحاولة لاحقًا.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <html lang="ar" dir="rtl">
          <Head>
        <title>سقيا</title>
             <link rel="shortcut icon" href="/images/SuqiaLogo.PNG" />
       
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <body className={`antialiased font-sans`}>
  
        <main className="flex-1 pt-24">{children}</main>

        <footer className="bg-blue-500 text-white py-5 mt-auto">
          <div className="max-w-6xl mx-auto text-center">
            
            <p className="text-base md:text-lg">
              &copy; 2025 سقيا - جميع الحقوق محفوظة
            </p>
          </div>
        </footer>

        <script>
          {`
            document.getElementById('menu-button').addEventListener('click', function() {
              var menu = document.getElementById('mobile-menu');
              if (menu.classList.contains('hidden')) {
                menu.classList.remove('hidden');
              } else {
                menu.classList.add('hidden');
              }
            });
          `}
        </script>

        {/* Chat Button */}
        <div className="fixed bottom-5 right-5 z-50">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center"
            aria-label="فتح الدردشة"
          >
            <MessageCircle className="w-6 h-6" />
            {isChatOpen ? null : (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {messages.length}
              </span>
            )}
          </button>
        </div>

        {/* Chat Window */}
        {isChatOpen && (
          <div className="fixed bottom-20 right-5 w-80 bg-white shadow-lg rounded-lg p-4 z-50 flex flex-col" style={{ maxHeight: '70vh' }}>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <h3 className="text-lg font-semibold text-black">دردشة المساعد</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
                aria-label="إغلاق الدردشة"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-3 space-y-2 py-2">
  {messages.map((message, index) => (
    <div
      key={index}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <p
        className={`max-w-xs text-sm p-3 rounded-lg ${
          message.role === 'assistant'
            ? 'bg-gray-100 text-gray-700'
            : 'bg-blue-500 text-white'
        }`}
        style={{ whiteSpace: 'pre-line' }} // Ensures line breaks are respected
      >
        {message.content}
      </p>
    </div>
  ))}
              {isLoading && (
                <div className="flex justify-start">
                  <p className="bg-gray-100 text-gray-700 text-sm p-3 rounded-lg">
                    جاري البحث عن إجابة...
                    <span className="inline-block ml-2 animate-pulse">...</span>
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                  disabled={isLoading}
                  aria-label="رسالة الدردشة"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center"
                  aria-label="إرسال الرسالة"
                >
                  {isLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : 'إرسال'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                المساعد الآلي قد يخطئ أحيانًا، يرجى التحقق من المعلومات المهمة
              </p>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <UserProvider>
      <Layout>{children}</Layout>
    </UserProvider>
  );
}