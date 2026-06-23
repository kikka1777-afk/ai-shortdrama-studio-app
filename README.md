# AI 短剧工作流 · Vercel 部署版

打开网址 → 贴素材 → 点运行，依次出 Writer(重构故事) / Director(分集大纲) / Stylist(美术资产)。
不配 key 也能点「跑内置样例」看效果；配了 key 就能跑你们自己的素材。

## 文件结构
```
.
├─ index.html        前端页面（画风选择、内置样例、右上「设置接口」入口）
├─ api/
│   └─ generate.js   后端代理接口（避开跨域；可用环境变量里的 key）
├─ package.json
└─ README.md
```
> 零配置：Vercel 自动把 `index.html` 当静态页、`api/generate.js` 当后端接口，不用 build。

---

## 让 Codex 接手（推荐，最省事）
把这个文件夹交给 Codex，一句话指令即可：

> 「把当前文件夹推到一个新的 GitHub 公开仓库 `ai-shortdrama-studio`，然后用 `vercel` 部署成线上网址；部署后在 Vercel 项目里加环境变量 `OPENAI_API_KEY`（值我稍后给），再 redeploy。」

等价的命令行（Codex 会自动跑）：
```bash
cd "D:\Drama Agent"
git init && git add . && git commit -m "init: AI 短剧工作流"
gh repo create ai-shortdrama-studio --public --source=. --push   # 需要 gh 登录
npx vercel --prod                                                # 需要 vercel 登录
# 然后到 Vercel 项目 Settings → Environment Variables 加 OPENAI_API_KEY，再 redeploy
```

---

## 配置 API Key（两种方式，二选一）

**方式①：在页面里填**（适合自己测）
打开网址 → 右上「⚙ 设置接口」→ 填 Key（OpenAI 兼容或 Azure）→ 保存。Key 只存你这台浏览器。

**方式②：Vercel 环境变量**（推荐，同事打开就能用，不用各自填 key）
Vercel 项目 → Settings → Environment Variables：
| 变量名 | 值 | 必填 |
|---|---|---|
| `OPENAI_API_KEY` | 你的 key | 是 |
| `OPENAI_BASE_URL` | 公司中转/Azure 地址（不填=OpenAI 官方） | 否 |

加完点 **Redeploy** 生效。之后任何人打开网址，不填 key 也能直接跑。

---

## 备注
- 已有一个仓库 `Pinpoon/ai-shortdrama-studio`（里面只提交了 `api/generate.js`）。可以让 Codex 推到这个已存在的仓库（补齐 index.html / package.json / README），或干脆新建一个干净仓库都行。
- 想改提示词/画风：编辑 `index.html` 里的 `buildPrompts()` 和 `STYLES`，重新部署即可。
