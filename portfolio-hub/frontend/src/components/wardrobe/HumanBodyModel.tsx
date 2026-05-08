import { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Button,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { CloudUpload, AutoAwesome, CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { authApi } from '@/services/api';

interface HumanBodyModelProps {
  imageUrl?: string;
  onImageUpdate?: (newUrl: string) => void;
  compact?: boolean;
}

export function HumanBodyModel({ imageUrl, onImageImageUpdate, compact = false }: HumanBodyModelProps) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setMessage('请选择图片文件（JPG/PNG/WebP）');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatus('error');
      setMessage('图片大小不能超过10MB');
      return;
    }

    setUploading(true);
    setStatus('uploading');
    setMessage('正在上传并调用火山引擎抠图...');

    try {
      const res = await authApi.updateBodyImage(file);
      const newImageUrl = res.body_image_url;

      setStatus('success');
      setMessage(res.message || 'AI虚拟试衣模型已更新');

      if (onImageImageUpdate && newImageUrl) {
        onImageImageUpdate(newImageUrl);
      }
    } catch (err: any) {
      console.error('[HumanBodyModel] 上传失败:', err);
      setStatus('error');
      setMessage(err.response?.data?.message || err.message || '上传失败，请稍后重试');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 紧凑模式 - 透明背景卡片
  if (compact) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        {/* 透明背景卡片 - 竖长条人形图片适配 */}
        <Box
          sx={{
            width: '100%',
            aspectRatio: '3 / 5',
            maxHeight: '100%',
            overflow: 'hidden',
            borderRadius: 2.5,
            border: '1px solid rgba(255, 255, 255, 0.3)',
            bgcolor: 'transparent',
          }}
        >
          <CardMedia
            component="img"
            image={imageUrl || '/placeholder-body.png'}
            alt={imageUrl ? '用户人体模型' : '默认人体模型'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              bgcolor: 'transparent',
              filter: uploading ? 'brightness(0.7)' : 'none',
            }}
          />

          {uploading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(28,27,31,0.6)',
                gap: 1,
              }}
            >
              <CircularProgress size={32} color="primary" />
              <Typography
                component="p"
                variant="caption"
                color="white"
                fontWeight={500}
                sx={{ fontSize: '0.75rem' }}
              >
                处理中...
              </Typography>
            </Box>
          )}
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* M3 Filled Tonal Button */}
        <Tooltip title="点击上传全身照，AI自动抠图">
          <Button
            variant="tonal"
            size="small"
            startIcon={
              uploading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <CloudUpload fontSize="small" />
              )
            }
            onClick={handleUploadClick}
            disabled={uploading}
            fullWidth
            sx={{
              borderRadius: 20,
              py: 0.625,
              px: 2.5,
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 140,
              fontSize: '0.8rem',
            }}
          >
            {uploading ? '处理中...' : '更换试衣图'}
          </Button>
        </Tooltip>

        {status !== 'idle' && status !== 'uploading' && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.25,
              px: 2,
              borderRadius: 2.5,
              maxWidth: 260,
              bgcolor:
                status === 'success'
                  ? 'primary.container'
                  : status === 'error'
                    ? 'error.container'
                    : 'tertiary.container',
              color:
                status === 'success'
                  ? 'primary.onContainer'
                  : status === 'error'
                    ? 'error.onContainer'
                    : 'tertiary.onContainer',
            }}
          >
            {status === 'success' && <CheckCircleOutline sx={{ fontSize: 16 }} />}
            {status === 'error' && <ErrorOutline sx={{ fontSize: 16 }} />}
            <Typography
              component="span"
              variant="caption"
              sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}
            >
              {message}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // 标准模式 - M3 Elevated 卡片
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.75 }}>
      {/* M3 Elevated 卡片 */}
      <Card
        variant="elevation"
        elevation={imageUrl ? 1 : 0}
        sx={{
          width: '90%',
          maxWidth: 340,
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 3,
          bgcolor: imageUrl ? undefined : 'surfaceContainerLow',
          transition: 'box-shadow 0.3s ease',
          '&:hover': imageUrl ? {
            elevation: 2,
          } : {},
        }}
      >
        <CardMedia
          component="img"
          height={360}
          image={imageUrl || '/placeholder-body.png'}
          alt={imageUrl ? '用户人体模型' : '默认人体模型'}
          sx={{
            objectFit: 'contain',
            bgcolor: imageUrl ? 'transparent' : 'surfaceContainerHighest',
            filter: uploading ? 'brightness(0.7)' : 'none',
            transition: 'filter 0.3s ease',
          }}
        />

        {uploading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(28,27,31,0.6)',
              gap: 1.5,
            }}
          >
            <CircularProgress size={40} color="primary" />
            <Typography
              component="p"
              variant="body2"
              color="white"
              fontWeight={500}
            >
              火山引擎处理中...
            </Typography>
          </Box>
        )}
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* M3 Filled Button */}
      <Tooltip title="点击上传你的全身照，AI将自动抠图生成试衣模型">
        <Button
          variant="contained"
          size="medium"
          startIcon={
            uploading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <CloudUpload />
            )
          }
          onClick={handleUploadClick}
          disabled={uploading}
          sx={{
            borderRadius: 20,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            minWidth: 180,
            boxShadow: 1,
          }}
        >
          {uploading ? '处理中...' : '更换我的试衣图'}
        </Button>
      </Tooltip>

      {/* M3 Status Container */}
      {status !== 'idle' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            p: 1.5,
            px: 2.5,
            borderRadius: 3,
            maxWidth: 300,
            bgcolor:
              status === 'success'
                ? 'primary.container'
                : status === 'error'
                  ? 'error.container'
                  : 'secondary.container',
            color:
              status === 'success'
                ? 'primary.onContainer'
                : status === 'error'
                  ? 'error.onContainer'
                  : 'secondary.onContainer',
          }}
        >
          {status === 'success' && <CheckCircleOutline />}
          {status === 'error' && <ErrorOutline />}
          {status === 'uploading' && <AutoAwesome />}
          <Typography
            component="span"
            variant="body2"
            sx={{ lineHeight: 1.5 }}
          >
            {message}
          </Typography>
        </Box>
      )}

      {/* M3 Supporting Text */}
      <Tooltip title="AI虚拟试衣 - 由火山引擎 Doubao 模型提供主体分割技术支持">
        <Typography
          component="span"
          variant="caption"
          color="text.disabled"
          sx={{
            fontSize: '0.6875rem',
            textAlign: 'center',
            cursor: 'help',
            letterSpacing: 0.25,
          }}
        >
          AI虚拟试衣 · 火山引擎 Doubao模型
        </Typography>
      </Tooltip>
    </Box>
  );
}
