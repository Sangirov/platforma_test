import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const dictionary = {
  uz: {
    langName: "Uzb",
    techName: "Sirdaryo ilg'or kasbiy\nmahorat texnikumi",
    deptName: "Ta'lim sifatini yaxshilash bo'limi",
    title: "Ro'yxatdan o'tish",
    fullname: "F.I.Sh (To'liq ismingiz)",
    username: "Foydalanuvchi nomi (Login)",
    password: "Maxfiy so'z",
    student: "O'quvchi",
    teacher: "O'qituvchi",
    manager: "Rahbariyat",
    signup: "RO'YXATDAN O'TISH",
    hasAccount: "Hisobingiz bormi?",
    signin: "Tizimga kirish"
  },
  cyrl: {
    langName: "Ўзб",
    techName: "Сирдарё илғор касбий\nмаҳорат техникуми",
    deptName: "Таълим сифатини яхшилаш бўлими",
    title: "Рўйхатдан ўтиш",
    fullname: "Ф.И.Ш (Тўлиқ исмингиз)",
    username: "Фойдаланувчи номи (Логин)",
    password: "Махфий сўз",
    student: "Ўқувчи",
    teacher: "Ўқитувчи",
    manager: "Раҳбарият",
    signup: "РЎЙХАТДАН ЎТИШ",
    hasAccount: "Ҳисобингиз борми?",
    signin: "Тизимга кириш"
  },
  ru: {
    langName: "Рус",
    techName: "Сырдарьинский передовой техникум\nпрофессионального мастерства",
    deptName: "Отдел качества образования",
    title: "Регистрация",
    fullname: "Ф.И.О (Полное имя)",
    username: "Имя пользователя (Логин)",
    password: "Пароль",
    student: "Студент",
    teacher: "Учитель",
    manager: "Руководство",
    signup: "СОЗДАТЬ АККАУНТ",
    hasAccount: "Уже есть аккаунт?",
    signin: "Войти"
  }
};

export default function Register() {
  const [lang, setLang] = useState('uz');
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const t = dictionary[lang];

  const handleRegister = async () => {
    if (!fullName || !login || !password) {
      alert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    setLoading(true);

    try {
      const email = `${login}@texnikum.uz`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userStatus = role === 'student' ? 'active' : 'pending';

      await setDoc(doc(db, 'users', user.uid), {
        fullName: fullName,
        login: login,
        role: role,
        status: userStatus,
        createdAt: new Date().toISOString()
      });

      if (userStatus === 'pending') {
         alert("Muvaffaqiyatli! Profilingiz Super Admin tasdig'ini kutmoqda.");
      } else {
         alert("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      }
      navigate('/');
      
    } catch (error) {
      console.error("Firebase xatosi:", error);
      alert("Xatolik yuz berdi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-10 bg-[#e6e9f0] relative overflow-hidden"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'url("/logo.png")',
          backgroundSize: '250px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center'
        }}
      ></div>

      <div className="w-[480px] p-10 sm:p-12 rounded-[40px] shadow-[15px_15px_30px_#c3c6cc,-15px_-15px_30px_#ffffff] bg-[#e6e9f0] text-center relative z-10">
        
        <div className="flex justify-center gap-3 mb-8">
          {Object.keys(dictionary).map((key) => (
            <button
              key={key}
              onClick={() => setLang(key)}
              className={`px-4 py-2 text-[11px] font-bold rounded-full transition-all duration-300 tracking-wide
                ${lang === key 
                  ? 'bg-[#e6e9f0] shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] text-blue-500' 
                  : 'bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] text-gray-500 hover:text-gray-700'}`}
            >
              {dictionary[key].langName}
            </button>
          ))}
        </div>

        <div className="mb-10">
          <h1 className="text-[20px] font-bold text-gray-600 uppercase tracking-wider leading-tight whitespace-pre-line">
            {t.techName}
          </h1>
          <h2 className="text-[12px] font-bold text-blue-500 uppercase tracking-widest mt-3 opacity-90">
            {t.deptName}
          </h2>
        </div>

        <h3 className="text-xl font-bold text-gray-700 mb-6">{t.title}</h3>

        <div className="space-y-6">
          <div className="flex justify-between gap-3 mb-2">
            {['student', 'teacher', 'manager'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-3 text-[12px] font-bold rounded-2xl transition-all duration-300
                  ${role === r 
                    ? 'bg-[#e6e9f0] shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] text-blue-500' 
                    : 'bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] text-gray-500 hover:text-gray-700'}`}
              >
                {t[r]}
              </button>
            ))}
          </div>

          <div className="flex items-center px-6 py-4 rounded-full bg-[#e6e9f0] shadow-[inset_6px_6px_10px_#c3c6cc,inset_-6px_-6px_10px_#ffffff] transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
            </svg>
            <input 
              type="text" 
              placeholder={t.fullname} 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-[14px]" 
            />
          </div>

          <div className="flex items-center px-6 py-4 rounded-full bg-[#e6e9f0] shadow-[inset_6px_6px_10px_#c3c6cc,inset_-6px_-6px_10px_#ffffff] transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <input 
              type="text" 
              placeholder={t.username} 
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-[14px]" 
            />
          </div>

          <div className="flex items-center px-6 py-4 rounded-full bg-[#e6e9f0] shadow-[inset_6px_6px_10px_#c3c6cc,inset_-6px_-6px_10px_#ffffff] transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mr-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <input 
              type="password" 
              placeholder={t.password} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-[14px]" 
            />
          </div>

          <button 
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-4 mt-6 text-[14px] font-bold tracking-[0.15em] text-gray-600 rounded-full bg-[#e6e9f0] shadow-[8px_8px_16px_#c3c6cc,-8px_-8px_16px_#ffffff] hover:text-blue-500 active:shadow-[inset_6px_6px_10px_#c3c6cc,inset_-6px_-6px_10px_#ffffff] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "KUTING..." : t.signup}
          </button>
          
          <p className="text-[13px] text-gray-500 mt-6 font-bold">
            {t.hasAccount} <Link to="/" className="text-gray-700 hover:underline ml-1">{t.signin}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}