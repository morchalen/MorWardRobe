import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CardMedia,
  Alert,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { clothesApi } from '@/services/api';
import type { CategoryType } from '@/types';

interface ClothingEditDialogProps {
  open: boolean;
  onClose: () => void;
  clothingId: string;
  onUpdate: () => void;
  onDelete?: () => void;
}

const categoryOptions = [
  { value: '上衣', label: '上装' },
  { value: '裤子', label: '下装' },
  { value: '外套', label: '外套' },
  { value: '连衣裙', label: '连衣裙' },
  { value: '配饰', label: '配饰' },
  { value: '鞋靴', label: '鞋履' },
];

const seasonOptions = [
  { value: '春', label: '春季' },
  { value: '夏', label: '夏季' },
  { value: '秋', label: '秋季' },
  { value: '冬', label: '冬季' },
];

export function ClothingEditDialog({ open, onClose, clothingId, onUpdate, onDelete }: ClothingEditDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [category, setCategory] = useState<CategoryType>('上衣');
  const [seasons, setSeasons] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open && clothingId) {
      loadClothing();
    }
  }, [open, clothingId]);

  const loadClothing = async () => {
    try {
      const clothing = await clothesApi.get(clothingId);
      setName(clothing.name);
      setColor(clothing.color);
      setCategory(clothing.category);
      setSeasons(clothing.seasons);
      setThumbnailUrl(clothing.thumbnail_url);
    } catch (err) {
      console.error('获取衣物信息失败:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await clothesApi.update(clothingId, {
        name,
        color,
        category,
        seasons,
      });
      onUpdate();
      onClose();
    } catch (err) {
      console.error('更新衣物失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await clothesApi.delete(clothingId);
      onDelete?.();
      onClose();
    } catch (err) {
      console.error('删除衣物失败:', err);
    } finally {
      setLoading(false);
      setDeleteConfirm(false);
    }
  };

  const toggleSeason = (season: string) => {
    setSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((s) => s !== season)
        : [...prev, season]
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>修改衣物</DialogTitle>
      <DialogContent>
        {thumbnailUrl && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <CardMedia
              component="img"
              image={thumbnailUrl}
              alt={name}
              sx={{
                width: 180,
                height: 180,
                objectFit: 'cover',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
              }}
            />
          </Box>
        )}

        <TextField
          label="名称"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="颜色"
          fullWidth
          value={color}
          onChange={(e) => setColor(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="分类"
          select
          fullWidth
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryType)}
          SelectProps={{ native: true }}
          sx={{ mb: 2 }}
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ mb: 1 }}>适用季节</Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {seasonOptions.map((option) => (
              <Button
                key={option.value}
                variant={seasons.includes(option.value) ? 'contained' : 'outlined'}
                size="small"
                onClick={() => toggleSeason(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </Box>
        </Box>

        {deleteConfirm && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            确定要删除这件衣物吗？此操作无法撤销。
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        {!deleteConfirm ? (
          <>
            <Button onClick={onClose}>取消</Button>
            <Button
              onClick={() => setDeleteConfirm(true)}
              color="error"
              startIcon={<Delete />}
            >
              删除
            </Button>
            <Button onClick={handleSave} disabled={loading} color="primary">
              保存
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setDeleteConfirm(false)}>取消</Button>
            <Button onClick={handleDelete} disabled={loading} color="error">
              确认删除
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}