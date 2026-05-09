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
  Chip,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Description, Refresh, Cancel } from '@mui/icons-material';
import { blogApi } from '@/services/api';

interface Post {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
}

export function AdminPanelPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

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

  const handleDeletePost = async () => {
    try {
      await blogApi.deletePost(confirmDialog.id);
      fetchPosts();
      setConfirmDialog(null);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" fontWeight={600}>
          文章管理
        </Typography>
        <Button
          onClick={fetchPosts}
          startIcon={<Refresh sx={{ fontSize: 14 }} />}
          size="small"
        >
          刷新
        </Button>
      </Box>

      <Paper sx={{ p: 2.2, mb: 1.5, backdropFilter: 'blur(16px) saturate(170%)', WebkitBackdropFilter: 'blur(16px) saturate(170%)', backgroundColor: 'rgba(255, 255, 255, 0.55)', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 2px 12px rgba(31, 38, 135, 0.04)' }}>
        <Typography variant="body2" color="text.secondary">
          文章管理说明：您可以查看、编辑和删除所有用户发布的文章。
        </Typography>
      </Paper>

      {error && (
        <Paper sx={{ p: 1.5, backdropFilter: 'blur(14px) saturate(155%)', WebkitBackdropFilter: 'blur(14px) saturate(155%)', bgcolor: 'rgba(239, 68, 68, 0.12)', borderLeft: '3px solid #dc3545', borderRadius: 2 }}>
          <Typography color="error" variant="body2">{error}</Typography>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>文章ID</TableCell>
                <TableCell>标题</TableCell>
                <TableCell>分类</TableCell>
                <TableCell>作者</TableCell>
                <TableCell>发布日期</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => (
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
                        onClick={() => setConfirmDialog({ id: post.id, name: post.title })}
                        size="small"
                        color="error"
                        title="删除文章"
                      >
                        <Delete sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
      >
        <DialogTitle sx={{ fontSize: '0.9rem', fontWeight: 600 }}>确认删除</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            确定要删除「{confirmDialog?.name}」吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1 }}>
          <Button onClick={() => setConfirmDialog(null)} startIcon={<Cancel sx={{ fontSize: 14 }} />} size="small">
            取消
          </Button>
          <Button
            onClick={handleDeletePost}
            color="error"
            startIcon={<Delete sx={{ fontSize: 14 }} />}
            size="small"
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}