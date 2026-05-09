import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Email,
  Shield,
  CalendarToday,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { blogApi } from '@/services/api';
import { useAuthStore } from '@/stores';

export function BlogProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.email?.split('@')[0] || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!username.trim()) {
      setError('用户名不能为空');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await blogApi.updateUserProfile({ username });
      setSuccess('保存成功！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2.5, backgroundColor: 'surface.default' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            个人中心
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon sx={{ fontSize: 14 }} />}
            onClick={handleLogout}
            size="small"
          >
            退出登录
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 1.5, fontSize: '0.725rem' }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 1.5, fontSize: '0.725rem' }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Email sx={{ color: 'text.secondary', fontSize: 16 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                邮箱
              </Typography>
              <Typography variant="body2">{user?.email || '-'}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Shield sx={{ color: 'text.secondary', fontSize: 16 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                账户类型
              </Typography>
              <Typography variant="body2">
                {user?.role === 'admin' ? '管理员' : '普通用户'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2 }}>
            <CalendarToday sx={{ color: 'text.secondary', fontSize: 16 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                注册时间
              </Typography>
              <Typography variant="body2">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 2.5, backgroundColor: 'surface.default' }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          修改个人信息
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="用户名"
            size="small"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            placeholder="输入用户名"
          />

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{ alignSelf: 'flex-start' }}
            size="small"
          >
            {loading ? <CircularProgress size={16} /> : '保存修改'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
