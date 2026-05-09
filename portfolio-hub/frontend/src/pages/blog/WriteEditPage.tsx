import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Upload,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { blogApi, lobsterApi } from '@/services/api';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  category?: string;
  cover?: string;
}

interface Settings {
  categories: string[];
}

export function WriteEditPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const isEditing = Boolean(slug);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [cover, setCover] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiFormatting, setAiFormatting] = useState(false);
  const [postId, setPostId] = useState<string>('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await blogApi.getSettings();
        setCategories(response.categories || []);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (isEditing && slug) {
      const fetchPost = async () => {
        try {
          const response = await blogApi.getPost(slug);
          const post = response;
          setPostId(post.id || '');
          setTitle(post.title || '');
          setCategory(post.category || '');
          setCover(post.cover || '');
          setContent(post.content || '');
        } catch (err) {
          setError('文章不存在');
        } finally {
          setPostLoading(false);
        }
      };
      fetchPost();
    }
  }, [isEditing, slug]);

  const handleAIFormat = async () => {
    if (!content.trim()) {
      setError('请先输入文章内容再使用AI排版');
      return;
    }

    setAiFormatting(true);
    setError('');

    try {
      const response = await lobsterApi.formatMarkdown(content);
      setContent(response.formatted_content || content);
      setSuccess('AI排版完成！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('AI formatting failed:', err);
      setError(err.response?.data?.error || 'AI排版失败，请重试');
    } finally {
      setAiFormatting(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('请输入文章标题');
      return;
    }
    if (!content.trim()) {
      setError('请输入文章内容');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const postData = { title, category, cover, content };
      if (isEditing && postId) {
        await blogApi.updatePost(postId, postData);
        setSuccess('文章更新成功！');
      } else {
        await blogApi.createPost(postData);
        setSuccess('文章发布成功！');
      }
      setTimeout(() => navigate('/blog'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await blogApi.uploadFile(formData);
      setCover(response.url || '');
    } catch (err) {
      setError('封面上传失败');
    }
  };

  if (postLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} data-color-mode="light">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          onClick={() => navigate('/blog')}
          startIcon={<ArrowBack sx={{ fontSize: 14 }} />}
          size="small"
          sx={{ textTransform: 'none' }}
        >
          返回文章列表
        </Button>
        <Box sx={{ display: 'flex', gap: 1.2 }}>
          <Button
            variant="outlined"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Save sx={{ fontSize: 14 }} />}
            size="small"
          >
            {isEditing ? '更新文章' : '发布文章'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ fontSize: '0.725rem' }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ fontSize: '0.725rem' }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 2.8, backdropFilter: 'blur(16px) saturate(170%)', WebkitBackdropFilter: 'blur(16px) saturate(170%)', backgroundColor: 'rgba(255, 255, 255, 0.55)', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 2px 12px rgba(31, 38, 135, 0.04)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="文章标题"
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            placeholder="输入文章标题"
          />

          <FormControl fullWidth size="small">
            <InputLabel>分类</InputLabel>
            <Select
              value={category}
              label="分类"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">无分类</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <TextField
              label="封面图片URL"
              size="small"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              fullWidth
              placeholder="输入封面图片URL或点击上传"
            />
            <Button
              component="label"
              variant="outlined"
              startIcon={<Upload sx={{ fontSize: 14 }} />}
              size="small"
              sx={{ mt: 1.5 }}
            >
              上传封面
              <input type="file" hidden accept="image/*" onChange={handleCoverUpload} />
            </Button>
            {cover && (
              <Box sx={{ mt: 1.5 }}>
                <img
                  src={cover}
                  alt="封面预览"
                  style={{ maxWidth: 220, maxHeight: 150, borderRadius: 8 }}
                />
              </Box>
            )}
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography variant="subtitle2" sx={{ fontSize: '0.725rem' }}>
                文章内容（支持 Markdown）
              </Typography>
              <Tooltip title="使用龙虾AI智能排版，优化Markdown格式和结构">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={aiFormatting ? <CircularProgress size={14} /> : <AutoAwesomeIcon sx={{ fontSize: 15 }} />}
                  onClick={handleAIFormat}
                  disabled={aiFormatting || !content.trim()}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.7rem',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.4,
                    backdropFilter: 'blur(12px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                    bgcolor: aiFormatting ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)',
                    border: `1px solid ${aiFormatting ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)'}`,
                    color: '#667eea',
                    transition: 'all 0.22s ease-out',
                    '&:hover:not(:disabled)': {
                      bgcolor: 'rgba(102, 126, 234, 0.18)',
                      border: '1px solid rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                    },
                    '&:disabled': {
                      color: 'text.disabled',
                      borderColor: 'divider',
                    },
                  }}
                >
                  {aiFormatting ? '排版中...' : '🦞 AI排版'}
                </Button>
              </Tooltip>
            </Box>
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              height={350}
              preview="edit"
              data-color-mode="light"
              style={{
                fontSize: '0.725rem',
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
