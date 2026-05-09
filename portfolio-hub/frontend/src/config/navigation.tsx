import {
  Checkroom as WardrobeIcon,
  Today as TodayIcon,
  SportsEsports as LobsterIcon,
  Article as BlogIcon,
  Add as NewPostIcon,
  ListAlt as AllPostsIcon,
  Category as CategoryIcon,
  Code as TechIcon,
  Favorite as LifeIcon,
  EditNote as EssayIcon,
  DnsRounded as ServerIcon,
  Psychology as BrainIcon,
  Person as ProfileIcon,
  Settings as AdminIcon,
  People as UsersIcon,
  Inventory as ClothingsIcon,
  ManageAccounts as BlogAdminIcon,
  LibraryBooks as PostsManageIcon,
} from '@mui/icons-material';
import { ReactNode } from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
  permission?: 'user' | 'admin';
  children?: NavItem[];
}

export interface NavGroup {
  title: string;
  icon?: ReactNode;
  items: NavItem[];
}

export const NAVIGATION_CONFIG: NavGroup[] = [
  {
    title: '衣橱',
    icon: <WardrobeIcon />,
    items: [
      { id: 'today', label: '今日', icon: <TodayIcon />, path: '/today' },
      { id: 'wardrobe', label: '我的衣橱', icon: <WardrobeIcon />, path: '/wardrobe' },
      { id: 'lobster', label: '龙虾', icon: <LobsterIcon />, path: '/lobster' },
    ],
  },
  {
    title: '博客',
    icon: <BlogIcon />,
    items: [
      { id: 'new-post', label: '新建文章', icon: <NewPostIcon />, path: '/blog/new-post' },
      { id: 'all-posts', label: '所有文章', icon: <AllPostsIcon />, path: '/blog' },
      {
        id: 'categories',
        label: '分类',
        icon: <CategoryIcon />,
        path: '/blog/category/tech',
        children: [
          { id: 'tech', label: '技术', icon: <TechIcon />, path: '/blog/category/tech' },
          { id: 'life', label: '生活', icon: <LifeIcon />, path: '/blog/category/life' },
          { id: 'essay', label: '随笔', icon: <EssayIcon />, path: '/blog/category/essay' },
        ],
      },
      { id: 'server-status', label: '服务器状态', icon: <ServerIcon />, path: '/blog/status', permission: 'admin' },
    ],
  },
  {
    title: '大脑',
    icon: <BrainIcon />,
    items: [
      { id: 'brain', label: '大脑四象限', icon: <BrainIcon />, path: '/brain' },
    ],
  },
  {
    title: '我的',
    icon: <ProfileIcon />,
    items: [
      { id: 'profile', label: '个人信息', icon: <ProfileIcon />, path: '/profile' },
    ],
  },
  {
    title: '管理',
    icon: <AdminIcon />,
    items: [
      { id: 'wardrobe-users', label: '衣橱用户管理', icon: <UsersIcon />, path: '/admin/users', permission: 'admin' },
      { id: 'clothings', label: '衣物管理', icon: <ClothingsIcon />, path: '/admin/clothings', permission: 'admin' },
      { id: 'blog-users', label: '博客用户管理', icon: <BlogAdminIcon />, path: '/blog/admin', permission: 'admin' },
      { id: 'blog-posts', label: '文章管理', icon: <PostsManageIcon />, path: '/blog/admin/posts', permission: 'admin' },
    ],
  },
];

export function getNavItemsByPermission(role: string | undefined): NavGroup[] {
  if (role === 'admin') {
    return NAVIGATION_CONFIG;
  }
  
  return NAVIGATION_CONFIG.map(group => ({
    ...group,
    items: group.items.filter(item => item.permission !== 'admin'),
  })).filter(group => group.items.length > 0);
}

export function findNavItemByPath(path: string): NavItem | null {
  for (const group of NAVIGATION_CONFIG) {
    for (const item of group.items) {
      if (item.path === path) return item;
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) return child;
        }
      }
    }
  }
  return null;
}
