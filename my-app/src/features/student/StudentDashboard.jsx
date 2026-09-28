import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentDashboard() {
  const { currentUser } = useAuth();

  const stats = [
    { title: "Umumiy o'zlashtirish", value: "86%", trend: "Yaxshi", color: "text-green-500" },
    { title: "Bajarilgan testlar", value: "14", trend: "+2 bu hafta", color: "text-blue-500" },
    { title: "O'rtacha ball", value: "4.2", trend: "5 balldan", color: "text-orange-500" },
    { title: "Yutuqlar (Sertifikatlar)", value: "3", trend: "Tasdiqlangan", color: "text-purple-500" }
  ];

  const subjects = [
    { name: "Kompyuter tarmoqlari", teacher: "A. Aliyev", progress: 92 },
    { name: "Ma'lumotlar bazasi", teacher: "B. Karimov", progress: 75 },
    { name: "Web dasturlash", teacher: "S. Umarov", progress: 88 },
  ];

  return (
    <div className="space-y-8">
      
      {/* Sarlavha qismi */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Salom, {currentUser?.fullName?.split(' ')[0] || 'O\'quvchi'}!</h1>
          <p className="text-gray-500 text-sm mt-1 font-bold tracking-wide">Bugungi natijalaringiz va ta'lim jarayoningiz bilan tanishing.</p>
        </div>
      </div>

      {/* Statistika Kartalari */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="p-6 rounded-[30px] bg-[#e6e9f0] shadow-[8px_8px_16px_#c3c6cc,-8px_-8px_16px_#ffffff] transition-all hover:shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff]">
            <h3 className="text-gray-500 text-[11px] font-bold tracking-wider uppercase mb-2">{stat.title}</h3>
            <div className="flex items-end justify-between">
              <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
              <span className="text-xs font-bold text-gray-400 mb-1">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Fanlar va O'zlashtirish (Progress bar) */}
        <div className="p-8 rounded-[30px] bg-[#e6e9f0] shadow-[8px_8px_16px_#c3c6cc,-8px_-8px_16px_#ffffff]">
          <h2 className="text-lg font-bold text-gray-700 mb-6">Mening Fanlarim</h2>
          <div className="space-y-6">
            {subjects.map((sub, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-[13px] font-bold text-gray-700">
                  <span>{sub.name} <span className="text-[10px] text-gray-400 ml-2">({sub.teacher})</span></span>
                  <span className="text-blue-500">{sub.progress}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#e6e9f0] shadow-[inset_2px_2px_4px_#c3c6cc,inset_-2px_-2px_4px_#ffffff] overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${sub.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* So'nggi natijalar */}
        <div className="p-8 rounded-[30px] bg-[#e6e9f0] shadow-[8px_8px_16px_#c3c6cc,-8px_-8px_16px_#ffffff]">
          <h2 className="text-lg font-bold text-gray-700 mb-6">So'nggi Test Natijalari</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 rounded-2xl bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#e6e9f0] shadow-[inset_2px_2px_4px_#c3c6cc,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-700">Web dasturlash - Oraliq nazorat</p>
                    <p className="text-[11px] text-gray-400 font-bold">12 Oktabr, 2026</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-blue-500">92/100</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}