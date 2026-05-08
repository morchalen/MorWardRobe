import { useTheme } from '@mui/material/styles';
import { useAuthStore } from '@/stores';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
} from '@mui/material';
import {
  CalendarToday,
  Checkroom,
  Person,
  Group,
} from '@mui/icons-material';
import { Shell } from 'lucide-react';

export function Sidebar() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const avatarInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  const menuItems = [
    { label: '今日', path: '/', icon: CalendarToday },
    { label: '我的衣橱', path: '/wardrobe', icon: Checkroom },
    { label: '我的', path: '/profile', icon: Person },
    { label: '龙虾', path: '/lobster', icon: Shell, accent: '#FF6B35' },
  ];

  const adminMenuItems = [
    { label: '用户管理', path: '/admin/users', icon: Group },
    { label: '衣物管理', path: '/admin/clothings', icon: Checkroom },
  ];

  return (
    <Box sx={{
      width: 280,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: '100%',
      overflow: 'hidden',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRight: '1px solid rgba(255, 255, 255, 0.5)',
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
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: theme.shadows[1],
            }}
          >
            <Checkroom />
          </Avatar>
          <Typography
            variant="h6"
            color="text.primary"
          >
            智能衣橱
          </Typography>
        </Box>
      </Box>

      <List
        sx={{
          flexGrow: 1,
          flexShrink: 1,
          minHeight: 0,
          pt: 1.5,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
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
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <ListItem
                sx={{
                  py: 0.25,
                  px: 1,
                  borderRadius: 3,
                }}
              >
                <ListItemButton
                  sx={{
                    borderRadius: 4,
                    py: 1.5,
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

                  {item.accent && isActive && (
                    <Box
                      component="span"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: item.accent,
                        ml: 1,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <Box sx={{ px: 2, pt: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6875rem', letterSpacing: '0.05em' }}>
                管理
              </Typography>
            </Box>
            {adminMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={{ textDecoration: 'none' }}
              >
                {({ isActive }) => (
                  <ListItem
                    sx={{
                      py: 0.25,
                      px: 1,
                      borderRadius: 3,
                    }}
                  >
                    <ListItemButton
                      sx={{
                        borderRadius: 4,
                        py: 1.5,
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

      <Box sx={{
        p: 2,
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        flexShrink: 0,
      }}>
        {user && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1.5,
            borderRadius: 3,
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            transition: 'background-color 0.15s ease-out',
          }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 42,
                height: 42,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 600,
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
          </Box>
        )}
      </Box>
    </Box>
  );
}
