import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const dictionary = {
  uz: {
    langName: "Uzb",
    techName: "Sirdaryo ilg'or kasbiy\nmahorat texnikumi",
    deptName: "Ta'lim sifatini yaxshilash bo'limi",
    title: "Tizimga kirish",
    username: "Foydalanuvchi nomi yoki Login",
    password: "Maxfiy so'z",
    signin: "KIRISH",
    noAccount: "Hisobingiz yo'qmi?",
    registerLink: "Ro'yxatdan o'tish"
  },
  cyrl: {
    langName: "Ўзб",
    techName: "Сирдарё илғор касбий\nмаҳорат техникуми",
    deptName: "Таълим сифатини яхшилаш бўлими",
    title: "Тизимга кириш",
    username: "Фойдаланувчи номи ёки Логин",
    password: "Махфий сўз",
    signin: "КИРИШ",
    noAccount: "Ҳисобингиз йўқми?",
    registerLink: "Рўйхатдан ўтиш"
  },
  ru: {
    langName: "Рус",
    techName: "Сырдарьинский передовой техникум\nпрофессионального мастерства",
    deptName: "Отдел качества образования",
    title: "Вход в систему",
    username: "Имя пользователя или Логин",
    password: "Пароль",
    signin: "ВОЙТИ",
    noAccount: "Нет аккаунта?",
    registerLink: "Зарегистрироваться"
  }
};

export default function Login() {
  const [lang, setLang] = useState('uz');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const t = dictionary[lang];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!login || !password) {
      alert("Iltimos, login va parolni kiriting!");
      return;
    }

    setLoading(true);

    try {
      const email = login.includes('@') ? login : `${login}@texnikum.uz`;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        alert("Foydalanuvchi ma'lumotlari bazadan topilmadi!");
        setLoading(false);
        return;
      }

      const userData = userDoc.data();

      if (userData.status === 'pending') {
        alert("Profilingiz hali Super Admin tomonidan tasdiqlanmagan. Iltimos kuting!");
        setLoading(false);
        return;
      }

      if (userData.status === 'blocked') {
        alert("Profilingiz bloklangan!");
        setLoading(false);
        return;
      }

      switch (userData.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'teacher':
          navigate('/teacher');
          break;
        case 'manager':
          navigate('/management');
          break;
        case 'student':
          navigate('/student');
          break;
        default:
          navigate('/');
      }

    } catch (error) {
      console.error("Kirish xatosi:", error);
      alert("Kirishda xatolik: Login yoki parol noto'g'ri!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-10 bg-[#e6e9f0] relative overflow-hidden"
      style={{ fontFamily: "'Georgia', serif" }}
    >
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

        <form onSubmit={handleLogin} className="space-y-6">
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
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 text-[14px] font-bold tracking-[0.15em] text-gray-600 rounded-full bg-[#e6e9f0] shadow-[8px_8px_16px_#c3c6cc,-8px_-8px_16px_#ffffff] hover:text-blue-500 active:shadow-[inset_6px_6px_10px_#c3c6cc,inset_-6px_-6px_10px_#ffffff] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "TEKSHIRILMOQDA..." : t.signin}
          </button>
          
          <p className="text-[13px] text-gray-500 mt-6 font-bold">
            {t.noAccount} <Link to="/register" className="text-gray-700 hover:underline ml-1">{t.registerLink}</Link>
          </p>
        </form>

      </div>
    </div>
  );
}