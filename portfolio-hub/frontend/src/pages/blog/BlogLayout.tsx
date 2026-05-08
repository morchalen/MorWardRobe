import { ReactNode, useState, useEffect } from 'react';
import { Box, Typography, Avatar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Collapse, useTheme } from '@mui/material';
import { Article, Person, Checkroom, ExpandLess, ExpandMore, Category, Cloud, Settings, Add } from '@mui/icons-material';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { blogApi } from '@/services/api';

interface BlogLayoutProps {
  children: ReactNode;
}

interface Settings {
  siteName: string;
  categories: string[];
  socialLinks?: { platform: string; url: string }[];
}

export function BlogLayout({ children }: BlogLayoutProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuthStore();
  const avatarInitial = user?.email?.charAt(0).toUpperCase() || 'U';
  const [settings, setSettings] = useState<Settings>({ siteName: '我的博客', categories: [] });
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const currentCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await blogApi.getSettings();
        setSettings(response);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (currentCategory && settings.categories.includes(currentCategory)) {
      setCategoriesOpen(true);
    }
  }, [currentCategory, settings.categories]);

  const handleToggleCategories = () => {
    if (!currentCategory || !settings.categories.includes(currentCategory)) {
      setCategoriesOpen(!categoriesOpen);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100vw',
        height: '100dvh',
        maxWidth: '100vw',
        maxHeight: '100dvh',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        backgroundColor: 'background.default',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box
          sx={{
            width: 220,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            borderRight: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '2px 0 16px rgba(31, 38, 135, 0.05)',
          }}
        >
          <Box sx={{ p: 2.5, pb: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.4)' }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 0.5,
              p: 1.2,
              borderRadius: 2.5,
              bgcolor: 'rgba(100, 149, 237, 0.08)',
              border: '1px solid rgba(100, 149, 237, 0.15)',
            }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(65, 105, 225, 0.95) 100%)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
                }}
              >
                <Article sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h6" color="text.primary" fontWeight={700} sx={{ letterSpacing: '0.01em' }}>
                我的博客
              </Typography>
            </Box>
          </Box>

          <List sx={{ flexGrow: 1, pt: 1.5, px: 1.5 }}>
            <NavLink to="/blog/new-post" style={{ textDecoration: 'none', width: '100%' }}>
              {({ isActive }) => (
                <ListItem sx={{ py: 0.3, px: 0.5, borderRadius: 2 }}>
                  <ListItemButton
                    sx={{
                      borderRadius: 2.5,
                      py: 1.2,
                      px: 2,
                      backdropFilter: isActive ? 'blur(14px) saturate(155%)' : 'blur(12px) saturate(145%)',
                      WebkitBackdropFilter: isActive ? 'blur(14px) saturate(155%)' : 'blur(12px) saturate(145%)',
                      bgcolor: isActive ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255, 255, 255, 0.35)',
                      border: isActive ? `1px solid ${theme.palette.secondary.main}35` : '1px solid transparent',
                      color: isActive ? theme.palette.secondary.main : 'text.primary',
                      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: isActive ? 'rgba(236, 72, 153, 0.35)' : 'rgba(236, 72, 153, 0.08)',
                        border: isActive ? '1px solid rgba(236, 72, 153, 0.45)' : '1px solid rgba(236, 72, 153, 0.15)',
                        transform: 'translateX(2px)',
                        boxShadow: isActive ? '0 2px 8px rgba(236, 72, 153, 0.15)' : 'none',
                      },
                      minHeight: 38,
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? theme.palette.secondary.main : `${theme.palette.secondary.main}70`, minWidth: 34 }}>
                      <Add sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="新建文章"
                      primaryTypographyProps={{ fontSize: '0.7875rem', fontWeight: isActive ? 650 : 450 }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </NavLink>

            <NavLink to="/blog" end style={{ textDecoration: 'none', width: '100%' }}>
              {({ isActive }) => (
                <ListItem sx={{ py: 0.3, px: 0.5, borderRadius: 2 }}>
                  <ListItemButton
                    sx={{
                      borderRadius: 2.5,
                      py: 1.2,
                      px: 2,
                      backdropFilter: isActive ? 'blur(14px) saturate(155%)' : 'blur(12px) saturate(145%)',
                      WebkitBackdropFilter: isActive ? 'blur(14px) saturate(155%)' : 'blur(12px) saturate(145%)',
                      bgcolor: isActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.35)',
                      border: isActive ? `1px solid ${theme.palette.primary.main}35` : '1px solid transparent',
                      color: isActive ? theme.palette.primary.main : 'text.primary',
                      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: isActive ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.08)',
                        border: isActive ? '1px solid rgba(99, 102, 241, 0.45)' : '1px solid rgba(99, 102, 241, 0.15)',
                        transform: 'translateX(2px)',
                        boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none',
                      },
                      minHeight: 38,
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : `${theme.palette.primary.main}60`, minWidth: 34 }}>
                      <Article sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="所有文章"
                      primaryTypographyProps={{ fontSize: '0.7875rem', fontWeight: isActive ? 650 : 450 }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </NavLink>

            <NavLink to="/blog/profile" style={{ textDecoration: 'none', width: '100%' }}>
              {({ isActive }) => (
                <ListItem sx={{ py: 0.3, px: 0.5, borderRadius: 2 }}>
                  <ListItemButton
                    sx={{
                      borderRadius: 2.5,
                      py: 1.2,
                      px: 2,
                      backdropFilter: isActive ? 'blur(14px) saturate(155%)' : 'blur(12px) saturate(145%)',
                      WebkitBackdropFilter: isActive ? 'blur(14px) saturate(155%)' : 'blur(12px) saturate(145%)',
                      bgcolor: isActive ? `${theme.palette.primary.main}25` : 'transparent',
                      border: isActive ? `1px solid ${theme.palette.primary.main}35` : '1px solid transparent',
                      color: isActive ? theme.palette.primary.main : 'text.primary',
                      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: isActive ? `${theme.palette.primary.main}35` : `${theme.palette.primary.main}08`,
                        border: isActive ? `1px solid ${theme.palette.primary.main}45` : `1px solid ${theme.palette.primary.main}15`,
                        transform: 'translateX(2px)',
                        boxShadow: isActive ? `0 2px 8px ${theme.palette.primary.main}15` : 'none',
                      },
                      minHeight: 38,
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : 'text.secondary', minWidth: 34 }}>
                      <Person sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="个人信息"
                      primaryTypographyProps={{ fontSize: '0.7875rem', fontWeight: isActive ? 650 : 450 }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </NavLink>

            {settings.categories.length > 0 && (
              <>
                <ListItem sx={{ py: 0.3, px: 0.5, borderRadius: 2 }}>
                  <ListItemButton
                    onClick={handleToggleCategories}
                    sx={{
                      borderRadius: 2.5,
                      py: 1.2,
                      px: 2,
                      backdropFilter: 'blur(12px) saturate(145%)',
                      WebkitBackdropFilter: 'blur(12px) saturate(145%)',
                      bgcolor: categoriesOpen ? 'rgba(255, 255, 255, 0.45)' : 'transparent',
                      border: categoriesOpen ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
                      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.55)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                      },
                      minHeight: 38,
                    }}
                  >
                    <ListItemIcon sx={{ color: 'text.secondary', minWidth: 34 }}>
                      <Category sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="分类"
                      primaryTypographyProps={{ fontSize: '0.7875rem', fontWeight: 500 }}
                    />
                    {categoriesOpen ? <ExpandLess sx={{ fontSize: 17 }} /> : <ExpandMore sx={{ fontSize: 17 }} />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={categoriesOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {settings.categories.map((cat) => (
                      <NavLink key={cat} to={`/blog?category=${encodeURIComponent(cat)}`} style={{ textDecoration: 'none', width: '100%' }}>
                        <ListItem sx={{ py: 0.2, px: 0.5, pl: 4 }}>
                          <ListItemButton
                            sx={{
                              borderRadius: 2,
                              py: 0.9,
                              px: 1.8,
                              minHeight: 32,
                              backdropFilter: 'blur(10px) saturate(140%)',
                              WebkitBackdropFilter: 'blur(10px) saturate(140%)',
                              bgcolor: 'rgba(255, 255, 255, 0.3)',
                              border: '1px solid transparent',
                              transition: 'all 0.2s ease-out',
                              '&:hover': {
                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                transform: 'translateX(2px)',
                              },
                            }}
                          >
                            <ListItemText
                              primary={cat}
                              primaryTypographyProps={{
                                fontSize: '0.7375rem',
                                color: 'text.secondary',
                                fontWeight: 450,
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      </NavLink>
                    ))}
                  </List>
                </Collapse>
              </>
            )}

            <NavLink to="/blog/status" style={{ textDecoration: 'none', width: '100%' }}>
              {({ isActive }) => (
                <ListItem sx={{ py: 0.3, px: 0.5, borderRadius: 2 }}>
                  <ListItemButton
                    sx={{
                      borderRadius: 2.5,
                      py: 1.2,
                      px: 2,
                      backdropFilter: isActive ? 'blur(14px) saturate(155%)' : 'blur(12px) saturate(145%)',
                      WebkitBackdropFilter: isActive ? 'blur(14px) saturate(155%)' : 'blur(12px) saturate(145%)',
                      bgcolor: isActive ? `${theme.palette.primary.main}25` : 'transparent',
                      border: isActive ? `1px solid ${theme.palette.primary.main}35` : '1px solid transparent',
                      color: isActive ? theme.palette.primary.main : 'text.primary',
                      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: isActive ? `${theme.palette.primary.main}35` : `${theme.palette.primary.main}08`,
                        border: isActive ? `1px solid ${theme.palette.primary.main}45` : `1px solid ${theme.palette.primary.main}15`,
                        transform: 'translateX(2px)',
                        boxShadow: isActive ? `0 2px 8px ${theme.palette.primary.main}15` : 'none',
                      },
                      minHeight: 38,
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : 'text.secondary', minWidth: 34 }}>
                      <Cloud sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="服务器状态"
                      primaryTypographyProps={{ fontSize: '0.7875rem', fontWeight: isActive ? 650 : 450 }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </NavLink>

            <NavLink to="/blog/admin" style={{ textDecoration: 'none', width: '100%' }}>
              {({ isActive }) => (
                <ListItem sx={{ py: 0.3, px: 0.5, borderRadius: 2 }}>
                  <ListItemButton
                    sx={{
                      borderRadius: 2.5,
                      py: 1.2,
                      px: 2,
                      backdropFilter: isActive ? 'blur(14px) saturate(155%)' : 'blur(12px) saturate(145%)',
                      WebkitBackdropFilter: isActive ? 'blur(14px) saturate(155%)' : 'blur(12px) saturate(145%)',
                      bgcolor: isActive ? `${theme.palette.primary.main}25` : 'transparent',
                      border: isActive ? `1px solid ${theme.palette.primary.main}35` : '1px solid transparent',
                      color: isActive ? theme.palette.primary.main : 'text.primary',
                      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: isActive ? `${theme.palette.primary.main}35` : `${theme.palette.primary.main}08`,
                        border: isActive ? `1px solid ${theme.palette.primary.main}45` : `1px solid ${theme.palette.primary.main}15`,
                        transform: 'translateX(2px)',
                        boxShadow: isActive ? `0 2px 8px ${theme.palette.primary.main}15` : 'none',
                      },
                      minHeight: 38,
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : 'text.secondary', minWidth: 34 }}>
                      <Settings sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="管理员面板"
                      primaryTypographyProps={{ fontSize: '0.7875rem', fontWeight: isActive ? 650 : 450 }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </NavLink>
          </List>

          <Divider sx={{ mx: 1.5, borderColor: 'rgba(255, 255, 255, 0.3)' }} />

          <Box sx={{ p: 2, pt: 2.5, borderTop: '1px solid rgba(255, 255, 255, 0.35)' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                p: 1.4,
                borderRadius: 2.5,
                backdropFilter: 'blur(16px) saturate(170%)',
                WebkitBackdropFilter: 'blur(16px) saturate(170%)',
                backgroundColor: 'rgba(255, 255, 255, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 2px 12px rgba(31, 38, 135, 0.04)',
                transition: 'all 0.22s ease-out',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  boxShadow: '0 4px 16px rgba(31, 38, 135, 0.08)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, rgba(100, 149, 237, 0.9) 0%, rgba(65, 105, 225, 0.95) 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  boxShadow: '0 2px 8px rgba(65, 105, 225, 0.25)',
                }}
              >
                {avatarInitial}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={650} noWrap sx={{ fontSize: '0.75rem', letterSpacing: '0.01em' }}>
                  {user?.email.split('@')[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.65rem' }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 1.8 }}>
              <ListItemButton
                onClick={() => navigate('/')}
                sx={{
                  flex: 1,
                  borderRadius: 2.5,
                  py: 0.8,
                  px: 1.5,
                  backgroundColor: 'surface.default',
                  border: '1px solid rgba(0,0,0,0.06)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                  minHeight: 32,
                }}
              >
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <Checkroom sx={{ fontSize: 14 }} />
                </ListItemIcon>
                <ListItemText primary="衣橱" primaryTypographyProps={{ fontSize: '0.6875rem' }} />
              </ListItemButton>

              <ListItemButton
                onClick={handleLogout}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  py: 0.8,
                  px: 1.5,
                  backgroundColor: 'surface.default',
                  border: '1px solid rgba(0,0,0,0.06)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                  minHeight: 32,
                }}
              >
                <ListItemText primary="退出" primaryTypographyProps={{ fontSize: '0.6875rem' }} />
              </ListItemButton>
            </Box>
          </Box>
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            minWidth: 0,
            p: 2.5,
          }}
        >
          <Box
            sx={{
              flex: 1,
              width: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              '&::-webkit-scrollbar': { width: 4, height: 4 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

