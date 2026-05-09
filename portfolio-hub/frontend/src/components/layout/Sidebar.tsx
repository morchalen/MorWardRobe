import { useTheme } from '@mui/material/styles';
import { useAuthStore } from '@/stores';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getGlassSidebar } from '@/styles/glass';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CalendarToday,
  Checkroom,
  Person,
  Group,
  Article as BlogIcon,
  Add as NewPostIcon,
  ListAlt as AllPostsIcon,
  Category as CategoryIcon,
  Code as TechIcon,
  Favorite as LifeIcon,
  EditNote as EssayIcon,
  DnsRounded as ServerIcon,
  Psychology as BrainIcon,
  Settings as AdminIcon,
  Inventory as ClothingsIcon,
  ManageAccounts as BlogAdminIcon,
  LibraryBooks as PostsManageIcon,
  Logout as LogoutIcon,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useState } from 'react';
import { Shell } from 'lucide-react';

export function Sidebar() {
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const avatarInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  const [expandedCategories, setExpandedCategories] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { label: '今日', path: '/today', icon: CalendarToday },
    { label: '我的衣橱', path: '/wardrobe', icon: Checkroom },
    { label: '龙虾', path: '/lobster', icon: Shell, accent: '#FF6B35' },
  ];

  const blogItems = [
    { label: '新建文章', path: '/blog/new-post', icon: NewPostIcon },
    { label: '所有文章', path: '/blog', icon: AllPostsIcon },
  ];

  const categoryItems = [
    { label: '技术', path: '/blog/category/技术', icon: TechIcon },
    { label: '生活', path: '/blog/category/生活', icon: LifeIcon },
    { label: '随笔', path: '/blog/category/随笔', icon: EssayIcon },
  ];

  const brainItems = [
    { label: '大脑四象限', path: '/brain', icon: BrainIcon, accent: '#9C27B0' },
  ];

  const adminMenuItems = [
    { label: '衣物管理', path: '/admin/clothings', icon: ClothingsIcon },
  ];

  const blogAdminItems = isAdmin ? [
    { label: '服务器状态', path: '/blog/status', icon: ServerIcon },
    { label: '文章管理', path: '/blog/admin', icon: BlogAdminIcon },
  ] : [];

  const standaloneAdminItems = isAdmin ? [
    { label: '用户管理', path: '/admin/users', icon: Group, accent: '#00ACC1' },
  ] : [];

  return (
    <Box sx={{
      width: 280,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: '100%',
      overflow: 'hidden',
      ...getGlassSidebar(theme),
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 1,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.03), transparent 8%, transparent 92%, rgba(0,0,0,0.03))',
        pointerEvents: 'none',
      },
    }}>

      {/* Header */}
      <Box sx={{
        p: 3,
        pb: 2,
        flexShrink: 0,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 1
        }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'transparent',
              boxShadow: 'none',
            }}
            src="/mono_logo.png"
            alt="MonOS Logo"
          />
          <Typography
            variant="h6"
            color="text.primary"
          >
            MonOS
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List
        sx={{
          flexGrow: 1,
          flexShrink: 1,
          minHeight: 0,
          pt: 1.5,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: 4,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(0,0,0,0.15)',
            borderRadius: 2,
          },
        }}
      >
        {/* 衣橱 Section */}
        <Box sx={{ px: 1.5, pt: 0.5 }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}>
            衣橱
          </Typography>
        </Box>
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <ListItem sx={{ py: 0.25, px: 1, borderRadius: 3 }}>
                <ListItemButton
                  sx={{
                    borderRadius: 4,
                    py: 1.4,
                    px: 2.5,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    transition: 'all 0.15s ease-out',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                      transform: 'translateX(2px)',
                    },
                    '&:active': {
                      transform: 'translateX(0)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: item.accent && !isActive
                        ? item.accent
                        : isActive
                          ? 'primary.contrastText'
                          : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </NavLink>
        ))}

        {/* 博客 Section */}
        <Box sx={{ px: 1.5, pt: 1.5 }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}>
            博客
          </Typography>
        </Box>
        {blogItems.map((item) => (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <ListItem sx={{ py: 0.25, px: 1, borderRadius: 3 }}>
                <ListItemButton
                  sx={{
                    borderRadius: 4,
                    py: 1.4,
                    px: 2.5,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    transition: 'all 0.15s ease-out',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                      transform: 'translateX(2px)',
                    },
                    '&:active': {
                      transform: 'translateX(0)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'primary.contrastText' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </NavLink>
        ))}

        {/* 分类 Sub-menu */}
        <ListItem sx={{ py: 0.25, px: 1, borderRadius: 3 }}>
          <ListItemButton
            onClick={() => setExpandedCategories(!expandedCategories)}
            sx={{
              borderRadius: 4,
              py: 1.4,
              px: 2.5,
              color: 'text.primary',
              transition: 'all 0.15s ease-out',
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'translateX(2px)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText
              primary="分类"
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: 400,
                  fontSize: '0.875rem',
                },
              }}
            />
            {expandedCategories ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        
        {expandedCategories && (
          <Box sx={{ pl: 3 }}>
            {categoryItems.map((item) => (
              <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                {({ isActive }) => (
                  <ListItem sx={{ py: 0.15, px: 1, borderRadius: 3 }}>
                    <ListItemButton
                      sx={{
                        borderRadius: 3,
                        py: 1,
                        px: 2,
                        bgcolor: isActive ? 'rgba(124, 111, 184, 0.12)' : 'transparent',
                        color: isActive ? 'primary.main' : 'text.secondary',
                        transition: 'all 0.15s ease-out',
                        '&:hover': {
                          bgcolor: isActive ? 'rgba(124, 111, 184, 0.18)' : 'action.hover',
                          transform: 'translateX(2px)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                        <item.icon sx={{ fontSize: '1.125rem' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: isActive ? 500 : 400,
                            fontSize: '0.8125rem',
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </NavLink>
            ))}
          </Box>
        )}

        {/* 大脑 Section */}
        <Box sx={{ px: 1.5, pt: 1.5 }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}>
            大脑
          </Typography>
        </Box>
        {brainItems.map((item) => (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <ListItem sx={{ py: 0.25, px: 1, borderRadius: 3 }}>
                <ListItemButton
                  sx={{
                    borderRadius: 4,
                    py: 1.4,
                    px: 2.5,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    transition: 'all 0.15s ease-out',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                      transform: 'translateX(2px)',
                    },
                    '&:active': {
                      transform: 'translateX(0)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: item.accent && !isActive
                        ? item.accent
                        : isActive
                          ? 'primary.contrastText'
                          : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </NavLink>
        ))}

        {/* 独立管理项 (Admin Only) - 用户管理 */}
        {isAdmin && standaloneAdminItems.map((item) => (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <ListItem sx={{ py: 0.25, px: 1, borderRadius: 3 }}>
                <ListItemButton
                  sx={{
                    borderRadius: 4,
                    py: 1.4,
                    px: 2.5,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    transition: 'all 0.15s ease-out',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                      transform: 'translateX(2px)',
                    },
                    '&:active': {
                      transform: 'translateX(0)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: item.accent && !isActive
                        ? item.accent
                        : isActive
                          ? 'primary.contrastText'
                          : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </NavLink>
        ))}

        {/* 管理 Section (Admin Only) */}
        {isAdmin && (
          <>
            <Box sx={{ px: 1.5, pt: 1.5 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}>
                衣橱管理
              </Typography>
            </Box>
            {adminMenuItems.map((item) => (
              <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                {({ isActive }) => (
                  <ListItem sx={{ py: 0.25, px: 1, borderRadius: 3 }}>
                    <ListItemButton
                      sx={{
                        borderRadius: 4,
                        py: 1.4,
                        px: 2.5,
                        bgcolor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? 'primary.contrastText' : 'text.primary',
                        transition: 'all 0.15s ease-out',
                        '&:hover': {
                          bgcolor: isActive ? 'primary.dark' : 'action.hover',
                          transform: 'translateX(2px)',
                        },
                        '&:active': {
                          transform: 'translateX(0)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isActive ? 'primary.contrastText' : 'text.secondary',
                          minWidth: 40,
                        }}
                      >
                        <item.icon />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </NavLink>
            ))}

            <Box sx={{ px: 1.5, pt: 1.5 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6875rem', letterSpacing: '0.08em' }}>
                博客管理
              </Typography>
            </Box>
            {blogAdminItems.map((item) => (
              <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                {({ isActive }) => (
                  <ListItem sx={{ py: 0.25, px: 1, borderRadius: 3 }}>
                    <ListItemButton
                      sx={{
                        borderRadius: 4,
                        py: 1.4,
                        px: 2.5,
                        bgcolor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? 'primary.contrastText' : 'text.primary',
                        transition: 'all 0.15s ease-out',
                        '&:hover': {
                          bgcolor: isActive ? 'primary.dark' : 'action.hover',
                          transform: 'translateX(2px)',
                        },
                        '&:active': {
                          transform: 'translateX(0)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isActive ? 'primary.contrastText' : 'text.secondary',
                          minWidth: 40,
                        }}
                      >
                        <item.icon />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </NavLink>
            ))}
          </>
        )}
      </List>

      {/* User Info Footer */}
      <Box sx={{
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        flexShrink: 0,
      }}>
        {user && (
          <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => navigate('/profile')}
            >
            <Avatar
              variant="rounded"
              sx={{
                width: 42,
                height: 42,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 600,
                transition: 'transform 0.15s ease',
              }}
            >
              {avatarInitial}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                noWrap
              >
                {user.email.split('@')[0]}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
              >
                {user.email}
              </Typography>
            </Box>
            <Tooltip title="退出登录">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'error.main',
                    bgcolor: `${theme.palette.error.main}10`,
                  },
                }}
              >
                <LogoutIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            </Box>
        )}
      </Box>
    </Box>
  );
}
