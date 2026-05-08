# 博客前端优化任务规划与验收标准

## 任务概述
对博客前端进行功能优化，包括导航栏改进、新建文章功能增强和错误修复。

---

## 📋 任务清单

### ✅ 任务1：修复Article图标未导入错误（高优先级）
**问题描述**：
- 控制台报错：`ReferenceError: Article is not defined`
- 位置：`BlogHomePage.tsx:220`
- 原因：使用了 `Article` 图标组件但未从 `@mui/icons-material` 导入

**修复方案**：
- 在 [BlogHomePage.tsx](file:///z:/MorWardRobe/portfolio-hub/frontend/src/pages/blog/BlogHomePage.tsx#L18-L24) 的导入语句中添加 `Article`

**验收标准**：
- [ ] 页面正常加载，无控制台错误
- [ ] 文章卡片封面区域正确显示Article图标
- [ ] 文章列表正常渲染

---

### ✅ 任务2：修改导航栏 - 全部文章按钮始终高亮（中优先级）
**需求描述**：
无论用户是否点击"全部文章"或浏览其他页面，该按钮始终保持高亮状态。

**实现方案**：
- 修改 [BlogLayout.tsx](file:///z:/MorWardRobe/portfolio-hub/frontend/src/pages/blog/BlogLayout.tsx#L90-L116) 中的NavLink样式逻辑
- 移除条件判断，始终设置高亮样式

**验收标准**：
- [ ] "全部文章"按钮在任何页面都显示为高亮状态（primary.main背景色）
- [ ] 其他导航项保持原有的激活状态逻辑不变
- [ ] 视觉效果符合M3设计规范

---

### ✅ 任务3：在导航栏添加"新建文章"按钮（中优先级）
**需求描述**：
1. 在"全部文章"按钮上方添加一个"新建文章"按钮
2. 点击后内容区域显示新建文章表单
3. 支持临时缓存机制：
   - 用户输入的内容被缓存
   - 切换到其他页面（如全部文章）后返回，内容依然保留
   - 点击发布后跳转到全部文章，并清空缓存

**实现方案**：
1. **导航栏修改** ([BlogLayout.tsx](file:///z:/MorWardRobe/portfolio-hub/frontend/src/pages/blog/BlogLayout.tsx))：
   - 在"全部文章"上方添加新的NavLink项
   - 指向 `/blog/new-post` 路由

2. **创建新建文章组件** (`NewPostPage.tsx`)：
   - 实现文章编辑表单（标题、分类、摘要、正文、封面）
   - 使用localStorage或React state管理临时数据
   - 发布成功后清除缓存并跳转

3. **路由配置** ([App.tsx](file:///z:/MorWardRobe/portfolio-hub/frontend/src/App.tsx) 或路由文件)：
   - 添加 `/blog/new-post` 路由

**技术实现细节**：
```typescript
// 缓存机制使用localStorage
const CACHE_KEY = 'blog_new_post_draft';

// 保存草稿
const saveDraft = (data: PostDraft) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
};

// 读取草稿
const loadDraft = (): PostDraft | null => {
  const cached = localStorage.getItem(CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
};

// 清除草稿（发布后调用）
const clearDraft = () => {
  localStorage.removeItem(CACHE_KEY);
};
```

**验收标准**：
- [ ] 导航栏显示"新建文章"按钮，位于"全部文章"上方
- [ ] 点击后进入新建文章页面，显示完整的编辑表单
- [ ] 输入内容后切换到其他页面再返回，内容仍然保留
- [ ] 点击发布按钮后：
  - 文章成功提交到后端
  - 自动跳转到全部文章页面
  - 新建文章页面的缓存被清空
  - 再次进入新建文章时显示空白表单
- [ ] 表单验证正常工作
- [ ] UI符合M3设计规范，物件大小合理

---

### ✅ 任务4：测试验证所有功能（高优先级）
**测试项目**：
1. 基础功能测试
   - [ ] 页面加载无错误
   - [ ] 导航栏所有按钮可点击
   - [ ] 全部文章按钮始终高亮

2. 新建文章功能测试
   - [ ] 新建文章按钮可见且可点击
   - [ ] 表单字段完整（标题、分类、摘要、正文、封面）
   - [ ] 内容缓存功能正常
   - [ ] 发布流程完整且正确

3. 兼容性测试
   - [ ] 不同屏幕尺寸下布局正常
   - [ ] 管理员/普通用户权限区分正确

---

## 🔧 技术栈要求
- React 18+
- MUI (Material UI) 组件库
- React Router v6
- TypeScript
- LocalStorage API（用于临时缓存）

## 📐 设计规范
- 遵循Google Material Design 3 (M3) 规范
- 物件大小缩小30%（已在上一轮完成）
- 颜色主题：primary (#6366f1), secondary (#ec4899)
- 字体大小已调整至紧凑尺寸

## ⚠️ 注意事项
1. 保持代码风格一致性
2. 不破坏现有功能
3. 所有新增组件遵循现有架构模式
4. 错误处理要完善
5. 性能优化考虑（避免不必要的重渲染）

## 📝 验收签字
- 开发完成日期：___________
- 测试通过日期：___________
- 产品验收日期：___________

---
*文档版本：v1.0*
*创建时间：2026-05-06*
