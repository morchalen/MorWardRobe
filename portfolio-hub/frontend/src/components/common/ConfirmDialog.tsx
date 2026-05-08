import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Warning as WarningIcon, Info as InfoIcon, Error as ErrorIcon, CheckCircle as SuccessIcon } from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

const variantConfig = {
  danger: {
    icon: ErrorIcon,
    color: '#dc3545',
    bgColor: 'rgba(220, 53, 69, 0.08)',
    confirmColor: 'error',
    confirmVariant: 'contained' as const,
  },
  warning: {
    icon: WarningIcon,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    confirmColor: 'warning',
    confirmVariant: 'contained' as const,
  },
  info: {
    icon: InfoIcon,
    color: '#4169E1',
    bgColor: 'rgba(65, 105, 225, 0.08)',
    confirmColor: 'primary',
    confirmVariant: 'contained' as const,
  },
  success: {
    icon: SuccessIcon,
    color: '#28a745',
    bgColor: 'rgba(40, 167, 69, 0.08)',
    confirmColor: 'success',
    confirmVariant: 'contained' as const,
  },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '确认操作',
  message = '确定要执行此操作吗？此操作不可撤销。',
  confirmLabel = '确认',
  cancelLabel = '取消',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  
  const config = variantConfig[variant];

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('确认操作失败:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 16px 64px rgba(31, 38, 135, 0.15)',
          animation: 'scaleIn 0.2s ease-out',
          '@keyframes scaleIn': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.95)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1)',
            },
          },
        },
      }}
    >
      {/* 标题栏 */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: config.bgColor,
              color: config.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {config.icon}
          </Box>
          <Typography
            variant="h6"
            component="span"
            sx={{ fontWeight: 600, fontSize: '1.125rem' }}
          >
            {title}
          </Typography>
        </Box>
        
        {!loading && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'rotate(90deg)',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>

      {/* 内容区 */}
      <DialogContent sx={{ pt: 2.5 }}>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.6,
            color: 'text.secondary',
          }}
        >
          {message}
        </Typography>
        
        {(variant === 'danger' || variant === 'warning') && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: config.bgColor,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <config.icon sx={{ fontSize: '1rem', color: config.color }} />
            <Typography
              variant="caption"
              sx={{ color: config.color, fontWeight: 500 }}
            >
              {variant === 'danger' ? '此操作无法撤销，请谨慎操作' : '建议仔细检查后再确认'}
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* 操作按钮 */}
      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading || isConfirming}
          sx={{
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={handleConfirm}
          variant={config.confirmVariant}
          color={config.confirmColor as any}
          disabled={loading || isConfirming}
          sx={{
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            minWidth: 100,
            ...(variant === 'danger'
              ? {
                  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)',
                    boxShadow: '0 4px 12px rgba(220, 53, 69, 0.35)',
                  }
                }
              : {}),
          }}
        >
          {isConfirming ? '处理中...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    onConfirm?: () => void | Promise<void>;
    title?: string;
    message?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
  }>({
    open: false,
  });

  const showConfirm = (
    onConfirm: () => void | Promise<void>,
    options?: {
      title?: string;
      message?: string;
      variant?: 'danger' | 'warning' | 'info' | 'success';
    }
  ) => {
    setDialogState({
      open: true,
      onConfirm,
      ...options,
    });
  };

  const closeDialog = () => {
    setDialogState({ open: false });
  };

  return {
    dialogState,
    showConfirm,
    closeDialog,
    ConfirmDialogComponent: (
      <ConfirmDialog
        open={dialogState.open}
        onClose={closeDialog}
        onConfirm={dialogState.onConfirm || (() => {})}
        title={dialogState.title}
        message={dialogState.message}
        variant={dialogState.variant || 'danger'}
      />
    ),
  };
}