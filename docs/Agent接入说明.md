# SmartWardrobe Agent 接入说明文档

## 文档概述
**版本**: 1.0
**适用范围**: v3.0+ (推荐系统及之后版本)
**最后更新**: 2026-05-03
**目标读者**: AI应用开发者、智能体(Agent)构建者、大模型集成工程师

---

## 目录
1. [什么是SmartWardrobe Agent](#一什么是smartwardrobe-agent)
2. [Agent能力矩阵](#二agent能力矩阵)
3. [接入架构与协议](#三接入架构与协议)
4. [认证与授权](#四认证与授权)
5. [工具函数(Tools)定义](#五工具函数tools定义)
6. [快速开始指南](#六快速开始指南)
7. [集成示例：GPT/Claude/文心一言](#七集成示例gptclaude文心一言)
8. [最佳实践与模式](#八最佳实践与模式)
9. [限制与注意事项](#九限制与注意事项)
10. [FAQ常见问题](#十faq常见问题)

---

## 一、什么是SmartWardrobe Agent

### 1.1 定义

**SmartWardrobe Agent** 是一套标准化的工具接口（Tool Use API），允许外部AI智能体（如GPT-4、Claude、文心一言等LLM）通过结构化的函数调用（Function Calling）来操控SmartWardrobe平台的核心功能。

### 1.2 核心价值

| 传统API调用 | Agent Tool Use |
|------------|----------------|
| 开发者需要编写大量胶水代码 | LLM自动理解语义并选择合适工具 |
| 需要处理复杂的业务逻辑编排 | Agent自主决策调用顺序 |
| 固定的请求响应模式 | 自然语言交互，灵活多变 |
| 适合确定性场景 | 适合探索性、创意性场景 |

### 1.3 典型使用场景

```
用户: "帮我看看明天穿什么，要适合开会还要防雨"

Agent思考过程:
1. 获取明天天气 → 工具: get_weather_forecast()
2. 识别场合需求 → 内部推理: business + rain_protection
3. 查询衣橱 → 工具: search_clothes({categories: ['outerwear'], features: ['waterproof']})
4. 生成搭配方案 → 工具: generate_outfit_recommendation({context: {...}})
5. 可选:虚拟试衣确认 → 工具: virtual_try_on({...})
6. 返回自然语言回答 + 视觉结果
```

---

## 二、Agent能力矩阵

### 2.1 可用工具分类

#### 📋 数据查询类 (Read Operations)
| 工具名 | 功能 | 版本要求 |
|--------|------|---------|
| `get_user_profile` | 获取用户身材/风格档案 | v1.0+ |
| `list_clothes` | 列出衣物（支持筛选） | v1.0+ |
| `get_clothing_details` | 获取单件衣物详情 | v1.0+ |
| `search_clothes_textual` | 文本搜索衣物 | v1.0+ |
| `search_clothes_visual` | 以图搜图 | v3.0+ |
| `get_wardrobe_stats` | 衣橱统计概览 | v4.0+ |
| `get_today_recommendation` | 今日穿搭推荐(OOTD) | v3.0+ |
| `get_weather_context` | 天气信息获取 | v3.0+ |
| `get_care_reminders` | 洗护提醒列表 | v4.0+ |

#### ✏️ 写入操作类 (Write Operations)
| 工具名 | 功能 | 版本要求 |
|--------|------|---------|
| `add_clothing` | 手动添加衣物 | v1.0+ |
| `update_clothing` | 更新衣物信息 | v1.0+ |
| `delete_clothing` | 删除衣物 | v1.0+ |
| `toggle_favorite` | 收藏/取消收藏 | v1.0+ |
| `log_wear_event` | 记录穿着事件 | v4.0+ |
| `transition_clothing_status` | 变更衣物状态 | v4.0+ |
| `log_care_event` | 记录洗护事件 | v4.0+ |

#### 🤖 AI能力类 (AI Operations)
| 工具名 | 功能 | 版本要求 |
|--------|------|---------|
| `ai_segment_image` | AI抠图 | v2.0+ |
| `ai_classify_clothing` | AI属性识别 | v2.0+ |
| `ai_batch_process` | 批量AI处理 | v2.0+ |
| `virtual_try_on` | 虚拟试衣 | v3.0+ |
| `generate_outfit` | 生成搭配方案 | v3.0+ |
| `score_outfit` | 搭配评分 | v3.0+ |
| `analyze_purchase_intent` | 购物意向分析 | v5.0+ |

#### 🔔 通知与反馈类 (Notification)
| 工具名 | 功能 | 版本要求 |
|--------|------|---------|
| `send_push_notification` | 发送推送通知 | v4.0+ |
| `create_reminder` | 创建提醒事项 | v4.0+ |
| `submit_feedback` | 提交用户反馈 | v1.0+ |

---

## 三、接入架构与协议

### 3.1 架构总览

```
┌─────────────────────────────────────────────────────┐
│                  用户界面层                           │
│  (Chat UI / Voice Assistant / Smart Home Hub)        │
└───────────────────┬─────────────────────────────────┘
                    │ Natural Language Input
                    ▼
┌─────────────────────────────────────────────────────┐
│              LLM Agent Layer                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ GPT-4o   │ │ Claude   │ │ 文心一言  │ ...         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘             │
│       └────────────┼────────────┘                    │
│                    │ Function Calling                 │
└────────────────────▼────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │  SmartWardrobe      │
          │  Agent Gateway      │
          │  (REST + WebSocket) │
          └──────────┬──────────┘
                     │
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
┌────────┐    ┌──────────┐    ┌──────────┐
│Auth    │    │Business  │    │AI       │
│Service │    │Logic     │    │Services │
└────────┘    └──────────┘    └──────────┘
```

### 3.2 通信协议

SmartWardrobe Agent遵循 **OpenAI Function Calling** 协议格式：

```typescript
// 1. 系统向LLM声明可用工具（System Prompt注入）
const tools: Tool[] = [
  {
    type: "function",
    function: {
      name: "search_clothes",
      description: "在用户的衣橱中搜索符合条件的衣物...",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "搜索关键词" },
          category: { type: "string", enum: ["tops","bottoms",...] },
          color: { type: "string" },
          max_results: { type: "number", default: 10 }
        },
        required: ["query"]
      }
    }
  }
];

// 2. LLM决定调用工具时返回的结构
{
  id: "call_abc123",
  type: "function",
  function: {
    name: "search_clothes",
    arguments: '{"query": "黑色外套", "category": "outerwear", "max_results": 5}'
  }
}

// 3. Agent执行工具调用并返回结果给LLM
{
  role: "tool",
  tool_call_id: "call_abc123",
  content: JSON.stringify({
    results: [
      { id: "clt_001", name: "黑色羊毛大衣", brand: "ZARA", ... }
    ],
    total: 3
  })
}
```

### 3.3 Agent Gateway端点

```
Base URL: https://agent.smartwardrobe.com/v1

主要端点:
POST /chat/completions           # 兼容OpenAI格式的对话接口
POST /tools/invoke               # 直接工具调用（跳过LLM决策）
GET /tools                       # 获取可用工具列表（JSON Schema）
WS /ws/agent                     # WebSocket长连接（流式输出）
```

---

## 四、认证与授权

### 4.1 认证方式

```http
# 方式1: JWT Bearer Token（用户上下文）
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

# 方式2: API Key + Secret（开发者应用）
X-Agent-API-Key: agent_sk_live_abc123
X-Agent-Signature: hmac-sha256=timestamp.body.signature
```

### 4.2 权限Scope

| Scope | 说明 | 适用场景 |
|-------|------|---------|
| `wardrobe:read` | 读取衣橱数据 | 查询、搜索、推荐 |
| `wardrobe:write` | 修改衣橱数据 | 添加、编辑、删除 |
| `ai:use` | 使用AI服务 | 抠图、识别、试衣 |
| `profile:read` | 读取用户档案 | 身材数据、偏好 |
| `notifications:send` | 发送通知 | 推送提醒 |

### 4.3 安全最佳实践

⚠️ **重要安全提示**:
- Agent操作应始终经过用户确认（特别是写操作）
- 建议实现"预览模式"，先展示将要执行的操作再确认
- 敏感操作（删除、支付）需要二次验证
- 记录所有Agent操作的审计日志

---

## 五、工具函数(Tools)定义

### 5.1 核心工具Schema（精选）

#### get_user_profile
```json
{
  "name": "get_user_profile",
  "description": "获取当前用户的完整个人档案，包括身材数据、风格偏好等。用于了解用户基本情况以提供个性化建议。",
  "parameters": {
    "type": "object",
    "properties": {
      "include_body_measurements": {
        "type": "boolean",
        "description": "是否包含详细的三围等身体尺寸数据（涉及隐私，默认false）",
        "default": false
      },
      "include_style_preferences": {
        "type": "boolean",
        "description": "是否包含风格偏好标签",
        "default": true
      }
    },
    "required": []
  }
}
```

**返回值示例**:
```json
{
  "basic_info": {
    "gender": "female",
    "height_cm": 165,
    "city": "上海"
  },
  "style_tags": ["minimalist", "business_casual"],
  "wardrobe_summary": {
    "total_items": 156,
    "dominant_colors": ["#000000", "#FFFFFF", "#2C3E50"]
  }
}
```

---

#### search_clothes
```json
{
  "name": "search_clothes",
  "description": "在用户的衣橱中搜索符合特定条件的衣物。支持文本关键词、品类、颜色等多维度筛选。",
  "parameters": {
    "type": "object",
    "properties": {
      "text_query": {
        "type": "string",
        "description": "自由文本搜索词，如'黑色羊毛外套'、'夏天穿的裙子'"
      },
      "category": {
        "type": "string",
        "enum": ["tops", "bottoms", "outerwear", "dress", "accessories", "shoes"],
        "description": "衣物品类"
      },
      "color": {
        "type": "string",
        "description": "颜色名称或HEX值，如'红色'或'#FF0000'"
      },
      "season": {
        "type": "string",
        "enum": ["spring", "summer", "autumn", "winter"],
        "description": "适用季节"
      },
      "brand": {
        "type": "string",
        "description": "品牌名称"
      },
      "status_filter": {
        "type": "string",
        "enum": ["active", "idle", "all"],
        "description": "状态过滤，默认只返回活跃可穿的衣物",
        "default": "active"
      },
      "max_results": {
        "type": "integer",
        "description": "最大返回数量，默认10，最大50",
        "default": 10,
        "maximum": 50
      },
      "sort_by": {
        "type": "string",
        "enum": ["relevance", "recently_worn", "most_worn", "newest_added", "price_high_low"],
        "description": "排序方式",
        "default": "relevance"
      }
    },
    "required": ["text_query"]
  }
}
```

---

#### get_today_recommendation
```json
{
  "name": "get_today_recommendation",
  "description": "获取基于当前天气、时间、用户偏好的今日穿搭推荐方案（OOTD）。这是最常用的推荐入口。",
  "parameters": {
    "type": "object",
    "properties": {
      "location_override": {
        "type": "string",
        "description": "手动指定城市（如不提供则自动根据用户档案中的常住城市）"
      },
      "occasion_hint": {
        "type": "string",
        "description": "今天的特殊场合提示，如'重要会议'、'约会'、'运动健身'、'休闲居家'"
      },
      "must_include_items": {
        "type": "array",
        "items": { "type": "string" },
        "description": "必须包含的衣物ID数组（例如用户指定今天一定要穿某件新买的衣服）"
      },
      "exclude_recently_worn_days": {
        "type": "integer",
        "description": "避免推荐最近N天已穿过的穿搭，默认3天",
        "default": 3
      },
      "style_preference_override": {
        "type": "array",
        "items": { "type": "string" },
        "description": "临时覆盖的风格偏好标签"
      }
    },
    "required": []
  }
}
```

**返回值示例**:
```json
{
  "primary_recommendation": {
    "outfit_id": "out_20260503_001",
    "garments": [
      {
        "clothing_id": "clt_088",
        "name": "灰色风衣",
        "category": "outerwear",
        "why_chosen": "上海明日有阵雨，风衣防水且温度适中(18°C)",
        "image_url": "https://..."
      },
      {
        "clothing_id": "clt_025",
        "name": "白色直筒牛仔裤",
        "category": "bottoms",
        "why_chosen": "经典百搭，与灰色形成清爽对比"
      }
    ],
    "overall_style_tag": "法式极简通勤",
    "confidence_score": 0.89,
    "weather_match": {
      "temperature": { "min": 15, "max": 20 },
      "condition": "阴转小雨",
      "precipitation_chance": 70
    }
  },
  "alternatives": [
    // 2-3套备选方案...
  ]
}
```

---

#### virtual_try_on
```json
{
  "name": "virtual_try_on",
  "description": "为用户生成虚拟试衣效果图片。将选定的衣物组合'穿'到用户照片或3D Avatar上，生成逼真的换装效果。",
  "parameters": {
    "type": "object",
    "properties": {
      "mode": {
        "type": "string",
        "enum": ["photo", "avatar_3d"],
        "description": "试衣模式：photo=使用真人全身照片, avatar_3d=使用3D数字人"
      },
      "person_photo_url": {
        "type": "string",
        "description": "用户全身照URL（mode=photo时必填）"
      },
      "garment_combination": {
        "type": "object",
        "description": "要试穿的衣物组合，明确每件衣服的穿着部位",
        "properties": {
          "upper_body": { "type": "string", "description": "上装衣物ID" },
          "lower_body": { "type": "string", "description": "下装衣物ID" },
          "outerwear": { "type": "string", "description": "外套衣物ID" },
          "dress": { "type": "string", "description": "连衣裙ID" },
          "accessories": {
            "type": "array",
            "items": { "type": "string" },
            "description": "配饰ID数组（包、鞋、围巾等）"
          }
        },
        "required": ["upper_body", "lower_body"]
      },
      "options": {
        "type": "object",
        "properties": {
          "output_quality": {
            "type": "string",
            "enum": ["standard", "hd", "ultra_hd"],
            "description": "输出质量",
            "default": "hd"
          },
          "preserve_face": {
            "type": "boolean",
            "description": "是否保护面部特征不被修改（强烈建议开启）",
            "default": true
          },
          "generation_count": {
            "type": "integer",
            "description": "生成多个变体供选择（1-4）",
            "default": 1,
            "maximum": 4
          }
        }
      }
    },
    "required": ["mode", "garment_combination"]
  }
}
```

---

#### log_wear_event
```json
{
  "name": "log_wear_event",
  "description": "记录一次实际的穿着事件。用于追踪穿衣历史，帮助系统学习用户习惯并优化未来推荐。",
  "parameters": {
    "type": "object",
    "properties": {
      "date": {
        "type": "string",
        "description": "穿着日期 ISO 8601格式，默认今天"
      },
      "worn_garment_ids": {
        "type": "array",
        "items": { "type": "string" },
        "description": "当天穿着的所有衣物ID数组",
        "minItems": 1
      },
      "occasion_type": {
        "type": "string",
        "enum": ["work", "casual", "formal", "sports", "date", "travel", "home", "other"],
        "description": "穿着场合类型"
      },
      "user_rating": {
        "type": "integer",
        "description": "事后满意度评分 1-5分",
        "minimum": 1,
        "maximum": 5
      },
      "feedback_text": {
        "type": "string",
        "description": "文字反馈，如'这套很舒服但有点热'、'被同事夸了'"
      },
      "photo_evidence_url": {
        "type": "string",
        "description": "穿搭实拍照片URL（可选上传）"
      }
    },
    "required": ["worn_garment_ids"]
  }
}
```

---

#### analyze_purchase_intent
```json
{
  "name": "analyze_purchase_intent",
  "description": "分析一件新商品的购买意向。自动查重判断是否与现有衣物重复，评估搭配潜力，给出购买建议。是购物决策辅助的核心工具。",
  "parameters": {
    "type": "object",
    "properties": {
      "product_input": {
        "type": "object",
        "description": "待分析的商品输入",
        "oneOf": [
          {
            "type": "object",
            "properties": {
              "input_type": { "const": "url" },
              "product_url": { "type": "string", "description": "商品页面链接" }
            },
            "required": ["input_type", "product_url"]
          },
          {
            "type": "object",
            "properties": {
              "input_type": { "const": "image" },
              "image_base64": { "type": "string", "description": "商品照片Base64编码" },
              "image_description": { "type": "string", "description": "对照片的文字描述（可选但有助提高准确率）" }
            },
            "required": ["input_type", "image_base64"]
          },
          {
            "type": "object",
            "properties": {
              "input_type": { "const": "text" },
              "description_text": { "type": "string", "description": "文字描述商品，如'ZARA M码 黑色羊毛大衣 价格1299'" }
            },
            "required": ["input_type", "description_text"]
          }
        ]
      },
      "options": {
        "type": "object",
        "properties": {
          "check_duplicate": {
            "type": "boolean",
            "description": "是否检查与现有衣物的重复度",
            "default": true
          },
          "generate_outfit_preview": {
            "type": "boolean",
            "description": "是否生成与现有衣物的搭配预览",
            "default": true
          },
          "include_price_analysis": {
            "type": "boolean",
            "description": "是否包含价格合理性分析",
            "default": true
          }
        }
      }
    },
    "required": ["product_input"]
  }
}
```

---

### 5.2 完整工具列表获取

动态获取当前可用的所有工具Schema：

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://agent.smartwardrobe.com/v1/tools
```

返回所有工具的JSON Schema定义数组。

---

## 六、快速开始指南

### 6.1 最小化集成（5分钟上手）

```python
# agent_quickstart.py
from openai import OpenAI
import json

# 配置SmartWardrobe Agent Gateway（兼容OpenAI格式）
client = OpenAI(
    base_url="https://agent.smartwardrobe.com/v1",
    api_key="your_smartwardrobe_jwt_or_api_key"
)

# 定义可用工具（也可从 /v1/tools 动态获取）
tools = client.tools.list()  # 自动获取最新工具定义

# 开始对话
response = client.chat.completions.create(
    model="smartwardrobe-agent-v1",  # 使用SW专用路由
    messages=[
        {"role": "system", "content": "你是专业的AI穿搭顾问助手..."},
        {"role": "user", "content": "帮我看看明天穿什么？我在上海"}
    ],
    tools=tools,
    tool_choice="auto"  # 让LLM决定是否调用工具
)

# 处理可能的工具调用
if response.choices[0].finish_reason == "tool_calls":
    tool_call = response.choices[0].message.tool_calls[0]
    print(f"Agent决定调用工具: {tool_call.function.name}")
    print(f"参数: {tool_call.function.arguments}")

    # 执行工具调用（实际由Gateway代理执行）
    tool_result = client.tools.execute(tool_call.id, tool_call.function)

    # 将结果返回给LLM生成最终回答
    final_response = client.chat.completions.create(
        model="smartwardrobe-agent-v1",
        messages=[
            response.choices[0].message,  # 包含工具调用的assistant消息
            {"role": "tool", "tool_call_id": tool_call.id, "content": json.dumps(tool_result)},
            {"role": "user", "content": "请用中文总结一下推荐结果"}
        ]
    )

    print(final_response.choices[0].message.content)
```

### 6.2 完整对话流程示例

```javascript
// agent_full_example.js
async function smartWardrobeConversation(userMessage) {
  const messages = [
    {
      role: 'system',
      content: `你是SmartWardrobe AI穿搭顾问。你可以帮助用户：
1. 推荐每日穿搭（考虑天气、场合、个人风格）
2. 搜索和管理衣橱物品
3. 进行虚拟试衣
4. 分析购物建议
5. 记录穿着和洗护情况

请用友好、专业但亲切的语气回复中文用户。
重要：涉及删除或重大修改前必须先征求用户同意。`
    },
    { role: 'user', content: userMessage }
  ];

  let maxTurns = 10;  // 防止无限循环
  let turn = 0;

  while (turn < maxTurns) {
    turn++;

    // 调用LLM（带工具）
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: SW_TOOLS,  // SmartWardrobe工具定义
      tool_choice: 'auto'
    });

    const message = completion.choices[0].message;

    // 如果没有工具调用，直接返回最终回答
    if (!message.tool_calls || message.tool_calls.length === 0) {
      return message.content;
    }

    // 将assistant的tool_call消息加入历史
    messages.push(message);

    // 执行每个工具调用
    for (const toolCall of message.tool_calls) {
      console.log(`[Tool Call] ${toolCall.function.name}(${toolCall.function.arguments})`);

      try {
        // 调用SmartWardrobe Agent Gateway
        const result = await fetch('https://agent.smartwardrobe.com/v1/tools/invoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${USER_TOKEN}`
          },
          body: JSON.stringify({
            tool_name: toolCall.function.name,
            parameters: JSON.parse(toolCall.function.arguments)
          })
        }).then(r => r.json());

        // 将工具结果加入消息历史
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      } catch (error) {
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: error.message })
        });
      }
    }
  }

  return "抱歉，处理过程中遇到了复杂情况，请稍后重试。";
}

// 使用示例
smartWardrobeConversation("我想买件新外套，这件怎么样？[附上链接]")
  .then(reply => console.log(reply));
```

---

## 七、集成示例：GPT/Claude/文心一言

### 7.1 OpenAI GPT-4o 集成

```typescript
// integrations/openai_gpt.ts
import OpenAI from 'openai';
import { SWAgentTools } from '@smartwardrobe/agent-sdk';

const gptClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function createGPTWardrobeAssistant() {
  const assistant = await gptClient.beta.assistants.create({
    name: "SmartWardrobe AI 顾问",
    instructions: SYSTEM_PROMPT,
    model: "gpt-4-turbo",
    tools: SWAgentTools.map(tool => ({
      type: "function" as const,
      function: tool
    }))
  });

  return assistant;
}

// 使用Assistants API的完整会话
export async function chatWithGPTAssistant(userInput: string, threadId?: string) {
  let thread = threadId
    ? await gptClient.beta.threads.retrieve(threadId)
    : await gptClient.beta.threads.create();

  // 添加用户消息
  await gptClient.beta.threads.messages.create(thread.id, {
    role: "user",
    content: userInput
  });

  // 运行assistant（自动处理工具调用循环）
  const run = await gptClient.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: ASSISTANT_ID
  });

  // 获取最终回复
  const messages = await gptClient.beta.threads.messages.list(thread.id);
  return messages.data[0].content[0].text.value;
}
```

### 7.2 Anthropic Claude 集成

```python
# integrations/anthropic_claude.py
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def claude_wardrobe_agent(user_message: str, history: list = None):
    """
    Claude原生支持tool_use，集成非常简洁
    """
    if history is None:
        history = []

    messages = history + [{"role": "user", "content": user_message}]

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        tools=SW_AGENT_TOOLS_DEFINITIONS,  # 从SDK导入的工具定义
        messages=messages
    )

    # 处理tool_use块
    while response.stop_reason == "tool_use":
        # 执行工具调用
        for block in response.content:
            if block.type == "tool_use":
                result = execute_sw_tool(block.name, block.input)
                messages.append({
                    "role": "user",
                    "content": [{
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(result, ensure_ascii=False)
                    }]
                })

        # 继续对话直到Claude给出最终回答
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            tools=SW_AGENT_TOOLS_DEFINITIONS,
            messages=messages
        )

    # 提取最终文本回复
    final_text = ""
    for block in response.content:
        if block.type == "text":
            final_text += block.text

    return final_text
```

### 7.3 百度文心一言 集成

```java
// integrations/wenxin_yiyan.java
import com.baidu.qianfan.core.*;
import com.baidu.qianfan.model.function.*;

public class WenxinWardrobeAgent {

    private Qianfan qianfan;
    private List<FunctionDefinition> swTools;

    public WenxinWardrobeAgent() {
        this.qianfan = new QianfanBuilder()
            .accessToken(System.getenv("QIANFAN_ACCESS_TOKEN"))
            .build();

        // 加载SmartWardrobe工具定义
        this.swTools = SWAgentToolLoader.loadFromSchema("/sw_tools_schema.json");
    }

    public String chat(String userMessage) {
        ChatResponse response = qianfan.chatCompletion()
            .model("ernie-4.0-8k")  // 或 ernie-speed
            .messages(
                Message.system(SYSTEM_PROMPT),
                Message.user(userMessage)
            )
            .functions(swTools)  // 文心一言也支持function calling
            .execute();

        // 处理函数调用循环
        int maxRounds = 5;
        for (int round = 0; round < maxRounds; round++) {
            if (!response.containsFunctionCalls()) {
                break;  // 无工具调用，返回最终回答
            }

            // 执行工具调用
            List<FunctionCall> calls = response.getFunctionCalls();
            List<FunctionCallResult> results = new ArrayList<>();

            for (FunctionCall call : calls) {
                Object result = executeSWTool(call.getName(), call.getArguments());
                results.add(new FunctionCallResult(call.getId(), toJson(result)));
            }

            // 将结果传回模型继续推理
            response = qianfan.chatCompletion()
                .model("ernie-4.0-8k")
                .messages(/* 包含之前的消息和工具结果 */)
                .functions(swTools)
                .execute();
        }

        return response.getResult();  // 最终文本回答
    }
}
```

### 7.4 多Agent协作示例

```typescript
// multi_agent_orchestrator.ts
/**
 * 高级用法：多Agent协作完成复杂任务
 * 场景：完整的换季整理工作流
 */
class WardrobeOrchestrator {
  private stylistAgent;    // 穿搭专家Agent
  private organizerAgent; // 整理规划Agent
  private shopperAgent;    // 购物分析Agent

  async handleSeasonalTransition(userInstruction: string) {
    // Step 1: Organizer分析当前衣橱状态
    const wardrobeAnalysis = await this.organizerAgent.run(`
      任务：分析用户衣橱现状，识别需要收纳的过季衣物
      用户指令: ${userInstruction}
    `, ['get_wardrobe_stats', 'list_clothes']);

    // Step 2: Stylist为当季衣物生成搭配建议
    const seasonalOutfits = await this.stylistAgent.run(`
      基于${wardrobeAnalysis}的分析结果，
      为即将到来的季节生成3套胶囊衣橱搭配方案
    `, ['get_today_recommendation', 'generate_outfit', 'virtual_try_on']);

    // Step 3: Shopper分析是否需要补充新单品
    if (seasonalOutfits.gaps_detected) {
      const shoppingAdvice = await this.shopperAgent.run(`
        用户当前衣橱缺少以下类型的单品: ${seasonalOutfits.missing_categories}
        请给出购物建议和预算估算
      `, ['analyze_purchase_intent']);
    }

    // 汇总报告
    return this.generateConsolidatedReport(
      wardrobeAnalysis,
      seasonalOutfits,
      shoppingAdvice
    );
  }
}
```

---

## 八、最佳实践与模式

### 8.1 System Prompt设计要点

```markdown
# 推荐的System Prompt模板

你是SmartWardrobe AI，一个专业的智能衣橱管理助手。

## 你的能力
你可以帮助用户：
- 📊 查看和管理数字衣橱
- 👔 获取每日穿搭推荐（OOTD）
- 🎨 进行虚拟试衣
- 🛒 分析购物建议
- 🧺 管理洗护和换季

## 交互原则
1. **主动确认**: 涉及删除、购买等重大操作前，先展示计划并征求用户同意
2. **视觉优先**: 当有图片结果（试衣效果）时，优先展示图片再辅以文字说明
3. **个性化**: 基于用户的历史数据和偏好给出针对性建议，避免泛泛而谈
4. **简洁高效**: 直接给出答案，避免冗长的解释，除非用户追问细节

## 示例对话风格
❌ 错误: "好的，我为您查询了您的衣橱数据。根据算法分析..."
✅ 正确: "我看了你的衣橱，发现那件灰色大衣很适合明天的天气！要不要试试虚拟试穿？"

## 错误处理
如果工具调用失败，不要暴露技术细节，而是：
- 告知用户发生了什么："哎呀，AI处理有点慢，稍等一下~"
- 提供替代方案："或者我可以先用文字给你描述一下搭配建议？"
```

### 8.2 工具调用优化策略

```typescript
// 策略1: 并行调用无关工具
async function parallelToolExecution(agentResponse) {
  const toolCalls = agentResponse.tool_calls;

  // 识别可以并行执行的调用（无依赖关系）
  const independentGroups = groupIndependentCalls(toolCalls);

  for (const group of independentGroups) {
    const results = await Promise.all(
      group.map(call => executeTool(call))
    );
    // 处理结果...
  }
}

// 策略2: 缓存常用查询
const cacheManager = new TTLCache({ ttl: 300 }); // 5分钟缓存

async function getCachedOrFetch(toolName, params) {
  const cacheKey = `${toolName}:${JSON.stringify(params)}`;

  if (cacheManager.has(cacheKey)) {
    return cacheManager.get(cacheKey);
  }

  const result = await executeToolDirectly(toolName, params);
  cacheManager.set(cacheKey, result);
  return result;
}

// 策略3: 分页大数据集
async function searchAllClothes(query) {
  let allResults = [];
  let page = 1;

  while (true) {
    const batch = await executeTool('search_clothes', {
      text_query: query,
      max_results: 50,
      page: page++
    });

    allResults.push(...batch.results);

    if (!batch.pagination.has_next) break;
    // 限制最多取500条防止滥用
    if (allResults.length >= 500) break;
  }

  return allResults;
}
```

### 8.3 用户体验增强技巧

```typescript
// 技巧1: 流式输出中间状态
function streamToolProgress(ws: WebSocket, toolCallId: string) {
  ws.send(JSON.stringify({
    type: 'tool_progress',
    tool_call_id: toolCallId,
    status: 'executing',
    message: '正在分析你的衣橱...',
    progress: 30
  }));
}

// 技巧2: 预加载热门数据
async function preloadForFastResponse(userId: string) {
  // 在用户打开对话时预加载常用数据
  const preloadData = await Promise.all([
    getUserProfileSummary(userId),       // 用户概况
    getTodayWeather(userId),             // 今日天气
    getRecentWornItems(userId, 7)        // 近期穿着
  ]);

  // 缓存到会话上下文，后续工具调用可直接使用
  sessionContext.set(userId, preloadData);
}

// 技巧3: 智能澄清模糊意图
function clarifyAmbiguousIntent(userMessage: string): string | null {
  // 如果用户说"帮我找件衣服"，太模糊
  if (isVagueRequest(userMessage)) {
    return "你想找哪种类型的衣服呢？比如：
    - 明天要穿的（我可以看天气推荐）
    - 特定颜色或品类的（比如'红色上衣'）
    - 很久没穿的旧衣服
    - 还是想买新的？";
  }
  return null;
}
```

---

## 九、限制与注意事项

### 9.1 当前限制

| 限制项 | 具体说明 | 解决方案 |
|--------|---------|---------|
| **并发限制** | 单用户同时最多5个Agent任务 | 使用队列排队 |
| **Token消耗** | 复杂任务可能消耗较多LLM Token | 优化Prompt长度，使用更高效的模型 |
| **AI服务延迟** | 虚拟试衣等重度AI操作需等待10-30秒 | 先返回文字建议，异步生成图片 |
| **工具调用深度** | 最大嵌套调用层级: 5层 | 避免过度复杂的自动化流程 |
| **文件大小** | 图片输入最大20MB | 要求客户端压缩后再传入 |

### 9.2 安全红线

🚫 **绝对禁止的操作**（即使Agent有权限也不应自动执行）:
1. 批量删除超过10件衣物（必须逐个确认）
2. 涉及金钱的操作（购买、订阅变更）
3. 修改密码或安全设置
4. 公开分享用户的私人照片到社区
5. 将用户数据传输至第三方

### 9.3 成本控制

```yaml
# 建议的成本监控配置
cost_control:
  per_user_daily_limit:
    llm_tokens: 100000              # 每日最大Token消耗
    ai_service_calls: 50            # AI服务调用次数
    virtual_tryon_generations: 10   # 虚拟试衣次数

  alert_thresholds:
    warning_at: 70%                 # 用量达70%时警告
    hard_limit_at: 100%             # 达100%暂停服务至次日

  budget_mode:
    free_tier:                      # 免费版用户
      daily_tool_calls: 20
      no_virtual_tryon: true
    pro_tier:                       # Pro版用户
      daily_tool_calls: 200
      virtual_tryon_daily: 20
```

---

## 十、FAQ常见问题

### Q1: Agent和普通API有什么区别？
**A**: Agent是为LLM优化的高层抽象。普通API需要你自己处理业务逻辑编排，Agent则让LLM理解语义后自动选择合适的工具链。简单说：API是"怎么做"，Agent是"做什么"。

### Q2: 可以用自己的LLM吗？
**A**: 完全可以！我们的Agent Gateway兼容OpenAI Function Calling协议，任何支持该协议的模型都可以接入，包括开源的Llama 3、Qwen等。

### Q3: 如何保证Agent不会误操作？
**A**: 三重保障机制：
1. **权限最小化**: 默认只授予读取权限，写操作需额外scope
2. **确认机制**: 删除/修改操作强制弹出确认对话框
3. **审计日志**: 所有Agent操作全程记录，可追溯回滚

### Q4: 支持多轮对话上下文吗？
**A**: 支持！Agent Gateway自动维护会话状态，支持跨多轮对话的上下文记忆。也支持通过WebSocket进行实时流式交互。

### Q5: 如何调试Agent的行为？
**A**: 提供：
- `/v1/debug/sessions/{session_id}` 查看完整对话历史和工具调用日志
- Dashboard可视化展示Agent的决策树
- Sandbox沙盒环境测试，不影响真实数据

### Q6: 商业化使用有什么限制？
**A**: 请参考开放平台的定价页面。Agent调用本身免费（消耗的是你自己的LLM API费用），但如果调用了SmartWardrobe的付费AI服务（如虚拟试衣），则按次计费。

---

## 附录：工具完整Schema索引

详见在线文档: https://docs.smartwardrobe.com/agent/tools-full-schema

或通过API动态获取: `GET https://agent.smartwardrobe.com/v1/tools`

---

**文档维护**: Agent Platform Team
**技术支持**: agent-support@smartwardrobe.com
**Discord社区**: https://discord.gg/smartwardrobe-dev
**更新频率**: 随版本迭代更新，重大变更提前30天通知
