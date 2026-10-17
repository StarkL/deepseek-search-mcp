# DeepSeek Search MCP Server 🔍

[![npm version](https://img.shields.io/npm/v/deepseek-search-mcp.svg)](https://www.npmjs.com/package/deepseek-search-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![MCP Protocol](https://img.shields.io/badge/MCP-1.6.0-green.svg)](https://modelcontextprotocol.io/)
[![DeepSeek API](https://img.shields.io/badge/API-DeepSeek%20Search%20%26%20Fetch-blueviolet)](https://api-docs.deepseek.com/zh-cn/guides/search/)

**DeepSeek Search MCP** 是基于 DeepSeek 官方最新发布的 [网页搜索 (Search) 与网页抓取 (Fetch) 接口](https://api-docs.deepseek.com/zh-cn/guides/search/) 构建的标准 Model Context Protocol (MCP) 服务。

为 **Claude Desktop、Cursor、Cline、Windsurf** 等全生态 AI 助手提供极低成本、原生优化的实时互联网检索与正文精读能力。

---

## ✨ 核心特性 (Key Features)

- 💰 **极致性价比**：完全复用已有的 DeepSeek API Key，仅需约 **¥5 元 / 千次调用**（~$0.75/1K），失败与空结果不计费，远低于海外同类搜索服务。
- 🧠 **专为大模型调优的长摘要**：支持 DeepSeek 独特的 `summary` 模式（600~800 字高质量长摘要），提供充沛信息量的同时，极大节省上下文 Token，告别传统搜索的“截断”与“爆 Context”。
- 🔄 **搜索 + 抓取双工具闭环**：
  - `deepseek_search`：实时网络搜索，支持相关性重排打分（`rerank_score`）与高级搜索语法。
  - `deepseek_fetch`：将目标 URL 一键抓取并解析为高清、无广告的干净 Markdown 正文。
- 🛡️ **生产级健壮性**：
  - **参数安全防爆**：自动拦截并截断大模型可能传入的长句子，防止触发官方 128 字符硬限制（HTTP 400）。
  - **429 智能指数退避重试**：针对 QPS 达到 5 次/秒上限的情况，自动进行指数退避平滑重试。
  - **404 抓取优雅降级**：目标站点存在强反爬或不可读时，平滑提示大模型改读摘要，避免对话中断。
  - **协议纯净防护**：严格分离 stdio 协议流与调试日志，彻底告别 JSON-RPC 解析错误。

---

## 🚀 快速上手 (Quick Start)

### 前置准备
1. 拥有一个 DeepSeek 开放平台账号并创建 API Key：[platform.deepseek.com](https://platform.deepseek.com/)
2. 确保账户内有充足余额（充值几元即可体验数千次搜索）。

---

### 客户端一键配置

#### 1. Claude Desktop
编辑 Claude Desktop 配置文件：
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "deepseek-search": {
      "command": "npx",
      "args": ["-y", "deepseek-search-mcp"],
      "env": {
        "DEEPSEEK_API_KEY": "sk-your-deepseek-api-key"
      }
    }
  }
}
```

#### 2. Claude Code (Anthropic 官方终端 Agent CLI)
只需在终端执行一行命令即可完成全局接入：
```bash
claude mcp add deepseek-search -e DEEPSEEK_API_KEY=sk-your-deepseek-api-key -- npx -y deepseek-search-mcp
```
> 或在任意项目根目录创建 `.mcp.json` 实现团队级一键共享：
> ```json
> {
>   "mcpServers": {
>     "deepseek-search": {
>       "command": "npx",
>       "args": ["-y", "deepseek-search-mcp"],
>       "env": {
>         "DEEPSEEK_API_KEY": "sk-your-deepseek-api-key"
>       }
>     }
>   }
> }
> ```

#### 3. DeepSeek Harness (`dsh` 官方 Agent 运行时)
DeepSeek 官方的 Agent 运行时 (`dsh`) 原生支持 MCP。有两种接入方式：
- **方式 A（Web 界面）**：启动 `dsh web` 后，打开浏览器进入 **Settings → MCP**，点击添加 stdio 服务：
  - **Command**: `npx`
  - **Args**: `-y deepseek-search-mcp`
  - **Env**: `DEEPSEEK_API_KEY=sk-your-deepseek-api-key`
- **方式 B（Profile 配置）**：在 Profile 的 patch 文件（如 `~/.dsh/profiles/default/cordis.patch.yml`）中添加插件项：
  ```yaml
  - id: mcp-deepseek-search
    name: '@deepseek-ai/dsh-mcp-client'
    config:
      serverName: deepseek-search
      transport: stdio
      command: npx
      args:
        - '-y'
        - 'deepseek-search-mcp'
      env:
        DEEPSEEK_API_KEY: !!js process.env.DEEPSEEK_API_KEY
  ```

#### 4. Cursor
在 Cursor 设置中打开 **Features -> MCP**，点击 **+ Add New MCP Server**：
- **Name**: `deepseek-search`
- **Type**: `command`
- **Command**: `npx -y deepseek-search-mcp`
- **Environment Variables**: 添加 `DEEPSEEK_API_KEY=sk-your-deepseek-api-key`

#### 5. Cline / Roo Code (VS Code 扩展)
打开 Cline 的 MCP 设定文件 `cline_mcp_settings.json`：
```json
{
  "mcpServers": {
    "deepseek-search": {
      "command": "npx",
      "args": ["-y", "deepseek-search-mcp"],
      "env": {
        "DEEPSEEK_API_KEY": "sk-your-deepseek-api-key"
      }
    }
  }
}
```

#### 6. Windsurf
在 `~/.codeium/windsurf/mcp_config.json` 中配置：
```json
{
  "mcpServers": {
    "deepseek-search": {
      "command": "npx",
      "args": ["-y", "deepseek-search-mcp"],
      "env": {
        "DEEPSEEK_API_KEY": "sk-your-deepseek-api-key"
      }
    }
  }
}
```

#### 7. Codex / OpenCode / Goose 及通用 Agent Harness
对于支持标准 Model Context Protocol 的任何代码智能体（Agent Harness），配置通用的 Stdio 标准指令即可：
- **Transport**: `stdio`
- **Executable**: `npx`
- **Arguments**: `["-y", "deepseek-search-mcp"]`
- **Environment Variables**: `DEEPSEEK_API_KEY=sk-your-deepseek-api-key`

---

## 🛠️ 可用工具 (Tools)

### 1. `deepseek_search` (网页搜索)
调用 DeepSeek 自研搜索引擎获取实时网络结果。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `query` | string | **是** | - | 搜索关键词（支持 `site:`、`-site:`、双引号等高级搜索语法，服务端已内置 128 字符防爆安全截断）。 |
| `count` | number | 否 | `5` | 返回结果数量（1~50）。 |
| `detail_level`| string | 否 | `"summary"` | 详情模式：<br>• `"summary"`：600~800 字密集长摘要（**推荐**）<br>• `"snippet"`：100~200 字短摘要（超省 Token）<br>• `"full"`：直接抓取网页正文。 |
| `min_score` | number | 否 | `1.0` | 排序分数阈值（0~3 分，官方认为 $\ge 1.5$ 为高度优质匹配），低于该值的结果将被自动过滤。 |
| `ori_question`| string| 否 | - | 用户原始提问，有助于搜索引擎更精确理解搜索意图。 |
| `localization`| string| 否 | - | 可选 IP 地址，用于优先匹配本地化搜索结果。 |

### 2. `deepseek_fetch` (网页正文提取)
深度抓取指定网页并解析为结构化的 Markdown 纯文本。

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `url` | string | **是** | - | 网页完整 HTTP/HTTPS 地址（最大支持 8192 字符）。 |
| `max_length` | number | 否 | `8000` | 返回 Markdown 文本的最大截断字符数，防止超大网页占满上下文。 |

---

## 环境变量说明

| 环境变量 | 必需 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `DEEPSEEK_API_KEY` | **是** | - | DeepSeek 开放平台 API 密钥（以 `sk-` 开头）。 |
| `DEEPSEEK_BASE_URL`| 否 | `https://api.deepseek.com` | 自定义 API 网关地址（用于企业私有代理或内网转发）。 |

---

## ❓ 常见问题排查 (FAQ)

1. **收到 HTTP 402 Payment Required 报错？**
   - 您的 DeepSeek 账户余额已耗尽。请前往 [platform.deepseek.com](https://platform.deepseek.com/) 充值即可恢复使用。
2. **遇到 HTTP 429 报错？**
   - DeepSeek Search / Fetch 接口单个账号独立限制为 **5 QPS**。本 MCP 已内置轻量指数退避重试，若仍频繁触发，请提示模型降低并发调用频次。
3. **部分网页 Fetch 提示无法提取正文？**
   - 某些目标网站具有严格的反爬盾（如 Cloudflare / 极验）或属于纯交互单页应用。遇到此类情况，MCP 会友好提示模型改用搜索阶段提供的长摘要进行分析。

---

## 📄 开源许可证 (License)

本项目基于 [MIT License](LICENSE) 开源。欢迎提 Issue 与 PR！
