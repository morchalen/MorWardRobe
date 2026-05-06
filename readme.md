# SmartWardrobe 智能衣橱

AI驱动的一站式个人衣橱数字化与虚拟试衣平台。

## 📖 项目简介

SmartWardrobe 是一个智能衣橱管理系统，通过AI技术实现衣物自动抠图、属性识别、虚拟试衣等功能，帮助用户告别混乱、减少决策、控制增量、优化存量。

### ✨ 核心特性

- 🤖 **AI一键抠图** - 自动去除背景，输出高清透明底PNG
- 🎯 **AI属性识别** - 自动识别品类、颜色、材质、季节、风格等
- 👕 **虚拟试衣** - 真人照片或3D数字人一键试穿，所见即所得
- 📦 **衣物生命周期管理** - 记录穿着次数、洗护提醒、闲置分析
- 💡 **智能穿搭推荐** - 结合天气和场合自动推荐
- 🔍 **图文搜索** - 关键词或图片搜索衣橱
- 📊 **衣橱统计** - 品类占比、色系分布、穿着数据等

## 🛠️ 技术栈

### 后端

- **语言**: Go 1.26+
- **Web框架**: Gin
- **ORM**: GORM
- **数据库**: PostgreSQL (主) / SQLite (单机轻量)
- **认证**: JWT
- **配置管理**: Viper

### 前端

- **框架**: React 19
- **语言**: TypeScript
- **构建工具**: Vite
- **UI组件库**: MUI 7 + Framework7
- **状态管理**: Zustand
- **样式**: Tailwind CSS 4 + Emotion
- **数据请求**: React Query + Axios

## 📁 项目结构

```
MorWardRobe/
├── apps/
│   ├── api-server/              # Go后端服务
│   │   ├── cmd/
│   │   │   └── server/
│   │   │       └── main.go     # 入口文件
│   │   ├── internal/
│   │   │   ├── config/         # 配置
│   │   │   ├── handler/        # 请求处理器
│   │   │   ├── middleware/     # 中间件
│   │   │   ├── model/          # 数据模型
│   │   │   └── router/         # 路由
│   │   ├── pkg/
│   │   ├── uploads/            # 上传文件存储
│   │   └── go.mod
│   │
│   └── web-client/             # React前端
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
│
├── docs/                       # 文档目录
│   ├── API接口规范.md
│   ├── Agent接入说明.md
│   ├── 数据库设计.md
│   └── 数据结构说明.md
│
├── 前后端启动命令.txt
└── README.md
```

## 🚀 快速开始

### 前置要求

- Go 1.26+
- Node.js 20+
- npm 或 pnpm
- PostgreSQL (可选，SQLite作为默认)

### 后端启动

```bash
# 进入后端目录
cd Z:\MorWardRobe\MorWardRobe\apps\api-server\cmd\server

# 运行服务
go run main.go
```

后端服务将在 `http://localhost:8080` 启动（具体端口见配置）。

### 前端启动

```bash
# 进入前端目录
cd Z:\MorWardRobe\MorWardRobe\apps\web-client

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动。

### 统一启动 (根目录)

```bash
# 在项目根目录
cd Z:\MorWardRobe\MorWardRobe

# 同时启动前后端
npm run dev
```

## 📚 文档

- [API接口规范](./docs/API接口规范.md) - 完整的API文档
- [数据库设计](./docs/数据库设计.md) - 数据库Schema设计
- [数据结构说明](./docs/数据结构说明.md) - 数据结构定义
- [Agent接入说明](./docs/Agent接入说明.md) - AI Agent接入指南

## 🎨 功能模块

### 1. 用户系统

- 用户注册/登录
- 个人信息管理
- 身材数据录入（支持AI拍照测量）
- 3D数字人生成
- 风格偏好设置

### 2. 衣物管理

- 衣物上传（支持批量）
- AI自动抠图与属性识别
- 文件夹分类
- 收藏/标记
- 状态管理（活跃/闲置/洗护中/收纳中）

### 3. AI服务

- 智能抠图（Segmentation）
- 属性识别（Classification）
- 图片质量评估
- 用户纠错反馈

### 4. 穿搭推荐

- 今日推荐（结合天气/场合）
- 搭配评分
- 以图搜衣
- 穿搭对比

### 5. 虚拟试衣

- 真人照片试穿
- 3D数字人试穿
- 多套方案对比

### 6. 生命周期管理

- 穿着记录
- 洗护提醒
- 闲置分析
- 一进一出策略
- 断舍离推荐

### 7. 社区功能

- 穿搭分享
- 关注/点赞/评论
- 热门内容推荐

## 🔧 配置

### 后端配置

复制 `.env.example` 为 `.env` 并修改配置：

```env
APP_ENV=development
APP_PORT=8080

DB_TYPE=sqlite
DB_PATH=./smartwardrobe.db
# PostgreSQL配置
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=password
# DB_NAME=smartwardrobe

JWT_SECRET=your_jwt_secret_key
```

### 前端配置

修改 `apps/web-client/.env`：

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

- 项目地址: [GitHub Repo]
- 问题反馈: [Issues]

---

**告别衣橱混乱，从 SmartWardrobe 开始！** 👕👖
