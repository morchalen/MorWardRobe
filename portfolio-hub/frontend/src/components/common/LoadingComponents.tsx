import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';
import { ReactNode } from 'react';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 40, 
  message = '加载中...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullScreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 9999,
        } : {
          py: 8,
        }),
      }}
    >
      <CircularProgress
        size={size}
        sx={{
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 500,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 },
            },
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  return content;
}

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = '正在加载数据...' }: PageLoaderProps) {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 80,
          height: 80,
        }}
      >
        <CircularProgress
          variant="determinate"
          thickness={4}
          value={100}
          sx={{ color: 'grey.200' }}
          size={80}
        />
        <CircularProgress
          variant="indeterminate"
          thickness={4}
          sx={{
            color: 'primary.main',
            position: 'absolute',
            left: 0,
            top: 0,
            animationDuration: '550ms',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
          size={80}
        />
      </Box>
      
      <Box sx={{ textAlign: 'center', mt: -1 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          {message.split('...')[0]}
          <span
            sx={{
              animation: 'dots 1.5s steps(4, end) infinite',
              '@keyframes dots': {
                '0%, 20%': { content: '.' },
                '40%': { content: '..' },
                '60%, 100%': { content: '...' },
              },
            }}
          >...</span>
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mt: 0.5,
            fontSize: '0.75rem',
          }}
        >
          请稍候，精彩内容即将呈现 ✨
        </Typography>
      </Box>
    </Box>
  );
}

interface CardSkeletonProps {
  count?: number;
  columns?: number;
}

export function CardSkeleton({ count = 6, columns = 5 }: CardSkeletonProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: `repeat(${Math.min(columns, 2)}, 1fr)`,
          sm: `repeat(${Math.min(columns, 3)}, 1fr)`,
          md: `repeat(${Math.min(columns, 4)}, 1fr)`,
          lg: `repeat(${columns}, 1fr)`,
        },
        gap: 1.5,
      }}
    >
      {[...Array(count)].map((_, i) => (
        <Box key={i}>
          <Skeleton
            variant="rectangular"
            height={180}
            sx={{
              borderRadius: 2.5,
              mb: 1,
            }}
          />
          <Skeleton
            variant="text"
            width="60%"
            sx={{ mx: 'auto', mb: 0.5 }}
          />
          <Skeleton
            variant="rectangular"
            width="40%"
            height={24}
            sx={{ mx: 'auto', borderRadius: 1 }}
          />
        </Box>
      ))}
    </Box>
  );
}

interface InlineLoaderProps {
  size?: 'small' | 'medium';
  label?: string;
}

export function InlineLoader({ size = 'small', label }: InlineLoaderProps) {
  const loaderSize = size === 'small' ? 20 : 32;
  
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
      }}
    >
      <CircularProgress size={loaderSize} thickness={4} />
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
}

interface SkeletonTextProps {
  lines?: number;
  width?: string | number;
}

export function SkeletonText({ lines = 3, width = '100%' }: SkeletonTextProps) {
  return (
    <Box sx={{ width }}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          sx={{
            mb: i < lines - 1 ? 1 : 0,
            width: i === lines - 1 ? '60%' : '100%',
          }}
        />
      ))}
    </Box>
  );
}

export interface WithLoadingProps {
  isLoading: boolean;
  loadingType?: 'spinner' | 'skeleton' | 'page';
  loadingMessage?: string;
  children: ReactNode;
}

export function WithLoading({
  isLoading,
  loadingType = 'page',
  loadingMessage = '加载中...',
  children,
}: WithLoadingProps) {
  if (isLoading) {
    switch (loadingType) {
      case 'spinner':
        return <LoadingSpinner message={loadingMessage} />;
      case 'skeleton':
        return <CardSkeleton />;
      case 'page':
      default:
        return <PageLoader message={loadingMessage} />;
    }
  }

  return <>{children}</>;
}