# AI 短剧工作流 · Vercel 部署版

打开网址 → 贴素材 → 点运行，依次出 Writer(重构故事) / Director(分集大纲) / Storyboard(分镜) / Stylist(美术资产)。
不配 key 也能点「跑内置样例」看效果；配了 key 就能跑你们自己的素材。

接口层是通用 OpenAI-compatible 配置，可接 OpenAI、Grok/xAI、公司中转、DeepSeek/Qwen 等兼容 Chat Completions 的服务；Azure OpenAI 也保留独立模式。

## 文件结构

```text
.
├─ index.html        前端页面（画风选择、内置样例、右上「设置接口」入口）
├─ api/
│  └─ generate.js    通用后端代理接口（避开跨域；可用环境变量里的 key）
├─ package.json
└─ README.md
```

Vercel 自动把 `index.html` 当静态页、`api/generate.js` 当后端接口，不用 build。

## 配置 API

方式一：在页面里填，适合自己测试。

打开网址 → 右上「设置接口」→ 选择预设（OpenAI / Grok / 自定义 OpenAI-compatible / Azure）→ 填 Base URL、模型名、Key → 保存。Key 只存当前浏览器。

方式二：Vercel 环境变量，推荐给同事共用。

| 变量名 | 值 | 必填 |
|---|---|---|
| `AI_API_KEY` | 通用 API Key | 是 |
| `AI_BASE_URL` | OpenAI-compatible Base URL，例如 `https://api.x.ai/v1` | 否 |
| `AI_MODEL` | 模型名，例如 `grok-4.3` | 否 |
| `AI_PROVIDER` | `compatible` 或 `azure` | 否 |
| `AI_API_VERSION` | Azure api-version | Azure 时可选 |

旧变量仍兼容：`OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`。
Grok 也可用 `XAI_API_KEY` 或 `GROK_API_KEY`，但更推荐统一用 `AI_API_KEY`。

### Grok / xAI 示例

| 变量名 | 值 |
|---|---|
| `AI_BASE_URL` | `https://api.x.ai/v1` |
| `AI_MODEL` | `grok-4.3`（或你账号可用的 Grok 模型） |
| `AI_API_KEY` | xAI API key |

加完点 Redeploy 生效。之后任何人打开网址，不填 key 也能直接跑。

## 部署

```powershell
cd "D:\Drama Agent"
npx vercel --prod
```

## 同步 Vercel API 配置

默认同步 Grok / xAI 配置：

```powershell
cd "D:\Drama Agent"
.\scripts\sync-vercel-api-settings.ps1
```

换其他 OpenAI-compatible 服务时，只改参数即可：

```powershell
.\scripts\sync-vercel-api-settings.ps1 -BaseUrl "https://api.your-provider.com/v1" -Model "your-model" -Provider "compatible"
```

## 备注

- 想改提示词/画风：编辑 `index.html` 里的 `buildPrompts()` 和 `STYLES`，重新部署即可。
- 想换模型：只改页面设置或 Vercel 环境变量，不需要改代码。
