import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/stores';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    if (!currentPassword) {
      setError('请输入当前密码');
      return false;
    }
    if (!newPassword) {
      setError('请输入新密码');
      return false;
    }
    if (newPassword.length < 6) {
      setError('新密码长度至少为6个字符');
      return false;
    }
    if (newPassword === currentPassword) {
      setError('新密码不能与当前密码相同');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess('密码修改成功！');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '密码修改失败，请检查当前密码是否正确';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
          p: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ mr: 1.5, color: 'text.secondary' }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            修改密码
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="当前密码"
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                    size="small"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 2,
              },
            }}
          />

          <TextField
            fullWidth
            label="新密码"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            disabled={isLoading}
            helperText="至少6个字符"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                    size="small"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 2,
              },
            }}
          />

          <TextField
            fullWidth
            label="确认新密码"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 2,
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              mt: 3,
              py: 1.25,
              borderRadius: 20,
              fontSize: '0.95rem',
              fontWeight: 600,
              background: isLoading
                ? undefined
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd1 0%, #6a4190 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              '确认修改'
            )}
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={() => navigate(-1)}
            disabled={isLoading}
            sx={{
              mt: 1.5,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            取消
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
