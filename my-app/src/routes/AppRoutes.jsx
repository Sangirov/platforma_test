import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { ProtectedRoute } from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import AdminDashboard from '../features/admin/AdminDashboard';
import AdminUsers from '../features/admin/AdminUsers';
import StudentDashboard from '../features/student/StudentDashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<MainLayout />}>
        
        {/* Super Admin yo'nalishlari */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* O'quvchi yo'nalishlari */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Routes>
              <Route path="/" element={<StudentDashboard />} />
              {/* O'quvchi uchun kelajakdagi sahifalar (Testlar, Portfolio) shu yerga qo'shiladi */}
            </Routes>
          </ProtectedRoute>
        } />

        <Route path="/teacher/*" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <div className="bg-[#e6e9f0] p-8 rounded-[30px] shadow-[8px_8px_16px_#c3c6cc,-8px_-8px_16px_#ffffff]">
              <h1 className="text-2xl font-bold text-gray-700">O'qituvchi Dashboardi</h1>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/management/*" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <div className="bg-[#e6e9f0] p-8 rounded-[30px] shadow-[8px_8px_16px_#c3c6cc,-8px_-8px_16px_#ffffff]">
              <h1 className="text-2xl font-bold text-gray-700">Rahbariyat Paneli</h1>
            </div>
          </ProtectedRoute>
        } />

      </Route>

      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center bg-[#e6e9f0]">
          <div className="p-10 rounded-[30px] shadow-[inset_8px_8px_16px_#c3c6cc,inset_-8px_-8px_16px_#ffffff] text-red-500 font-bold text-xl tracking-wider text-center">
            XATOLIK: SIZDA BU SAHIFAGA RUXSAT YO'Q!
          </div>
        </div>
      } />
    </Routes>
  );
};