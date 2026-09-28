import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tepada turuvchi umumiy statistika (bu qismni ham keyingi bosqichlarda real bazaga ulaymiz)
  const stats = [
    { title: "Jami O'quvchilar", value: "1,245", trend: "+12%", color: "text-blue-500" },
    { title: "O'qituvchilar", value: "84", trend: "+2", color: "text-green-500" },
    { title: "Tasdiq kutayotganlar", value: pendingUsers.length.toString(), trend: "Muhim", color: "text-orange-500" },
    { title: "Faol Guruhlar", value: "32", trend: "0", color: "text-purple-500" }
  ];

  // Baza (Firestore) dan pending statusdagi foydalanuvchilarni tortib olish
  const fetchPendingUsers = async () => {
    try {
      const q = query(collection(db, 'users'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setPendingUsers(users);
    } catch (error) {
      console.error("Foydalanuvchilarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Foydalanuvchini tasdiqlash
  const handleApprove = async (userId, userName) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'active' });
      fetchPendingUsers();
    } catch (error) {
      console.error("Tasdiqlashda xatolik:", error);
      alert("Xatolik yuz berdi!");
    }
  };

  // Foydalanuvchini rad etish
  const handleReject = async (userId) => {
    if(window.confirm("Bu foydalanuvchini rad etib, bloklaysizmi?")) {
      try {
        await updateDoc(doc(db, 'users', userId), { status: 'blocked' });
        fetchPendingUsers();
      } catch (error) {
        console.error("Rad etishda xatolik:", error);
      }
    }
  };

  const roleNames = {
    teacher: "O'qituvchi",
    manager: "Rahbariyat"
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-700">Super Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1 font-bold tracking-wide">Ta'lim muassasasining umumiy statistikasi va holati</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ta'lim sifati grafigi (Immitatsiya) */}
        <div className="lg:col-span-2 p-8 rounded-[30px] bg-[#e6e9f0] shadow-[8px_8px_16px_#c3c6cc,-8px_-8px_16px_#ffffff]">
          <h2 className="text-lg font-bold text-gray-700 mb-6">O'zlashtirish Dinamikasi</h2>
          <div className="h-64 flex items-end justify-between gap-3">
            {[60, 75, 50, 85, 70, 90, 80, 95].map((height, i) => (
              <div key={i} className="w-full bg-[#e6e9f0] shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] rounded-t-xl relative h-full flex items-end">
                <div 
                  style={{ height: `${height}%` }} 
                  className="w-full bg-blue-500 rounded-t-xl transition-all duration-500 opacity-80 hover:opacity-100"
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* REAl BAZADAN KELAYOTGAN: Tasdiq kutayotgan foydalanuvchilar */}
        <div className="p-8 rounded-[30px] bg-[#e6e9f0] shadow-[8px_8px_16px_#c3c6cc,-8px_-8px_16px_#ffffff]">
          <h2 className="text-lg font-bold text-gray-700 mb-6">Yangi So'rovlar (Real-time)</h2>
          
          {loading ? (
            <p className="text-gray-500 font-bold animate-pulse text-center">Yuklanmoqda...</p>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 font-bold">Yangi so'rovlar yo'q</p>
            </div>
          ) : (
            <div className="space-y-5 h-64 overflow-y-auto pr-2 custom-scrollbar">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex flex-col p-4 rounded-2xl bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff]">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#e6e9f0] shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center text-blue-500 font-bold text-lg uppercase">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-700 truncate w-32">{user.fullName}</p>
                      <p className="text-[11px] text-orange-500 font-bold">{roleNames[user.role] || user.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprove(user.id, user.fullName)}
                      className="flex-1 py-2 rounded-xl bg-green-500 text-white font-bold text-[11px] tracking-wider shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] hover:bg-green-600 transition-all"
                    >
                      TASDIQLASH
                    </button>
                    <button 
                      onClick={() => handleReject(user.id)}
                      className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold text-[11px] tracking-wider shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] hover:bg-red-600 transition-all"
                    >
                      RAD ETISH
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}