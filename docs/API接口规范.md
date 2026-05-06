# SmartWardrobe API 接口规范文档

## 文档概述
**版本**: v1.0 - v5.0 全量规范
**最后更新**: 2026-05-03
**Base URL**: `https://api.smartwardrobe.com/v{version}`
**认证方式**: JWT Bearer Token (用户) / API Key + HMAC签名 (开发者)

---

## 目录
1. [通用规范](#一通用规范)
2. [认证模块 API](#二认证模块-api)
3. [用户档案 API](#三用户档案-api)
4. [衣物管理 API](#四衣物管理-api)
5. [AI 服务 API](#五ai-服务-api)
6. [推荐系统 API](#六推荐系统-api)
7. [虚拟试衣 API](#七虚拟试衣-api)
8. [生命周期管理 API](#八生命周期管理-api)
9. [社区与社交 API](#九社区与社交-api)
10. [购物助手 API](#十购物助手-api)
11. [开放平台 API](#十一开放平台-api)
12. [WebSocket 实时通信](#十二websocket-实时通信)
13. [错误码规范](#十三错误码规范)
14. [SDK 与代码示例](#十四sdk-与代码示例)

---

## 一、通用规范

### 1.1 HTTP 方法语义

| 方法 | 用途 | 幂等性 | 缓存 |
|------|------|--------|------|
| GET | 获取资源 | 是 | 可缓存 |
| POST | 创建资源/触发操作 | 否 | 不可缓存 |
| PUT | 全量更新资源 | 是 | 不可缓存 |
| PATCH | 部分更新资源 | 否 | 不可缓存 |
| DELETE | 删除资源 | 是 | 不可缓存 |

### 1.2 请求头标准

```http
# 所有请求必须包含
Content-Type: application/json
Accept: application/json
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
X-Request-ID: uuid-v4          # 客户端生成的请求追踪ID
X-Client-Version: 3.2.1        # 客户端版本号
X-Platform: ios                # ios/android/web/desktop

# 认证请求额外包含
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

# 开发者API请求
X-API-Key: sk_live_abc123...
X-API-Timestamp: 1677654321
X-API-Signature: hmac-sha256=abcdef...
```

### 1.3 响应格式标准

#### 成功响应（2xx）
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 业务数据
  },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-05-03T10:30:00Z",
    "server_version": "3.2.1"
  }
}
```

#### 分页响应
```json
{
  "code": 200,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 156,
      "total_pages": 8,
      "has_next": true,
      "has_prev": false,
      "next_cursor": "eyJpZCI6MTU2fQ=="
    }
  }
}
```

#### 错误响应（4xx/5xx）
```json
{
  "code": 40001,
  "error": "VALIDATION_ERROR",
  "message": "请求参数校验失败",
  "details": [
    {
      "field": "email",
      "message": "邮箱格式不正确",
      "code": "INVALID_EMAIL_FORMAT"
    }
  ],
  "request_id": "req_xyz789",
  "documentation_url": "https://docs.smartwardrobe.com/errors/40001"
}
```

### 1.4 版本控制策略

```
URL路径版本化（推荐）:
/v1/auth/login        → 稳定版
/v2/ai/segment        → 包含AI功能
/v3/recommendations   → 推荐系统
/v4/care/reminders     → 生命周期管理
/v5/community/posts    → 社交功能

Header版本控制（备选）:
Accept: application/vnd.smartwardrobe.v2+json
```

### 1.5 速率限制（Rate Limiting）

| 层级 | 限制 | 头部标识 |
|------|------|---------|
| 匿名用户 | 100 req/hour | `X-RateLimit-Limit: 100` |
| 免费用户 | 1,000 req/hour | `X-RateLimit-Remaining: 850` |
| Pro用户 | 10,000 req/hour | `X-RateLimit-Reset: 1677655000` |
| 企业用户 | 自定义SLA | - |

超限返回:
```json
{
  "code": 42900,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "API调用频率超限，请稍后重试",
  "retry_after_seconds": 60
}
```

---

## 二、认证模块 API

### 2.1 用户注册

```http
POST /v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phone": "+8613800138000",
  "nickname": "时尚达人小王",
  "invite_code": "optional"           // 可选邀请码
}
```

**响应 201 Created**:
```json
{
  "code": 201,
  "data": {
    "user": {
      "id": "usr_a1b2c3d4",
      "email": "u***@example.com",     // 脱敏显示
      "nickname": "时尚达人小王",
      "avatar_url": null,
      "created_at": "2026-05-03T10:30:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGci...",
      "refresh_token": "eyJhbGci...",
      "token_type": "Bearer",
      "expires_in": 86400               // 24小时
    }
  }
}
```

### 2.2 用户登录

```http
POST /v1/auth/login
Content-Type: application/json

// 方式1: 邮箱+密码
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// 方式2: 手机号+验证码
{
  "phone": "+8613800138000",
  "sms_code": "123456"
}

// 方式3: OAuth第三方登录（v5.0）
{
  "provider": "wechat" | "apple" | "google",
  "provider_token": "oauth_access_token_from_provider"
}
```

**响应 200 OK**:
```json
{
  "code": 200,
  "data": {
    "tokens": {
      "access_token": "eyJ...",
      "refresh_token": "eyJ...",
      "expires_in": 86400
    },
    "user": { /* 同上 */ },
    "is_new_device": true,             // 是否新设备登录
    "mfa_required": false              // 是否需要二次验证
  }
}
```

### 2.3 刷新Token

```http
POST /v1/auth/refresh
Authorization: Bearer <refresh_token>

// 或
Content-Type: application/json
{
  "refresh_token": "eyJ..."
}
```

### 2.4 登出

```http
POST /v1/auth/logout
Authorization: Bearer <access_token>

// 响应 204 No Content
// 服务端将token加入黑名单（Redis TTL = token剩余有效期）
```

### 2.5 获取当前用户信息

```http
GET /v1/auth/me
Authorization: Bearer <access_token>
```

**响应 200 OK**:
```json
{
  "code": 200,
  "data": {
    "id": "usr_a1b2c3d4",
    "email": "u***@example.com",
    "phone": "+86****8000",
    "nickname": "时尚达人小王",
    "avatar_url": "https://cdn.sw.com/avatars/usr_a1b2c3d4.jpg",
    "plan": {
      "type": "pro_individual",
      "expires_at": "2027-05-03T00:00:00Z",
      "features": ["unlimited_ai_tryon", "community_access"]
    },
    "stats": {
      "total_clothes": 156,
      "active_clothes": 142,
      "join_days": 365
    },
    "preferences": {
      "language": "zh-CN",
      "theme": "dark",
      "notifications_enabled": true
    }
  }
}
```

### 2.6 修改密码

```http
PUT /v1/auth/password
Authorization: Bearer <token>

{
  "old_password": "OldPass123!",
  "new_password": "NewSecurePass456!"
}
```

---

## 三、用户档案 API

### 3.1 获取完整档案

```http
GET /v1/profile
Authorization: Bearer <token>
```

**响应 200**:
```json
{
  "code": 200,
  "data": {
    "basic_info": {
      "gender": "female",
      "age": 28,
      "height_cm": 165.0,
      "weight_kg": 52.0,
      "city": "上海"
    },
    "body_measurements": {
      "bust_cm": 84,
      "waist_cm": 64,
      "hip_cm": 90,
      "shoulder_width_cm": 38,
      "leg_length_cm": 95
    },
    "style_preferences": {
      "tags": ["minimalist", "business_casual", "french_style"],
      "avoid_colors": ["#FFFF00"],         // 避讳黄色
      "preferred_brands": ["COS", "Massimo Dutti", "Uniqlo"],
      "occasion_weights": {                 // 场合偏好权重
        "work": 0.4,
        "casual": 0.35,
        "formal": 0.15,
        "sports": 0.1
      }
    },
    "avatar_3d": {
      "model_id": "avatar_usr_a1b2c3d4",   // 3D数字人模型ID
      "thumbnail_url": "...",
      "is_generated": true,
      "generated_at": "2026-04-15T10:00:00Z"
    }
  }
}
```

### 3.2 更新身材数据

```http
PUT /v1/profile/body-data
Authorization: Bearer <token>

{
  "height_cm": 166.0,
  "weight_kg": 51.5,
  "bust_cm": 85,
  "waist_cm": 63,
  "hip_cm": 91,
  "source": "manual"                     // manual | ai_measured
}
```

### 3.3 AI拍照测量身材（v2.0+）

```http
POST /v2/profile/ai-body-measure
Authorization: Bearer <token>
Content-Type: multipart/form-data

// 参数:
// - front_photo: 正面全身照 (必填)
// - side_photo: 侧面全身照 (可选,提高精度)
// - height_hint: 身高提示cm (可选)

**异步任务响应 202 Accepted**:
{
  "task_id": "task_body_measure_xyz",
  "status": "processing",
  "estimated_time": 15,                  // 秒
  "websocket_endpoint": "wss://api.smartwardrobe.com/ws/tasks/task_body_measure_xyz"
}

// 任务完成后通过WebSocket推送或轮询获取结果:
{
  "task_id": "task_body_measure_xyz",
  "status": "completed",
  "result": {
    "measurements": {
      "height_cm": 165.2,
      "weight_kg_estimated": 51.8,       // AI估算体重(可选)
      "bust_cm": 83.5,
      "waist_cm": 63.8,
      "hip_cm": 89.7,
      "shoulder_width_cm": 37.9,
      "arm_length_cm": 58,
      "leg_length_cm": 94.6
    },
    "confidence": 0.92,                   // 测量置信度
    "body_shape_analysis": {
      "type": "pear_shape",              // 梨形/X型/H型等
      "characteristics": ["肩窄腰细", "臀部丰满"],
      "style_recommendations": ["适合高腰线设计", "避免过于紧身的下装"]
    },
    "avatar_model_url": "https://...",    // 生成的3D Avatar预览
    "pose_keypoints_image": "https://..." // 关键点可视化图
  }
}
```

---

## 四、衣物管理 API

### 4.1 上传衣物（手动模式）

```http
POST /v1/clothes/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

字段:
- images[]: 图片文件 (最多10张, 单张≤10MB, 支持JPG/PNG/WebP)
- category: string (必填) tops|bottoms|outerwear|dress|accessories|shoes
- name: string (可选) 衣物名称
- primary_color: string (必填) HEX色值 "#2C3E50"
- secondary_color: string (可选) 拼色第二主色
- brand: string (可选)
- price: number (可选)
- purchase_date: string (可选) ISO 8601 "2026-01-15"
- seasons: string[] (可选) ["spring","autumn"]
- material: string (可选)
- style_tags: string[] (可选)
- custom_tags: string[] (可选)
- folder_id: string (可选) 归属文件夹UUID
- notes: string (可选)

**响应 201 Created**:
{
  "code": 201,
  "data": {
    "clothing_ids": ["clt_001", "clt_002"],
    "processed_images": [
      {
        "clothing_id": "clt_001",
        "original_url": "https://cdn.sw.com/original/clt_001.jpg",
        "thumbnail_url": "https://cdn.sw.com/thumb/clt_001.webp",
        "optimized_size_kb": 245
      }
    ],
    "upload_status": "success",
    "next_step_suggestion": {
      "action": "ai_process",
      "description": "是否使用AI自动抠图和属性识别？",
      "endpoint": "/v2/ai/process-batch",
      "params": { "clothing_ids": ["clt_001", "clt_002"] }
    }
  }
}
```

### 4.2 获取衣物列表

```http
GET /v1/clothes?page=1&per_page=20&category=tops&status=active&sort=-created_at
Authorization: Bearer <token>

查询参数:
- page: integer (默认1)
- per_page: integer (默认20, 最大100)
- category: string 品类过滤
- status: string active|idle|seasonal_storage|all
- seasons: string[] 季节过滤
- colors: string[] 颜色过滤 (HEX数组)
- folder_id: string 文件夹过滤
- is_favorite: boolean 收藏过滤
- search: string 关键词搜索 (名称/品牌/标签)
- sort: string 排序字段 created_at|wear_count|price|name (前缀-表示降序)
- fields: string[] 选择返回字段 (减少传输量)

**响应 200**:
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": "clt_001",
        "name": "ZARA黑色羊毛大衣",
        "category": "outerwear",
        "subcategory": "wool_coat",
        "primary_color": "#1a1a1a",
        "brand": "ZARA",
        "price": 1299.00,
        "purchase_date": "2025-11-20",
        "image_url": "https://cdn.sw.com/images/clt_001.webp",
        "thumbnail_url": "https://cdn.sw.com/thumb/clt_001.webp",
        "is_favorite": true,
        "wear_count": 23,
        "last_worn_date": "2026-04-28",
        "status": "active",
        "tags": ["winter", "formal", "warm"],
        "created_at": "2025-11-20T15:30:00Z"
      }
      // ... 更多物品
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_items": 142,
      "total_pages": 8,
      "has_next": true
    }
  }
}
```

### 4.3 获取衣物详情

```http
GET /v1/clothes/{clothing_id}
Authorization: Bearer <token>

**响应 200**:
{
  "code": 200,
  "data": {
    "id": "clt_001",
    "basic_info": {
      "name": "ZARA黑色羊毛大衣",
      "category": "outerwear",
      "subcategory": "wool_coat",
      "primary_color": "#1a1a1a",
      "color_name": "纯黑",
      "secondary_color": null,
      "brand": "ZARA",
      "price": 1299.00,
      "purchase_date": "2025-11-20",
      "purchase_location": "天猫旗舰店",
      "size": "M码 / 38",
      "material": "70%羊毛 30%聚酯纤维",
      "seasons": ["autumn", "winter"],
      "style_tags": ["minimalist", "business_casual"],
      "custom_tags": ["年会必备"],
      "notes": "仅穿过3次，99新"
    },

    "images": [
      {
        "id": "img_001",
        "url": "https://cdn.sw.com/clt_001/main.jpg",
        "type": "main",
        "width": 2048,
        "height": 3072
      },
      {
        "id": "img_002",
        "url": "https://cdn.sw.com/clt_001/detail1.jpg",
        "type": "detail",
        "description": "领部细节"
      }
    ],

    "ai_analysis": {                    // v2.0+ 字段
      "segmented_image_url": "https://cdn.sw.com/processed/clt_001_seg.png",
      "classification": {
        "category_confidence": 0.96,
        "color_accuracy": 0.98,
        "material_detected": "wool_blend",
        "fit_details": {
          "silhouette": "regular_fit",
          "length": "knee_length",
          "closure_type": "double_breasted"
        }
      },
      "analyzed_at": "2025-11-21T10:00:00Z",
      "model_version": "v2.1.0"
    },

    "lifecycle": {                      // v4.0+ 字段
      "status": "active",
      "wear_count": 23,
      "last_worn_date": "2026-04-28",
      "wash_count": 2,
      "last_wash_date": "2026-02-15",
      "next_care_date": "2026-06-01",    // 预计下次护理日期
      "cost_per_wear": 56.48            // 每次穿着成本 = 价格/穿着次数
    },

    "outfits_used_in": [                 // 穿搭记录关联
      {
        "outfit_id": "out_045",
        "date": "2026-04-28",
        "occasion": "商务会议"
      }
    ],

    "created_at": "2025-11-20T15:30:00Z",
    "updated_at": "2026-04-29T09:15:00Z"
  }
}
```

### 4.4 更新衣物信息

```http
PUT /v1/clothes/{clothing_id}
Authorization: Bearer <token>

{
  "name": "ZARA黑色双排扣羊毛大衣",     // 仅传需要更新的字段
  "notes": "年会穿过一次，平时很少穿",
  "custom_tags": ["年会必备", "待断舍离考虑"]
}
```

### 4.5 删除衣物

```http
DELETE /v1/clothes/{clothing_id}
Authorization: Bearer <token>

// 响应 204 No Content (软删除，保留30天后物理删除)
```

### 4.6 收藏/取消收藏

```http
POST /v1/clothes/{clothing_id}/favorite
Authorization: Bearer <token>

{
  "action": "toggle"  // add | remove | toggle
}

// 响应 200
{
  "code": 200,
  "data": {
    "clothing_id": "clt_001",
    "is_favorite": true,
    "favorite_count": 12
  }
}
```

### 4.7 批量操作

```http
POST /v1/clothes/batch-update
Authorization: Bearer <token>

{
  "action": "move_to_folder" | "change_status" | "batch_delete" | "add_tags",
  "clothing_ids": ["clt_001", "clt_005", "clt_010"],
  "payload": {
    // 根据action不同传入不同参数
    "folder_id": "fld_seasonal_winter",
    "status": "seasonal_storage",
    "tags": ["to_review"]
  }
}
```

---

## 五、AI 服务 API

### 5.1 AI抠图（Segmentation）

```http
POST /v2/ai/segment
Authorization: Bearer <token>

{
  "clothing_id": "clt_001",             // 已上传的衣物ID
  "mode": "auto",                       // auto | clothing_focused | accessory_focused
  "output_format": "png",
  "quality": "hd",                      // standard(1080p) | hd(2K) | ultra_hd(4K)
  "enable_shadow_removal": true,
  "edge_smoothing": 3                   // 0-10
}
```

**异步响应 202**:
```json
{
  "task_id": "seg_task_abc123",
  "status": "processing",
  "estimated_time": 3,                  // 秒
  "websocket_url": "wss://api.smartwardrobe.com/ws/tasks/seg_task_abc123"
}
```

**完成回调/WebSocket推送**:
```json
{
  "task_id": "seg_task_abc123",
  "status": "completed",
  "result": {
    "segmented_image_url": "https://cdn.sw.com/processed/clt_001_seg.png",
    "mask_visualization_url": "https://cdn.sw.com/masks/clt_001_mask.png",
    "thumbnail_url": "https://cdn.sw.com/thumb/clt_001_seg_thumb.webp",
    "confidence": 0.94,
    "processing_stats": {
      "inference_time_ms": 280,
      "post_process_time_ms": 120,
      "total_time_ms": 420
    }
  }
}
```

### 5.2 批量AI处理

```http
POST /v2/ai/process-batch
Authorization: Bearer <token>

{
  "clothing_ids": ["clt_001", "clt_002", ..., "clt_100"],
  "operations": ["segment", "classify"],  // 执行的操作列表
  "priority": "normal",                  // low | normal | high
  "callback_webhook": "https://your-app.com/webhooks/ai-complete",
  "notify_via": ["push", "email"]        # 完成通知方式
}
```

**响应 202**:
```json
{
  "batch_id": "batch_20260503_xyz",
  "total_items": 100,
  "queued_count": 100,
  "estimated_total_time": 25,            // 分钟
  "progress_ws_endpoint": "wss://.../ws/batches/batch_20260503_xyz"
}
```

### 5.3 AI属性识别（Classification）

```http
POST /v2/ai/classify
Authorization: Bearer <token>

{
  "clothing_id": "clt_001",
  "force_reanalyze": false               // 忽略缓存重新分析
}
```

**完整响应** (见v2.0文档中的ClassifyResponse示例)

### 5.4 用户纠错AI识别结果

```http
POST /v2/ai/classify/{classification_id}/correct
Authorization: Bearer <token>

{
  "attribute_path": "category.primary",
  "original_value": "blouse",
  "corrected_value": "shirt",
  "feedback_type": "wrong_label",
  "notes": "这是衬衫不是女士衬衫"
}
```

### 5.5 图片质量评估

```http
POST /v2/ai/assess-image-quality
Authorization: Bearer <token>
Content-Type: multipart/form-data

// 参数: image file

**响应 200**:
{
  "score": 78,                           // 0-100
  "is_acceptable": true,
  "dimensions": {
    "sharpness": 82,
    "lighting": 75,
    "color_accuracy": 85,
    "resolution": 80,
    "composition": 70,
    "noise_level": 65
  },
  "issues": ["光线略显不均匀"],
  "suggestions": ["建议在自然光下拍摄", "确保衣物占画面60%以上"],
  "auto_enhance_available": true
}
```

---

## 六、推荐系统 API

### 6.1 今日穿搭推荐（OOTD）

```http
GET /v3/recommendations/today
Authorization: Bearer <token>

Query Params:
- location: string (可选, 默认根据IP定位)
- occasion_hint: string (可选)
- exclude_recently_worn_days: number (默认3)
- must_include_items: string[] (可选)
- preferred_styles: string[] (可选临时偏好)
```

**响应 200** (详见v3.0 TodayOutfitResponse)

### 6.2 搭配评分

```http
POST /v3/outfit/score
Authorization: Bearer <token>

{
  "garments": ["clt_010", "clt_025", "clt_088"],
  "context": {
    "weather": { "temperature": 18, "condition": "cloudy" },
    "occasion": { "type": "work", "formality_level": 7 }
  }
}
```

**响应 200**:
```json
{
  "overall_score": 87,
  "grade": "A-",
  "dimension_scores": {
    "color_harmony": { "score": 92, "feedback": "黑白灰配色经典耐看" },
    "style_coherence": { "score": 85, "feedback": "风格统一" },
    "proportion_balance": { "score": 88, "feedback": "上下装比例协调" },
    "occasion_fit": { "score": 90, "feedback": "非常适合办公场合" }
  },
  "improvement_suggestions": [
    {
      "type": "add",
      "suggestion": "可加入一条棕色皮带提升层次感",
      "expected_score_increase": 3
    }
  ]
}
```

### 6.3 以图搜衣

```http
POST /v3/search/visual
Authorization: Bearer <token>
Content-Type: multipart/form-data

// 参数: query_image (图片文件)

{
  "search_scope": "my_wardrobe",
  "top_k": 12,
  "filters": {
    "categories": ["tops"],
    "seasons": ["spring", "summer"]
  }
}
```

---

## 七、虚拟试衣 API

### 7.1 创建试衣任务

```http
POST /v3/virtual-tryon
Authorization: Bearer <token>

{
  "mode": "photo",
  "photo_mode": {
    "person_image_url": "https://cdn.sw.com/users/my_full_body.jpg",
    "category_mapping": {
      "upper_body": "clt_010",
      "lower_body": "clt_025",
      "outerwear": "clt_088"
    },
    "preserve_identity_features": true
  },
  "options": {
    "output_resolution": "1024",
    "enable_shadow_realism": true,
    "generation_count": 2                 // 生成2个变体供选择
  }
}
```

**响应 202** (异步):
```json
{
  "task_id": "vton_task_xyz",
  "estimated_time": 12,                  // 秒
  "status": "processing"
}
```

**完成响应**:
```json
{
  "results": [
    {
      "image_url": "https://cdn.sw.com/vton/result_1.jpg",
      "quality_metrics": {
        "overall_score": 0.89,
        "face_preservation": 0.95,
        "garment_naturalness": 0.87
      },
      "fit_analysis": {
        "is_size_appropriate": true,
        "suggestion": "版型修身显气质"
      }
    }
  ]
}
```

---

## 八、生命周期管理 API

### 8.1 获取洗护提醒

```http
GET /v4/care/reminders
Authorization: Bearer <token>

**响应 200**:
{
  "urgent": [
    {
      "clothing_id": "clt_050",
      "name": "白色真丝衬衫",
      "image_url": "...",
      "reason": "已连续穿着3次（真丝建议每2-3次清洗）",
      "overdue_days": 1,
      "suggested_action": "立即手洗",
      "care_instructions": {
        "wash_method": "hand",
        "water_temp": "cold",
        "special_instructions": ["使用专用丝毛洗涤剂", "不可拧绞", "阴凉处晾干"]
      }
    }
  ],
  "upcoming": [...],
  "seasonal_alerts": [
    {
      "type": "retrieve_summer_clothes",
      "affected_items_count": 35,
      "weather_forecast": "下周气温回升至25°C+"
    }
  ]
}
```

### 8.2 记录洗护日志

```http
POST /v4/care/log-wash
Authorization: Bearer <token>

{
  "clothing_ids": ["clt_050", "clt_051"],
  "wash_date": "2026-05-03",
  "wash_method": "hand_wash",
  "detergent_used": "丝净洗涤剂",
  "notes": "轻微掉色"
}
```

### 8.3 衣物状态变更

```http
POST /v4/clothes/{clothing_id}/transition-status
Authorization: Bearer <token>

{
  "target_status": "idle",
  "reason": "超过120天未穿，系统判定为闲置",
  "triggered_by": "system_auto"         // user_manual | system_auto | care_reminder
}
```

### 8.4 获取衣橱健康报告

```http
GET /v4/analytics/wardrobe-health?period=last_quarter
Authorization: Bearer <token>
```

**响应 200** (详见v4.0 WardrobeHealthReport)

---

## 九、社区与社交 API

### 9.1 发布穿搭帖子

```http
POST /v5/community/posts
Authorization: Bearer <token>

{
  "content": {
    "images": ["base64_image_1...", "base64_image_2..."],
    "caption": "今天的OOTD ☁️ 灰色风衣+牛仔裤，适合上海的阴雨天 #ootd #极简风",
    "garment_ids": ["clt_088", "clt_025"],
    "visibility": "public",
    "location": { "lat": 31.2304, "lng": 121.4737, "name": "上海静安寺" }
  },
  "options": {
    "enable_ai_enrichment": true,
    "allow_shopping_link_generation": true
  }
}
```

### 9.2 获取社区Feed流

```http
GET /v5/community/feed?feed_type=for_you&page=1
Authorization: Bearer <token>
```

### 9.3 点赞/收藏/分享

```http
POST /v5/community/posts/{post_id}/interact
Authorization: Bearer <token>

{
  "action": "like",                    // like | unlike | save | unsave | share
  "share_target": "wechat"             // wechat | weibo | copy_link | dm
}
```

---

## 十、购物助手 API

### 10.1 分析购买意向

```http
POST /v5/shopping/analyze
Authorization: Bearer <token>

{
  "input": {
    "type": "url",
    "payload": "https://item.taobao.com/item.htm?id=123456789"
  },
  "options": {
    "check_duplicate": true,
    "generate_outfit_preview": true,
    "include_price_comparison": true
  }
}
```

**响应 200** (详见v5.0 ShoppingAnalysisResponse)

---

## 十一、开放平台 API

### 11.1 开发者认证

所有开放API请求需携带HMAC-SHA256签名:

```javascript
const crypto = require('crypto');

const timestamp = Math.floor(Date.now() / 1000);
const message = `${timestamp}.${request.method}.${request.path}.${JSON.stringify(request.body)}`;
const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(message)
  .digest('hex');

// Headers:
// X-API-Key: sk_live_abc123
// X-API-Timestamp: 1677654321
// X-API-Signature: sha256=abcdef123456...
```

### 11.2 对外提供AI抠图服务

```http
POST /open-api/v1/ai/segment
X-API-Key: sk_live_...
X-API-Timestamp: ...
X-API-Signature: ...

{
  "image": "base64_encoded_image...",
  "output_format": "png",
  "quality": "hd"
}
```

### 11.3 Webhook事件订阅

```http
POST /open-api/v1/webhooks/subscribe
Authorization: Bearer <developer_access_token>

{
  "events": ["clothing.added", "care.reminder.triggered"],
  "endpoint_url": "https://your-app.com/webhooks",
  "secret": "your_webhook_secret_for_verification"
}
```

---

## 十二、WebSocket 实时通信

### 连接端点

```
wss://api.smartwardrobe.com/ws?token={jwt_token}
```

### 消息协议（JSON）

```typescript
// 客户端 → 服务端
interface WSClientMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping';
  channels?: string[];                  // 订阅的频道
  request_id?: string;                  // 请求追踪ID
}

// 服务端 → 客户端
interface WSServerMessage {
  type: 'subscribed' | 'event' | 'pong' | 'error';
  channel?: string;
  event?: {
    event_type: string;                 // ai.task_completed | care.reminder | etc.
    data: any;
    timestamp: string;
  };
  request_id?: string;
}
```

### 使用示例

```javascript
const ws = new WebSocket(`wss://api.smartwardrobe.com/ws?token=${accessToken}`);

ws.onopen = () => {
  // 订阅AI任务完成频道
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['tasks.vton.task_abc123', 'tasks.segment.batch_xyz'],
    request_id: 'req_sub_001'
  }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'event' && msg.event.event_type === 'ai.task_completed') {
    console.log('AI处理完成:', msg.event.data);
    // 更新UI展示结果
  }
};
```

---

## 十三、错误码规范

### 错误码分类体系

| 范围 | 类别 | 说明 |
|------|------|------|
| 20000-29999 | 成功类 | 20000=成功, 20100=创建成功等 |
| 40000-49999 | 客户端错误 | 参数/权限/业务逻辑错误 |
| 50000-59999 | 服务端错误 | 内部异常/第三方依赖故障 |
| 60000-69999 | 限流与配额 | 速率限制/配额用尽 |
| 70000-79999 | 认证授权 | Token过期/权限不足 |

### 常用错误码速查表

```yaml
errors:
  # === 认证相关 (7xxxx) ===
  70001:
    http_status: 401
    code: "AUTH_TOKEN_EXPIRED"
    message: "访问令牌已过期，请重新登录"
    action: "引导用户重新登录"

  70002:
    http_status: 401
    code: "AUTH_INVALID_TOKEN"
    message: "无效的访问令牌"
    action: "清除本地存储，跳转登录页"

  70003:
    http_status: 403
    code: "AUTH_INSUFFICIENT_PERMISSIONS"
    message: "权限不足，无法执行此操作"
    action: "提示用户升级账户套餐"

  # === 参数校验 (4xxxx) ===
  40001:
    http_status: 400
    code: "VALIDATION_ERROR"
    message: "请求参数校验失败"

  40002:
    http_status: 400
    code: "INVALID_FILE_TYPE"
    message: "不支持的文件类型，仅支持JPG/PNG/WebP"
    action: "提示用户选择正确格式"

  40003:
    http_status: 400
    code: "FILE_SIZE_EXCEEDED"
    message: "文件大小超出限制（最大10MB）"
    action: "提示用户压缩图片"

  40004:
    http_status: 400
    code: "RESOURCE_NOT_FOUND"
    message: "请求的资源不存在"

  # === 业务逻辑 (4xxxx) ===
  40101:
    http_status: 400
    code: "WARDROBE_CAPACITY_REACHED"
    message: "衣橱已达上限（免费版200件），请升级Pro版或移除部分衣物"
    action: "触发一进一出流程或引导付费"

  40102:
    http_status: 409
    code: "DUPLICATE_CLOTHING_DETECTED"
    message: "检测到疑似重复衣物，是否仍要添加？"
    action: "弹窗让用户确认"

  # === AI服务 (45xxx) ===
  45001:
    http_status: 503
    code: "AI_SERVICE_UNAVAILABLE"
    message: "AI服务暂时不可用，请稍后重试"
    action: "显示重试按钮，30秒后自动重试"

  45002:
    http_status: 422
    code: "AI_SEGMENTATION_LOW_QUALITY"
    message: "图片质量过低，无法进行精准抠图"
    action: "建议用户重新拍摄更清晰的照片"

  45003:
    http_status: 422
    code: "AI_CLASSIFICATION_CONFIDENCE_LOW"
    message: "AI无法确定衣物属性，建议手动填写"
    action: "切换到手动录入模式"

  # === 配额限制 (6xxxx) ===
  60001:
    http_status: 429
    code: "RATE_LIMIT_EXCEEDED"
    message: "API调用频率超限"
    retry_after_seconds: 60

  60002:
    http_status: 403
    code: "QUOTA_EXCEEDED"
    message: "本月AI试用次数已用完（3/3），升级Pro版解锁无限次"
    action: "引导至支付页面"

  # === 社区内容 (48xxx) ===
  48001:
    http_status: 400
    code: "CONTENT_VIOLATION"
    message: "发布内容违反社区规范"
    action: "提示违规原因，要求修改"

  48002:
    http_status: 429
    code: "POST_FREQUENCY_LIMIT"
    message: "发布过于频繁，请5分钟后再试"
```

---

## 十四、SDK 与代码示例

### TypeScript/JavaScript SDK

```bash
npm install @smartwardrobe/sdk
```

```typescript
import { SmartWardrobeClient } from '@smartwardrobe/sdk';

const client = new SmartWardrobeClient({
  baseURL: 'https://api.smartwardrobe.com',
  authToken: 'your_jwt_token'
});

// 完整示例：从上传到AI处理再到穿搭推荐
async function fullWorkflow() {
  try {
    // 1. 上传衣物
    const uploadResult = await client.clothes.upload({
      files: [imageFile],
      category: 'tops',
      color: '#FFFFFF',
      brand: 'UNIQLO'
    });
    console.log('上传成功:', uploadResult.clothing_ids);

    // 2. AI抠图
    const segTask = await client.ai.segment({
      clothingId: uploadResult.clothing_ids[0],
      quality: 'hd'
    });

    // 等待异步任务完成
    const segResult = await client.tasks.waitForCompletion(segTask.task_id);
    console.log('抠图完成:', segResult.result.segmented_image_url);

    // 3. AI属性识别
    const classification = await client.ai.classify({
      clothingId: uploadResult.clothing_ids[0]
    });
    console.log('识别结果:', classification.attributes.category.secondary);

    // 4. 获取今日推荐
    const ootd = await client.recommendations.getToday();
    console.log('今日推荐:', ootd.primary_recommendation.garments);

  } catch (error) {
    if (error instanceof SmartWardrobeApiError) {
      console.error(`API错误 [${error.code}]: ${error.message}`);
      // 根据错误码做特定处理
      if (error.code === 'QUOTA_EXCEEDED') {
        showUpgradePrompt();
      }
    }
  }
}
```

### Python SDK

```bash
pip install smartwardrobe-sdk
```

```python
from smartwardrobe import SmartWardrobeClient

client = SmartWardrobeClient(
    api_key="your_api_key",
    base_url="https://api.smartwardrobe.com"
)

# 以图搜图示例
def search_similar_clothes(image_path: str):
    with open(image_path, 'rb') as f:
        result = client.search.visual(
            image=f.read(),
            top_k=12,
            search_scope="my_wardrobe"
        )

    for item in result.results:
        print(f"相似度: {item.similarity_score:.2%} - {item.name}")
        print(f"  匹配理由: {', '.join(item.matched_reasons)}")

# 监听Webhook事件（Flask示例）
from flask import Flask, request

app = Flask(__name__)

@app.route('/webhooks/sw', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-SW-Signature')
    payload = request.get_data()

    if not client.webhooks.verify_signature(payload, signature, WEBHOOK_SECRET):
        return '', 401

    event = request.json
    if event['type'] == 'clothing.added':
        process_new_clothing(event['data'])

    return '', 200
```

### Go SDK

```go
package main

import (
    "context"
    "log"
    sw "github.com/smartwardrobe/go-sdk"
)

func main() {
    client := sw.NewClient(sw.Config{
        BaseURL:    "https://api.smartwardrobe.com",
        APISKey:    "sk_live_xxx",
        APISecret: "your_secret",
    })

    // 虚拟试衣示例
    task, err := client.VTON.CreateTryOnTask(context.Background(), &sw.TryOnRequest{
        Mode: sw.PhotoMode,
        PersonImageURL: "https://example.com/my-photo.jpg",
        CategoryMapping: map[string]string{
            "upper_body": "clt_010",
            "lower_body": "clt_025",
        },
        Options: &sw.TryOnOptions{
            OutputResolution: "1024",
            GenerationCount: 2,
        },
    })
    if err != nil {
        log.Fatal(err)
    }

    // 轮询等待结果
    result, err := client.Tasks.WaitFor(context.Background(), task.ID, time.Minute*2)
    if err != nil {
        log.Fatal(err)
    }

    log.Printf("试衣完成! 质量评分: %.2f\n", result.QualityMetrics.OverallScore)
}
```

---

## 附录

### A. API版本兼容性矩阵

| API模块 | v1.0 | v2.0 | v3.0 | v4.0 | v5.0 |
|--------|------|------|------|------|------|
| Auth | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile | ✅ | ✅(+AI测量) | ✅ | ✅ | ✅ |
| Clothes CRUD | ✅ | ✅ | ✅ | ✅(+状态机) | ✅ |
| AI Segment | ❌ | ✅ | ✅ | ✅ | ✅ |
| AI Classify | ❌ | ✅ | ✅ | ✅ | ✅ |
| Recommendations | ❌ | ❌ | ✅ | ✅ | ✅ |
| Virtual TryOn | ❌ | ❌ | ✅ | ✅ | ✅(+AR实时) |
| Care/Lifecycle | ❌ | ❌ | ❌ | ✅ | ✅ |
| Community | ❌ | ❌ | ❌ | ❌ | ✅ |
| Shopping | ❌ | ❌ | ❌ | ❌ | ✅ |
| Open Platform | ❌ | ❌ | ❌ | ❌ | ✅ |

### B. Changelog（重要变更记录）

#### v5.0 变更
- **新增**: `/v5/community/*` 社交模块全部端点
- **新增**: `/v5/shopping/*` 购物助手端点
- **新增**: `/open-api/*` 开放平台端点
- **变更**: WebSocket支持更多事件类型
- **废弃**: v1.0中部分旧字段将在v6.0移除

#### v4.0 变更
- **新增**: `/v4/care/*` 洗护管理端点
- **新增**: `/v4/analytics/*` 数据分析端点
- **新增**: 衣物状态转换API
- **变更**: Clothes对象新增lifecycle字段组

#### v3.0 变更
- **新增**: `/v3/recommendations/*` 推荐系统端点
- **新增**: `/v3/virtual-tryon` 虚拟试衣端点
- **新增**: `/v3/search/visual` 以图搜图端点

#### v2.0 变更
- **新增**: `/v2/ai/*` 所有AI能力端点
- **变更**: 上传接口增加ai_processing选项

---

**文档维护**: API Team
**反馈渠道**: api-feedback@smartwardrobe.com
**Swagger UI**: https://api-docs.smartwardrobe.com (交互式调试)
