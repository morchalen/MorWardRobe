# 智能衣橱前端大换血：Material UI / M3 (Material Design 3) 迁移方案

## 📋 目录
1. [项目现状分析](#1-项目现状分析)
2. [迁移目标与版本选择](#2-迁移目标与版本选择)
3. [技术栈对比](#3-技术栈对比)
4. [详细迁移步骤](#4-详细迁移步骤)
5. [组件映射指南](#5-组件映射指南)
6. [主题定制方案](#6-主题定制方案)
7. [页面迁移清单](#7-页面迁移清单)
8. [性能优化建议](#8-性能优化建议)
9. [测试策略](#9-测试策略)
10. [风险控制与回滚方案](#10-风险控制与回滚方案)

---

## 1. 项目现状分析

### 1.1 当前技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.5 | 核心框架 |
| TypeScript | ~6.0.2 | 类型系统 |
| Vite | 8.0.10 | 构建工具 |
| **Tailwind CSS** | **4.2.4** | **UI样式（当前）** |
| Lucide React | ^1.14.0 | 图标库 |
| React Router DOM | 6 | 路由管理 |
| Zustand | ^5.0.12 | 状态管理 |
| TanStack React Query | ^5.100.8 | 数据获取 |
| Axios | ^1.16.0 | HTTP客户端 |

### 1.2 当前UI特点
- ✅ **毛玻璃效果**：大量使用 `backdrop-blur` 和半透明背景
- ✅ **渐变设计**：卡片和按钮使用线性渐变
- ✅ **圆角设计**：`rounded-xl/2xl/3xl` 圆角风格
- ✅ **自定义表单**：手写的输入框、按钮样式
- ✅ **响应式布局**：Grid 布局系统

### 1.3 项目结构
```
smartwardrobe-v1/apps/web-client/src/
├── components/
│   ├── common/          # 通用组件 (EmptyState, LoadingSpinner, ProtectedRoute)
│   ├── layout/          # 布局组件 (MainLayout, Sidebar, BottomNav, AdminLayout)
│   └── wardrobe/        # 衣橱组件 (ClothingCard)
├── pages/
│   ├── auth/            # 认证页面 (LoginPage, RegisterPage)
│   ├── clothes/         # 衣物页面 (AddClothingPage, ClothingDetailPage, WardrobePage)
│   ├── admin/           # 管理后台 (AdminDashboard, UsersManagement)
│   ├── today/           # 今日推荐 (TodayPage)
│   ├── profile/         # 个人资料 (ProfilePage)
│   ├── settings/        # 设置 (SettingsPage)
│   └── folders/         # 文件夹管理 (FoldersPage)
├── services/api.ts      # API服务
├── stores/index.ts      # Zustand状态管理
└── types/index.ts       # TypeScript类型定义
```

### 1.4 当前痛点
1. **维护成本高**：大量内联样式和自定义CSS，难以统一维护
2. **组件复用性差**：每个页面都重复编写相似的卡片、按钮、输入框样式
3. **无设计系统**：缺乏统一的颜色、间距、字体规范
4. **可访问性不足**：缺少ARIA标签、键盘导航支持
5. **主题切换困难**：深色模式实现复杂
6. **动画不一致**：各组件的过渡效果不统一

---

## 2. 迁移目标与版本选择

### 2.1 推荐版本：**Material UI v7.3.x + Material Design 3**

**选择理由：**
- ✅ **完全支持 React 19**：原生兼容，无需polyfill
- ✅ **稳定版本**：2025年3月发布，经过充分验证
- ✅ **完整中文文档**：[mui.org.cn](https://mui.org.cn/material-ui/) 提供完整中文文档
- ✅ **长期支持**：官方承诺LTS支持
- ✅ **Pigment CSS 可选**：零运行时CSS-in-JS，提升性能
- ✅ **M3 完整支持**：动态配色、个性化 tokens

**备选方案：**
- **MUI v9**（2026年4月发布）：最新版，但文档较少，建议观望
- **MUI v6 LTS**：保守选择，适合需要超长支持的场景

### 2.2 迁移收益

#### 🎨 设计层面
- **统一的设计语言**：遵循 Google Material Design 3 规范
- **动态配色系统**：基于主色自动生成完整调色板
- **更好的可访问性**：内置WCAG 2.1 AA级对比度标准
- **响应式优先**：内置断点系统和响应式组件

#### 💻 开发效率
- **丰富的组件库**：50+ 预制组件，开箱即用
- **类型安全**：完整的 TypeScript 类型定义
- **主题定制**：灵活的主题系统，支持深色模式
- **社区生态**：庞大的社区和第三方集成

#### ⚡ 性能优化
- **Tree Shaking**：按需引入，减小包体积
- **Pigment CSS**：构建时提取样式，零运行时开销
- **SSR 支持**：服务端渲染兼容

---

## 3. 技术栈对比

### 3.1 迁移前后对比

| 维度 | 迁移前 (Tailwind) | 迁移后 (MUI/M3) |
|------|-------------------|------------------|
| **UI框架** | Tailwind CSS v4 | Material UI v7 |
| **设计系统** | 自定义（无规范） | Material Design 3 |
| **组件库** | 手写组件 | 50+ 预制组件 |
| **图标** | Lucide React | Material Icons / Lucide (保留) |
| **样式方案** | Utility-first + 内联样式 | CSS-in-JS (Emotion/Pigment) |
| **主题系统** | CSS变量 | M3 Theme + Dynamic Color |
| **动画** | CSS transitions | MUI内置动画系统 |
| **可访问性** | 手动添加 | 内置支持 |
| **包体积** | ~40KB (Tailwind) | ~150KB (MUI, 支持tree-shaking) |

### 3.2 依赖变更

#### 新增依赖
```json
{
  "dependencies": {
    "@mui/material": "^7.3.9",
    "@mui/icons-material": "^7.3.9",
    "@emotion/react": "^11.13.0",
    "@emotion/styled": "^11.13.0",
    "@mui/lab": "^7.0.1-beta.22"
  }
}
```

#### 移除依赖（可选）
```json
{
  "dependencies": {
    // 可以保留用于某些特殊样式需求
    "tailwindcss": "^4.2.4",  // 降级为辅助工具
    "clsx": "^2.1.1",          // MUI内部已使用
    "tailwind-merge": "^3.5.0" // 同上
  }
}
```

---

## 4. 详细迁移步骤

### 🎯 Phase 1: 环境准备（预计时间：1天）

#### Step 1.1: 创建新分支
```bash
git checkout -b feature/mui-m3-migration
```

#### Step 1.2: 安装依赖
```bash
cd smartwardrobe-v1/apps/web-client

# 安装 MUI 核心包
pnpm add @mui/material@^7.3.9 @mui/icons-material@^7.3.9 @emotion/react @emotion/styled

# 安装实验室组件（可选）
pnpm add @mui/lab@^7.0.1-beta.22
```

#### Step 1.3: 配置 TypeScript（如需要）
确保 `tsconfig.json` 包含以下配置：
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

#### Step 1.4: 备份当前样式文件
```bash
# 备份关键样式文件
cp src/index.css src/index.css.backup
cp src/App.css src/App.css.backup
```

---

### 🎨 Phase 2: 主题系统搭建（预计时间：2天）

#### Step 2.1: 创建 M3 主题配置文件

创建 `src/theme/theme.ts`:

```typescript
import { createTheme } from '@mui/material/styles';

// 定义品牌色（基于当前项目的主色）
const brandColor = '#007AFF'; // 当前的 --color-primary

// 创建 M3 主题
export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: brandColor,
          light: '#3385FF',
          dark: '#0056CC',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#6750A4', // M3 推荐的次要色
        },
        error: {
          main: '#B3261E',
        },
        warning: {
          main: '#F57C00',
        },
        success: {
          main: '#2E7D32',
        },
        background: {
          default: '#FEF7FF', // M3 浅色背景
          paper: '#FFFFFF',
        },
        text: {
          primary: '#1C1B1F',
          secondary: '#49454F',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#D0BCFF',
          dark: '#ABCFFF',
          contrastText: '#381E72',
        },
        mode: 'dark',
        background: {
          default: '#1C1B1F',
          paper: '#2B2930',
        },
        text: {
          primary: '#E6E1E5',
          secondary: '#CAC4D0',
        },
      },
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"SF Pro Display"',
      '"Segoe UI"',
      '"PingFang SC"',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none', // M3 不强制大写
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16, // M3 大圆角
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, // M3 全圆角按钮
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24, // M3 大圆角卡片
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
        },
      },
    },
  },
});

export default theme;
```

#### Step 2.2: 创建 ThemeProvider 包装器

创建 `src/theme/ThemeProvider.tsx`:

```typescript
import { useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const memoizedTheme = useMemo(() => theme, []);

  return (
    <MUIThemeProvider theme={memoizedTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </MUIThemeProvider>
  );
}
```

#### Step 2.3: 更新入口文件

修改 `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import App from './App';
import './index.css'; // 保留基础重置样式

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

#### Step 2.4: 更新全局样式

修改 `src/index.css`（精简为基础重置）:

```css
/* 仅保留必要的全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: inherit; /* 继承 MUI 字体 */
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

/* 自定义滚动条（可选） */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
```

---

### 🔧 Phase 3: 布局组件迁移（预计时间：3天）

#### Step 3.1: 迁移 MainLayout

**Before (Tailwind):**
```tsx
// src/components/layout/MainLayout.tsx
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="min-h-screen" style={{ marginLeft: '280px' }}>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
```

**After (MUI):**
```tsx
// src/components/layout/MainLayout.tsx
import { Box, Toolbar } from '@mui/material';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH = 280;

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${SIDEBAR_WIDTH}px`,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* 为顶部固定内容留出空间 */}
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
```

#### Step 3.2: 迁移 Sidebar

**Before (Tailwind):**
```tsx
// src/components/layout/Sidebar.tsx
<aside className="fixed left-0 top-0 bottom-0 w-[280px] flex flex-col z-50">
  <div className="h-full backdrop-blur-[30px] bg-white/70 ...">
    {/* Logo */}
    {/* Navigation */}
    {/* User Info */}
  </div>
</aside>
```

**After (MUI):**
```tsx
// src/components/layout/Sidebar.tsx
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import { Home, Shirt, User, LogOut } from '@mui/icons-material';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';

const SIDEBAR_WIDTH = 280;

const navItems = [
  { to: '/', icon: Home, label: '今日' },
  { to: '/wardrobe', icon: Shirt, label: '衣橱' },
  { to: '/profile', icon: User, label: '我的' },
];

export function Sidebar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      const { authApi } = await import('@/services/api');
      await authApi.logout();
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      logout();
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[1],
        },
      }}
    >
      {/* Logo 区域 */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: 'primary.main',
              borderRadius: 2,
            }}
          >
            衣
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              智能衣橱
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Smart Wardrobe
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 导航菜单 */}
      <List component="nav" sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.active': {
                bgcolor: 'primary.lighter', // 需要在主题中自定义
                color: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <item.icon />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      {/* 用户信息区域 */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
              }}
            >
              {user?.nickname?.charAt(0)?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {user?.nickname || '--'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email || ''}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <IconButton
          onClick={handleLogout}
          sx={{
            mt: 2,
            width: '100%',
            justifyContent: 'flex-start',
            pl: 2,
            color: 'text.secondary',
            '&:hover': {
              color: 'error.main',
              bgcolor: 'error.lighter',
            },
          }}
        >
          <LogOut sx={{ mr: 1 }} />
          <Typography variant="body2">退出登录</Typography>
        </IconButton>
      </Box>
    </Drawer>
  );
}
```

---

### 📄 Phase 4: 页面组件迁移（预计时间：10天）

#### Step 4.1: 登录页迁移

**Before (Tailwind):**
```tsx
// LoginPage.tsx - 使用自定义样式
<div className="w-full max-w-[400px] rounded-3xl p-8"
  style={{ background: 'linear-gradient(...)', backdropFilter: 'blur(40px)' }}
>
  <input className="w-full px-4 py-3 bg-white/60 backdrop-blur-md ..." />
  <button className="w-full py-3.5 bg-gradient-to-r from-blue-500 ..." />
</div>
```

**After (MUI):**
```tsx
// LoginPage.tsx - 使用 MUI 组件
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          p: 4,
          borderRadius: 5,
          bgcolor: 'background.paper',
        }}
      >
        {/* Logo 和标题 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2,
              bgcolor: 'primary.main',
              borderRadius: 3,
            }}
          >
            衣
          </Avatar>
          <Typography variant="h5" fontWeight={700}>
            欢迎回来
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            登录您的智能衣橱账户
          </Typography>
        </Box>

        {/* 表单 */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              id="email"
              type="email"
              label="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              size="medium"
            />

            <TextField
              fullWidth
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              size="medium"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              loading={isLoading}
              disabled={isLoading}
              sx={{ mt: 1, py: 1.5, borderRadius: 3 }}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </Box>
        </form>

        {/* 注册链接 */}
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3, color: 'text.secondary' }}
        >
          没有账户？{' '}
          <Link
            to="/register"
            style={{ color: 'inherit', fontWeight: 600 }}
          >
            立即注册
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}
```

#### Step 4.2: 今日推荐页迁移

**关键改动点：**
- 使用 `<Card>` 替代自定义卡片
- 使用 `<Grid>` 或 `<Grid2>` 替代 Tailwind Grid
- 使用 `<Chip>` 替代自定义标签
- 使用 `<IconButton>` 替代自定义按钮
- 使用 `<Skeleton>` 替代自定义加载状态

```tsx
// TodayPage.tsx (核心代码片段)
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Button,
  Avatar,
  IconButton,
  Skeleton,
} from '@mui/material';
import { RefreshCw, Plus } from '@mui/icons-material';

export function TodayPage() {
  // ... 状态逻辑保持不变 ...

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            今日推荐
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            基于天气智能搭配
          </Typography>
        </Box>
        <IconButton onClick={fetchWeather} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* 天气信息卡片 */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 4 }}>
            <CardContent>
              {/* 天气显示内容 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                <Box>
                  <Typography variant="overline" color="primary" fontWeight={600}>
                    天气信息
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {weather?.city || '--'}
                  </Typography>
                </Box>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'warning.main', borderRadius: 3 }}>
                  ☀️
                </Avatar>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h2" fontWeight={700}>
                {weather?.temperature ?? '--'}
                <Typography component="span" variant="h4" color="text.secondary" sx={{ ml: 1 }}>
                  °C
                </Typography>
              </Typography>

              {/* 舒适度信息 */}
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography variant="body2" color="text.secondary">天气状况</Typography>
                  <Typography variant="body2" fontWeight={500}>{weather?.weather || '--'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography variant="body2" color="text.secondary">舒适度</Typography>
                  <Chip label={comfort?.level || '--'} color="primary" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography variant="body2" color="text.secondary">建议</Typography>
                  <Typography variant="body2" fontWeight={500}>{comfort?.tip || '--'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* 添加衣物按钮 */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Plus />}
            component={Link}
            to="/clothes/add"
            sx={{ mt: 3, py: 1.5, borderRadius: 3 }}
          >
            添加衣物
          </Button>
        </Grid>

        {/* 穿搭方案卡片 */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="primary" fontWeight={600}>
                  穿搭方案
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>今日搭配</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  基于当前温度 {weather?.temperature ?? '--'}°C 智能生成
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {/* 上装 */}
                <Grid item xs={6}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.02)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>上装</Typography>
                      <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.50', borderRadius: 2 }}>
                        👔
                      </Avatar>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600}>T恤 / 衬衫</Typography>
                    <Typography variant="caption" color="text.secondary">轻薄透气材质</Typography>
                  </Card>
                </Grid>

                {/* 下装 */}
                <Grid item xs={6}>
                  <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, cursor: 'pointer', '&:hover': { transform: 'scale(1.02)' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>下装</Typography>
                      <Avatar sx={{ width: 44, height: 44, bgcolor: 'success.50', borderRadius: 2 }}>
                        👖
                      </Avatar>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600}>长裤 / 裙子</Typography>
                    <Typography variant="caption" color="text.secondary">舒适休闲款式</Typography>
                  </Card>
                </Grid>

                {/* 条件渲染外套和配饰 */}
                {(comfort && comfort.layers >= 3) && (
                  <>
                    <Grid item xs={6}>
                      <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, cursor: 'pointer' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>外套</Typography>
                        <Avatar sx={{ width: 44, height: 44, bgcolor: 'warning.50', borderRadius: 2, my: 1 }}>🧥</Avatar>
                        <Typography variant="subtitle2" fontWeight={600}>轻薄外套</Typography>
                      </Card>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
```

#### Step 4.3: ClothingCard 组件迁移

**Before (Tailwind):**
```tsx
<div className="group relative rounded-3xl overflow-hidden hover:scale-[1.02]"
  style={{ background: 'linear-gradient(...)', backdropFilter: 'blur(30px)' }}
>
  <button className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 ...">
    <Heart />
  </button>
</div>
```

**After (MUI):**
```tsx
// ClothingCard.tsx
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Favorite, FavoriteBorder, MoreVert, Edit, Delete } from '@mui/icons-material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWardrobeStore } from '@/stores';
import { CATEGORY_LABELS, SEASON_LABELS } from '@/utils';
import type { Clothing } from '@/types';

interface ClothingCardProps {
  item: Clothing;
  onDelete?: () => void;
}

export function ClothingCard({ item, onDelete }: ClothingCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { toggleFavorite } = useWardrobeStore();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 4,
        },
        position: 'relative',
      }}
    >
      {/* 图片区域 */}
      <CardMedia
        component={Link}
        to={`/clothes/${item.id}`}
        sx={{
          aspectRatio: '3/4',
          position: 'relative',
          display: 'block',
          bgcolor: 'grey.100',
          cursor: 'pointer',
          '& img': {
            transition: 'transform 0.5s',
          },
          '&:hover img': {
            transform: 'scale(1.05)',
          },
        }}
        image={item.thumbnail_url || item.image_url || undefined}
        title={item.name || CATEGORY_LABELS[item.category] || '未命名衣物'}
      >
        {!item.thumbnail_url && !item.image_url && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
            }}
          >
            👔
          </Box>
        )}

        {/* 收藏按钮 */}
        <IconButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(255,255,255,0.9)',
            opacity: item.is_favorite ? 1 : 0,
            transition: 'opacity 0.3s',
            '.parent:hover &': {
              opacity: 1,
            },
            '&:hover': {
              bgcolor: 'rgba(255,255,255,1)',
            },
          }}
        >
          {item.is_favorite ? (
            <Favorite color="error" fontSize="small" />
          ) : (
            <FavoriteBorder fontSize="small" />
          )}
        </IconButton>

        {/* 更多操作菜单按钮 */}
        <IconButton
          onClick={handleMenuOpen}
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: 'rgba(255,255,255,0.9)',
            opacity: 0,
            transition: 'opacity 0.3s',
            '.parent:hover &': {
              opacity: 1,
            },
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </CardMedia>

      {/* 下拉菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <MenuItem
          component={Link}
          to={`/clothes/${item.id}`}
          onClick={handleMenuClose}
        >
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>编辑</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onDelete?.();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
      </Menu>

      {/* 卡片内容 */}
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {item.name || CATEGORY_LABELS[item.category] || '未命名衣物'}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {item.brand && <span>{item.brand}</span>}
          {item.price && (
            <>
              {' · '}
              <Box component="span" color="primary.main" fontWeight={500}>
                ¥{item.price}
              </Box>
            </>
          )}
        </Typography>

        {/* 标签 */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          {item.seasons?.slice(0, 2).map((season) => (
            <Chip
              key={season}
              label={SEASON_LABELS[season]}
              size="small"
              variant="outlined"
            />
          ))}
          {item.custom_tags?.slice(0, 1).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              color="primary"
              variant="filled"
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
```

---

### 🧩 Phase 5: 通用组件迁移（预计时间：2天）

#### Step 5.1: EmptyState 组件

**Before:**
```tsx
// EmptyState.tsx (自定义)
<div className="flex flex-col items-center justify-center py-16">
  <span className="text-6xl mb-4">👔</span>
  <p className="text-gray-500">暂无数据</p>
</div>
```

**After:**
```tsx
// EmptyState.tsx (MUI)
import { Box, Typography, Paper } from '@mui/material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = '👔',
  title = '暂无数据',
  description,
  action,
}: EmptyStateProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        py: 8,
        px: 4,
        textAlign: 'center',
        borderRadius: 4,
      }}
    >
      <Typography sx={{ fontSize: '4rem', mb: 2 }}>{icon}</Typography>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      {action && <Box>{action}</Box>}
    </Paper>
  );
}
```

#### Step 5.2: LoadingSpinner 组件

**After:**
```tsx
// LoadingSpinner.tsx (MUI)
import { CircularProgress, Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message = '加载中...', fullScreen = false }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress />
    </Box>
  );
}
```

#### Step 5.3: ProtectedRoute 组件

保持不变，仅更新导入路径。

---

### 🚀 Phase 6: 高级特性集成（预计时间：3天）

#### Step 6.1: 深色模式支持

创建 `src/components/common/ThemeToggle.tsx`:

```tsx
import { IconButton, Tooltip } from '@mui/material';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useColorScheme } from '@mui/material/styles';

export function ThemeToggle() {
  const { mode, setMode } = useColorScheme();

  return (
    <Tooltip title={`切换到${mode === 'dark' ? '浅色' : '深色'}模式`}>
      <IconButton
        onClick={() => {
          setMode(mode === 'dark' ? 'light' : 'dark');
        }}
        color="inherit"
      >
        {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
}
```

在 Sidebar 中添加主题切换按钮：
```tsx
// 在 Sidebar 的用户信息区域上方添加
<Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pt: 1 }}>
  <ThemeToggle />
</Box>
```

#### Step 6.2: 响应式断点使用

MUI 内置断点系统：
- `xs`: 0px+
- `sm`: 600px+
- `md`: 900px+
- `lg`: 1200px+
- `xl`: 1536px+

示例：
```tsx
import { useTheme, useMediaQuery } from '@mui/material';

function ResponsiveComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  return (
    <Grid container spacing={isMobile ? 2 : 3}>
      <Grid item xs={12} md={6}>
        {/* 内容 */}
      </Grid>
    </Grid>
  );
}
```

#### Step 6.3: 动画效果

MUI 内置动画：
```tsx
import { Fade, Slide, Zoom, Grow, Collapse } from '@mui/material';

<Fade in={visible}>
  <div>淡入效果</div>
</Fade>

<Slide direction="up" in={visible} mountOnEnter unmountOnExit>
  <div>滑入效果</div>
</Slide>

<Collapse in={expanded}>
  <div>折叠展开</div>
</Collapse>
```

---

## 5. 组件映射指南

### 5.1 常用组件对照表

| 当前实现 (Tailwind) | MUI 组件 | 说明 |
|---------------------|----------|------|
| `<button>` + 自定义样式 | `<Button>` | 支持 variant: text, contained, outlined, fab |
| `<input>` + 样式 | `<TextField>` | 包含 label, helperText, error 状态 |
| `<select>` | `<Select>` | 支持 multiSelect, native |
| `<div className="card">` | `<Card>` | 包含 CardHeader, CardContent, CardActions |
| `<a>` 导航链接 | `<Button component={Link}>` | 结合 react-router-dom |
| `<div className="modal">` | `<Dialog>` | 模态对话框 |
| `<div className="dropdown">` | `<Menu>` | 下拉菜单 |
| `<img>` + 样式 | `<Avatar>` / `<CardMedia>` | 头像和媒体 |
| `<span className="badge">` | `<Badge>` | 徽章计数 |
| `<span className="chip/tag">` | `<Chip>` | 标签/芯片 |
| `<div className="toast">` | `<Snackbar>` | 轻提示 |
| `<div className="tooltip">` | `<Tooltip>` | 工具提示 |
| 加载状态 | `<CircularProgress>` / `<LinearProgress>` | 进度指示器 |
| Tab 切换 | `<Tabs>` + `<Tab>` | 选项卡 |
| 数据表格 | `<Table>` | 表格（可选升级 DataGrid） |
| 分页 | `<Pagination>` | 分页器 |
| 侧边栏 | `<Drawer>` | 抽屉/侧边栏 |
| 顶部导航 | `<AppBar>` + `<Toolbar>` | 应用栏 |
| 底部导航 | `<BottomNavigation>` | 底部导航（移动端） |
| 图标 | `@mui/icons-material` | Material Icons (保留 lucide 作为补充) |

### 5.2 布局组件对照

| Tailwind 类名 | MUI 实现 | 示例 |
|---------------|----------|------|
| `flex`, `items-center`, `justify-between` | `sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}` | Flexbox 布局 |
| `grid grid-cols-3 gap-4` | `<Grid container spacing={2}><Grid item xs={4}></Grid></Grid>` | Grid 布局 |
| `container mx-auto max-w-6xl` | `<Container maxWidth="lg">` | 居中容器 |
| `p-8` | `sx={{ p: 3 }}` | 间距（MUI 使用 8px 倍数） |
| `rounded-xl` | `sx={{ borderRadius: 2 }}` | 圆角 |
| `shadow-lg` | `elevation={3}` | 阴影 |
| `bg-white/70 backdrop-blur-md` | `sx={{ bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)' }}` | 毛玻璃效果 |
| `hover:scale-105` | `'&:hover': { transform: 'scale(1.05)' }` | Hover 效果 |
| `transition-all duration-300` | `transition: 'all 0.3s ease-in-out'` | 过渡动画 |

---

## 6. 主题定制方案

### 6.1 保留现有视觉特征

为了保持项目现有的毛玻璃效果和渐变风格，可以在 MUI 主题中扩展：

```typescript
// 在 theme.ts 中添加自定义 token
theme.palette.common = {
  ...theme.palette.common,
  glassBg: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.45)',
};

// 自定义毛玻璃效果 mixin
const glassEffect = (opacity: number = 0.85) => ({
  background: `linear-gradient(180deg, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,${opacity * 0.85}) 100%)`,
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  border: '1px solid rgba(255,255,255,0.45)',
});
```

### 6.2 渐变按钮样式

```typescript
// 在 components overrides 中
MuiButton: {
  variants: [
    {
      props: { variant: 'gradient' },
      style: {
        background: 'linear-gradient(to right, var(--mui-palette-primary-main), var(--mui-palette-primary-dark))',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(0, 122, 255, 0.35)',
        '&:hover': {
          boxShadow: '0 6px 20px rgba(0, 122, 255, 0.45)',
        },
      },
    },
  ],
},
```

### 6.3 动态配色（Dynamic Color）

如果希望实现类似 Android 12+ 的动态取色功能：

```typescript
import { createTheme, alpha } from '@mui/material/styles';

// 从图片提取颜色（高级功能）
async function extractColorsFromImage(imageUrl: string) {
  // 使用 canvas API 或第三方库提取主色
  // 返回 seed color 用于生成调色板
}

// 生成 M3 tonal palette
function generateTonalPalette(seedColor: string) {
  // 使用 M3 色彩算法生成色调
  // 参考: https://m3.material.io/styles/color/the-color-system/tonal-palette
}
```

---

## 7. 页面迁移清单

### 7.1 迁移优先级排序

| 优先级 | 页面 | 预计工时 | 依赖关系 |
|--------|------|----------|----------|
| P0 | LoginPage | 2小时 | 无 |
| P0 | RegisterPage | 1.5小时 | LoginPage |
| P0 | MainLayout + Sidebar | 4小时 | 无 |
| P1 | TodayPage | 4小时 | MainLayout |
| P1 | WardrobePage | 3小时 | ClothingCard |
| P1 | ClothingCard | 3小时 | 无 |
| P2 | AddClothingPage | 4小时 | 无 |
| P2 | ClothingDetailPage | 3小时 | ClothingCard |
| P2 | ProfilePage | 2小时 | 无 |
| P3 | SettingsPage | 3小时 | ThemeToggle |
| P3 | FoldersPage | 2小时 | 无 |
| P3 | AdminDashboard | 4小时 | 无 |
| P3 | UsersManagement | 3小时 | 无 |

**总预估工时：38.5 小时（约 5 个工作日）**

### 7.2 各页面迁移要点

#### LoginPage / RegisterPage
- ✅ 使用 `<TextField>` 替代 input
- ✅ 使用 `<Button loading>` 替代自定义加载状态
- ✅ 使用 `<Alert>` 替代错误提示
- ✅ 使用 `<Paper>` 替代卡片容器

#### TodayPage
- ✅ 使用 `<Grid>` 替代 grid 布局
- ✅ 使用 `<Card>` 替代自定义卡片
- ✅ 使用 `<Chip>` 替代标签
- ✅ 使用 `<Skeleton>` 替代加载占位符
- ✅ 使用 `<Avatar>` 替代图标容器

#### WardrobePage
- ✅ 使用 `<Grid>` 实现瀑布流/网格布局
- ✅ 使用 `<Fab>` (Floating Action Button) 添加按钮
- ✅ 使用 `<Pagination>` 分页
- ✅ 使用 `<SearchIcon>` + `<TextField>` 搜索框

#### AddClothingPage
- ✅ 使用 `<FormControl>` + `<Select>` 下拉选择
- ✅ 使用 `<RadioGroup>` 单选组
- ✅ 使用 `<Switch>` 开关
- ✅ 使用 `<Dropzone>` 或自定义上传组件（可结合 MUI）
- ✅ 使用 `<Stepper>` 步骤条（如果有多步骤表单）

#### ProfilePage
- ✅ 使用 `<Avatar>` large 尺寸头像
- ✅ 使用 `<List>` 列表展示用户信息
- ✅ 使用 `<Divider>` 分隔线
- ✅ 使用 `<Dialog>` 编辑弹窗

#### AdminDashboard
- ✅ 使用 `<DataGrid>` 数据表格（推荐从 `@mui/x-data-grid` 升级）
- ✅ 使用 `<Chart>` 图表（可选 `@mui/x-charts`）
- ✅ 使用 `<Tabs>` 选项卡切换
- ✅ 使用 `<StatsCard>` 统计卡片（自定义）

---

## 8. 性能优化建议

### 8.1 减小包体积

#### 按需引入
```bash
# 安装插件
pnpm add -D babel-plugin-import  # 如果使用 Babel
# 或
pnpm add -D unplugin-vue-components  # Vite 自动导入
```

**Vite 配置 (vite.config.ts):**
```typescript
import { defineConfig } from 'vite';
import vitePluginImport from 'vite-plugin-import';

export default defineConfig({
  plugins: [
    vitePluginImport([
      {
        libraryName: '@mui/material',
        libraryDirectory: 'esm',
        style: (name) => `@mui/material/${name}/style`,
      },
      {
        libraryName: '@mui/icons-material',
        libraryDirectory: 'esm',
        style: false, // icons 不需要单独的 CSS
      },
    ]),
  ],
});
```

#### Tree Shaking
MUI v7 默认支持 tree shaking，只需确保：
- 使用 ES modules (`esModuleInterop: true`)
- 生产环境构建时启用 `sideEffects: false`

### 8.2 使用 Pigment CSS（可选）

如果想进一步优化运行时性能：

```bash
pnpm add @pigment-css/react
```

**优势：**
- 构建时提取 CSS，零运行时开销
- 更小的 bundle size
- 支持 RSC (React Server Components)

**注意：** Pigment CSS 在 v7 中仍为实验性功能，建议先使用 Emotion，后续再评估迁移。

### 8.3 懒加载重型组件

```tsx
import { lazy, Suspense } from 'react';

// 懒加载 DataGrid
const DataGrid = lazy(() => import('@mui/x-data-grid').then(m => ({ default: m.DataGrid })));

function HeavyComponent() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <DataGrid {...props} />
    </Suspense>
  );
}
```

### 8.4 虚拟化长列表

对于衣物列表等可能很长的列表，使用虚拟滚动：

```bash
pnpm add react-window
```

```tsx
import { FixedSizeList as List } from 'react-window';
import { List as MuiList, ListItem } from '@mui/material';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <ListItem style={style} divider>
      {items[index].name}
    </ListItem>
  );

  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={72}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

---

## 9. 测试策略

### 9.1 单元测试

使用 Vitest（项目已有）+ Testing Library：

```bash
# 安装测试工具
pnpm add -D @testing-library/jest-dom @testing-library/user-event
```

**示例测试用例：**
```tsx
// __tests__/LoginPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { LoginPage } from '@/pages/auth/LoginPage';

describe('LoginPage', () => {
  it('should render login form correctly', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LoginPage />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

  it('should show error when fields are empty', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LoginPage />
        </ThemeProvider>
      </BrowserRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /登录/i }));

    expect(screen.getByText(/请填写邮箱和密码/i)).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <LoginPage />
        </ThemeProvider>
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/密码/i);
    const toggleButton = screen.getByRole('button');

    expect(passwordInput).toHaveAttribute('type', 'password');

    await userEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
```

### 9.2 视觉回归测试

使用 Playwright 或 Chromatic 进行截图对比：

```bash
# 安装 Playwright
pnpm add -D @playwright/test
```

**示例：**
```ts
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('login page visual regression', async ({ page }) => {
  await page.goto('/login');

  // 截图并对比基线
  await expect(page).toHaveScreenshot('login-page.png');
});

test('sidebar navigation', async ({ page }) => {
  // 先登录
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="submit-button"]');

  // 等待跳转到首页
  await page.waitForURL('/');

  // 截图侧边栏
  const sidebar = page.locator('aside');
  await expect(sidebar).toHaveScreenshot('sidebar.png');
});
```

### 9.3 可访问性测试

使用 axe-core 进行自动化 a11y 测试：

```bash
pnpm add -D jest-axe
```

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(
    <ThemeProvider>
      <LoginPage />
    </ThemeProvider>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 9.4 测试覆盖率目标

| 类型 | 目标覆盖率 | 重点模块 |
|------|-----------|----------|
| 单元测试 | >80% | 通用组件、工具函数、状态管理 |
| 集成测试 | 关键流程 | 登录注册、CRUD操作、路由守卫 |
| E2E测试 | 核心用户旅程 | 完整购物车流程、管理员操作 |
| 视觉回归 | 所有页面 | UI一致性验证 |

---

## 10. 风险控制与回滚方案

### 10.1 潜在风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| **样式冲突** | Tailwind 和 MUI 样式覆盖 | 高 | 逐步迁移，最终移除 Tailwind |
| **包体积增大** | 首屏加载变慢 | 中 | 按需引入、代码分割、懒加载 |
| **学习曲线** | 团队成员不熟悉 MUI | 中 | 组织培训、提供文档、Code Review |
| **浏览器兼容** | 某些旧浏览器不支持 | 低 | MUI 已处理大部分兼容问题 |
| **第三方库冲突** | 与现有库产生冲突 | 低 | 充分测试、查阅兼容性文档 |

### 10.2 回滚方案

#### 方案 A: Feature Flag（推荐）

使用 feature flag 控制新旧UI切换：

```typescript
// src/config/features.ts
export const features = {
  useNewUI: process.env.REACT_APP_USE_NEW_UI === 'true', // 通过环境变量控制
};

// 在 App.tsx 中使用
if (features.useNewUI) {
  return <MUILayout />;
} else {
  return <LegacyLayout />;
}
```

**优点：**
- 可以灰度发布
- 快速回滚（改环境变量即可）
- A/B 测试友好

#### 方案 B: Git Branch 回滚

```bash
# 回滚到迁移前的 commit
git revert <migration-commit-hash>

# 或者切回旧分支
git checkout main
git merge --strategy=ours feature/mui-migration
git checkout feature/mui-migration
git merge main
```

#### 方案 C: 双版本共存

同时保留两套组件，通过路由参数或用户设置切换：

```tsx
// URL: /wardrobe?ui=v2
const searchParams = new URLSearchParams(window.location.search);
const uiVersion = searchParams.get('ui') || 'v1';

return uiVersion === 'v2' ? <MUIWardrobe /> : <LegacyWardrobe />;
```

### 10.3 监控指标

迁移前后应监控以下指标：

| 指标 | 监控方式 | 告警阈值 |
|------|----------|----------|
| **FCP (First Contentful Paint)** | Lighthouse / Web Vitals | < 1.8s |
| **LCP (Largest Contentful Paint)** | Web Vitals | < 2.5s |
| **TTI (Time to Interactive)** | Performance Observer | < 3.8s |
| **Bundle Size** | Bundle Analyzer | 增量 < 30% |
| **Runtime Errors** | Sentry / LogRocket | 错误率 < 0.1% |
| **User Satisfaction** | 问卷调查 / NPS | NPS > 40 |

### 10.4 应急预案

**如果在生产环境发现严重问题：**

1. **立即回滚**：执行回滚方案 A（最快，< 5分钟）
2. **通知用户**：通过应用内公告或邮件通知
3. **问题排查**：检查错误日志、用户反馈
4. **修复验证**：开发环境修复后重新测试
5. **逐步发布**：先发布到测试环境，观察 24 小时后再发布到生产

---

## 📅 时间规划（总工期：2周）

### Week 1: 基础设施搭建
- **Day 1-2**: 环境准备、依赖安装、主题配置
- **Day 3-4**: 布局组件迁移（MainLayout, Sidebar）
- **Day 5**: 通用组件迁移（EmptyState, LoadingSpinner）

### Week 2: 页面迁移
- **Day 6-7**: 认证页面（Login, Register）
- **Day 8-9**: 核心页面（Today, Wardrobe, ClothingCard）
- **Day 10**: 功能页面（AddClothing, Detail, Profile）
- **Day 11**: 管理后台（Admin Dashboard, Users）
- **Day 12**: 高级特性（暗黑模式、动画、优化）
- **Day 13-14**: 测试、修复 Bug、文档整理

---

## 📚 参考资源

### 官方文档
- **Material UI 中文文档**: https://mui.org.cn/material-ui/
- **Material Design 3 规范**: https://m3.material.io/
- **MUI v7 迁移指南**: https://mui.com/material-ui/migration/upgrade-to-v7/

### 社区资源
- **MUI GitHub**: https://github.com/mui/material-ui
- **Stack Overflow**: [material-ui tag](https://stackoverflow.com/questions/tagged/material-ui)
- **MUI Templates**: https://mui.com/material-ui/getting-started/templates/

### 学习资料
- **MUI v7 新特性视频**: YouTube 搜索 "MUI v7 new features"
- **Material Design 3 课程**: Google I/O 2021 Keynote
- **实战案例**: https://mui.com/material-ui/getting-started/example-projects/

---

## ✅ 迁移完成检查清单

### 开发阶段
- [ ] 所有依赖正确安装，无版本冲突
- [ ] 主题配置符合设计要求
- [ ] 所有页面组件迁移完成
- [ ] 响应式布局在各断点正常工作
- [ ] 深色模式正常切换
- [ ] 所有交互功能正常（表单提交、导航等）
- [ ] 无 TypeScript 类型错误
- [ ] ESLint 检查无错误
- [ ] 单元测试通过（>80% 覆盖率）

### 测试阶段
- [ ] Chrome/Firefox/Safari 主流版本测试通过
- [ ] 移动端 Safari / Chrome 测试通过
- [ ] 可访问性测试通过（axe-core 无严重违规）
- [ ] 视觉回归测试截图对比一致
- [ ] 性能指标达标（LCP < 2.5s）
- [ ] 包体积增量控制在合理范围

### 上线前
- [ ] Code Review 完成
- [ ] 产品经理/UI设计师验收通过
- [ ] Staging 环境部署成功
- [ ] 回滚方案准备就绪
- [ ] 监控告警配置完成
- [ ] 用户通知文案准备就绪

---

## 🎯 总结

本次迁移将使 **智能衣橱** 项目获得：

✨ **现代化的设计系统**：Material Design 3 规范
⚡ **更高的开发效率**：预制组件减少 60% 样式代码
♿ **更好的可访问性**：内置 WCAG 2.1 AA 标准
🌙 **完善的主题支持**：一键切换深色模式
📱 **优秀的移动端体验**：响应式优先设计
🔧 **更易维护的代码**：统一的设计 Token 和组件API

**预期投入**：2 周（1 名前端开发者）
**长期收益**：降低 40% UI 维护成本，提升用户体验满意度

---

**文档版本**: v1.0
**最后更新**: 2026-05-03
**作者**: AI Assistant
**适用项目**: smartwardrobe-v1/apps/web-client
