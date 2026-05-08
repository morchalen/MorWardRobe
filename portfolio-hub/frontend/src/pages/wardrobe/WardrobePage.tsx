import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  InputAdornment,
  Fab,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { clothesApi } from '@/services/api';
import { ClothingCard } from '@/components/wardrobe/ClothingCard';
import { ClothingEditModal } from '@/components/wardrobe/ClothingEditModal';
import { useWardrobeStore } from '@/stores';
import type { Clothing } from '@/types';
import { glassStyles } from '@/styles/glass';
import { CardSkeleton } from '@/components/common/LoadingComponents';
import { EmptyStates } from '@/components/common/EmptyState';
import { ConfirmDialog, useConfirmDialog } from '@/components/common/ConfirmDialog';

const CATEGORIES = [
  { value: 'all', label: '全部' },
  { value: '上衣', label: '上装' },
  { value: '裤子', label: '下装' },
  { value: '外套', label: '外套' },
  { value: '连衣裙', label: '连衣裙' },
  { value: '配饰', label: '配饰' },
  { value: '鞋靴', label: '鞋履' },
];

export function WardrobePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClothing, setEditingClothing] = useState<Clothing | null>(null);

  const { clothes, totalItems, isLoading, fetchClothes } = useWardrobeStore();
  const deleteClothing = useWardrobeStore((state) => state.deleteClothing);
  
  const { dialogState, showConfirm, closeDialog, ConfirmDialogComponent } = useConfirmDialog();

  useEffect(() => {
    fetchClothes(1);
  }, [fetchClothes]);

  const filteredClothes = clothes.filter((item) => {
    const matchesSearch = searchQuery
      ? item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    showConfirm(async () => {
      await deleteClothing(id);
      fetchClothes(1);
    }, {
      title: '确认删除',
      message: '确定要删除这件衣物吗？删除后无法恢复。',
      variant: 'danger',
    });
  };

  const handleEdit = (clothing: Clothing) => {
    setEditingClothing(clothing);
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditingClothing(null);
  };

  return (
    <Box>
      {/* 页面头部 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            我的衣橱
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            共 {totalItems} 件衣物
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/clothes/add')}
          sx={{
            borderRadius: 20,
            ...glassStyles.button.contained,
          }}
        >
          添加衣物
        </Button>
      </Box>

      {/* 搜索栏 */}
      <TextField
        fullWidth
        placeholder="搜索衣物名称、颜色、分类..."
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2.5,
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            ...glassStyles.input,
          },
        }}
      />

      {/* 分类筛选 + 视图切换 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.value}
              label={cat.label}
              onClick={() => setSelectedCategory(cat.value)}
              color={selectedCategory === cat.value ? 'primary' : 'default'}
              variant={selectedCategory === cat.value ? 'filled' : 'outlined'}
              clickable
              size="medium"
              sx={{ fontWeight: 500, borderRadius: 2, ...glassStyles.chip }}
            />
          ))}
        </Box>
      </Box>

      {/* 错误提示 - 暂时移除，store 无 error 字段 */}

      {/* 加载骨架屏 */}
      {isLoading && <CardSkeleton count={10} columns={5} />}

      {/* 空状态：无衣物 */}
      {!isLoading && clothes.length === 0 && (
        EmptyStates.noClothes(() => navigate('/clothes/add'))
      )}

      {/* 空状态：搜索无结果 */}
      {!isLoading && clothes.length > 0 && filteredClothes.length === 0 && searchQuery && (
        EmptyStates.noSearchResults(searchQuery, () => setSearchQuery(''))
      )}

      {/* 空状态：分类筛选无结果 */}
      {!isLoading && clothes.length > 0 && filteredClothes.length === 0 && !searchQuery && selectedCategory !== 'all' && (
        EmptyStates.noSearchResults(selectedCategory, () => setSelectedCategory('all'))
      )}

      {!isLoading && filteredClothes.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
            gap: 1.5,
          }}
        >
          {filteredClothes.map((clothing) => (
            <ClothingCard
              key={clothing.id}
              clothing={clothing}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      )}

      <ClothingEditModal
        open={editModalOpen}
        onClose={handleEditClose}
        clothing={editingClothing}
        onSuccess={() => fetchClothes(1)}
      />

      {/* 删除确认对话框 */}
      {ConfirmDialogComponent}

      {/* 浮动操作按钮 */}
      <Fab
        color="primary"
        aria-label="add clothing"
        onClick={() => navigate('/clothes/add')}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
          ...glassStyles.fab,
        }}
      >
        <Add />
      </Fab>
    </Box>
  );
}
