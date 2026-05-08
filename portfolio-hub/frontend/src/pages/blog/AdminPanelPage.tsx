import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Chip,
  Switch,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Group, Description, Save, Cancel, Refresh, Lock, CheckCircle, ErrorOutline } from '@mui/icons-material';
import { BlogLayout } from './BlogLayout';
import apiClient, { blogApi } from '@/services/api';

interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
}

export function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordDialog, setPasswordDialog] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'user' | 'post'; id: string; name: string } | null>(null);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchPosts();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('%c========================================', 'color: #22c55e; font-weight: bold');
      console.log('%c[DEBUG] 开始获取用户列表...', 'color: #3b82f6; font-weight: bold');
      console.log('%c[DEBUG] 当前时间:', 'color: #6b7280', new Date().toISOString());
      
      const token = localStorage.getItem('access_token');
      console.log('%c[DEBUG] Token 存在:', 'color: #6b7280', !!token);
      console.log('%c[DEBUG] Token 长度:', 'color: #6b7280', token ? token.length : 0);
      console.log('%c[DEBUG] Token 前20字符:', 'color: #6b7280', token ? token.substring(0, 20) + '...' : '无');
      
      console.log('%c[DEBUG] apiClient baseURL:', 'color: #6b7280', apiClient.defaults.baseURL);
      console.log('%c[DEBUG] 发起请求: GET /admin/users', 'color: #f59e0b; font-weight: bold');
      
      const startTime = performance.now();
      console.log('%c[DEBUG] 请求开始时间:', 'color: #6b7280', startTime);
      
      const response = await apiClient.get('/admin/users');
      
      const endTime = performance.now();
      console.log('%c[DEBUG] 请求完成! 耗时:', 'color: #22c55e; font-weight: bold', (endTime - startTime).toFixed(2), 'ms');
      
      console.log('%c[DEBUG] 响应数据类型:', 'color: #6b7280', typeof response);
      console.log('%c[DEBUG] 响应数据:', 'color: #6b7280');
      console.log(response);
      
      console.log('%c[DEBUG] 响应是否为数组:', 'color: #6b7280', Array.isArray(response));
      console.log('%c[DEBUG] 响应.data 是否存在:', 'color: #6b7280', response && 'data' in response);
      console.log('%c[DEBUG] 响应.data 是否为数组:', 'color: #6b7280', response && Array.isArray(response.data));
      console.log('%c[DEBUG] 响应.Data 是否存在:', 'color: #6b7280', response && 'Data' in response);
      console.log('%c[DEBUG] 响应.users 是否存在:', 'color: #6b7280', response && 'users' in response);
      
      let parsedUsers: User[] = [];
      if (Array.isArray(response)) {
        console.log('%c[DEBUG] 响应是数组，直接使用', 'color: #22c55e');
        parsedUsers = response;
      } else if (response && Array.isArray(response.data)) {
        console.log('%c[DEBUG] 响应.data 是数组', 'color: #22c55e');
        parsedUsers = response.data;
      } else if (response && Array.isArray(response.Data)) {
        console.log('%c[DEBUG] 响应.Data 是数组', 'color: #22c55e');
        parsedUsers = response.Data;
      } else if (response && response.users) {
        console.log('%c[DEBUG] 响应.users 存在', 'color: #22c55e');
        parsedUsers = response.users;
      } else {
        console.log('%c[DEBUG] 无法解析用户数据，返回空数组', 'color: #ef4444');
        parsedUsers = [];
      }
      
      setUsers(parsedUsers);
      console.log('%c[DEBUG] 用户列表长度:', 'color: #22c55e; font-weight: bold', parsedUsers.length);
      console.log('%c[DEBUG] 用户列表:', 'color: #6b7280');
      console.log(parsedUsers);
      console.log('%c========================================', 'color: #22c55e; font-weight: bold');
      
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
      
      if (err._statusCode === 401) {
        setError('没有管理员权限或登录已过期，请重新登录');
      } else if (err._statusCode === 403) {
        setError('权限不足，需要管理员权限');
      } else {
        setError('获取用户列表失败：' + (err.message || '未知错误'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogApi.getPosts({ limit: 1000 });

      let postsData = [];
      if (Array.isArray(response)) {
        postsData = response;
      } else if (response && Array.isArray(response.posts)) {
        postsData = response.posts;
      }

      setPosts(postsData.map((p: any) => ({
        id: p.id || p.slug,
        title: p.title,
        category: p.category || '未分类',
        date: p.date || p.created_at,
        author: p.author || 'admin',
      })));
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      setError('获取文章列表失败：' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      await apiClient.put(`/admin/users/${editingUser.id}`, editingUser);
      fetchUsers();
      setEditingUser(null);
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await apiClient.put(`/admin/users/${userId}/status`, { is_active: !currentStatus });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordDialog) return;
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('密码长度至少为6位');
      return;
    }
    try {
      const user = users.find(u => u.id === passwordDialog);
      if (!user) return;

      await apiClient.post('/auth/change-password', {
        email: user.email,
        current_password: '',
        new_password: newPassword,
      });
      setPasswordDialog(null);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } catch (err) {
      console.error('Failed to change password:', err);
      setPasswordError('修改密码失败');
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDialog || confirmDialog.type !== 'user') return;
    try {
      await apiClient.delete(`/admin/users/${confirmDialog.id}`);
      fetchUsers();
      setConfirmDialog(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!confirmDialog || confirmDialog.type !== 'post') return;
    try {
      await blogApi.deletePost(confirmDialog.id);
      fetchPosts();
      setConfirmDialog(null);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  return (
    <BlogLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight={600}>
            博客管理员面板
          </Typography>
          <Button
            onClick={activeTab === 'users' ? fetchUsers : fetchPosts}
            startIcon={<Refresh sx={{ fontSize: 14 }} />}
            size="small"
          >
            刷新
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.2, mb: 1.5 }}>
          <Button
            variant={activeTab === 'users' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('users')}
            startIcon={<Group sx={{ fontSize: 14 }} />}
            size="small"
          >
            用户管理
          </Button>
          <Button
            variant={activeTab === 'posts' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('posts')}
            startIcon={<Description sx={{ fontSize: 14 }} />}
            size="small"
          >
            文章管理
          </Button>
        </Box>

        {error && (
          <Paper sx={{ p: 1.5, backdropFilter: 'blur(14px) saturate(155%)', WebkitBackdropFilter: 'blur(14px) saturate(155%)', bgcolor: 'rgba(239, 68, 68, 0.12)', borderLeft: '3px solid #dc3545', borderRadius: 2 }}>
            <Typography color="error" variant="body2">{error}</Typography>
          </Paper>
        )}

        {activeTab === 'users' && !error && (
          <Paper sx={{ p: 2.2, mb: 1.5, backdropFilter: 'blur(16px) saturate(170%)', WebkitBackdropFilter: 'blur(16px) saturate(170%)', backgroundColor: 'rgba(255, 255, 255, 0.55)', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 2px 12px rgba(31, 38, 135, 0.04)' }}>
            <Typography variant="body2" color="text.secondary">
              用户管理说明：您可以管理所有用户的角色、状态和密码。用户数据与衣橱系统共用。
            </Typography>
          </Paper>
        )}

        {activeTab === 'posts' && (
          <Paper sx={{ p: 2.2, mb: 1.5, backdropFilter: 'blur(16px) saturate(170%)', WebkitBackdropFilter: 'blur(16px) saturate(170%)', backgroundColor: 'rgba(255, 255, 255, 0.55)', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 2px 12px rgba(31, 38, 135, 0.04)' }}>
            <Typography variant="body2" color="text.secondary">
              文章管理说明：您可以查看、编辑和删除所有用户发布的文章。
            </Typography>
          </Paper>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error && activeTab === 'users' ? (
          <Box />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {activeTab === 'users' ? (
                    <>
                      <TableCell>用户ID</TableCell>
                      <TableCell>邮箱</TableCell>
                      <TableCell>角色</TableCell>
                      <TableCell>状态</TableCell>
                      <TableCell>注册时间</TableCell>
                      <TableCell>操作</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>文章ID</TableCell>
                      <TableCell>标题</TableCell>
                      <TableCell>分类</TableCell>
                      <TableCell>作者</TableCell>
                      <TableCell>发布日期</TableCell>
                      <TableCell>操作</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {activeTab === 'users' ? (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id.slice(0, 8)}...</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role === 'admin' ? '管理员' : '普通用户'}
                          color={user.role === 'admin' ? 'warning' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            checked={user.is_active}
                            onChange={() => handleToggleUserStatus(user.id, user.is_active)}
                            color={user.is_active ? 'success' : 'default'}
                            size="small"
                          />
                          {user.is_active ? (
                            <CheckCircle sx={{ color: 'success.main', fontSize: 14 }} />
                          ) : (
                            <ErrorOutline sx={{ color: 'error.main', fontSize: 14 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            onClick={() => setEditingUser(user)}
                            size="small"
                            title="编辑角色"
                          >
                            <Edit sx={{ fontSize: 14 }} />
                          </IconButton>
                          <IconButton
                            onClick={() => setPasswordDialog(user.id)}
                            size="small"
                            title="修改密码"
                          >
                            <Lock sx={{ fontSize: 14 }} />
                          </IconButton>
                          <IconButton
                            onClick={() => setConfirmDialog({ type: 'user', id: user.id, name: user.email })}
                            size="small"
                            color="error"
                            title="删除用户"
                          >
                            <Delete sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id} hover>
                      <TableCell>{post.id}</TableCell>
                      <TableCell sx={{ maxWidth: 250 }}>
                        <Typography noWrap>{post.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={post.category} size="small" />
                      </TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>{new Date(post.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            onClick={() => window.location.href = `/blog/edit/${post.id}`}
                            size="small"
                            title="编辑文章"
                          >
                            <Edit sx={{ fontSize: 14 }} />
                          </IconButton>
                          <IconButton
                            onClick={() => setConfirmDialog({ type: 'post', id: post.id, name: post.title })}
                            size="small"
                            color="error"
                            title="删除文章"
                          >
                            <Delete sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={!!editingUser} onClose={() => setEditingUser(null)}>
          <DialogTitle sx={{ fontSize: '0.9rem', fontWeight: 600 }}>编辑用户角色</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              size="small"
              label="邮箱"
              type="email"
              fullWidth
              value={editingUser?.email || ''}
              disabled
            />
            <Select
              labelId="role-label"
              id="role"
              value={editingUser?.role || 'user'}
              onChange={(e) => setEditingUser({ ...editingUser!, role: e.target.value as string })}
              fullWidth
              size="small"
              sx={{ mt: 1.5 }}
            >
              <MenuItem value="user">普通用户</MenuItem>
              <MenuItem value="admin">管理员</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions sx={{ gap: 1 }}>
            <Button onClick={() => setEditingUser(null)} startIcon={<Cancel sx={{ fontSize: 14 }} />} size="small">
              取消
            </Button>
            <Button onClick={handleSaveUser} startIcon={<Save sx={{ fontSize: 14 }} />} color="primary" size="small">
              保存
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!passwordDialog} onClose={() => {
          setPasswordDialog(null);
          setNewPassword('');
          setConfirmPassword('');
          setPasswordError('');
        }}>
          <DialogTitle sx={{ fontSize: '0.9rem', fontWeight: 600 }}>修改密码</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              size="small"
              label="新密码"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码（至少6位）"
            />
            <TextField
              margin="dense"
              size="small"
              label="确认密码"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
            />
            {passwordError && (
              <Typography color="error" variant="body2" sx={{ mt: 1.5 }}>
                {passwordError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ gap: 1 }}>
            <Button onClick={() => {
              setPasswordDialog(null);
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError('');
            }} startIcon={<Cancel sx={{ fontSize: 14 }} />} size="small">
              取消
            </Button>
            <Button onClick={handleChangePassword} startIcon={<Save sx={{ fontSize: 14 }} />} color="primary" size="small">
              保存
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={!!confirmDialog}
          onClose={() => setConfirmDialog(null)}
        >
          <DialogTitle sx={{ fontSize: '0.9rem', fontWeight: 600 }}>确认删除</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              确定要删除 {confirmDialog?.name} 吗？此操作无法撤销。
            </Typography>
            {confirmDialog?.type === 'user' && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                删除用户后，其发布的文章将保留，但作者信息将显示为未知。
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ gap: 1 }}>
            <Button onClick={() => setConfirmDialog(null)} startIcon={<Cancel sx={{ fontSize: 14 }} />} size="small">
              取消
            </Button>
            <Button
              onClick={confirmDialog?.type === 'user' ? handleDeleteUser : handleDeletePost}
              color="error"
              startIcon={<Delete sx={{ fontSize: 14 }} />}
              size="small"
            >
              删除
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </BlogLayout>
  );
}