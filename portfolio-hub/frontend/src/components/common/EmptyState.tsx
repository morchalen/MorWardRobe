import { Box, Typography, Button, SvgIcon } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'contained' | 'outlined';
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'contained',
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, sm: 8, md: 10 },
        px: 3,
        textAlign: 'center',
        animation: 'fadeInUp 0.5s ease-out',
        '@keyframes fadeInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      {/* 图标区域 */}
      {icon && (
        <Box
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: '50%',
            bgcolor: (theme) => 
              theme.palette.mode === 'light' 
                ? 'rgba(100, 149, 237, 0.08)' 
                : 'rgba(100, 149, 237, 0.15)',
            color: 'primary.main',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 16px rgba(65, 105, 225, 0.2)',
            },
          }}
        >
          {icon}
        </Box>
      )}

      {/* 标题 */}
      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: 'text.primary',
          fontSize: { xs: '1.125rem', sm: '1.25rem' },
        }}
      >
        {title}
      </Typography>

      {/* 描述 */}
      {description && (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 360,
            mb: 3,
            color: 'text.secondary',
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      )}

      {/* 操作按钮 */}
      {(actionLabel || secondaryActionLabel) && (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {secondaryActionLabel && (
            <Button
              variant="outlined"
              onClick={onSecondaryAction}
              sx={{
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              {secondaryActionLabel}
            </Button>
          )}
          
          {actionLabel && (
            <Button
              variant={actionVariant}
              onClick={onAction}
              sx={{
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                ...(
                  actionVariant === 'contained' 
                    ? {
                        background: 'linear-gradient(135deg, rgba(100, 149, 237, 0.88) 0%, rgba(65, 105, 225, 0.92) 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(100, 149, 237, 0.95) 0%, rgba(65, 105, 225, 0.98) 100%)',
                          }
                      }
                    : {}
                ),
              }}
            >
              {actionLabel}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

export const EmptyStates = {
  noClothes: (
    onAdd: () => void
  ) => (
    <EmptyState
      icon={
        <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 2L12 6M12 18L12 22M6 12L2 12M22 12L18 12" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      }
      title="衣橱空空如也"
      description="还没有添加任何衣物哦，快来添加你的第一件衣物吧！打造专属于你的智能衣橱 ✨"
      actionLabel="立即添加衣物"
      onAction={onAdd}
    />
  ),

  noSearchResults: (
    query: string,
    onClear: () => void
  ) => (
    <EmptyState
      icon={
        <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      }
      title={`未找到"${query}"相关结果`}
      description="试试其他关键词，或者检查拼写是否正确"
      secondaryActionLabel="清除搜索"
      onSecondaryAction={onClear}
    />
  ),

  noRecommendations: () => (
    <EmptyState
      icon={
        <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      }
      title="暂无穿搭推荐"
      description="先添加一些衣物到你的衣橱，AI会为你量身定制穿搭方案 🎨"
      actionLabel="去添加衣物"
      actionVariant="outlined"
    />
  ),

  error: (
    message: string = '出了点问题',
    onRetry?: () => void
  ) => (
    <EmptyState
      icon={
        <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      }
      title={message}
      description="请稍后重试，或联系技术支持"
      actionLabel="重试"
      onAction={onRetry}
      actionVariant="outlined"
    />
  ),

  networkError: (
    onRetry?: () => void
  ) => EmptyStates.error('网络连接失败', onRetry),
};