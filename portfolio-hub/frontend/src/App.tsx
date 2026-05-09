import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';

import { TodayPage } from '@/pages/today/TodayPage';
import { WardrobePage } from '@/pages/wardrobe/WardrobePage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { ChangePasswordPage } from '@/pages/profile/ChangePasswordPage';
import { LobsterPage } from '@/pages/lobster/LobsterPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { AddClothingPage } from '@/pages/clothes/AddClothingPage';
import { ClothingDetailPage } from '@/pages/clothes/ClothingDetailPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { UsersManagement } from '@/pages/admin/UsersManagement';
import { ClothingsManagement } from '@/pages/admin/ClothingsManagement';
import { BlogHomePage } from '@/pages/blog/BlogHomePage';
import { PostDetailPage } from '@/pages/blog/PostDetailPage';
import { WriteEditPage } from '@/pages/blog/WriteEditPage';
import { BlogProfilePage } from '@/pages/blog/BlogProfilePage';
import { ServerStatusPage } from '@/pages/blog/ServerStatusPage';
import { AdminPanelPage } from '@/pages/blog/AdminPanelPage';
import { NewPostPage } from '@/pages/blog/NewPostPage';
import { BrainPage } from '@/pages/brain/BrainPage';

export default function App() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100dvh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        backgroundColor: theme.palette.background.default,
        backgroundImage: `
          radial-gradient(at 10% 20%, ${theme.palette.action.hover} 0px, transparent 50%),
          radial-gradient(at 80% 30%, ${theme.palette.info.light || theme.palette.primary.light}15 0px, transparent 50%),
          radial-gradient(at 40% 70%, ${primary}12 0px, transparent 50%),
          radial-gradient(at 90% 90%, ${secondary}10 0px, transparent 50%)
        `,
      }}
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes with Main Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Outlet />
              </MainLayout>
            </ProtectedRoute>
          }
        >
          {/* Default redirect to today */}
          <Route index element={<Navigate to="/today" replace />} />

          {/* 衣橱模块 */}
          <Route path="today" element={<TodayPage />} />
          <Route path="wardrobe" element={<WardrobePage />} />
          <Route path="lobster" element={<LobsterPage />} />

          {/* 衣橱子页面 */}
          <Route path="clothes/add" element={<AddClothingPage />} />
          <Route path="clothes/:id" element={<ClothingDetailPage />} />

          {/* 博客模块 */}
          <Route path="blog" element={<BlogHomePage />} />
          <Route path="blog/new-post" element={<NewPostPage />} />
          <Route path="blog/post/:slug" element={<PostDetailPage />} />
          <Route path="blog/write" element={<WriteEditPage />} />
          <Route path="blog/edit/:slug" element={<WriteEditPage />} />
          <Route path="blog/profile" element={<BlogProfilePage />} />
          <Route path="blog/status" element={<ServerStatusPage />} />
          <Route path="blog/admin" element={<AdminPanelPage />} />

          {/* 博客分类 */}
          <Route path="blog/category/:category" element={<BlogHomePage />} />

          {/* 大脑模块 */}
          <Route path="brain" element={<BrainPage />} />

          {/* 我的模块 */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />

          {/* 管理模块 - 衣橱 */}
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/users" element={<UsersManagement />} />
          <Route path="admin/clothings" element={<ClothingsManagement />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}
