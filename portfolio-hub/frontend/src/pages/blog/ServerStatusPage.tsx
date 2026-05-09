import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Cloud } from '@mui/icons-material';
import { blogApi } from '@/services/api';

interface ServerStatus {
  cpu?: { usage: string };
  memory?: { usage: string };
  load?: { average: string };
  system?: { os: string; arch: string };
}

export function ServerStatusPage() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await blogApi.getServerStatus();
        setServerStatus(response);
      } catch (err) {
        console.error('Failed to fetch server status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Cloud sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography variant="h5" fontWeight={600}>
          服务器状态
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 1.5,
          }}
        >
          <Paper
            sx={{
              p: 2,
              backgroundColor: 'surface.default',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              },
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1.2 }}>
              <CircularProgress
                variant="determinate"
                value={parseFloat(serverStatus?.cpu?.usage || '0')}
                size={80}
                thickness={4}
                sx={{
                  color: parseFloat(serverStatus?.cpu?.usage || '0') > 80 ? 'error.main' : 'primary.main',
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h5" fontWeight={600}>
                  {serverStatus?.cpu?.usage || '0'}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="subtitle2" fontWeight={500} fontSize="0.75rem">
              CPU 使用率
            </Typography>
            <Typography variant="body2" color="text.tertiary" fontSize="0.6875rem">
              当前处理器负载
            </Typography>
          </Paper>

          <Paper
            sx={{
              p: 2,
              backgroundColor: 'surface.default',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              },
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1.2 }}>
              <CircularProgress
                variant="determinate"
                value={parseFloat(serverStatus?.memory?.usage || '0')}
                size={80}
                thickness={4}
                sx={{
                  color: parseFloat(serverStatus?.memory?.usage || '0') > 80 ? 'error.main' : 'secondary.main',
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h5" fontWeight={600}>
                  {serverStatus?.memory?.usage || '0'}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="subtitle2" fontWeight={500} fontSize="0.75rem">
              内存使用率
            </Typography>
            <Typography variant="body2" color="text.tertiary" fontSize="0.6875rem">
              当前内存占用
            </Typography>
          </Paper>

          <Paper
            sx={{
              p: 2,
              backgroundColor: 'surface.default',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              },
            }}
          >
            <Box
              sx={{
                mb: 1.2,
                p: 1.5,
                borderRadius: '50%',
                bgcolor: 'warning.light',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
              }}
            >
              <Typography variant="h5" fontWeight={600} color="warning.dark">
                {serverStatus?.load?.average || '0'}%
              </Typography>
            </Box>
            <Typography variant="subtitle2" fontWeight={500} fontSize="0.75rem">
              系统负载
            </Typography>
            <Typography variant="body2" color="text.tertiary" fontSize="0.6875rem">
              服务器整体负载
            </Typography>
          </Paper>

          <Paper
            sx={{
              p: 2,
              backgroundColor: 'surface.default',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              },
            }}
          >
            <Box
              sx={{
                mb: 1.2,
                p: 1,
                borderRadius: 8,
                bgcolor: 'primary.light',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                {serverStatus?.system?.os || '-'}
              </Typography>
            </Box>
            <Typography variant="subtitle2" fontWeight={500} fontSize="0.75rem">
              操作系统
            </Typography>
            <Typography variant="body2" color="text.tertiary" fontSize="0.6875rem">
              {serverStatus?.system?.arch || '-'} 架构
            </Typography>
          </Paper>
        </Box>
      )}

      <Paper sx={{ p: 2, backgroundColor: 'surface.default' }}>
        <Typography variant="subtitle2" sx={{ mb: 1.2, fontSize: '0.725rem' }}>
          状态说明
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          <Typography variant="body2" color="text.secondary" fontSize="0.725rem">
            • CPU 使用率超过 80% 时显示为红色，表示负载较高
          </Typography>
          <Typography variant="body2" color="text.secondary" fontSize="0.725rem">
            • 内存使用率超过 80% 时显示为红色，建议关注
          </Typography>
          <Typography variant="body2" color="text.secondary" fontSize="0.725rem">
            • 系统负载反映当前服务器整体运行状态
          </Typography>
          <Typography variant="body2" color="text.secondary" fontSize="0.725rem">
            • 数据每 5 秒自动刷新
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
