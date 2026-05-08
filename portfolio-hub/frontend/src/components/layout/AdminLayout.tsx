import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Shirt,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '@/stores';
import { cn } from '@/utils';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, fetchUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: '仪表盘', end: true },
    { to: '/admin/users', icon: Users, label: '用户管理' },
    { to: '/admin/clothings', icon: Shirt, label: '衣物管理' },
    { to: '/settings', icon: Settings, label: '系统设置' },
  ];

  return (
    <div className="flex h-screen bg-neutral-100">
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo区域 */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold">管理后台</h1>
              <p className="text-xs text-slate-400">SmartWardrobe</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            主菜单
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* 底部用户信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-bold">
                {user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-blue-400">管理员</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-neutral-900">控制面板</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* 快捷统计 */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-neutral-600">系统运行正常</span>
              </div>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
