import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Book,
  CalendarToday,
  Search,
  Edit,
  Add,
  Article,
} from '@mui/icons-material';
import { BlogLayout } from './BlogLayout';
import { blogApi } from '@/services/api';
import { useAuthStore } from '@/stores';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  category?: string;
  cover?: string;
}

interface Settings {
  siteName: string;
  categories: string[];
}

export function BlogHomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<Settings>({
    siteName: '我的博客',
    categories: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 12;

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsResponse, settingsResponse] = await Promise.all([
          blogApi.getPosts({ page, limit: postsPerPage }),
          blogApi.getSettings(),
        ]);
        setPosts(postsResponse.posts || []);
        setSettings(settingsResponse);
        const total = postsResponse.total || 0;
        setTotalPages(Math.ceil(total / postsPerPage));
      } catch (err) {
        console.error('Failed to fetch blog data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedCategory) {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
  }, [selectedCategory]);

  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category === selectedCategory)
    : posts;

  const searchedPosts = searchQuery
    ? filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    : filteredPosts;

  const getColorByTime = (dateString: string) => {
    const date = new Date(dateString);
    const hour = date.getHours();

    const hourlyColors = {
      0: '#1a1a2e',   // 00:00 - 深夜黑蓝
      1: '#16213e',   // 01:00 - 午夜深蓝
      2: '#0f3460',   // 02:00 - 凌晨暗蓝
      3: '#1a1a3e',   // 03:00 - 黎明前深紫
      4: '#2d2d5e',   // 04:00 - 破晓前靛蓝
      5: '#4a5568',   // 05:00 - 晨曦灰蓝
      6: '#f6ad55',   // 06:00 - 日出橙黄 🌅
      7: '#fbd38d',   // 07:00 - 早晨金黄 ☀️
      8: '#faf089',   // 08:00 - 清晨浅黄
      9: '#9ae6b4',   // 09:00 - 上午嫩绿 🌿
      10: '#68d391',  // 10:00 - 前午翠绿
      11: '#48bb78',  // 11:00 - 正午前绿
      12: '#38a169',  // 12:00 - 正午深绿 🌞
      13: '#4fd1c5',  // 13:00 - 下午青绿 💚
      14: '#63b3ed',  // 14:00 - 午后天蓝 🔵
      15: '#4299e1',  // 15:00 - 下午蓝色
      16: '#667eea',  // 16:00 - 傍晚靛蓝 💜
      17: '#9f7aea',  // 17:00 - 黄昏紫色
      18: '#b794f4',  // 18:00 - 晚霞淡紫 🌆
      19: '#f687b3',  // 19:00 - 日落粉红 🌅
      20: '#fc8181',  // 20:00 - 晚霞橙红
      21: '#ed8936',  // 21:00 - 夜幕橙色 🌙
      22: '#dd6b20',  // 22:00 - 入夜深橙
      23: '#c05621',  // 23:00 - 午夜棕红
    };

    return hourlyColors[hour as keyof typeof hourlyColors] || '#718096';
  };

  const handleWriteArticle = () => {
    navigate('/blog/write');
  };

  const handleEditArticle = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/blog/edit/${slug}`);
  };

  return (
    <BlogLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Book sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={600}>
              {settings.siteName}
            </Typography>
            {!loading && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'primary.light',
                  color: 'white',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 1.5,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}
              >
                {searchedPosts.length} 条日志
              </Typography>
            )}
          </Box>
          {isAdmin && (
            <IconButton
              onClick={handleWriteArticle}
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                width: 32,
                height: 32,
              }}
            >
              <Add sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>

        <Paper sx={{ p: 1.8, backdropFilter: 'blur(16px) saturate(170%)', WebkitBackdropFilter: 'blur(16px) saturate(170%)', backgroundColor: 'rgba(255, 255, 255, 0.55)', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 2px 12px rgba(31, 38, 135, 0.04)' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 15, color: 'rgba(99, 102, 241, 0.6)' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backdropFilter: 'blur(14px) saturate(160%)',
                WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                transition: 'all 0.22s ease-out',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(100, 149, 237, 0.3)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                  boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.08)',
                },
              },
            }}
          />
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} sx={{ color: 'primary.main' }} />
          </Box>
        ) : searchedPosts.length === 0 ? (
          <Paper sx={{ p: 4.5, textAlign: 'center', backdropFilter: 'blur(16px) saturate(170%)', WebkitBackdropFilter: 'blur(16px) saturate(170%)', backgroundColor: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.45)', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              暂无文章
            </Typography>
            <Typography variant="body2" color="text.tertiary" sx={{ mt: 0.8 }}>
              {isAdmin ? '快来发布你的第一篇文章吧！' : '暂无文章，敬请期待！'}
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={1.8}>
              {searchedPosts.map((post) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={post.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      overflow: 'visible',
                      backdropFilter: 'blur(14px) saturate(160%)',
                      WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.45)',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(31, 38, 135, 0.04)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.72)',
                        border: '1px solid rgba(255, 255, 255, 0.7)',
                        boxShadow: '0 8px 24px rgba(31, 38, 135, 0.1)',
                        '& .post-actions': {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                      },
                    }}
                    onClick={() => navigate(`/blog/post/${post.slug}`)}
                  >
                    <Box sx={{ position: 'relative', height: 95 }}>
                      {!post.cover ? (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            background: getColorByTime(post.date),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Article sx={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }} />
                        </Box>
                      ) : (
                        <CardMedia
                          component="img"
                          image={post.cover}
                          alt={post.title}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}

                      {isAdmin && (
                        <Box
                          className="post-actions"
                          sx={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            opacity: 0,
                            transform: 'translateY(-4px)',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              p: 0.5,
                              borderRadius: 2.5,
                              backdropFilter: 'blur(16px) saturate(180%)',
                              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                              backgroundColor: 'rgba(255, 255, 255, 0.75)',
                              border: '1px solid rgba(255, 255, 255, 0.8)',
                              boxShadow: '0 2px 12px rgba(31, 38, 135, 0.08)',
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => handleEditArticle(post.slug, e)}
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                backdropFilter: 'blur(10px) saturate(150%)',
                                WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                                backgroundColor: 'rgba(100, 149, 237, 0.25)',
                                border: '1px solid rgba(100, 149, 237, 0.35)',
                                color: '#4169E1',
                                transition: 'all 0.22s ease-out',
                                '&:hover': {
                                  backgroundColor: 'rgba(100, 149, 237, 0.4)',
                                  border: '1px solid rgba(100, 149, 237, 0.55)',
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 2px 8px rgba(65, 105, 225, 0.2)',
                                },
                              }}
                            >
                              <Edit sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      )}

                      {post.category && (
                        <Chip
                          label={post.category}
                          size="small"
                          variant="filled"
                          sx={{
                            position: 'absolute',
                            bottom: 6,
                            left: 8,
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            height: 24,
                            borderRadius: 2,
                            backdropFilter: 'blur(14px) saturate(155%)',
                            WebkitBackdropFilter: 'blur(14px) saturate(155%)',
                            bgcolor: 'rgba(99, 102, 241, 0.28)',
                            color: '#6366f1',
                            border: '1px solid rgba(99, 102, 241, 0.4)',
                            transition: 'all 0.22s ease-out',
                            '&:hover': {
                              bgcolor: 'rgba(99, 102, 241, 0.4)',
                              transform: 'translateY(-1px)',
                            },
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ pt: 1, pb: 1, '&:last-child': { pb: 1 } }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        noWrap
                        title={post.title}
                        sx={{ mb: 0.3, fontSize: '0.75rem', lineHeight: 1.3 }}
                      >
                        {post.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: '0.7rem',
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {post.excerpt || post.title}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.6 }}>
                        <CalendarToday sx={{ fontSize: 10, color: 'text.tertiary' }} />
                        <Typography
                          variant="caption"
                          color="text.tertiary"
                          sx={{ fontSize: '0.65rem' }}
                        >
                          {new Date(post.date).toLocaleDateString('zh-CN')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, p) => setPage(p)}
                  color="primary"
                  size="small"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </BlogLayout>
  );
}
