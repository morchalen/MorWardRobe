import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  Edit,
  Delete,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { blogApi } from '@/services/api';
import { useAuthStore } from '@/stores';
import { getTimeBasedColor } from '@/utils';

interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  content: string;
  category?: string;
  cover?: string;
}

const stripPreCodeWrapper = (content: string): { content: string; wasWrapped: boolean } => {
  const preCodeMatch = content.match(/^\s*<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>\s*$/i);
  if (preCodeMatch) {
    let inner = preCodeMatch[1];
    const textarea = document.createElement('textarea');
    textarea.innerHTML = inner;
    inner = textarea.value;
    return { content: inner.trim(), wasWrapped: true };
  }

  const entityMatch = content.match(/^\s*&lt;pre&gt;&lt;code[^&]*&gt;([\s\S]*)&lt;\/code&gt;&lt;\/pre&gt;\s*$/i);
  if (entityMatch) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = entityMatch[1];
    return { content: textarea.value.trim(), wasWrapped: true };
  }

  return { content: content, wasWrapped: false };
};

const looksLikeMarkdown = (text: string): boolean => {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.startsWith('<') && !trimmed.startsWith('<!--')) return false;
  const mdPatterns = [/^#{1,6}\s/m, /^\*\*[^*]+\*\*/m, /^[-*+]\s/m, /^\d+\.\s/m, /^>\s/m, /^`{3}/m, /^\[[^\]]+\]\(/m];
  return mdPatterns.some(p => p.test(trimmed));
};

export function PostDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === 'admin';

  const timeColor = useMemo(() => {
    if (!post) return { color: '#F0E68C', name: '柠檬黄' };
    return getTimeBasedColor(new Date(post.date));
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await blogApi.getPost(slug);
        setPost(response);
      } catch (err: any) {
        setError(err.response?.data?.message || '文章不存在');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const { content: rawContent, wasWrapped } = useMemo(
    () => (post ? stripPreCodeWrapper(post.content) : { content: '', wasWrapped: false }),
    [post]
  );

  const isMarkdown = wasWrapped || looksLikeMarkdown(rawContent);

  const handleEdit = () => {
    navigate(`/blog/edit/${slug}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await blogApi.deletePost(post?.id || '');
      navigate('/blog');
    } catch (err) {
      setError('删除失败，请重试');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Paper sx={{ p: 8, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.9)' }}>
        <Typography variant="h6" color="text.error">
          {error || '文章不存在'}
        </Typography>
        <Button
          onClick={() => navigate('/blog')}
          sx={{ mt: 4 }}
        >
          返回博客首页
        </Button>
      </Paper>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          onClick={() => navigate('/blog')}
          startIcon={<ArrowBack sx={{ fontSize: 14 }} />}
          size="small"
          sx={{ textTransform: 'none' }}
        >
          返回文章列表
        </Button>
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 0.8 }}>
            <Tooltip title="编辑文章">
              <IconButton onClick={handleEdit} size="small" sx={{ color: 'primary.main' }}>
                <Edit sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="删除文章">
              <IconButton onClick={() => setDeleteDialogOpen(true)} size="small" sx={{ color: 'error.main' }}>
                <Delete sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {post && (
        <Box
          sx={{
            height: 120,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${timeColor.color} 0%, ${timeColor.color}99 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `url(${post.cover || ''}) center/cover no-repeat`,
              opacity: post.cover ? 0.15 : 0,
              transition: 'opacity 0.3s ease',
            },
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: timeColor.color === '#000000' || timeColor.color === '#0F1423' || timeColor.color === '#1A2A42' || timeColor.color === '#150F1A'
                ? '#ffffff'
                : 'rgba(0,0,0,0.85)',
              textAlign: 'center',
              px: 2,
              zIndex: 1,
              textShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            {post.title}
          </Typography>
        </Box>
      )}

      <Paper sx={{ p: 3, backgroundColor: 'surface.default' }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
            {post.category && (
              <Chip
                label={post.category}
                size="small"
                sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
              />
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: 'text.secondary' }}>
              <CalendarToday sx={{ fontSize: 12 }} />
              <Typography variant="caption">
                {new Date(post.date).toLocaleDateString('zh-CN')}
              </Typography>
            </Box>
          </Box>
          <Typography variant="h4" fontWeight={600}>
            {post.title}
          </Typography>
        </Box>

        <Box
          sx={{
            color: 'text.primary',
            lineHeight: 1.7,
            fontSize: '0.775rem',
            '& h1': { fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', marginTop: '1.5rem' },
            '& h2': { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.25rem', paddingBottom: '0.35rem', borderBottom: '1px solid divider' },
            '& h3': { fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', marginTop: '1rem' },
            '& p': { marginBottom: '0.8rem' },
            '& ul, & ol': { paddingLeft: '1.5rem', marginBottom: '0.8rem' },
            '& li': { marginBottom: '0.3rem' },
            '& blockquote': { borderLeft: '3px solid primary.main', paddingLeft: '0.75rem', marginLeft: 0, color: 'text.secondary', fontStyle: 'italic', marginBottom: '0.8rem' },
            '& a': { color: 'primary.main', textDecoration: 'underline' },
            '& img': { maxWidth: '100%', borderRadius: '0.5rem' },
            '& hr': { border: 'none', borderTop: '1px solid divider', margin: '1.5rem 0' },
            '& pre': { backgroundColor: '#1f2937', color: '#e5e7eb', padding: '0.75rem', borderRadius: '0.5rem', overflowX: 'auto', marginBottom: '0.8rem', fontSize: '0.7rem' },
            '& code': { backgroundColor: '#f3f4f6', padding: '0.15em 0.3em', borderRadius: '0.2rem', fontSize: '0.9em', fontFamily: 'monospace' },
            '& pre code': { backgroundColor: 'transparent', padding: 0 },
          }}
        >
          {isMarkdown ? (
            <ReactMarkdown>{rawContent}</ReactMarkdown>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: rawContent }} />
          )}
        </Box>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontSize: '0.9rem', fontWeight: 600 }}>删除文章</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.775rem' }}>
            确定要删除这篇文章吗？此操作不可恢复。
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting} size="small">
            取消
          </Button>
          <Button onClick={handleDelete} color="error" disabled={deleting} size="small">
            {deleting ? <CircularProgress size={16} /> : '删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
