import { Component, ReactNode, ErrorInfo } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            bgcolor: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
                : 'background.default',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              maxWidth: 480,
              width: '100%',
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
            }}
          >
            {/* 错误图标 */}
            <Box
              sx={{
                mb: 2.5,
                p: 2,
                borderRadius: '50%',
                bgcolor: 'rgba(220, 53, 69, 0.08)',
                color: '#dc3545',
                display: 'inline-flex',
                animation: 'shake 0.6s ease-in-out',
                '@keyframes shake': {
                  '0%, 100%': { transform: 'translateX(0)' },
                  '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-8px)' },
                  '20%, 40%, 60%, 80%': { transform: 'translateX(8px)' },
                },
              }}
            >
              <ErrorIcon sx={{ fontSize: 48 }} />
            </Box>

            {/* 标题 */}
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, mb: 1 }}
            >
              哎呀，出了点问题 😔
            </Typography>

            {/* 描述 */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 1, lineHeight: 1.6 }}
            >
              页面遇到了一些意外情况，无法正常显示。
            </Typography>

            {/* 错误详情（开发环境） */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(220, 53, 69, 0.04)',
                  border: '1px solid rgba(220, 53, 69, 0.12)',
                  textAlign: 'left',
                }}
              >
                <Typography variant="caption" color="error" fontWeight={600}>
                  错误详情（仅开发环境可见）:
                </Typography>
                <pre
                  style={{
                    marginTop: 8,
                    padding: 8,
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    maxHeight: 150,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    color: '#dc3545',
                  }}
                >
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </Box>
            )}

            {/* 操作按钮 */}
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              <Button
                variant="outlined"
                onClick={this.handleReset}
                sx={{
                  borderRadius: 8,
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                重试
              </Button>
              <Button
                variant="contained"
                onClick={this.handleReload}
                sx={{
                  borderRadius: 8,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  background: 'linear-gradient(135deg, rgba(100, 149, 237, 0.88) 0%, rgba(65, 105, 225, 0.92) 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(100, 149, 237, 0.95) 0%, rgba(65, 105, 225, 0.98) 100%)',
                  }
                }}
              >
                刷新页面
              </Button>
            </Box>

            {/* 联系支持 */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 3,
                display: 'block',
                fontSize: '0.75rem',
              }}
            >
              如果问题持续存在，请联系技术支持 📧
            </Typography>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}