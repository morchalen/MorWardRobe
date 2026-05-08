import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  Search,
  Delete,
  Visibility,
  Image as ImageIcon,
  Checkroom,
} from '@mui/icons-material';
import { adminApi, clothesApi } from '@/services/api';
import { Clothing, PaginatedResponse } from '@/types';

const categoryLabels: Record<string, string> = {
  tops: '上装',
  bottoms: '下装',
  outerwear: '外套',
  dress: '连衣裙',
  accessories: '配饰',
  shoes: '鞋履',
};

export function ClothingsManagement() {
  const [clothings, setClothings] = useState<Clothing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  // 详情对话框
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedClothing, setSelectedClothing] = useState<Clothing | null>(null);

  // Notification
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ open: false, message: '', type: 'success' });

  const fetchClothings = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page + 1,
        per_page: perPage,
      };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await adminApi.listAllClothings(params);
      setClothings(res.items);
      setTotalItems(res.pagination.total_items);
    } catch (err) {
      console.error('获取衣物列表失败:', err);
      setNotification({
        open: true,
        message: '获取衣物列表失败',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClothings();
  }, [page, perPage, categoryFilter]);

  const handleSearch = () => {
    setPage(0);
    fetchClothings();
  };

  const handleDeleteClothing = async (clothing: Clothing) => {
    if (!window.confirm(`确定要删除衣物「${clothing.name}」吗？此操作不可撤销！`)) return;

    try {
      await clothesApi.delete(clothing.id);
      setNotification({
        open: true,
        message: '衣物删除成功',
        type: 'success',
      });
      fetchClothings();
    } catch (err) {
      setNotification({
        open: true,
        message: '删除衣物失败',
        type: 'error',
      });
    }
  };

  const openDetailDialog = (clothing: Clothing) => {
    setSelectedClothing(clothing);
    setDetailDialogOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            衣物管理
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            管理系统中的所有用户衣物
          </Typography>
        </Box>
        <Chip
          label={`共 ${totalItems} 件衣物`}
          color="primary"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* 搜索和筛选 */}
      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <TextField
            label="搜索衣物名称"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
            sx={{ flex: 1, minWidth: 250 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>分类筛选</InputLabel>
            <Select
              value={categoryFilter}
              label="分类筛选"
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">所有分类</MenuItem>
              <MenuItem value="tops">上装</MenuItem>
              <MenuItem value="bottoms">下装</MenuItem>
              <MenuItem value="outerwear">外套</MenuItem>
              <MenuItem value="shoes">鞋履</MenuItem>
              <MenuItem value="accessories">配饰</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSearch}>
            搜索
          </Button>
        </Box>
      </Card>

      {/* 衣物表格 */}
      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell>衣物图片</TableCell>
                    <TableCell>衣物信息</TableCell>
                    <TableCell>分类</TableCell>
                    <TableCell>颜色</TableCell>
                    <TableCell>季节</TableCell>
                    <TableCell>所属用户</TableCell>
                    <TableCell>添加时间</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clothings.map((clothing) => (
                    <TableRow key={clothing.id} hover>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={clothing.image_url}
                          sx={{ width: 56, height: 56, bgcolor: 'grey.200' }}
                        >
                          <ImageIcon />
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {clothing.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {clothing.id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={categoryLabels[clothing.category] || clothing.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={clothing.color}
                          size="small"
                          sx={{
                            bgcolor: getColorHex(clothing.color),
                            color: getContrastColor(clothing.color),
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {clothing.seasons?.map((season) => (
                            <Chip
                              key={season}
                              label={season}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {clothing.user_id?.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(clothing.created_at).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="查看详情">
                            <IconButton
                              color="info"
                              size="small"
                              onClick={() => openDetailDialog(clothing)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="删除衣物">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteClothing(clothing)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {clothings.length === 0 && (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Checkroom sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">暂无衣物数据</Typography>
              </Box>
            )}

            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={perPage}
              onRowsPerPageChange={(e) => {
                setPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="每页显示"
            />
          </>
        )}
      </Card>

      {/* 详情对话框 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>衣物详情</DialogTitle>
        <DialogContent>
          {selectedClothing && (
            <Box sx={{ pt: 2, display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              {/* 图片区域 */}
              <Box sx={{ flex: 1 }}>
                <Box
                  component="img"
                  src={selectedClothing.image_url}
                  alt={selectedClothing.name}
                  sx={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                    borderRadius: 2,
                    bgcolor: 'grey.100',
                  }}
                />
              </Box>

              {/* 信息区域 */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedClothing.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    ID: {selectedClothing.id}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Chip
                    label={categoryLabels[selectedClothing.category] || selectedClothing.category}
                    color="primary"
                  />
                  <Chip
                    label={selectedClothing.color}
                    sx={{
                      bgcolor: getColorHex(selectedClothing.color),
                      color: getContrastColor(selectedClothing.color),
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    适配季节
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    {selectedClothing.seasons?.map((season) => (
                      <Chip
                        key={season}
                        label={season}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    所属用户
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {selectedClothing.user_id}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    添加时间
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {new Date(selectedClothing.created_at).toLocaleString('zh-CN')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>关闭</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (selectedClothing) {
                handleDeleteClothing(selectedClothing);
                setDetailDialogOpen(false);
              }
            }}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 通知提示 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// 辅助函数：获取颜色的十六进制值
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    红色: '#EF4444',
    蓝色: '#3B82F6',
    绿色: '#22C55E',
    黄色: '#EAB308',
    橙色: '#F97316',
    紫色: '#A855F7',
    粉色: '#EC4899',
    黑色: '#1F2937',
    白色: '#F9FAFB',
    灰色: '#6B7280',
    棕色: '#92400E',
    米色: '#FEF3C7',
    藏青色: '#1E3A5F',
    白蓝色: '#60A5FA',
    蓝黑色: '#1E3A8A',
  };
  return colorMap[colorName] || '#9CA3AF';
}

// 辅助函数：获取对比色（用于文字颜色）
function getContrastColor(colorName: string): string {
  const darkColors = ['黑色', '藏青色', '蓝黑色', '紫色', '棕色', '绿色'];
  return darkColors.includes(colorName) ? '#FFFFFF' : '#000000';
}
