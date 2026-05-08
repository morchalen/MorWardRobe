import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Shirt,
  FolderOpen,
  User,
  Settings,
  LogOut,
  Plus,
  Search,
} from 'lucide-react';
import { useAuthStore } from '@/stores';
import { cn } from '@/utils';

export function Layout() {
  const { user, logout, isAuthenticated, fetchUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && isAuthenticated) {
      fetchUser();
    }
  }, [user, isAuthenticated, fetchUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: '衣橱总览' },
    { to: '/clothes/new', icon: Plus, label: '添加衣物' },
    { to: '/folders', icon: FolderOpen, label: '文件夹' },
    { to: '/settings', icon: Settings, label: '设置' },
  ];

  return (
    <div className="relative flex h-screen overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(253, 247, 232, 0.8) 0%, transparent 70%),
            radial-gradient(ellipse 70% 50% at 85% 90%, rgba(239, 228, 255, 0.7) 0%, transparent 65%),
            #fafafa
          `,
        }}
      />
      <aside className="w-56 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-lg font-semibold text-gray-900">SmartWardrobe</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <NavLink
            to="/profile"
            className="flex items-center gap-3 mb-3 rounded-md hover:bg-gray-50 transition-colors -mx-2 px-2 py-2"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-sm font-medium text-purple-600">
              {user?.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="h-14 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-base font-medium text-gray-900">我的衣橱</h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索..."
              className="pl-9 pr-4 py-1.5 w-56 text-sm bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:border-gray-300"
            />
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
