import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  // Ma'lumot yuklanayotganda ekranda kuting yozuvi chiqadi
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e6e9f0]">
        <div className="text-blue-500 font-bold tracking-wider animate-pulse text-xl">
          YUKLANMOQDA...
        </div>
      </div>
    );
  }

  // Agar tizimga kirmagan bo'lsa, login sahifasiga qaytaradi
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // Agar ruxsat etilmagan rol kirmoqchi bo'lsa
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};