import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material';
import { clothesApi } from '@/services/api';
import type { Clothing } from '@/types';
import { glassStyles } from '@/styles/glass';

const CATEGORIES = [
  { value: '上衣', label: '上装' },
  { value: '裤子', label: '下装' },
  { value: '外套', label: '外套' },
  { value: '连衣裙', label: '连衣裙' },
  { value: '配饰', label: '配饰' },
  { value: '鞋靴', label: '鞋履' },
];

interface ClothingEditModalProps {
  open: boolean;
  onClose: () => void;
  clothing: Clothing | null;
  onSuccess?: () => void;
}

export function ClothingEditModal({ open, onClose, clothing, onSuccess }: ClothingEditModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (clothing) {
      setName(clothing.name || '');
      setCategory(clothing.category || '');
      setColor(clothing.color || '');
    } else {
      setName('');
      setCategory('');
      setColor('');
    }
  }, [clothing, open]);

  const handleSubmit = async () => {
    if (!clothing || !name.trim()) return;

    try {
      await clothesApi.updateClothing(clothing.id, {
        name: name.trim(),
        category,
        color: color.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('编辑衣物失败:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          ...glassStyles.dialog,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
        编辑衣物
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="衣物名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            label="分类"
            select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="颜色"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {clothing?.image_url && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                当前图片
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 120,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                }}
              >
                <img
                  src={clothing.image_url}
                  alt={clothing.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            px: 3,
            ...glassStyles.button.text,
          }}
        >
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            px: 4,
            ...glassStyles.button.contained,
          }}
          disabled={!name.trim()}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}