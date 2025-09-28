"use client";


import { Mail, Phone, MapPin, Linkedin, Github, Twitter } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import Navbar from "../navbar";

export default function TeamPage() {
  // Añadir animaciones sutiles al cargar
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  const teamMembers = [
    { name: "مشاري الحربي", role: "Backend Developer", linkedin: "#" },
    { name: "عمر الجوير", role: "Backend Developer", linkedin: "#" },
    { name: "احمد الحريصي", role: "Backend Developer", linkedin: "#" },
    { name: "خالد علوي", role: "Frontend Developer", linkedin: "#", },
    { name: "أحمد العواد", role: "Frontend Developer", linkedin: "#"},
    { name: "محمد الفاتش", role: "Frontend Developer", linkedin: "#"},
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <Navbar />
      {/* Encabezado elegante */}
      <div className="max-w-5xl mx-auto text-center mb-16 fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">فريقنا</h1>
        <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-8"></div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          نحن فريق من المطورين المبدعين الذين يعملون معًا لجعل رؤية سقيا حقيقة واقعة
        </p>
      </div>

      {/* Rejilla de equipo con diseño moderno y minimalista */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 fade-in" 
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="p-6 text-center">
                {/* Imagen de perfil elegante */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-gray-100 p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del miembro con tipografía mejorada */}
                <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-gray-500 font-medium mb-4">{member.role}</p>
                
                {/* Línea separadora sutil */}
                <div className="w-16 h-px bg-gray-200 mx-auto my-4"></div>
                
                {/* Enlaces sociales con iconos modernos */}
                <div className="flex justify-center space-x-5 mt-4">
                  <a 
                    href={member.linkedin} 
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} />
                  </a>
             
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

   
      
      {/* CSS para animaciones sutiles */}
      <style jsx global>{`
        .fade-in {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in.show {
          opacity: 1;
          transform: translateY(0);
        }
        /* Agregar efectos de hover a las tarjetas */
        .fade-in:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}