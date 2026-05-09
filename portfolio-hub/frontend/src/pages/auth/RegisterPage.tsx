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
} from '@mui/material';
import { Visibility, VisibilityOff, Checkroom, PersonAdd } from '@mui/icons-material';
import { useAuthStore } from '@/stores';
import { getGlassCard, getGlassButton } from '@/styles/glass';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('请阅读并同意服务条款');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为 6 位');
      return;
    }

    try {
      await register(email, password);
      setSuccessMessage('注册成功，欢迎加入智能衣橱');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试');
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
        backgroundImage: `
          radial-gradient(ellipse 85% 65% at 85% 5%, rgba(135,206,235,0.45) 0%, rgba(135,206,235,0.25) 35%, transparent 60%),
          radial-gradient(ellipse 75% 60% at 15% 95%, rgba(200,170,210,0.50) 0%, rgba(190,160,200,0.28) 40%, transparent 65%),
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
          maxWidth: 480,
          width: '100%',
          px: 4,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 68,
              height: 68,
              bgcolor: 'primary.main',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 6px 20px rgba(66,99,235,0.30)',
            }}
          >
            <Checkroom sx={{ fontSize: 36 }} />
          </Avatar>
          <Typography variant="h5" fontWeight={700}>
            创建账号
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            开始你的智能穿搭之旅
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={(theme) => ({
            width: '100%',
            p: 3.5,
            ...getGlassCard(theme),
            borderRadius: 3,
          })}
        >
          {error && (
            <Alert severity="error" variant="outlined" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 3,
                alignItems: 'start',
              }}
            >
              {/* 左侧列：输入区 */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
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
                  placeholder="your@email.com"
                />
                <TextField
                  required
                  fullWidth
                  size="medium"
                  label="密码"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  helperText="至少 6 个字符"
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
                <TextField
                  required
                  fullWidth
                  size="medium"
                  label="确认密码"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      我已阅读并同意{' '}
                      <Link component={RouterLink} to="#" underline="hover">
                        服务条款
                      </Link>{' '}
                      和{' '}
                      <Link component={RouterLink} to="#" underline="hover">
                        隐私政策
                      </Link>
                    </Typography>
                  }
                  sx={{ ml: 0 }}
                />
              </Box>

              {/* 右侧列：操作区 */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  minWidth: 130,
                  justifyContent: 'space-between',
                  alignItems: 'stretch',
                }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 1.75,
                    px: 1.5,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    已有账号？
                  </Typography>
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    underline="none"
                    sx={{
                      fontWeight: 600,
                      color: 'primary.main',
                      fontSize: '0.95rem',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    立即登录 →
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="outlined"
                  startIcon={<PersonAdd />}
                  sx={(theme) => ({
                    py: 1.75,
                    ...getGlassButton(theme, 'outlined'),
                    borderRadius: 10,
                  })}
                >
                  注册
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Typography variant="caption" color="text.disabled" sx={{ mt: 2.5 }}>
          © 2026 Smart Wardrobe · Powered by Morchalen_General
        </Typography>
      </Box>

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
