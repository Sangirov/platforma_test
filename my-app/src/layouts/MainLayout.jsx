import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Tizimdan chiqishda xatolik:", error);
    }
  };

  const roleNames = {
    admin: 'Super Admin',
    manager: 'Rahbariyat',
    teacher: "O'qituvchi",
    student: "O'quvchi"
  };

  const navLinkClass = ({ isActive }) =>
    `w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-300 ${
      isActive
        ? 'bg-[#e6e9f0] shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] text-blue-600'
        : 'bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] text-gray-500 hover:text-blue-500 hover:shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff]'
    }`;

  return (
    <div className="min-h-screen bg-[#e6e9f0] flex" style={{ fontFamily: "'Georgia', serif" }}>
      
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out flex flex-col bg-[#e6e9f0] shadow-[15px_0_30px_#c3c6cc,-15px_0_30px_#ffffff] z-20`}>
        <div className="h-20 flex items-center justify-center border-b border-gray-300/30 px-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 shadow-[4px_4px_10px_#b3b6bd,-4px_-4px_10px_#ffffff] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            T
          </div>
          {sidebarOpen && (
            <span className="ml-3 font-bold text-gray-700 uppercase tracking-wider text-[12px] leading-tight">
              Ta'lim Sifati
            </span>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-4">
          
          {/* Umumiy Bosh Sahifa (Dashboard) barcha rollar uchun */}
          <NavLink to={`/${currentUser?.role || ''}`} end className={navLinkClass}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            {sidebarOpen && <span className="ml-4 font-bold text-[13px] tracking-wide">Bosh panel</span>}
          </NavLink>

          {/* Faqat Super Admin uchun menyular */}
          {currentUser?.role === 'admin' && (
            <NavLink to="/admin/users" className={navLinkClass}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              {sidebarOpen && <span className="ml-4 font-bold text-[13px] tracking-wide">Foydalanuvchilar</span>}
            </NavLink>
          )}

          {/* Faqat O'quvchi uchun menyular */}
          {currentUser?.role === 'student' && (
            <>
              <NavLink to="/student/subjects" className={navLinkClass}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                {sidebarOpen && <span className="ml-4 font-bold text-[13px] tracking-wide">Mening Fanlarim</span>}
              </NavLink>
              
              <NavLink to="/student/tests" className={navLinkClass}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {sidebarOpen && <span className="ml-4 font-bold text-[13px] tracking-wide">Testlar</span>}
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4">
          <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-3 rounded-2xl bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] hover:text-red-500 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            {sidebarOpen && <span className="ml-3 font-bold text-[13px]">Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-[#e6e9f0] shadow-[0_5px_15px_-5px_#c3c6cc] z-10 flex items-center justify-between px-8">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] text-gray-500 hover:text-blue-500 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          </button>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[14px] font-bold text-gray-700">{currentUser?.fullName || 'Foydalanuvchi'}</p>
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">{currentUser?.role ? roleNames[currentUser.role] : ''}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#e6e9f0] shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center border-2 border-white text-blue-600 font-black text-xl uppercase">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}