import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import * as XLSX from 'xlsx';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Foydalanuvchilarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  const roleNames = {
    admin: "Super Admin",
    teacher: "O'qituvchi",
    manager: "Rahbariyat",
    student: "O'quvchi"
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.login?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 1. HAQIQIY EXCEL (.xlsx) NAMUNA YARATISH VA YUKLASH
  const handleDownloadTemplate = () => {
    // Siz xohlagan ustunlar ketma-ketligi
    const header = [["№", "F.I.SH", "Kursi", "Guruh", "Login", "Parol", "Telfon raqami"]];
    const sampleData = [
      [1, "Aliyev Vali G'ayrat o'g'li", "1", "10-25", "ali_1025", "123456", "+998901234567"],
      [2, "Karimova Lola Sanjar qizi", "2", "11-24", "lola_1124", "123456", "+998931234567"]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([...header, ...sampleData]);
    
    // Excel ustunlarining kengligini chiroyli qilish
    worksheet['!cols'] = [
      { wch: 5 },  // №
      { wch: 35 }, // F.I.SH
      { wch: 10 }, // Kursi
      { wch: 15 }, // Guruh
      { wch: 20 }, // Login
      { wch: 15 }, // Parol
      { wch: 20 }  // Telfon raqami
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Oquvchilar");
    
    // Haqiqiy .xlsx fayl sifatida kompyuterga yuklash
    XLSX.writeFile(workbook, "Oquvchilar_Namunasi.xlsx");
  };

  // 2. EXCEL FAYLNI O'QISH VA BAZAGA YOZISH
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Excelni qatorlarga (array'lar massiviga) aylantiramiz
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Sarlavhani (1-qatorni) tashlab yuboramiz va bo'sh qatorlarni tozalaymiz
        const dataRows = rows.slice(1).filter(row => row.length > 0 && row[1]);
        setUploadProgress({ current: 0, total: dataRows.length });

        const secondaryApp = initializeApp(auth.app.options, "SecondaryApp");
        const secondaryAuth = getAuth(secondaryApp);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          
          // Ustunlar indeksi: 1=F.I.SH, 2=Kursi, 3=Guruh, 4=Login, 5=Parol, 6=Telfon raqami
          const fullName = String(row[1] || '').trim();
          const course = String(row[2] || '').trim();
          const group = String(row[3] || '').trim();
          const login = String(row[4] || '').trim();
          const password = String(row[5] || '').trim();
          const phone = String(row[6] || '').trim();

          if (fullName && login && password) {
            try {
              const email = `${login}@texnikum.uz`;
              
              const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
              const newUser = userCredential.user;

              await setDoc(doc(db, 'users', newUser.uid), {
                fullName,
                login,
                course,
                groupId: group,
                phone,
                role: 'student', 
                status: 'active',
                createdAt: new Date().toISOString()
              });
              
              successCount++;
            } catch (error) {
              console.error(`Xatolik (${login}):`, error);
              errorCount++;
            }
          }
          setUploadProgress({ current: i + 1, total: dataRows.length });
        }

        secondaryAuth.signOut();
        
        alert(`Yuklash yakunlandi!\nMuvaffaqiyatli: ${successCount} ta\nXato: ${errorCount} ta`);
      } catch (err) {
        console.error("Faylni o'qishda xatolik:", err);
        alert("Faylni o'qishda xatolik yuz berdi. To'g'ri .xlsx fayl yuklaganingizga ishonch hosil qiling.");
      } finally {
        setIsUploading(false);
        setIsExcelModalOpen(false);
        fetchUsers(); 
        
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-8 relative">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Foydalanuvchilarni Boshqarish</h1>
          <p className="text-gray-500 text-sm mt-1 font-bold tracking-wide">Tizimdagi barcha rollar va profillar nazorati</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center px-4 py-3 rounded-full bg-[#e6e9f0] shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] w-72">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input 
              type="text" 
              placeholder="Ism yoki login orqali qidiruv..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-700 text-sm font-bold"
            />
          </div>
          
          <button 
            onClick={() => setIsExcelModalOpen(true)}
            className="px-6 py-3 rounded-full bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] text-green-600 font-bold tracking-wider text-sm hover:text-green-700 active:shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            EXCEL IMPORT
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-full bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] text-blue-600 font-bold tracking-wider text-sm hover:text-blue-700 active:shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            QO'SHISH
          </button>
        </div>
      </div>

      <div className="p-8 rounded-[30px] bg-[#e6e9f0] shadow-[8px_8px_16px_#c3c6cc,-8px_-8px_16px_#ffffff] overflow-hidden">
        {loading ? (
          <p className="text-gray-500 font-bold animate-pulse text-center py-10">Yuklanmoqda...</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300/30">
                  <th className="pb-4 text-gray-400 font-bold text-xs uppercase tracking-wider">F.I.Sh</th>
                  <th className="pb-4 text-gray-400 font-bold text-xs uppercase tracking-wider">Login</th>
                  <th className="pb-4 text-gray-400 font-bold text-xs uppercase tracking-wider">Kurs/Guruh</th>
                  <th className="pb-4 text-gray-400 font-bold text-xs uppercase tracking-wider">Rol</th>
                  <th className="pb-4 text-gray-400 font-bold text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-300/20 hover:bg-gray-100/50 transition-colors">
                    <td className="py-4 font-bold text-gray-700 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e6e9f0] shadow-[inset_2px_2px_4px_#c3c6cc,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-blue-500 text-xs uppercase">
                        {user.fullName?.charAt(0) || '?'}
                      </div>
                      {user.fullName}
                    </td>
                    <td className="py-4 font-bold text-gray-500">{user.login}</td>
                    <td className="py-4 font-bold text-gray-500">{user.course ? `${user.course}-kurs / ` : ''}{user.groupId || '-'}</td>
                    <td className="py-4 font-bold text-blue-500">{roleNames[user.role] || user.role}</td>
                    <td className="py-4 font-bold">
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider shadow-[inset_2px_2px_4px_#c3c6cc,inset_-2px_-2px_4px_#ffffff]
                        ${user.status === 'active' ? 'text-green-600' : user.status === 'pending' ? 'text-orange-500' : 'text-red-500'}`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <p className="text-center text-gray-400 font-bold py-6">Foydalanuvchilar topilmadi.</p>
            )}
          </div>
        )}
      </div>

      {/* EXCEL IMPORT MODALI */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[600px] p-8 rounded-[40px] bg-[#e6e9f0] shadow-[15px_15px_30px_#c3c6cc,-15px_-15px_30px_#ffffff]">
            <h2 className="text-xl font-bold text-gray-700 mb-2">O'quvchilarni .xlsx formatida Yuklash</h2>
            
            {isUploading ? (
              <div className="py-10 text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-gray-700 font-bold text-lg">Ma'lumotlar bazaga yozilmoqda...</h3>
                <p className="text-gray-500 font-bold mt-2">{uploadProgress.current} / {uploadProgress.total} yakunlandi</p>
                <p className="text-red-500 text-xs mt-4">Iltimos, sahifani yopmang!</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold text-gray-400 mb-6 tracking-wide">Jarayon xatosiz ishlashi uchun andozamizdan (.xlsx) foydalaning.</p>
                
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 p-4 rounded-2xl bg-[#e6e9f0] shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] flex flex-col items-center justify-center text-center">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mb-2">1</span>
                    <p className="text-[11px] font-bold text-gray-500 uppercase">Namunani yuklang</p>
                  </div>
                  <div className="flex-1 p-4 rounded-2xl bg-[#e6e9f0] shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] flex flex-col items-center justify-center text-center">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mb-2">2</span>
                    <p className="text-[11px] font-bold text-gray-500 uppercase">Ma'lumot kiriting</p>
                  </div>
                  <div className="flex-1 p-4 rounded-2xl bg-[#e6e9f0] shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] flex flex-col items-center justify-center text-center">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mb-2">3</span>
                    <p className="text-[11px] font-bold text-gray-500 uppercase">Faylni tanlang</p>
                  </div>
                </div>

                <div 
                  className="border-2 border-dashed border-gray-300 rounded-[30px] p-8 flex flex-col items-center justify-center bg-[#e6e9f0] shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] cursor-pointer hover:border-blue-400 transition-all group mb-6 relative overflow-hidden"
                  onClick={() => fileInputRef.current.click()}
                >
                  <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <div className="w-16 h-16 rounded-full bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-bold text-sm text-center">Tayyorlangan Excel faylni tanlash uchun <br/><span className="text-blue-500 underline">shu yerga bosing</span></p>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setIsExcelModalOpen(false)} className="px-6 py-4 rounded-full bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] text-gray-500 font-bold tracking-wider text-sm hover:text-red-500 active:shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] transition-all">
                    YOPISH
                  </button>
                  <button onClick={handleDownloadTemplate} className="flex-1 py-4 rounded-full bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] text-blue-500 font-bold tracking-wider text-sm hover:text-blue-600 active:shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] transition-all">
                    EXCEL NAMUNANI YUKLASH
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* YAKKA TARTIBDA QO'SHISH MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] p-8 rounded-[40px] bg-[#e6e9f0] shadow-[15px_15px_30px_#c3c6cc,-15px_-15px_30px_#ffffff]">
            <h2 className="text-xl font-bold text-gray-700 mb-6">Yangi Foydalanuvchi Qo'shish</h2>
            <div className="space-y-5">
              <input type="text" placeholder="F.I.Sh" className="w-full px-6 py-4 rounded-full bg-[#e6e9f0] shadow-[inset_6px_6px_10px_#c3c6cc,inset_-6px_-6px_10px_#ffffff] outline-none text-gray-700 text-sm font-bold" />
              <input type="text" placeholder="Login" className="w-full px-6 py-4 rounded-full bg-[#e6e9f0] shadow-[inset_6px_6px_10px_#c3c6cc,inset_-6px_-6px_10px_#ffffff] outline-none text-gray-700 text-sm font-bold" />
              <input type="password" placeholder="Parol" className="w-full px-6 py-4 rounded-full bg-[#e6e9f0] shadow-[inset_6px_6px_10px_#c3c6cc,inset_-6px_-6px_10px_#ffffff] outline-none text-gray-700 text-sm font-bold" />
              
              <select className="w-full px-6 py-4 rounded-full bg-[#e6e9f0] shadow-[inset_6px_6px_10px_#c3c6cc,inset_-6px_-6px_10px_#ffffff] outline-none text-gray-700 text-sm font-bold appearance-none">
                <option value="student">O'quvchi</option>
                <option value="teacher">O'qituvchi</option>
                <option value="manager">Rahbariyat</option>
                <option value="admin">Super Admin</option>
              </select>

              <div className="flex gap-4 mt-8">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 rounded-full bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] text-gray-500 font-bold tracking-wider text-sm hover:text-red-500 active:shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] transition-all">BEKOR QILISH</button>
                <button className="flex-1 py-4 rounded-full bg-[#e6e9f0] shadow-[4px_4px_8px_#c3c6cc,-4px_-4px_8px_#ffffff] text-blue-600 font-bold tracking-wider text-sm hover:shadow-[inset_4px_4px_8px_#c3c6cc,inset_-4px_-4px_8px_#ffffff] transition-all">SAQLASH</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}