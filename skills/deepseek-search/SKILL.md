---
name: deepseek-search
description: DeepSeek Search & Fetch Agentic Best Practices Guide. Explains how and when to use deepseek_search and deepseek_fetch tools effectively.
---

# DeepSeek 联网搜索与精读技能指南 (DeepSeek Search & Fetch Skill)

本指南旨在指导 AI Agent 如何最高效、最节省 Token 地利用 DeepSeek 搜索引擎与网页提取能力解决复杂研究与实时信息检索任务。

---

## 核心工作流：两阶段搜索与精读 (Two-Stage Workflow)

```mermaid
flowchart LR
    A["用户提问 / 实时信息诉求"] --> B["1. deepseek_search"]
    B --> C{"长摘要是否已满足解答要求？"}
    C -->|是| D["直接结构化回答并附上引用链接"]
    C -->|否 (需长文深入分析)| E["2. deepseek_fetch 抓取对应网页"]
    E --> D
```

### 阶段一：初步探索与过滤 (Search)
1. **关键词精炼原则**：
   - DeepSeek 的 `query` 长度严格限制在 **128 字符以内**。不要把一长段原始对话扔给 `query`。
   - 提取 2~5 个核心实体词和动作词（如 `"DeepSeek API 搜索接口 计费 429"`）。
2. **善用高级搜索语法**：
   - 查找官方文档或指定站点：`site:github.com`、`site:api-docs.deepseek.com`
   - 排除低质干扰站：`-site:csdn.net`
   - 精确匹配特定报错代码：`"invalid_request_error"`
3. **参数调优**：
   - 默认模式 `detail_level="summary"`：返回 600~800 字语义密集长摘要，绝大多数问答场景无需额外抓取网页，既快又省 Token。
   - 快速意图探测：`detail_level="snippet"`。
   - 结果质量保证：默认 `min_score=1.0`（DeepSeek 认为 $\ge 1.5$ 为高度优质匹配）。

### 阶段二：深入长文研读 (Fetch)
当且仅当发生以下情况时，才对搜索结果中的目标 URL 执行 `deepseek_fetch`：
- 需要查阅完整的 API 参数列表、技术规范长文；
- 需要下载/阅读长篇源码、配置教程；
- 用户明确要求“详细总结/全文翻译”该网页。

---

## 避坑与容错指引

1. **429 频率超限**：
   - DeepSeek Search 与 Fetch 限制为 5 QPS。请勿在单个思考回合中并发发起数十个搜索或抓取请求，按需串行或控制批次。
2. **反爬与 404**：
   - 遇到抓取失败时，直接使用 Search 阶段已有的 `summary` 内容作答，并告知用户由于目标站点反爬限制，已基于权威摘要进行分析。
