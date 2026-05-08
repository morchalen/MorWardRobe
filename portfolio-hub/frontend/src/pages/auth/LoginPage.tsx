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
import { Visibility, VisibilityOff, Checkroom, Login, Book, Psychology } from '@mui/icons-material';
import { useAuthStore } from '@/stores';
import { glassStyles } from '@/styles/glass';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [targetSystem, setTargetSystem] = useState<'wardrobe' | 'blog' | 'brain'>('wardrobe');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent, system: 'wardrobe' | 'blog' | 'brain') => {
    e.preventDefault();
    setError('');
    setTargetSystem(system);

    try {
      await login(email, password);
      if (system === 'blog') {
        setSuccessMessage('登录成功，正在进入博客...');
        setTimeout(() => navigate('/blog'), 1500);
      } else if (system === 'brain') {
        setSuccessMessage('登录成功，正在进入大脑...');
        setTimeout(() => navigate('/brain'), 1500);
      } else {
        setSuccessMessage('登录成功，欢迎回来');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
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
            智能衣橱
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            AI 驱动的个人穿搭管理平台
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            p: 3.5,
            borderRadius: 3,
            ...glassStyles.primary,
          }}
        >
          {error && (
            <Alert severity="error" variant="outlined" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form">
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
                    pt: 0.25,
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
                    component={RouterLink}
                    to="#"
                    variant="caption"
                    underline="hover"
                  >
                    忘记密码？
                  </Link>
                </Box>
              </Box>

              {/* 右侧列：操作区 */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  minWidth: 140,
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
                  <Link
                    component={RouterLink}
                    to="/register"
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
                    立即注册 →
                  </Link>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    type="submit"
                    onClick={(e) => handleSubmit(e, 'wardrobe')}
                    fullWidth
                    variant="contained"
                    startIcon={<Checkroom />}
                    sx={{
                      py: 1.5,
                      borderRadius: 8,
                      ...glassStyles.button.contained,
                    }}
                  >
                    进入衣橱
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    startIcon={<Psychology />}
                    onClick={(e) => handleSubmit(e, 'brain')}
                    sx={{
                      py: 1.5,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.85) 0%, rgba(103, 58, 183, 0.9) 100%)',
                      color: 'white',
                      boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 25px rgba(156, 39, 176, 0.4)',
                        background: 'linear-gradient(135deg, rgba(136, 29, 156, 0.85) 0%, rgba(93, 48, 173, 0.9) 100%)',
                      },
                    }}
                  >
                    登录大脑
                  </Button>
                  <Button
                    type="submit"
                    onClick={(e) => handleSubmit(e, 'blog')}
                    fullWidth
                    variant="outlined"
                    startIcon={<Book />}
                    sx={{
                      py: 1.5,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    进入博客
                  </Button>
                </Box>
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
