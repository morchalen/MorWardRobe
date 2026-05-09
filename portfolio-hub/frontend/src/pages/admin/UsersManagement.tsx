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
  Pagination,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search,
  Shield,
  Block,
  CheckCircle,
  Delete,
  Edit,
  PersonAdd,
  People,
  Inventory,
  Visibility,
  Image as ImageIcon,
  Checkroom,
  Lock,
  VpnKey,
} from '@mui/icons-material';
import { adminApi } from '@/services/api';
import { User, Clothing } from '@/types';

export function UsersManagement() {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'blog'>('wardrobe');
  
  console.log('%c========================================', 'color: #ffd700; font-weight: bold');
  console.log('%c[DEBUG] UsersManagement 组件挂载!', 'color: #ff6347; font-weight: bold');
  console.log('%c[DEBUG] 当前时间:', 'color: #6b7280', new Date().toISOString());
  
  const token = localStorage.getItem('access_token');
  console.log('%c[DEBUG] LocalStorage Token 存在:', 'color: #6b7280', !!token);
  console.log('%c[DEBUG] Token 长度:', 'color: #6b7280', token ? token.length : 0);
  console.log('%c========================================', 'color: #ffd700; font-weight: bold');

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userClothesDialogOpen, setUserClothesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [userClothes, setUserClothes] = useState<Clothing[]>([]);
  const [userClothesLoading, setUserClothesLoading] = useState(false);
  const [userClothesPage, setUserClothesPage] = useState(0);
  const [userClothesTotal, setUserClothesTotal] = useState(0);

  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin',
  });
  const [editForm, setEditForm] = useState({
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin',
    isActive: true,
  });

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ open: false, message: '', type: 'success' });

  // 博客管理相关状态
  const [blogEditingUser, setBlogEditingUser] = useState<User | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 博客管理函数
  const handleBlogEditRole = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUser(userId, { role: newRole });
      setNotification({ open: true, message: '用户角色更新成功', type: 'success' });
      fetchUsers();
    } catch (err) {
      setNotification({ open: true, message: '角色更新失败', type: 'error' });
    }
  };

  const handleBlogToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminApi.updateUser(userId, { is_active: !currentStatus });
      setNotification({ open: true, message: !currentStatus ? '用户已启用' : '用户已禁用', type: 'success' });
      fetchUsers();
    } catch (err) {
      setNotification({ open: true, message: '状态更新失败', type: 'error' });
    }
  };

  const handleBlogResetPassword = (userId: string) => {
    setResetPasswordUser(userId);
    setPasswordDialogOpen(true);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleBlogSubmitPassword = async () => {
    if (!resetPasswordUser) return;
    
    if (newPassword.length < 6) {
      setPasswordError('密码长度至少6位');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }

    try {
      await adminApi.updateUser(resetPasswordUser, { password: newPassword });
      setNotification({ open: true, message: '密码重置成功', type: 'success' });
      setPasswordDialogOpen(false);
      setResetPasswordUser(null);
    } catch (err) {
      setNotification({ open: true, message: '密码重置失败', type: 'error' });
    }
  };

  const fetchUsers = async () => {
    console.log('%c========================================', 'color: #22c55e; font-weight: bold');
    console.log('%c[DEBUG] fetchUsers 函数被调用!', 'color: #3b82f6; font-weight: bold');
    console.log('%c[DEBUG] 当前时间:', 'color: #6b7280', new Date().toISOString());
    
    setLoading(true);
    try {
      const currentToken = localStorage.getItem('access_token');
      console.log('%c[DEBUG] Token 存在:', 'color: #6b7280', !!currentToken);
      console.log('%c[DEBUG] Token 长度:', 'color: #6b7280', currentToken ? currentToken.length : 0);
      console.log('%c[DEBUG] Token 前20字符:', 'color: #6b7280', currentToken ? currentToken.substring(0, 20) + '...' : '无');
      
      const params: any = { page: page + 1, per_page: perPage };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      
      console.log('%c[DEBUG] 请求参数:', 'color: #6b7280', JSON.stringify(params));
      console.log('%c[DEBUG] 发起请求: GET /admin/users', 'color: #f59e0b; font-weight: bold');
      
      const startTime = performance.now();
      
      console.log('%c[DEBUG] 调用 adminApi.listUsers...', 'color: #9370db');
      const res = await adminApi.listUsers(params);
      
      const endTime = performance.now();
      console.log('%c[DEBUG] 请求完成! 耗时:', 'color: #22c55e; font-weight: bold', (endTime - startTime).toFixed(2), 'ms');
      
      console.log('%c[DEBUG] 响应数据类型:', 'color: #6b7280', typeof res);
      console.log('%c[DEBUG] 响应数据:', 'color: #6b7280');
      console.log(res);
      
      if (res && res.items) {
        console.log('%c[DEBUG] 用户列表长度:', 'color: #22c55e; font-weight: bold', res.items.length);
      } else {
        console.log('%c[WARN] 响应数据格式异常!', 'color: #ff9900');
      }
      
      console.log('%c========================================', 'color: #22c55e; font-weight: bold');
      
      setUsers(res.items || []);
      setTotalItems(res.pagination?.total_items || 0);
    } catch (err: any) {
      console.error('%c========================================', 'color: #ef4444; font-weight: bold');
      console.error('%c[ERROR] 获取用户列表失败!', 'color: #ef4444; font-weight: bold');
      console.error('%c[ERROR] 错误对象:', 'color: #ef4444');
      console.error(err);
      console.error('%c[ERROR] 错误类型:', 'color: #ef4444', typeof err);
      console.error('%c[ERROR] 错误消息:', 'color: #ef4444', err.message);
      console.error('%c[ERROR] 错误状态码:', 'color: #ef4444', err._statusCode || err.status || '未知');
      console.error('%c[ERROR] 错误响应数据:', 'color: #ef4444', err.data || err.response?.data || '无');
      console.error('%c[ERROR] 完整错误对象:', 'color: #ef4444');
      console.dir(err);
      console.error('%c========================================', 'color: #ef4444; font-weight: bold');
      setNotification({ open: true, message: '获取用户列表失败', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('%c[DEBUG] useEffect 触发! 依赖项: page=%d, perPage=%d, roleFilter=%s', 'color: #ffa500', page, perPage, roleFilter);
    fetchUsers();
  }, [page, perPage, roleFilter]);

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const handleCreateUser = async () => {
    try {
      await adminApi.createUser(createForm);
      setNotification({ open: true, message: '用户创建成功', type: 'success' });
      setCreateDialogOpen(false);
      setCreateForm({ email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setNotification({ open: true, message: '创建用户失败', type: 'error' });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    try {
      const updateData: any = { email: editForm.email, role: editForm.role };
      if (editForm.password) updateData.password = editForm.password;
      await adminApi.updateUser(selectedUser.id, updateData);
      if (editForm.isActive !== selectedUser.is_active) {
        await adminApi.updateUserStatus(selectedUser.id, editForm.isActive);
      }
      setNotification({ open: true, message: '用户更新成功', type: 'success' });
      setEditDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setNotification({ open: true, message: '更新用户失败', type: 'error' });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`确定要删除用户「${user.email}」吗？此操作不可撤销！`)) return;
    try {
      await adminApi.deleteUser(user.id);
      setNotification({ open: true, message: '用户已删除', type: 'success' });
      fetchUsers();
    } catch (err) {
      setNotification({ open: true, message: '删除用户失败', type: 'error' });
    }
  };

  const handleClearWardrobe = async (user: User) => {
    if (!window.confirm(`确定要清空用户「${user.email}」的所有衣物吗？`)) return;
    try {
      await adminApi.clearUserWardrobe(user.id);
      setNotification({ open: true, message: '衣橱已清空', type: 'success' });
    } catch (err) {
      setNotification({ open: true, message: '清空衣橱失败', type: 'error' });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.is_active,
    });
    setEditDialogOpen(true);
  };

  const fetchUserClothes = async (userId: string, page: number = 0) => {
    setUserClothesLoading(true);
    try {
      const res = await adminApi.getUserClothes(userId, { page: page + 1, per_page: 12 });
      setUserClothes(res.items);
      setUserClothesTotal(res.pagination.total_items);
    } catch (err) {
      console.error('获取用户衣物失败:', err);
    } finally {
      setUserClothesLoading(false);
    }
  };

  const openUserClothesDialog = (user: User) => {
    setSelectedUser(user);
    setUserClothesPage(0);
    fetchUserClothes(user.id, 0);
    setUserClothesDialogOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            用户管理
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            统一管理衣橱和博客系统的所有用户
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip label={`共 ${totalItems} 个用户`} color="primary" sx={{ fontWeight: 600 }} />
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setCreateDialogOpen(true)}>
            创建用户
          </Button>
        </Box>
      </Box>

      {/* Tab 切换器 */}
      <Card sx={{ p: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
            },
          }}
        >
          <Tab 
            value="wardrobe" 
            icon={<Checkroom sx={{ mr: 1 }} />}
            label="衣橱管理" 
            iconPosition="start"
          />
          <Tab 
            value="blog" 
            icon={<Edit sx={{ mr: 1 }} />}
            label="博客管理"
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {activeTab === 'wardrobe' && (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <TextField
            label="搜索用户邮箱"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
            sx={{ flex: 1, minWidth: 250 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>角色筛选</InputLabel>
            <Select
              value={roleFilter}
              label="角色筛选"
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="">所有角色</MenuItem>
              <MenuItem value="user">普通用户</MenuItem>
              <MenuItem value="admin">管理员</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSearch}>
            搜索
          </Button>
        </Box>
      </Card>

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
                    <TableCell>用户</TableCell>
                    <TableCell>角色</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>注册时间</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#2C3E50', width: 36, height: 36, fontSize: '0.85rem' }}>
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {user.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {user.id.substring(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role === 'admin' ? '管理员' : '普通用户'}
                          size="small"
                          color={user.role === 'admin' ? 'warning' : 'default'}
                          icon={user.role === 'admin' ? <Shield /> : <People />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? '正常' : '已禁用'}
                          size="small"
                          color={user.is_active ? 'success' : 'error'}
                          icon={user.is_active ? <CheckCircle /> : <Block />}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="查看衣物">
                            <IconButton color="info" size="small" onClick={() => openUserClothesDialog(user)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="编辑用户">
                            <IconButton color="primary" size="small" onClick={() => openEditDialog(user)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="清空衣橱">
                            <IconButton color="warning" size="small" onClick={() => handleClearWardrobe(user)}>
                              <Inventory />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="删除用户">
                            <IconButton color="error" size="small" onClick={() => handleDeleteUser(user)}>
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

            {users.length === 0 && (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <People sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">暂无用户数据</Typography>
              </Box>
            )}

            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={perPage}
              onRowsPerPageChange={(e) => { setPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              labelRowsPerPage="每页显示"
            />
          </>
        )}
      </Card>
      </Box>
      )}

      {/* 博客管理 Tab 内容 */}
      {activeTab === 'blog' && (
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          博客用户管理
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 2, fontWeight: 400 }}>
            - 角色权限、账户状态、密码重置
          </Typography>
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 700 }}>邮箱</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>角色</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>状态</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>注册时间</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: user.role === 'admin' ? 'primary.main' : 'grey.400',
                            fontSize: '0.875rem',
                          }}
                        >
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        size="small"
                        onChange={(e) => handleBlogEditRole(user.id, e.target.value)}
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="user">普通用户</MenuItem>
                        <MenuItem value="admin">管理员</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? '正常' : '禁用'}
                        color={user.is_active ? 'success' : 'error'}
                        size="small"
                        onClick={() => handleBlogToggleStatus(user.id, user.is_active)}
                        sx={{ cursor: 'pointer', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="重置密码">
                          <IconButton
                            size="small"
                            onClick={() => handleBlogResetPassword(user.id)}
                            sx={{ color: 'warning.main' }}
                          >
                            <VpnKey fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">暂无用户数据</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
      )}

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>创建用户</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="邮箱"
              type="email"
              fullWidth
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
            <TextField
              label="密码"
              type="password"
              fullWidth
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              helperText="至少6个字符"
            />
            <FormControl fullWidth>
              <InputLabel>角色</InputLabel>
              <Select
                value={createForm.role}
                label="角色"
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'user' | 'admin' })}
              >
                <MenuItem value="user">普通用户</MenuItem>
                <MenuItem value="admin">管理员</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreateUser}>
            创建
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>编辑用户</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="邮箱"
              type="email"
              fullWidth
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
            <TextField
              label="新密码（留空则不修改）"
              type="password"
              fullWidth
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              helperText="至少6个字符，留空则不修改密码"
            />
            <FormControl fullWidth>
              <InputLabel>角色</InputLabel>
              <Select
                value={editForm.role}
                label="角色"
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'user' | 'admin' })}
              >
                <MenuItem value="user">普通用户</MenuItem>
                <MenuItem value="admin">管理员</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>账户状态</InputLabel>
              <Select
                value={editForm.isActive ? 'active' : 'disabled'}
                label="账户状态"
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
              >
                <MenuItem value="active">正常</MenuItem>
                <MenuItem value="disabled">已禁用</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleEditUser}>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={userClothesDialogOpen} onClose={() => setUserClothesDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedUser?.email} 的衣橱
        </DialogTitle>
        <DialogContent>
          {userClothesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : userClothes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Checkroom sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">该用户还没有添加任何衣物</Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {userClothes.map((clothing) => (
                  <Box key={clothing.id} sx={{ width: 120 }}>
                    <Avatar
                      variant="rounded"
                      src={clothing.image_url}
                      sx={{ width: 120, height: 120, mb: 1, bgcolor: 'grey.200' }}
                    >
                      <ImageIcon />
                    </Avatar>
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {clothing.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {clothing.color}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {userClothesTotal > 12 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={Math.ceil(userClothesTotal / 12)}
                    page={userClothesPage + 1}
                    onChange={(_, page) => {
                      setUserClothesPage(page - 1);
                      if (selectedUser) fetchUserClothes(selectedUser.id, page - 1);
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserClothesDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 博客管理 - 密码重置对话框 */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VpnKey color="warning" />
            重置用户密码
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            为该用户设置新密码，密码长度至少6位
          </Alert>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {passwordError && (
              <Alert severity="error" onClose={() => setPasswordError('')}>
                {passwordError}
              </Alert>
            )}
            <TextField
              label="新密码"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoFocus
            />
            <TextField
              label="确认密码"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!confirmPassword && confirmPassword !== newPassword}
              helperText={!!confirmPassword && confirmPassword !== newPassword ? '两次输入的密码不一致' : ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>取消</Button>
          <Button variant="contained" color="warning" startIcon={<Lock />} onClick={handleBlogSubmitPassword}>
            重置密码
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
