import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Image, Package, Users, Trophy, Settings, LogOut, FileText, MessageSquare, UserPlus, Instagram, Camera, Video, CalendarDays, KeyRound, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLayout = ({ children, user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${document.cookie
            .split('; ')
            .find((row) => row.startsWith('session_token='))
            ?.split('=')[1] || ''}`
        }
      });
      document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login');
    }
  };

  const isMaster = user?.role === 'master';
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/hero', label: 'Home Hero', icon: Camera },
    { path: '/admin/club-info', label: 'Club Info', icon: FileText },
    { path: '/admin/history', label: 'History', icon: FileText },
    { path: '/admin/gallery', label: 'Gallery', icon: Image },
    { path: '/admin/posters', label: 'Event Posters', icon: CalendarDays },
    { path: '/admin/videos', label: 'Videos', icon: Video },
    { path: '/admin/instagram', label: 'Instagram Feed', icon: Instagram },
    { path: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
    { path: '/admin/achievements', label: 'Achievements', icon: Trophy },
    { path: '/admin/team', label: 'Team', icon: Users },
    { path: '/admin/join-us', label: 'Join Us', icon: UserPlus },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
    { path: '/admin/account', label: 'My Account', icon: KeyRound },
    ...(isMaster ? [{ path: '/admin/users', label: 'Admin Users', icon: Crown, badge: 'Master' }] : []),
  ];

  return (
    <div className="flex h-screen bg-[#FAFAFA]" data-testid="admin-layout">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col" data-testid="admin-sidebar">
        <div className="p-6 border-b border-gray-200 shrink-0">
          <h1 className="font-heading text-2xl font-bold text-[#410C09]">UTeM 24FD</h1>
          <p className="text-sm text-gray-600">Admin Panel</p>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#410C09] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    data-testid={`admin-nav-${item.path.split('/').pop()}`}
                  >
                    <Icon size={20} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200 bg-white shrink-0">
          {user && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-800" data-testid="admin-user-name">{user.name}</p>
              <p className="text-xs text-gray-500" data-testid="admin-user-email">{user.email}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start"
            data-testid="logout-btn"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto" data-testid="admin-main">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;