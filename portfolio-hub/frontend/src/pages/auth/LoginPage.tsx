import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Avatar,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Visibility, VisibilityOff, Checkroom, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuthStore } from '@/stores';
import { authApi } from '@/services/api';
import { getGlassCard, getGlassButton, getGlassDialog } from '@/styles/glass';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // 忘记密码相关状态
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      setSuccessMessage('登录成功，欢迎回来');
      setTimeout(() => navigate('/today'), 1200);
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    }
  };

  const handleOpenResetDialog = () => {
    setShowResetDialog(true);
    setResetEmail(email); // 预填当前输入的邮箱
    setResetError('');
    setResetSuccess(false);
    setResetNewPassword('');
    setResetConfirmPassword('');
  };

  const handleCloseResetDialog = () => {
    setShowResetDialog(false);
    setResetError('');
    setResetSuccess(false);
  };

  const handleResetPassword = async () => {
    setResetError('');

    // 简单验证
    if (!resetEmail) {
      setResetError('请输入邮箱地址');
      return;
    }
    if (!resetNewPassword) {
      setResetError('请输入新密码');
      return;
    }
    if (resetNewPassword.length < 6) {
      setResetError('密码长度至少6位');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('两次输入的密码不一致');
      return;
    }

    setIsResetting(true);
    try {
      await authApi.resetPassword(resetEmail, resetNewPassword);
      setResetSuccess(true);
      setTimeout(() => {
        handleCloseResetDialog();
        setSuccessMessage('密码重置成功，请使用新密码登录');
      }, 2000);
    } catch (err: any) {
      setResetError(err.message || '密码重置失败，请稍后重试');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: '#FFFFFF',
      }}
      style={{
        background: '#FFFFFF',
        backgroundImage: `
          radial-gradient(ellipse 85% 65% at 15% 5%, rgba(135,206,235,0.45) 0%, rgba(135,206,235,0.25) 35%, transparent 60%),
          radial-gradient(ellipse 75% 60% at 85% 95%, rgba(200,170,210,0.50) 0%, rgba(190,160,200,0.28) 40%, transparent 65%),
          radial-gradient(ellipse 55% 45% at 50% 50%, rgba(173,216,230,0.22) 0%, transparent 55%)
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
          px: 4,
        }}
      >
        {/* Logo区域 */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: 'transparent',
              mx: 'auto',
              mb: 2,
              boxShadow: 'none',
            }}
            src="/mono_logo.png"
            alt="MonOS Logo"
          />
          <Typography variant="h5" fontWeight={700}>
            MonOS
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            智能衣橱 · 博客 · 大脑
          </Typography>
        </Box>

        {/* 登录表单 */}
        <Paper
          elevation={0}
          sx={(theme) => ({
            width: '100%',
            p: 3,
            ...getGlassCard(theme),
            borderRadius: 3,
          })}
        >
          {error && (
            <Alert severity="error" variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                size="medium"
                label="邮箱地址"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                autoComplete="email"
              />
              
              <TextField
                required
                fullWidth
                size="medium"
                label="密码"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        tabIndex={-1}
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">记住我</Typography>
                  }
                  sx={{ ml: 0 }}
                />
                <Link
                  component="button"
                  type="button"
                  variant="caption"
                  underline="hover"
                  onClick={handleOpenResetDialog}
                  sx={{ cursor: 'pointer', bgcolor: 'transparent', border: 'none', p: 0 }}
                >
                  忘记密码？
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Checkroom />}
                sx={(theme) => ({
                  py: 1.75,
                  mt: 1,
                  fontSize: '1rem',
                  ...getGlassButton(theme, 'contained'),
                  borderRadius: 3,
                })}
              >
                登录
              </Button>

              <Box
                sx={{
                  textAlign: 'center',
                  pt: 1,
                  borderTop: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  还没有账号？{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    fontWeight={600}
                    underline="hover"
                    color="primary.main"
                  >
                    立即注册 →
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Typography variant="caption" color="text.disabled" sx={{ mt: 2.5 }}>
          © 2026 MonOS · Powered by Morchalen_General
        </Typography>
      </Box>

      {/* 忘记密码 - 重置密码对话框 */}
      <Dialog
        open={showResetDialog}
        onClose={handleCloseResetDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: (theme) => ({
            ...getGlassDialog(theme),
            borderRadius: 3,
          })
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleCloseResetDialog} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>
              重置密码
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {!resetSuccess ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              {resetError && (
                <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
                  {resetError}
                </Alert>
              )}

              <TextField
                required
                fullWidth
                size="medium"
                label="邮箱地址"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="请输入您的注册邮箱"
                autoFocus
              />

              <TextField
                required
                fullWidth
                size="medium"
                label="新密码"
                type={showResetPassword ? 'text' : 'password'}
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                placeholder="至少6位字符"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        edge="end"
                        tabIndex={-1}
                        size="small"
                      >
                        {showResetPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                required
                fullWidth
                size="medium"
                label="确认新密码"
                type="password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                placeholder="再次输入新密码"
              />

              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                直接输入新密码即可完成重置，无需验证码。
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'success.main',
                }}
              >
                ✓
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                密码重置成功！
              </Typography>
              <Typography variant="body2" color="text.secondary">
                请使用新密码登录
              </Typography>
            </Box>
          )}
        </DialogContent>

        {!resetSuccess && (
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={handleCloseResetDialog}
              color="inherit"
              sx={{ mr: 1 }}
            >
              取消
            </Button>
            <Button
              onClick={handleResetPassword}
              variant="contained"
              disabled={isResetting}
              sx={(theme) => ({
                minWidth: 120,
                ...getGlassButton(theme, 'contained'),
              })}
            >
              {isResetting ? '重置中...' : '立即重置'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSuccessMessage('')}
          sx={{
            borderRadius: 2,
            fontSize: '0.9375rem',
            fontWeight: 500,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
