import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

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
  const tertiary = theme.palette.info?.main || primary;

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
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/brain"
          element={
            <ProtectedRoute>
              <BrainPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TodayPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/wardrobe"
          element={
            <ProtectedRoute>
              <MainLayout>
                <WardrobePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/lobster"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LobsterPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clothes/add"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AddClothingPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clothes/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ClothingDetailPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UsersManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/clothings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ClothingsManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog"
          element={
            <ProtectedRoute>
              <BlogHomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog/new-post"
          element={
            <ProtectedRoute>
              <NewPostPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog/post/:slug"
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog/write"
          element={
            <ProtectedRoute>
              <WriteEditPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog/edit/:slug"
          element={
            <ProtectedRoute>
              <WriteEditPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog/profile"
          element={
            <ProtectedRoute>
              <BlogProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog/status"
          element={
            <ProtectedRoute>
              <ServerStatusPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog/admin"
          element={
            <ProtectedRoute>
              <AdminPanelPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}
