import { Box, Typography, Card, CardContent, Avatar, Button, Divider, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Logout, Email, Shield, CalendarToday, Key } from '@mui/icons-material';
import { useAuthStore } from '@/stores';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
      {/* 头部用户信息卡片 - 玻璃风格 */}
      <Box
        sx={{
          mb: 2,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        }}
      >
        {/* 渐变背景 */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%)',
        }} />

        <Box sx={{ pt: 7, pb: 1.75, px: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '1.5rem',
                border: '3px solid rgba(255, 255, 255, 0.8)',
                boxShadow: 1,
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>

            <Box sx={{ flex: 1, pb: 0.125 }}>
              <Typography
                component="h1"
                variant="h6"
                fontWeight={700}
                color="text.primary"
              >
                {user?.email?.split('@')[0] || '用户'}
              </Typography>
              <Typography
                component="p"
                variant="caption"
                color="text.secondary"
              >
                {user?.email}
              </Typography>
            </Box>

            <Chip
              icon={<Shield sx={{ fontSize: 12 }} />}
              label={user?.role === 'admin' ? '管理员' : '普通用户'}
              color={user?.role === 'admin' ? 'secondary' : 'default'}
              variant={user?.role === 'admin' ? 'filled' : 'outlined'}
              size="small"
              sx={{
                fontWeight: 600,
                height: 28,
                borderRadius: 6,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* 账号信息 - 玻璃卡片 */}
      <Box
        sx={{
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
          mb: 2,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <List disablePadding sx={{ py: 0.5 }}>
            <ListItem
              sx={{
                px: 2.75,
                py: 2,
                borderBottom: `1px solid ${'divider'}`,
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 44 }}>
                <Email color="action" sx={{ fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="邮箱地址"
                secondary={user?.email || '-'}
                primaryTypographyProps={{
                  component: 'span',
                  variant: 'caption',
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
                secondaryTypographyProps={{
                  component: 'p',
                  variant: 'body2',
                  fontWeight: 500,
                }}
              />
            </ListItem>

            <ListItem
              sx={{
                px: 2.75,
                py: 2,
                borderBottom: `1px solid ${'divider'}`,
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 44 }}>
                <Shield color="action" sx={{ fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="账号角色"
                secondary={user?.role === 'admin' ? '系统管理员' : '标准用户'}
                primaryTypographyProps={{
                  component: 'span',
                  variant: 'caption',
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
                secondaryTypographyProps={{
                  component: 'p',
                  variant: 'body2',
                  fontWeight: 500,
                }}
              />
            </ListItem>

            <ListItem
              sx={{
                px: 2.75,
                py: 2,
              }}
            >
              <ListItemIcon sx={{ minWidth: 44 }}>
                <CalendarToday color="action" sx={{ fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="加入时间"
                secondary={user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}
                primaryTypographyProps={{
                  component: 'span',
                  variant: 'caption',
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
                secondaryTypographyProps={{
                  component: 'p',
                  variant: 'body2',
                  fontWeight: 500,
                }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Box>

      {/* 操作按钮 - 玻璃卡片 */}
      <Box
        sx={{
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
          p: 1.75,
          display: 'flex',
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          size="large"
          startIcon={<Key />}
          fullWidth
          onClick={handleChangePassword}
          sx={{
            borderRadius: 20,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'rgba(102, 126, 234, 0.4)',
            color: 'primary.main',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              borderColor: 'rgba(102, 126, 234, 0.6)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          修改密码
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={<Logout />}
          fullWidth
          onClick={handleLogout}
          sx={{
            borderRadius: 20,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd1 0%, #6a4190 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
            },
          }}
        >
          退出登录
        </Button>
      </Box>
    </Box>
  );
}
