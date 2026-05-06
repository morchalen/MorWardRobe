# SmartWardrobe 未来规划

## 核心功能清单

### 0. 穿搭方案评分系统
- **位置**: 穿搭方案页面，AI推荐按钮左侧
- **功能**: 生成穿搭后，调用龙虾AI对穿搭进行评分（1-10分）
- **展示**: 显示"AI评分：X/10"
- **评分维度**: 颜色搭配、风格一致性、场合适配、季节适配

### 1. AI试衣功能
- **位置**: 穿搭方案页面
- **功能**: 基于当前穿搭方案，一键生成虚拟试衣效果
- **技术**: 集成IDM-VTON模型，支持真人照片换装
- **交互**: 点击"AI试衣"按钮，上传照片或使用已有照片，生成试穿效果

### 2. 穿搭评分社区
- **Tab位置**: 衣橱页面下方新增"社区评分"Tab
- **浏览模式**: 每次展示一个其他用户公开的穿搭
- **交互流程**: 查看穿搭 → 评分(1-5星) → 可选评价 → 自动展示下一个
- **公开机制**: 用户可选择将穿搭设为公开，AI自动模糊人脸
- **数据结构**:
  - `public_outfits` - 公开穿搭表（穿搭图片、衣服卡片、所属用户）
  - `outfit_ratings` - 评分表（评分、评价内容、打分用户）
  
- **用户数据查看**: 每个用户有"公开穿搭"Tab，显示自己的公开穿搭及其平均分和打分人数
- **分享入口**: 穿搭方案页面添加"添加为公开穿搭"按钮

### 3. 断舍离模式
- **位置**: "我的"页面
- **功能**: 开启后固定衣橱容量上限
- **机制**: 
  - 当前衣物数量即为上限
  - 新增衣物时必须先移除同等数量的旧衣物
  - 可随时关闭模式，关闭后恢复正常添加

## 数据结构设计

```sql
-- 公开穿搭表
CREATE TABLE public_outfits (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    outfit_image_url TEXT NOT NULL,
    garment_ids UUID[] NOT NULL,  -- 穿搭包含的衣物ID
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 穿搭评分表
CREATE TABLE outfit_ratings (
    id UUID PRIMARY KEY,
    outfit_id UUID REFERENCES public_outfits(id),
    rater_user_id UUID REFERENCES users(id),
    score INTEGER CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(outfit_id, rater_user_id)  -- 每人只能评一次
);

-- 用户设置表（新增断舍离模式字段）
ALTER TABLE users ADD COLUMN konmari_mode_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN wardrobe_capacity_limit INTEGER;

-- 公开穿搭统计视图
CREATE VIEW public_outfit_stats AS
SELECT 
    o.id,
    o.user_id,
    AVG(r.score) as average_score,
    COUNT(r.id) as rating_count
FROM public_outfits o
LEFT JOIN outfit_ratings r ON o.id = r.outfit_id
WHERE o.is_public = true
GROUP BY o.id, o.user_id;
```

## API接口设计

```typescript
// POST /api/outfits/:id/rate - 评分穿搭
interface RateOutfitRequest {
    score: number;  // 1-5
    comment?: string;
}

// GET /api/outfits/public/random - 获取随机公开穿搭
interface RandomPublicOutfitResponse {
    outfit_id: string;
    outfit_image_url: string;
    garments: Array<{
        id: string;
        name: string;
        image_url: string;
        category: string;
    }>;
    average_score: number;
    rating_count: number;
}

// GET /api/users/:id/public-outfits - 获取用户公开穿搭列表
interface UserPublicOutfitsResponse {
    outfits: Array<{
        outfit_id: string;
        outfit_image_url: string;
        average_score: number;
        rating_count: number;
        created_at: string;
    }>;
}

// POST /api/outfits/:id/make-public - 将穿搭设为公开
interface MakePublicRequest {
    outfit_image_url: string;  // 穿搭图片URL
}

// PUT /api/users/me/konmari-mode - 切换断舍离模式
interface KonmariModeRequest {
    enabled: boolean;
}
```

## 前端页面规划

### 穿搭方案页面增强
```
布局:
┌─────────────────────────────────────┐
│  穿搭展示区                          │
│  ┌─────────────────────────────┐    │
│  │     上装图片                 │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │     下装图片                 │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │     鞋履图片                 │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  AI评分: 8/10          AI推荐按钮    │
│  AI试衣按钮            添加公开穿搭   │
└─────────────────────────────────────┘
```

### 社区评分页面
```
布局:
┌─────────────────────────────────────┐
│  当前展示的公开穿搭                    │
│  ┌─────────────────────────────┐    │
│  │  [穿搭图片 - AI模糊人脸]     │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 衣服卡片列表                 │    │
│  │ • 上衣：XX品牌 XX款式        │    │
│  │ • 下装：XX品牌 XX款式        │    │
│  │ • 鞋履：XX品牌 XX款式        │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  评分区域                            │
│  ⭐⭐⭐⭐☆  5分                        │
│  [评价输入框]                        │
│  [提交评分] 按钮                     │
│  当前评分: 4.2分 (128人评价)         │
└─────────────────────────────────────┘
```

### "我的"页面 - 断舍离模式
```
布局:
┌─────────────────────────────────────┐
│  用户信息卡片                        │
├─────────────────────────────────────┤
│  衣橱统计                           │
│  总衣物: 86件                       │
│  断舍离模式: [⚪ 关闭 / ⚫ 开启]     │
│  容量上限: 86件 (开启时不可修改)     │
├─────────────────────────────────────┤
│  快捷操作                           │
│  [修改密码] [个人信息] [衣橱统计]    │
│  [公开穿搭数据]                      │
└─────────────────────────────────────┘
```

## 实现优先级

| 优先级 | 功能 | 预估工时 | 说明 |
|--------|------|---------|------|
| P0 | 穿搭评分系统 | 2天 | 调用龙虾AI评分，简单界面展示 |
| P0 | AI试衣功能 | 5天 | 集成VTON模型，前端交互 |
| P1 | 穿搭评分社区 | 7天 | 后端API + 前端页面 |
| P1 | 断舍离模式 | 3天 | 修改用户设置，添加容量限制逻辑 |

## 技术依赖

- **AI试衣**: IDM-VTON模型（需GPU部署）
- **人脸模糊**: YOLO人脸检测 + 高斯模糊
- **评分存储**: PostgreSQL数据库
- **前端框架**: React + TypeScript + MUI