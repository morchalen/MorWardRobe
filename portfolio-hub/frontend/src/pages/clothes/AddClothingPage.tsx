import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Alert,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AddPhotoAlternate,
  Checkroom,
  ArrowBack,
} from '@mui/icons-material';
import { clothesApi } from '@/services/api';

const categories = [
  { value: '上衣', label: '上装', icon: '👔' },
  { value: '裤子', label: '下装', icon: '👖' },
  { value: '裙子', label: '裙装', icon: '👗' },
  { value: '外套', label: '外套', icon: '🧥' },
  { value: '连衣裙', label: '连衣裙', icon: '👗' },
  { value: '鞋靴', label: '鞋履', icon: '👟' },
  { value: '配饰', label: '配饰', icon: '👜' },
  { value: '其他', label: '其他', icon: '📦' },
];

const seasonOptions = [
  { value: '春', label: '春 🌸' },
  { value: '夏', label: '夏 ☀️' },
  { value: '秋', label: '秋 🍂' },
  { value: '冬', label: '冬 ❄️' },
];

export function AddClothingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
    color: '',
    seasons: [] as string[],
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('请选择有效的图片文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return;
    }
    setImage(file);
    setError('');

    // 创建预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleSeason = (season: string) => {
    setForm((prev) => ({
      ...prev,
      seasons: prev.seasons.includes(season)
        ? prev.seasons.filter((s) => s !== season)
        : [...prev.seasons, season],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.category) {
      setError('请选择衣物分类');
      return;
    }

    setLoading(true);
    try {
      if (image) {
        await clothesApi.upload(
          {
            images: image,
            category: form.category,
            color: form.color || '未指定',
            name: form.name || undefined,
            seasons: form.seasons.length > 0 ? form.seasons : undefined,
          },
          'thin'
        );
      } else {
        await clothesApi.create({
          name: form.name || '未命名衣物',
          category: form.category,
          color: form.color || '未指定',
          seasons: form.seasons.length > 0 ? form.seasons : undefined,
        });
      }

      setSuccess('✅ 衣物添加成功！正在跳转到衣橱...');
      setTimeout(() => {
        navigate('/wardrobe');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || '添加失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      {/* 页面头部 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'surfaceContainerLow' }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            添加新衣物
          </Typography>
          <Typography variant="body2" color="text.secondary">
            填写衣物信息（图片可选）
          </Typography>
        </Box>
      </Box>

      <Card elevation={0} sx={{ border: `1px solid`, borderColor: 'divider', borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* 图片上传区 - MD3 拖放上传风格 */}
            <Box
              onClick={handleImageSelect}
              sx={{
                width: '100%',
                height: 280,
                borderRadius: 4,
                border: `2px dashed ${image ? 'primary.main' : 'divider'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                overflow: 'hidden',
                position: 'relative',
                bgcolor: image ? 'transparent' : 'action.hover',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: image ? undefined : 'primary.50',
                  transform: 'scale(1.005)',
                },
              }}
            >
              {imagePreview ? (
                <>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="预览"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      bgcolor: 'background.paper',
                      borderRadius: 20,
                      px: 2,
                      py: 0.75,
                      boxShadow: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                    }}
                  >
                    <CloudUploadIcon fontSize="small" />
                    <Typography variant="body2" fontWeight={500}>
                      更换图片
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  <AddPhotoAlternate sx={{ fontSize: 56, opacity: 0.35, mb: 1 }} />
                  <Typography variant="h6" fontWeight={500} gutterBottom>
                    点击或拖拽上传图片（可选）
                  </Typography>
                  <Typography variant="caption">
                    支持 JPG、PNG、WebP 格式，最大 10MB
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

            <Divider sx={{ my: 4 }} />

            {/* 表单字段 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <TextField
                fullWidth
                label="衣物名称"
                placeholder="例如：白色棉质T恤"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                helperText="可选，方便后续搜索"
              />

              <TextField
                fullWidth
                select
                label="分类 *"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="颜色"
                placeholder="例如：白色、藏青色"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                helperText="可选，支持中文描述"
              />
            </Box>

            {/* 季节选择 - 使用 Chip 组 */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                适用季节（可多选）
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {seasonOptions.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    onClick={() => toggleSeason(opt.value)}
                    color={form.seasons.includes(opt.value) ? 'primary' : 'default'}
                    variant={form.seasons.includes(opt.value) ? 'filled' : 'outlined'}
                    clickable
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Box>
            </Box>

            {/* 提交按钮 */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="text"
                onClick={() => navigate('/wardrobe')}
                disabled={loading}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={
                  loading ? <CircularProgress size={18} color="inherit" /> : <Checkroom />
                }
                disabled={loading}
                sx={{
                  minWidth: 160,
                  borderRadius: 20,
                  px: 4,
                }}
              >
                {loading ? '上传中...' : '添加到衣橱'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
