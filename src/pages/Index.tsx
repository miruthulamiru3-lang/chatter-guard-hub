import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import ChatPage from '@/components/ChatPage';
import AdminDashboard from '@/components/AdminDashboard';

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <LoginPage />;
  if (user?.role === 'admin') return <AdminDashboard />;
  return <ChatPage />;
};

export default Index;
